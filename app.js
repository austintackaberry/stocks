const express = require("express");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
var uuidv4 = require("uuid/v4");
const app = express();
const port = process.env.PORT || 5000;

console.log(process.env.NODE_ENV);
app.use(helmet());
app.use(function(req, res, next) {
  res.locals.nonce = uuidv4();
  next();
});
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://www.google-analytics.com/analytics.js"],
      imgSrc: ["'self'", "https://www.google-analytics.com"],
      styleSrc: [
        "'self'",
        function(req, res) {
          return "'nonce-" + res.locals.nonce + "'";
        }
      ]
    }
  })
);

if (process.env.NODE_ENV === "production") {
  app.get("/", async function(req, res) {
    const pagePath = path.join(__dirname + "/client/build/index.html");
    let html = await getHtml(pagePath);
    html = html
      .replace(/<script/g, `<script nonce="${res.locals.nonce}"`)
      .replace(/<style/g, `<style nonce="${res.locals.nonce}"`);
    res.send(html);
  });
  app.use(express.static("client/build"));
}

app.get("/getStockData", async (req, res) => {
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
app.listen(port, () => console.log(`Server listening on port ${port}`));

const getHtml = path =>
  new Promise((resolve, reject) =>
    fs.readFile(path, "utf-8", (err, contents) => {
      if (err) return reject(err);
      return resolve(contents);
    })
  );
