var express = require("express"),
  apiRouter = express();

// apiRouter.use("/user", require("./user"));

apiRouter.use("/grip", require("./grip"));

apiRouter.use("/money-2020", require("./money-2020"));

apiRouter.use("/bright-data", require("./bright-data"));

apiRouter.use("/sales-nav", require("./sales-nav"));

module.exports = apiRouter;
