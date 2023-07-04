var express = require("express"),
  apiRouter = express();

// apiRouter.use("/user", require("./user"));

apiRouter.use("/grip", require("./grip"));

apiRouter.use("/money-2020", require("./money-2020"));

module.exports = apiRouter;
