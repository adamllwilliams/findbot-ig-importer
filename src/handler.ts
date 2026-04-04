import { ApifyClient } from 'apify-client';

exports.hello = async (event) => {
  const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
  });

  const input = {
    "username": [
        "https://www.instagram.com/p/DVJudAwiLW3/",
    ],
    "resultsLimit": 24,
    "dataDetailLevel": "basicData"
  };

  const run = await client.actor("apify/instagram-post-scraper").call(input);

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v4! Your function executed successfully!",
      displayUrl: items[0].displayUrl,
      caption: items[0].caption,
    }),
  };
};
