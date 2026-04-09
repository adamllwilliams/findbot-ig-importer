export interface ScraperResult {
  imageBase64: string;
  caption: string;
}

export interface ApifyItem {
  displayUrl: string;
  caption: string;
}

export interface EventData {
  title: string;
  description?: string | null;
  start_datetime: string;
  end_datetime?: string | null;
  venue?: string | null;
}
