import { ApifyClient } from 'apify-client';

exports.hello = async (event) => {
  // SCRAPE
  const res = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-post-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: [event.queryStringParameters?.url],
        resultsLimit: 24,
        dataDetailLevel: 'basicData'
      })
    }
  );

  const items = await res.json();
  const displayUrl = items[0].displayUrl;
  const caption = items[0].caption;

  const imageRes = await fetch(displayUrl);
  const buffer = await imageRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v4! Your function executed successfully!",
      displayUrl: displayUrl,
      caption: caption,
    }),
  };
};
