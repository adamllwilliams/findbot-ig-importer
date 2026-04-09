import { ApifyClient } from 'apify-client';
import { ScraperResult, ApifyItem } from './types';

export async function scrapePost(url: string): Promise<ScraperResult> {
  const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

  const run = await client.actor('apify/instagram-post-scraper').call({
    directUrls: [url],
    resultsLimit: 1,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  if (items.length === 0) {
    throw new Error('No results returned from Apify');
  }

  const { displayUrl, caption } = items[0] as unknown as ApifyItem;

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
