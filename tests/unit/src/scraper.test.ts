import { scrapePost } from '../../../src/scraper';

describe('scrapePost', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return imageBase64 and caption on happy path', async () => {
    // Arrange
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ displayUrl: 'https://cdn.ig.com/image.jpg', caption: 'Test event caption' }]
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => Buffer.from('fake-image-data')
      } as unknown as Response);

    // Act
    const result = await scrapePost('https://www.ig.com/p/ABC123/');

    // Assert
    expect(result.caption).toBe('Test event caption');
    expect(result.imageBase64).toBeTruthy();
  });

  it('should throw error if apify request fails', async () => {
    // Arrange
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
      } as unknown as Response);

    // Act & Assert
    await expect(scrapePost('https://www.ig.com/p/ABC123/')).rejects.toThrow('Apify request failed with status 403');
  });

  it('should throw error if apify items are empty', async () => {
    // Arrange
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as unknown as Response);

    // Act & Assert
    await expect(scrapePost('https://www.ig.com/p/ABC123/')).rejects.toThrow('No results returned from Apify');
  });

  it('should throw error if apify response is missing required fields', async () => {
    // Arrange
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ displayUrl: 'https://cdn.ig.com/image.jpg' }]
      } as unknown as Response);

    // Act & Assert
    await expect(scrapePost('https://www.ig.com/p/ABC123/')).rejects.toThrow();
  });

  it('should use the first item if multiple items are returned from apify', async () => {
    // Arrange
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { displayUrl: 'https://cdn.ig.com/image1.jpg', caption: 'First caption' },
          { displayUrl: 'https://cdn.ig.com/image2.jpg', caption: 'Second caption' }
        ]
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => Buffer.from('fake-image-data')
      } as unknown as Response);

    // Act
    const result = await scrapePost('https://www.ig.com/p/ABC123/');

    // Assert
    expect(result.caption).toBe('First caption');
  });

  it('should proceed with empty imageBase64 if image fetch fails', async () => {
    // Arrange
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ displayUrl: 'https://cdn.ig.com/image.jpg', caption: 'Test event caption' }]
      } as unknown as Response)
      .mockRejectedValueOnce(new Error('Network error'));

    // Act
    const result = await scrapePost('https://www.ig.com/p/ABC123/');

    // Assert
    expect(result.imageBase64).toBe('');
    expect(result.caption).toBe('Test event caption');
    expect(warnSpy).toHaveBeenCalledWith('Failed to fetch image, proceeding with caption only');
  });

  it('should proceed with image if caption is empty', async () => {
    // Arrange
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ displayUrl: 'https://cdn.ig.com/image.jpg', caption: '' }]
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => Buffer.from('fake-image-data')
      } as unknown as Response);

    // Act
    const result = await scrapePost('https://www.ig.com/p/ABC123/');

    // Assert
    expect(result.caption).toBe('');
    expect(result.imageBase64).toBeTruthy();
  });

  it('should throw an error with empty imageBase64 and caption', async () => {
    // Arrange
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ displayUrl: 'https://cdn.ig.com/image.jpg', caption: '' }]
      } as unknown as Response)
      .mockRejectedValueOnce(new Error('Network error'));

    // Act & Assert
    await expect(scrapePost('https://www.ig.com/p/ABC123/')).rejects.toThrow('No image or caption available for event extraction');
    expect(warnSpy).toHaveBeenCalledWith('Failed to fetch image, proceeding with caption only');
  });
});