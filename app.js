const express = require("express");
const app = express();
const port = 5000;

app.use(express.static("client/build"));

app.get("/getStockdata", async (req, res) => {
  const { Client } = require("pg");
  const client = new Client();
  await client.connect();

  // Get random stock id
  const sqlCount = "SELECT COUNT(*) FROM stocks;";
  const resCount = await client.query(sqlCount);
  const count = parseInt(resCount.rows[0].count);
  const randId = Math.floor(Math.random() * count);

  // Get data of random stock
  const sqlQuery = "SELECT * FROM stocks WHERE id = " + randId;
  const resResults = await client.query(sqlQuery);
  const formattedResults = resResults.rows[0];
  formattedResults.data = JSON.parse(formattedResults.data);

  await client.end();
  res.send(formattedResults);
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
