var express = require("express"),
  apiRouter = express();

apiRouter.use("/user", require("./user"));

apiRouter.use("/grip", require("./grip"));

module.exports = apiRouter;
