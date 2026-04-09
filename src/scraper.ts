import { ScraperResult, ApifyItem } from './types';

export async function scrapePost(url: string): Promise<ScraperResult> {
  const apifyRes = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-post-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: [url],
        resultsLimit: 1,
        dataDetailLevel: 'basicData',
      }),
    }
  );

  if (!apifyRes.ok) {
    throw new Error(`Apify request failed with status ${apifyRes.status}`);
  }

  const items = await apifyRes.json() as ApifyItem[];

  if (items.length === 0) {
    throw new Error('No results returned from Apify');
  }

  const { displayUrl, caption } = items[0];

  let imageBase64: string = '';

  try {
    const imageRes = await fetch(displayUrl);
    const buffer = await imageRes.arrayBuffer();
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
