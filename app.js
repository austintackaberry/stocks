const { Client } = require("pg");
const client = new Client();

(async () => {
  await client.connect();

  const sqlCount = "SELECT COUNT(*) FROM stocks;";

  const resCount = await client.query(sqlCount);
  const count = parseInt(resCount.rows[0].count);
  const randId = Math.floor(Math.random() * count);
  const sqlQuery = "SELECT * FROM stocks WHERE id = " + randId;
  const resResults = await client.query(sqlQuery);
  const formattedResults = resResults.rows[0];
  formattedResults.data = JSON.parse(formattedResults.data);
  console.log(formattedResults);
  await client.end();
})();
