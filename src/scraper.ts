import { ScraperResult, ApifyResponseSchema } from './types';

export async function scrapePost(url: string): Promise<ScraperResult> {
  const apifyRes: Response = await fetch(
    `https://api.apify.com/v2/acts/apify~ig-post-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: [url],
        resultsLimit: 1,
        dataDetailLevel: 'basicData'
      })
    }
  );

  if (!apifyRes.ok) {
    throw new Error(`Apify request failed with status ${apifyRes.status}`);
  }

  const items = ApifyResponseSchema.parse(await apifyRes.json());
  const { displayUrl, caption } = items[0];

  let imageBase64: string = '';

  try {
    const imageRes: Response = await fetch(displayUrl);
    const buffer: ArrayBuffer = await imageRes.arrayBuffer();
    imageBase64 = Buffer.from(buffer).toString('base64');
  } catch {
    console.warn('Failed to fetch image, proceeding with caption only');
  }

  if (!imageBase64 && !caption) {
    throw new Error('No image or caption available for event extraction');
  }

  return {
    imageBase64,
    caption,
  };
}