import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

exports.hello = async (event) => {
  // SCRAPE
  const res = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-post-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: [event.queryStringParameters?.url],
        resultsLimit: 1,
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
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const config = {
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.MINIMAL,
    },
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      required: ["title", "start_datetime"],
      properties: {
        title: {
          type: Type.STRING,
          description: "Event title",
        },
        description: {
          type: Type.STRING,
          description: "Event description in 140 characters or less",
        },
        start_datetime: {
          type: Type.STRING,
          description: "Event start datetime in local UK time (format: YYYY-MM-DDTHH:MM:SS, no timezone)",
        },
        end_datetime: {
          type: Type.STRING,
          description: "Event end datetime in local UK time (format: YYYY-MM-DDTHH:MM:SS, no timezone)",
        },
        venue: {
          type: Type.STRING,
          description: "Venue or location name",
        },
      },
    },
  };
  const model = 'gemini-3.1-flash-lite-preview';
  const contents = [{
      role: 'user',
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64 } },
        { text: `Extract event details from this Instagram post.\n\nCaption: ${caption}` }
      ]
    }];

  const response = await genAI.models.generateContent({
    config,
    model,
    contents,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v4! Your function executed successfully!",
      displayUrl: displayUrl,
      caption: caption,
      eventData: response.text,
    }),
  };
};
