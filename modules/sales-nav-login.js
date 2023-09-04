const puppeteer = require("puppeteer");

async function loginToSalesNavigator(loginUrl, targetUrl, email, password) {
  if (!loginUrl || !targetUrl || !email || !password) {
    throw new Error("Missing required parameters");
  }

  const browser = await puppeteer.launch({
    headless: false, // Run in non-headless mode for debugging
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
  });

  const requestUrls = [];
  const requestHeaders = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Set up request interception before navigating to the login page
    await page.setRequestInterception(true);

    page.on("request", async (request) => {
      const url = request.url();
      const targetUrlPattern = "https://www.linkedin.com/sales-api/salesApiLeadSearch";
      if (url.includes(targetUrlPattern)) {
        const cookie = request.headers()["cookie"];
        // console.log("Request cookie:", cookie);
        console.log("Raw headers:", request.headers());
        requestHeaders.push(cookie);
        requestUrls.push(request.url());
      }
      request.continue();
    });
    

    await page.goto(loginUrl);

    // Wait for the form input divs to appear
    await page.waitForSelector(".form__input--floating");

    // Find the input elements inside the divs using 'aria-label' attributes
    const emailInput = await page.$('input[aria-label="Email or Phone"]');
    await emailInput.type(email);

    const passwordInput = await page.$('input[aria-label="Password"]');
    await passwordInput.type(password);

    // Find and click the "Sign in" button
    await page.click('button[aria-label="Sign in"]');
 
    // Add a 2-second delay after successful login
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await page.goto(targetUrl);

    await new Promise((resolve) => setTimeout(resolve, 5000));
   
    // Return results
    return {
      status: "success",
      requestHeaders,
      requestUrls,
    };
  } catch (error) {
    console.error("Error during the login process:", error.message);
    return {
      status: "error",
      error: error.message,
    };
  } finally {
    // Close the browser when done (whether successful or not)
    await browser.close();
  }
}

module.exports = loginToSalesNavigator;
