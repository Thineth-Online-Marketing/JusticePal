import { Request, Response } from 'express';

export interface LegalNewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  rawTime?: number;
  summary: string;
  url: string;
}

const fallbackNews: LegalNewsItem[] = [
  {
    id: '1',
    title: 'Supreme Court Issues New Practice Direction on Electronic Filing',
    category: 'Supreme Court',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    rawTime: Date.now(),
    summary: 'The Supreme Court of Sri Lanka has published revised guidelines for digital document submissions in commercial appeals.',
    url: 'https://www.supremecourt.lk'
  },
  {
    id: '2',
    title: 'Extraordinary Gazette Published: Commercial Law Amendments 2026',
    category: 'Gazette',
    date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    rawTime: Date.now() - 86400000,
    summary: 'New statutory provisions regarding corporate dispute resolution mechanisms take effect this month.',
    url: 'http://www.documents.gov.lk'
  },
  {
    id: '3',
    title: 'Bar Association of Sri Lanka (BASL) Annual Legal Tech Seminar',
    category: 'BASL Notice',
    date: new Date(Date.now() - 172800000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    rawTime: Date.now() - 172800000,
    summary: 'Notice to all legal practitioners regarding upcoming mandatory continuing legal education (CLE) workshops.',
    url: 'https://basl.lk'
  }
];

let cachedNews: LegalNewsItem[] | null = null;
let lastFetchedTime: number | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export const getLegalNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();

    // Return cached news if valid
    if (cachedNews && lastFetchedTime && (now - lastFetchedTime < CACHE_DURATION_MS)) {
      res.status(200).json({ success: true, data: cachedNews, source: 'cache' });
      return;
    }

    // Try fetching from external API (Google News RSS converted to JSON)
    const rssUrl = encodeURIComponent('https://news.google.com/rss/search?q=Sri+Lanka+legal+OR+Supreme+Court+Sri+Lanka+OR+Sri+Lanka+law+gazette&hl=en-LK&gl=LK&ceid=LK:en');
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    try {
      const response = await fetch(apiUrl, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('Failed to fetch from RSS to JSON API');

      const data = await response.json();
      
      if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
        const fetchedNews: LegalNewsItem[] = data.items.map((item: any, index: number) => {
          let category = 'Legal News';
          const titleLower = (item.title || '').toLowerCase();
          if (titleLower.includes('gazette')) category = 'Gazette';
          else if (titleLower.includes('supreme court')) category = 'Supreme Court';
          else if (titleLower.includes('basl')) category = 'BASL Notice';

          const parsedDate = item.pubDate ? new Date(item.pubDate) : new Date();
          const rawTime = !isNaN(parsedDate.getTime()) ? parsedDate.getTime() : Date.now();
          const formattedDate = !isNaN(parsedDate.getTime())
            ? parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

          return {
            id: `ext-${index}-${Date.now()}`,
            title: item.title,
            category: category,
            date: formattedDate,
            rawTime,
            summary: item.description ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...' : 'No summary available.',
            url: item.link,
          };
        });

        // Sort descending: newest published items first
        fetchedNews.sort((a, b) => (b.rawTime || 0) - (a.rawTime || 0));

        cachedNews = fetchedNews.slice(0, 10);
        lastFetchedTime = now;
        res.status(200).json({ success: true, data: cachedNews, source: 'api' });
        return;
      }
    } catch (apiError) {
      console.warn('External news API failed, falling back to local data.');
    }

    // Always fallback on API error or no items
    res.status(200).json({ success: true, data: fallbackNews, source: 'fallback' });
  } catch (error) {
    console.error('Catastrophic error in getLegalNews, falling back safely:', error);
    // Bulletproof fallback on any catastrophic error
    res.status(200).json({ success: true, data: fallbackNews, source: 'fallback-error' });
  }
};
