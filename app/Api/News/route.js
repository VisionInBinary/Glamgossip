
import { NextResponse } from 'next/server';
import { detectRegion, weightNews, paginate, fetchNewsAPI, fetchRSS } from '../../../lib/getNews';
import newsData from '../../../content/news.json';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);

    // detect region from header or fallback to default
    let region = searchParams.get('region');
    if (!region) region = detectRegion(req.headers);

    // Load static news first (from /content/news.json)
    let articles = (newsData?.items || []).map(a => ({ ...a }));

    // Fallback to APIs if empty
    if (!articles.length) {
      try {
        articles = await fetchNewsAPI(region);
      } catch (e) {
        console.error('NewsAPI fetch failed', e);
      }
      if (!articles.length) {
        try {
          articles = await fetchRSS(region);
        } catch (e) {
          console.error('RSS fetch failed', e);
        }
      }
    }

    // Apply weighting & paginate
    const weighted = weightNews(articles, region);
    const { items, nextPage } = paginate(weighted, page, pageSize);

    return NextResponse.json({ region, page, pageSize, items, nextPage });
  } catch (err) {
    console.error('News API error:', err);
    return NextResponse.json({ error: 'Failed to load news' }, { status: 500 });
  }
}
