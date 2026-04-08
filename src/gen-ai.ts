import { GoogleGenAI, ThinkingLevel, GenerateContentConfig, Content, GenerateContentResponse, Part } from '@google/genai';
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
  };
  const model: string = 'gemini-3.1-flash-lite-preview';
  let parts: Part[] = [
    { text: `Extract event details from this Instagram post.\n\nCaption: ${caption}` },
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
