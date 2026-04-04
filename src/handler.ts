import { GoogleGenAI } from '@google/genai';

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

  // GEMINI
  const ai = new GoogleGenAI({
    apiKey: process.env['GEMINI_API_KEY'],
  });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Explain how AI works in a few words",
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v4! Your function executed successfully!",
      displayUrl: displayUrl,
      caption: caption,
      responseText: response.text,
    }),
  };
};
