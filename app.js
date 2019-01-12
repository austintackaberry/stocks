const express = require("express");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
var uuidv4 = require("uuid/v4");
const app = express();
const port = process.env.PORT || 5000;
const AWS = require("aws-sdk");
require("dotenv").config();

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

// Only serve up static build files in production
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
  AWS.config.update({
    region: "us-west-1"
  });
  const dynamodb = new AWS.DynamoDB.DocumentClient({
    apiVersion: "2012-08-10",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-west-1"
  });

  const params = {
    TableName: "stockit"
  };

  // Get all documents from db and randomly choose one
  dynamodb.scan(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const count = data.Count;
      const randId = Math.floor(Math.random() * count);
      const item = data.Items[randId];
      res.send(item);
    }
  });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

const getHtml = path =>
  new Promise((resolve, reject) =>
    fs.readFile(path, "utf-8", (err, contents) => {
      if (err) return reject(err);
      return resolve(contents);
    })
  );
