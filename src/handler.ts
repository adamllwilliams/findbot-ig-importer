import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { scrapePost } from './scraper';
import { extractEventData } from './gen-ai';
import { EventData } from './types';

export const importPost = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const url = event.queryStringParameters?.url;

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'A valid IG URL is required' }),
      };
    }

    // scraper
    const { imageBase64, caption } = await scrapePost(url);

    // gen-ai
    const eventData: EventData = await extractEventData(imageBase64, caption);

    return {
      statusCode: 200,
      body: JSON.stringify(eventData),
    };
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = 'An unexpected error occurred';
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    }
  }
};
