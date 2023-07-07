const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");

const app = express();

app.get("/scrape", async (req, res) => {
  try {
    // downloading the target web page
    // by performing an HTTP GET request in Axios
    const axiosResponse = await axios.request({
      method: "GET",
      url: "https://brightdata.com/",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      },
    });

    // parsing the HTML source of the target web page with Cheerio
    const $ = cheerio.load(axiosResponse.data);

    // initializing the data structures
    // that will contain the scraped data
    const industries = [];
    const marketLeaderReasons = [];
    const customerExperienceReasons = [];

    // Scraping the "Popular Use cases" section
    $(".section_cases_row_col_item").each((index, element) => {
      // Extracting the data of interest
      const imageUrl = $(element).find("img").attr("data-lazy-src");
      const useCaseTitle = $(element).find(".elementor-image-box-title a").text().trim();
      const useCaseUrl = $(element).find(".elementor-image-box-title a").attr("href");

      // Creating an object containing the scraped data
      const useCase = {
        imageUrl: imageUrl,
        title: useCaseTitle,
        url: useCaseUrl,
      };

      // Adding the object containing the scraped data to the popularUseCases array
      industries.push(useCase);
    });

    // transforming the scraped data into a general object
    const scrapedData = {
      industries: industries,
      marketLeader: marketLeaderReasons,
      customerExperience: customerExperienceReasons,
    };

    // sending the scraped data as the API response
    res.json(scrapedData);
  } catch (error) {
    // handling any errors that occurred during scraping
    res.status(500).json({ error: "Scraping failed" });
  }
});

module.exports = app;
