import { extractEventData } from '../../../src/gen-ai';
import { GoogleGenAI } from '@google/genai';

jest.mock('@google/genai');

const mockGenerateContent = jest.fn();

beforeEach(() => {
  (GoogleGenAI as jest.Mock).mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('extractEventData', () => {
  it('should return EventData on happy path', async () => {
    // Arrange
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        title: 'Test Event',
        description: 'Test description',
        start_datetime: '2026-05-23T16:00:00',
        end_datetime: null,
        venue: 'The Golden Lion',
      }),
    });

    // Act
    const result = await extractEventData('fake-base64', 'Test caption');

    // Assert
    expect(result.title).toBe('Test Event');
    expect(result.venue).toBe('The Golden Lion');
    expect(result.start_datetime).toBe('2026-05-23T16:00:00');
  });

  it('should throw if response text is empty', async () => {
    // Arrange
    mockGenerateContent.mockResolvedValueOnce({
      text: '',
    });

    // Act & Assert
    await expect(extractEventData('fake-base64', 'Test caption')).rejects.toThrow();
  });

  it('should include image part when imageBase64 is provided', async () => {
    // Arrange
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        title: 'Test Event',
        description: null,
        start_datetime: '2026-05-23T16:00:00',
        end_datetime: null,
        venue: null,
      }),
    });

    // Act
    await extractEventData('fake-base64', 'Test caption');

    // Assert
    const callArgs = mockGenerateContent.mock.calls[0][0];
    const firstPart = callArgs.contents[0].parts[0];
    expect(firstPart).toHaveProperty('inlineData');
  });

  it('should exclude image part when imageBase64 is empty', async () => {
    // Arrange
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        title: 'Test Event',
        description: null,
        start_datetime: '2026-05-23T16:00:00',
        end_datetime: null,
        venue: null,
      }),
    });

    // Act
    await extractEventData('', 'Test caption');

    // Assert
    const callArgs = mockGenerateContent.mock.calls[0][0];
    const firstPart = callArgs.contents[0].parts[0];
    expect(firstPart).not.toHaveProperty('inlineData');
  });

  it('should throw if generateContent throws', async () => {
    // Arrange
    mockGenerateContent.mockRejectedValueOnce(new Error('Gemini API error'));

    // Act & Assert
    await expect(extractEventData('fake-base64', 'Test caption')).rejects.toThrow('Gemini API error');
  });
});