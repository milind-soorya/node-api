const puppeteer = require("puppeteer");

async function loginToSalesNavigator(loginUrl, targetUrl, email, password) {
  if (!loginUrl || !targetUrl || !email || !password) {
    throw new Error("Missing required parameters");
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const requestUrls = [];
  const requestHeaders = [];

  await page.setRequestInterception(true);

  page.on("request", async (request) => {
    if (request.headers().hasOwnProperty("Cookie")) {
      const cookie = request.headers()["Cookie"];
      requestHeaders.push(cookie);
      requestUrls.push(request.url());
    }

    request.continue();
  });

  await page.goto(loginUrl);
  const iframeElement = await page.$("iframe");
  const iframe = await iframeElement.contentFrame();

  const EMAIL_SELECTOR = "#username";
  const PASSWORD_SELECTOR = "#password";
  const BUTTON_SELECTOR =
    "#app__container > main > div > form > div.login__form_action_container > button";

  await iframe.waitForSelector(EMAIL_SELECTOR);
  await iframe.type(EMAIL_SELECTOR, email);

  await iframe.waitForSelector(PASSWORD_SELECTOR);
  await iframe.type(PASSWORD_SELECTOR, password);

  await iframe.click(BUTTON_SELECTOR);

  await page.waitForNavigation({ waitUntil: "networkidle0" });

  await page.goto(targetUrl, { waitUntil: "networkidle0" });

  setTimeout(async () => {
    await browser.close();
  }, 10000);

  return {
    requestHeaders,
    requestUrls,
  };
}

module.exports = loginToSalesNavigator;
