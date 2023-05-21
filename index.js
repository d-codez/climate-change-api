const PORT = process.env.PORT || 8000;

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

const articles = [];
const newsPapers = [
  {
    "name": "cityam",
    "address": "https://www.cityam.com/london-must-become-a-world-leader-on-climate-change-action",
    "base": ""
  },
  {
    "name": "thetimes",
    "address": "https://www.thetimes.co.uk/environment/climate-change",
    "base": ""
  },
  {
    "name": "guardian",
    "address": "https://www.theguardian.com/environment/climate-change",
    "base": ""
  },
  {
    "name": "BBCNews",
    "address": "https://www.bbc.com/news/science-environment-56837908",
    "base": "https://www.bbc.com"
  },
  {
    "name": "NationalGeographic",
    "address": "https://www.nationalgeographic.com/environment/climate-change/",
    "base": ""
  },
  {
    "name": "TheNewYorkTimes",
    "address": "https://www.nytimes.com/section/climate",
    "base": "https://www.nytimes.com"
  },
  {
    "name": "WashingtonPost",
    "address": "https://www.washingtonpost.com/climate-environment/",
    "base": ""
  },
  {
    "name": "AlJazeera",
    "address": "https://www.aljazeera.com/climate-crisis",
    "base": ""
  },
  {
    "name": "TheIndependent",
    "address": "https://www.independent.co.uk/environment/climate-change",
    "base": "https://www.independent.co.uk"
  },
  {
    "name": "Bloomberg",
    "address": "https://www.bloomberg.com/green/climate-politics",
    "base": ""
  },
  {
    "name": "ScientificAmerican",
    "address": "https://www.scientificamerican.com/earth-and-environment/",
    "base": ""
  },
  {
    "name": "HuffPost",
    "address": "https://www.huffpost.com/impact/topic/climate-change",
    "base": ""
  },
  {
    "name": "ABCNews",
    "address": "https://abcnews.go.com/alerts/climate-change",
    "base": ""
  },
  {
    "name": "TheSydneyMorningHerald",
    "address": "https://www.smh.com.au/environment/climate-change",
    "base": ""
  },
  {
    "name": "CBCNews",
    "address": "https://www.cbc.ca/news/climate",
    "base": "https://www.cbc.ca"
  },
  {
    "name": "telegraph",
    "address": "https://www.telegraph.co.uk/climate-change",
    "base": "https://www.telegraph.co.uk"
  },
  {
    "name": "Vox",
    "address": "https://www.vox.com/energy-and-environment",
    "base": ""
  },
  {
    "name": "NBCNews",
    "address": "https://www.nbcnews.com/science/environment",
    "base": "https://www.nbcnews.com"
  },
  {
    "name": "FinancialTimes",
    "address": "https://www.ft.com/climate-capital",
    "base": ""
  },
  {
    "name": "CBSNews",
    "address": "https://www.cbsnews.com/climate-change/",
    "base": "https://www.cbsnews.com"
  },
  {
    "name": "USAToday",
    "address": "https://www.usatoday.com/climate-change/",
    "base": "https://www.usatoday.com"
  },
  {
    "name": "TheWallStreetJournal",
    "address": "https://www.wsj.com/search?query=climate&mod=searchresults_viewallresults",
    "base": ""
  },
  {
    "name": "Time",
    "address": "https://time.com/section/climate/",
    "base": "https://time.com"
  },
  {
    "name": "NPR",
    "address": "https://www.npr.org/sections/climate",
    "base": "https://www.npr.org"
  },
  {
    "name": "TheWeatherChannel",
    "address": "https://features.weather.com/collateral",
    "base": ""
  },
  {
    "name": "TheEconomist",
    "address": "https://www.economist.com/climate-change",
    "base": "https://www.economist.com"
  }
];

const processArticle = ($, element) => {
  let title = $(element).text()?.replace(/\s+/g, ' ').trim();
  const url = $(element).attr('href');

  if (title?.includes('<img')) {
    const innerHtml = $(element).html();
    const inner$ = cheerio.load(innerHtml);
    title = inner$('img').attr('alt')?.replace(/\s+/g, ' ').trim();
  }

  return { title, url };
};

const getArticles = async () => {
  try {
    for (const newsPaper of newsPapers) {
      const response = await axios.get(newsPaper.address);
      const html = response.data;
      const $ = cheerio.load(html);

      $('a:contains("climate")', html).each(function () {
        const { title, url } = processArticle($, this);

        articles.push({
          title,
          url: url.includes('https') ? url : newsPaper.base + url,
          source: newsPaper.name,
        });
      });
    }
  } catch (error) {
    console.log({ error });
    return error;
  }
};

getArticles();

app.get('/', (req, res) => {
  res.json('Welcome to my climate change API');
});

app.get('/news', (req, res) => {
  res.json(articles);
});

app.get('/news/:newsPaperId', async (req, res) => {
  try {
    const newsPaperId = req.params.newsPaperId;
    const newsPaper = newsPapers.find((newsPaper) => newsPaper.name.toLowerCase() == newsPaperId.toLowerCase());
    const newsPaperAddress = newsPaper.address;
    const newsPaperBase = newsPaper.base;

    const response = await axios.get(newsPaperAddress);
    const specificArticles = [];
    const html = response.data;
    const $ = cheerio.load(html);

    $('a:contains("climate")', html).each(function () {
      const { title, url } = processArticle($, this);

      specificArticles.push({
        title,
        url: url.includes('https') ? url : newsPaperBase + url,
        source: newsPaperId,
      });
    });

    res.json(specificArticles);
  } catch (error) {
    console.log({ error });
    return error;
  }
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
