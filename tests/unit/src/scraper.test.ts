import { scrapePost } from '../../../src/scraper';
import { ApifyClient } from 'apify-client';

jest.mock('apify-client');

const mockListItems = jest.fn();
const mockCall = jest.fn();

(ApifyClient as jest.Mock).mockImplementation(() => ({
  actor: () => ({ call: mockCall }),
  dataset: () => ({ listItems: mockListItems }),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('scrapePost', () => {
  beforeEach(() => {
    mockCall.mockResolvedValue({ defaultDatasetId: 'test-dataset-id' });
  });

  it('should return imageBase64 and caption on happy path', async () => {
    // Arrange
    mockListItems.mockResolvedValueOnce({
      items: [{ displayUrl: 'https://cdn.ig.com/image.jpg', caption: 'Test event caption' }],
    });

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => Buffer.from('fake-image-data'),
    } as unknown as Response);

    // Act
    const result = await scrapePost('https://www.ig.com/p/ABC123/');

    // Assert
    expect(result.caption).toBe('Test event caption');
    expect(result.imageBase64).toBeTruthy();
  });

  it('should use the first item if multiple items are returned from apify', async () => {
    // Arrange
    mockListItems.mockResolvedValueOnce({
      items: [
        { displayUrl: 'https://cdn.ig.com/image1.jpg', caption: 'First caption' },
        { displayUrl: 'https://cdn.ig.com/image2.jpg', caption: 'Second caption' },
      ],
    });

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => Buffer.from('fake-image-data'),
    } as unknown as Response);

    // Act
    const result = await scrapePost('https://www.ig.com/p/ABC123/');

    // Assert
    expect(result.caption).toBe('First caption');
  });

  it('should proceed with empty imageBase64 if image fetch fails', async () => {
    // Arrange
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    mockListItems.mockResolvedValueOnce({
      items: [{ displayUrl: 'https://cdn.ig.com/image.jpg', caption: 'Test event caption' }],
    });

    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    // Act
    const result = await scrapePost('https://www.ig.com/p/ABC123/');

    // Assert
    expect(result.imageBase64).toBe('');
    expect(result.caption).toBe('Test event caption');
    expect(warnSpy).toHaveBeenCalledWith('Failed to fetch image, proceeding with caption only');
  });

  it('should proceed with image if caption is empty', async () => {
    // Arrange
    mockListItems.mockResolvedValueOnce({
      items: [{ displayUrl: 'https://cdn.ig.com/image.jpg', caption: '' }],
    });

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => Buffer.from('fake-image-data'),
    } as unknown as Response);

    // Act
    const result = await scrapePost('https://www.ig.com/p/ABC123/');

    // Assert
    expect(result.caption).toBe('');
    expect(result.imageBase64).toBeTruthy();
  });

  it('should throw if both imageBase64 and caption are empty', async () => {
    // Arrange
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    mockListItems.mockResolvedValueOnce({
      items: [{ displayUrl: 'https://cdn.ig.com/image.jpg', caption: '' }],
    });

    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    // Act & Assert
    await expect(scrapePost('https://www.ig.com/p/ABC123/')).rejects.toThrow('No image or caption available for event extraction');
    expect(warnSpy).toHaveBeenCalledWith('Failed to fetch image, proceeding with caption only');
  });

  it('should throw if apify returns no items', async () => {
    // Arrange
    mockListItems.mockResolvedValueOnce({ items: [] });

    // Act & Assert
    await expect(scrapePost('https://www.ig.com/p/ABC123/')).rejects.toThrow('No results returned from Apify');
  });

  it('should throw if the apify actor call fails', async () => {
    // Arrange
    mockCall.mockRejectedValueOnce(new Error('Apify actor error'));

    // Act & Assert
    await expect(scrapePost('https://www.ig.com/p/ABC123/')).rejects.toThrow('Apify actor error');
  });
});
