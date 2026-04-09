import { scrapePost } from '../../../src/scraper';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('scrapePost', () => {
  it('should return imageBase64 and caption on happy path', async () => {
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ displayUrl: 'https://cdn.ig.com/image.jpg', caption: 'Test event caption' }],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => Buffer.from('fake-image-data'),
      } as unknown as Response);

    const result = await scrapePost('https://www.ig.com/p/ABC123/');

    expect(result.caption).toBe('Test event caption');
    expect(result.imageBase64).toBeTruthy();
  });

  it('should throw if apify request fails', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as unknown as Response);

    await expect(scrapePost('https://www.ig.com/p/ABC123/')).rejects.toThrow('Apify request failed with status 403');
  });

  it('should throw if apify returns no items', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as unknown as Response);

    await expect(scrapePost('https://www.ig.com/p/ABC123/')).rejects.toThrow('No results returned from Apify');
  });

  it('should use the first item if multiple items are returned', async () => {
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { displayUrl: 'https://cdn.ig.com/image1.jpg', caption: 'First caption' },
          { displayUrl: 'https://cdn.ig.com/image2.jpg', caption: 'Second caption' },
        ],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => Buffer.from('fake-image-data'),
      } as unknown as Response);

    const result = await scrapePost('https://www.ig.com/p/ABC123/');

    expect(result.caption).toBe('First caption');
  });

  it('should proceed with empty imageBase64 if image fetch fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ displayUrl: 'https://cdn.ig.com/image.jpg', caption: 'Test event caption' }],
      } as unknown as Response)
      .mockRejectedValueOnce(new Error('Network error'));

    const result = await scrapePost('https://www.ig.com/p/ABC123/');

    expect(result.imageBase64).toBe('');
    expect(result.caption).toBe('Test event caption');
    expect(warnSpy).toHaveBeenCalledWith('Failed to fetch image, proceeding with caption only');
  });

  it('should proceed with image if caption is empty', async () => {
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ displayUrl: 'https://cdn.ig.com/image.jpg', caption: '' }],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => Buffer.from('fake-image-data'),
      } as unknown as Response);

    const result = await scrapePost('https://www.ig.com/p/ABC123/');

    expect(result.caption).toBe('');
    expect(result.imageBase64).toBeTruthy();
  });

  it('should throw if both imageBase64 and caption are empty', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ displayUrl: 'https://cdn.ig.com/image.jpg', caption: '' }],
      } as unknown as Response)
      .mockRejectedValueOnce(new Error('Network error'));

    await expect(scrapePost('https://www.ig.com/p/ABC123/')).rejects.toThrow('No image or caption available for event extraction');
    expect(warnSpy).toHaveBeenCalledWith('Failed to fetch image, proceeding with caption only');
  });
});
