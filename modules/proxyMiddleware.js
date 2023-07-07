const request = require("request");

function proxyMiddleware(req, res, next) {
  const proxyOptions = {
    url: req.protocol + "://" + req.get("host") + req.originalUrl,
    proxy: "http://brd-customer-hl_95484916-zone-data_center:8x3zrcssgvqs@brd.superproxy.io:22225",
    rejectUnauthorized: false,
  };

  request(proxyOptions, function (error, response, body) {
    if (error) {
      console.error(error);
      res.status(500).send("An error occurred");
    } else {
      res.send(body);
    }
  });
}

module.exports = proxyMiddleware;
