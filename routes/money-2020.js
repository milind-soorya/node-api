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

  // const browser = await puppeteer.launch({ headless: "new" });
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on("request", async (request) => {
    try {
      const url = request.url();
      const searchString = "search?"; // Replace 'search-word' with the word you want to search for

      if (
        request.headers().hasOwnProperty("x-authorization") &&
        request.url().startsWith("https://api-prod.grip.events/1/container/") &&
        url.includes(searchString)
      ) {
        bearerToken = request.headers()["x-authorization"];
        requestUrls.push(url);
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

  await page.waitForSelector('a[data-test="loginSSOButton"]', {
    visible: true,
  });
  await page.click('a[data-test="loginSSOButton"]');

  await page.waitForSelector('input[name="username"]', {
    visible: true,
  });

  await page.type('input[name="username"]', email);
  await page.type('input[name="password"]', password);

  // await page.click('button[name="action"]');
  await page.evaluate(() => {
    const loginButton = document.querySelector('button[name="action"]');
    loginButton.click();
  });

  await page.waitForNavigation({ waitUntil: "networkidle0" });

  await page.goto(targetUrl, {
    waitUntil: "networkidle0",
  });

  await browser.close(); // Close the browser instance

  return bearerToken;
}

module.exports = app;
