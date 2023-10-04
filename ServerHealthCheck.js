const { default: axios } = require("axios");
const chalk = require("chalk");

const servers = [
  "http://localhost:8081/",
  "http://localhost:8082/",
  "http://localhost:8083/",
];

const INIT_PORT = 8081;
const MAX_RETRIES = 1;

const checkTCPConnectionHandshake = async (currentIndex) => {
  try {
    await axios.get(servers[currentIndex]);
  } catch (error) {
    return false;
  }
  return true;
};

const healthCheck = async () => {
  const ans = Array(servers.length);
  ans.fill(false);
  let i = 0;
  while (i < servers.length) {
    let retries = MAX_RETRIES;
    let serverHealth = false;
    while (retries >= 0 && !serverHealth) {
      serverHealth = await checkTCPConnectionHandshake(i);
      retries--;
    }
    ans[i] = serverHealth;
    i++;
  }
  return ans;
};

healthCheck().then((data) => {
  console.log();
  console.log(chalk.bgYellow.bold("  Running Health Checkup ...           "));
  data.forEach((e, i) => {
    if (e) {
      console.log(
        chalk.bgGreen.bold(
          `  Server at port ${INIT_PORT + i} is Running & OK  `
        )
      );
    } else {
      console.log(
        chalk.bgRed.bold(`  Server at port ${INIT_PORT + i} is Down & Not OK `)
      );
    }
  });
  console.log();
});
