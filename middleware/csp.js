const path = require("path");
const fs = require("fs");

const cache = new Map();

const getHtml = path =>
  new Promise((resolve, reject) =>
    fs.readFile(path, "utf-8", (err, contents) => {
      if (err) return reject(err);

      cache.set(path, contents);
      return resolve(contents);
    })
  );

const csp = () => async (req, res, next) => {
  const pagePath = path.join(dirViews, page);
  let html = cache.get(pagePath);
  if (!html) {
    html = await getHtml(pagePath);
  }
  html = html
    .replace(/<script/g, `<script nonce="${nonce1}"`)
    .replace(/<style/g, `<style nonce="${nonce1}"`);
  return {
    html,
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
  };
};

export default csp;
