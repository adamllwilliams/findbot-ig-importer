import { z } from 'zod';

export interface ScraperResult {
  imageBase64: string;
  caption: string;
}

export const ApifyItemSchema = z.object({
  displayUrl: z.string(),
  caption: z.string(),
});

export const ApifyResponseSchema = z.array(ApifyItemSchema).min(1, {
  message: 'No results returned from Apify'
});

export const EventDataSchema = z.object({
  title: z.string(),
  description: z.string().nullish(),
  start_datetime: z.string(),
  end_datetime: z.string().nullish(),
  venue: z.string().nullish(),
});

export type EventData = z.infer<typeof EventDataSchema>;