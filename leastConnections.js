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

const checkTCPConnectionHandshake = async (strs) => {
  try {
    const r = await axios.get(strs);
  } catch (error) {
    return false;
  } finally {
    console.log(`Handshaking done to the server ${strs}`);
  }
  return true;
};

const mpp = new Map();
mpp.set(servers[0], 0);
mpp.set(servers[1], 0);
mpp.set(servers[2], 0);

app.all("/x", async (req, res) => {
  const arr = Array.from(mpp.keys());
  const sorted = arr.sort((a, b) => {
    return mpp.get(a) - mpp.get(b);
  });
  let index = 0;
  while (index < servers.length) {
    const r = await checkTCPConnectionHandshake(sorted[index]);
    if (r) break;
    index++;
  }

  if (index == servers.length) {
    return res.send(`Can't process your request all servers are down`);
  }
  mpp.set(sorted[index], mpp.get(sorted[index]) + 1);
  console.log(sorted[index], mpp);

  proxy.web(req, res, { target: sorted[index] });
});

const port = 8080;
app.listen(port, () => {
  console.log(`Load balancer listening on port ${port}`);
});
