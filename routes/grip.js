const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
let bearerToken = "";
let requestUrls = [];

app.use(express.json()); // Add this line to parse JSON

app.post("/auth_token", async (req, res) => {
  try {
    const { loginUrl, targetUrl, email, password } = req.body;
    const token = await getToken({ loginUrl, targetUrl, email, password });
    const response = {
      "x-authorization": token,
      request_urls: requestUrls,
    };
    res.json(response);
    requestUrls = []; // Clear the requestUrls array
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

async function getToken({ loginUrl, targetUrl, email, password }) {
  if (!loginUrl || !targetUrl || !email || !password) {
    throw new Error("Missing required parameters");
  }

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on("request", async (request) => {
    const customHeaders = {
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "",
      Authorization: bearerToken ? `Bearer ${bearerToken}` : "",
      "Cache-Control": "No-Cache",
      Dnt: "1",
      "Login-Source": "web",
      Origin: "https://matchmaking.grip.events",
      Pragma: "No-Cache",
      Referer: "https://matchmaking.grip.events/fintechtalentsnorthamerica2023/event-login",
      "Sec-Ch-Ua": '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      "X-Grip-Version": "Web/19.1.2",
    };

    try {
      if (
        request.headers().hasOwnProperty("x-authorization") &&
        request.url().startsWith("https://api-prod.grip.events/1/container/5891/search?")
      ) {
        bearerToken = request.headers()["x-authorization"];
        requestUrls.push(request.url());
      }

      request.continue();
    } catch (error) {
      console.error(error);
      request.abort();
    }
  });

  await page.goto(loginUrl, {
    waitUntil: "networkidle0",
  });

  await page.waitForSelector('button[data-test="loginButton"]', {
    visible: true,
  });
  await page.click('button[data-test="loginButton"]');

  await page.type('input[data-test="emailInput"]', email);
  await page.waitForSelector('button[data-test="loginButton"]', {
    visible: true,
  });
  await page.click('button[data-test="loginButton"]');

  await page.waitForTimeout(2000);

  await page.type('input[data-test="passwordInput"]', password);
  await page.click('button[data-test="loginButton"]');

  await page.waitForNavigation({ waitUntil: "networkidle0" });
  await page.waitForTimeout(2000);

  await page.goto(targetUrl, {
    waitUntil: "networkidle0",
  });

  await browser.close(); // Close the browser instance

  return bearerToken;
}

module.exports = app;
