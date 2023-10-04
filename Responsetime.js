const { default: axios } = require("axios");
const express = require("express");
const httpProxy = require("http-proxy");

const app = express();
const proxy = httpProxy.createProxyServer();

let currentIndex = -1;

const servers = [
  { address: "http://localhost:8081/", responseTime: 4 },
  { address: "http://localhost:8082/", responseTime: 3 },
  { address: "http://localhost:8083", responseTime: 7 },
];

const checkTCPConnectionHandshake = async (currentIndex) => {
  try {
    await axios.get(servers[currentIndex].address);
  } catch (error) {
    return false;
  }
  return true;
};

app.all("/x", async (req, res) => {
  servers.sort((a, b) => a.responseTime - b.responseTime);

  let trialCount = 0;
  let reqIndex = -1;
  // currentIndex = -1;
  currentIndex++;
  currentIndex %= servers.length;
  while (trialCount < servers.length) {
    const r = await checkTCPConnectionHandshake(currentIndex);
    if (r) {
      reqIndex = currentIndex;
      break;
    }
    trialCount++;
    currentIndex++;
    currentIndex %= servers.length;
  }
  if (trialCount === servers.length)
    return res.send(`Can't process your request all servers are down`);

  proxy.web(req, res, { target: servers[reqIndex].address });
});

const port = 8080;
app.listen(port, () => {
  console.log(`Load balancer listening on port ${port}`);
});
