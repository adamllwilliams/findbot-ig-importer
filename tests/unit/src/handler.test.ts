import { importPost } from '../../../src/handler';
import { scrapePost } from '../../../src/scraper';
import { extractEventData } from '../../../src/gen-ai';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

jest.mock('../../../src/scraper');
jest.mock('../../../src/gen-ai');

const mockScrapePost = scrapePost as jest.Mock;
const mockExtractEventData = extractEventData as jest.Mock;

const mockEvent = (url?: string) => ({
  queryStringParameters: url ? { url } : {}
} as unknown as APIGatewayProxyEventV2);

afterEach(() => {
  jest.clearAllMocks();
});

describe('importPost', () => {
  it('should return 400 if url is missing', async () => {
    // Act
    const result = await importPost(mockEvent()) as { statusCode: number; body: string };;

    // Assert
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body as string).error).toBe('A valid IG URL is required');
  });

  it('should return 200 with event data on happy path', async () => {
    // Arrange
    mockScrapePost.mockResolvedValueOnce({
      imageBase64: 'fake-base64',
      caption: 'Test caption',
    });

    mockExtractEventData.mockResolvedValueOnce({
      title: 'Test Event',
      description: 'Test description',
      start_datetime: '2026-05-23T16:00:00',
      end_datetime: null,
      venue: 'The Golden Lion',
    });

    // Act
    const result = await importPost(mockEvent('https://www.ig.com/p/ABC123/')) as { statusCode: number; body: string };

    // Assert
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).title).toBe('Test Event');
  });

  it('should return 500 with scrapePost error message', async () => {
    // Arrange
    mockScrapePost.mockRejectedValueOnce(new Error('Apify request failed with status 403'));

    // Act
    const result = await importPost(mockEvent('https://www.ig.com/p/ABC123/')) as { statusCode: number; body: string };

    // Assert
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('Apify request failed with status 403');
  });

  it('should return 500 with extractEventData error message', async () => {
    // Arrange
    mockScrapePost.mockResolvedValueOnce({
      imageBase64: 'fake-base64',
      caption: 'Test caption',
    });

    mockExtractEventData.mockRejectedValueOnce(new Error('Gemini API error'));

    // Act
    const result = await importPost(mockEvent('https://www.ig.com/p/ABC123/')) as { statusCode: number; body: string };

    // Assert
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('Gemini API error');
  });
});