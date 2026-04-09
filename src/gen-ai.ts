import { GoogleGenAI, ThinkingLevel, GenerateContentConfig, Content, GenerateContentResponse, Part, MediaResolution } from '@google/genai';
import { geminiResponseSchema } from './gemini-response-schema';
import { EventData, EventDataSchema } from './types';

export async function extractEventData(imageBase64: string, caption: string): Promise<EventData> {
  const genAI: GoogleGenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const config: GenerateContentConfig = {
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.MINIMAL,
    },
    responseMimeType: 'application/json',
    responseSchema: geminiResponseSchema,
    mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
  };
  const model: string = 'gemini-3.1-flash-lite-preview';
  let parts: Part[] = [
    {
      text: `This is an IG post promoting an event. Extract structured event details from the image and caption below. Use UK local time for all datetimes. Omit fields not explicitly stated.\n\n--- IG CAPTION ---\n${caption}\n--- END IG CAPTION ---`,
    },
  ]

  if (imageBase64) {
    parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
  }

  const contents: Content[] = [{
        role: 'user',
        parts,
    }];

  const response: GenerateContentResponse = await genAI.models.generateContent({
    config,
    model,
    contents,
  });

  return EventDataSchema.parse(JSON.parse(response.text ?? ''));
}
