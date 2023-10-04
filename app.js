const { default: axios } = require("axios");
const express = require("express");
const httpProxy = require("http-proxy");

const app = express();
const proxy = httpProxy.createProxyServer();

const servers = [
  "http://localhost:8081/",
  "http://localhost:8082/",
  "http://localhost:8083/",
];
let currentIndex = -1;

const checkTCPConnectionHandshake = async (currentIndex) => {
  try {
    await axios.get(servers[currentIndex]);
  } catch (error) {
    return false;
  }
  return true;
};

app.all("/x", async (req, res) => {
  // console.log(currentIndex, " servers");
  let trialCount = 0;
  currentIndex++;
  currentIndex %= servers.length;
  while (trialCount < servers.length) {
    const r = await checkTCPConnectionHandshake(currentIndex);
    if (r) break;
    trialCount++;
    currentIndex++;
    currentIndex %= servers.length;
  }
  if (trialCount === servers.length)
    return res.send(`Can't process your request all servers are down`);
  proxy.web(req, res, { target: servers[currentIndex] });
});

const port = 8080;
app.listen(port, () => {
  console.log(`Load balancer listening on port ${port}`);
});
