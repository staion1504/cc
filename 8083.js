const express = require("express");
const app = express();
const port = 8083;

app.all("*", (req, res) => {
  res.send(`hello from simple server (${port - 8080}) at port ${port}`);
});

app.listen(port, () =>
  console.log("> Server is up and running on port : " + port)
);
