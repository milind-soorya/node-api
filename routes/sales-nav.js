const express = require("express");
const loginToSalesNavigator = require("../modules/sales-nav-login");
const useProxyMiddleware = require("../modules/proxyMiddleware");
const app = express();

app.use(express.json());

// Add the proxy middleware to the app
// app.use(useProxyMiddleware);

app.post("/auth_token", async (req, res) => {
  try {
    const { loginUrl, targetUrl, email, password } = req.body;
    const { requestHeaders, requestUrls } = await loginToSalesNavigator(
      loginUrl,
      targetUrl,
      email,
      password
    );
    const response = {
      requestUrls,
      requestHeaders,
    };
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = app;
