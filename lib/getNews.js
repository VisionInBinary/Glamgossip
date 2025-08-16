
// /lib/getNews.js

// Detect user region from IP headers
export function detectRegion(headers) {
  try {
    const ip = headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry');
    return ip && ip.toUpperCase() === 'IN' ? 'IN' : 'US';
  } catch {
    return 'US'; // fallback default
  }
}

// Weighting function: prioritize region-related news
export function weightNews(articles, region) {
  return articles
    .map(a => {
      let weight = a.spice || 1;
      if (region === 'IN' && a.domain === 'bollywood') weight += 1;
      if (region !== 'IN' && a.domain === 'hollywood') weight += 1;
      return { ...a, weight };
    })
    .sort((a, b) => b.weight - a.weight || b.publishedAt - a.publishedAt);
}

// Paginate results for infinite scrolling
export function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    nextPage: end < items.length ? page + 1 : null
  };
}

// Fetch from NewsAPI
export async function fetchNewsAPI(region) {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return [];
  const domFilter = region === 'IN' ? 'Bollywood' : 'Hollywood';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(domFilter + ' celebrity')}&language=en&sortBy=publishedAt&pageSize=50`;

  const res = await fetch(url, { headers: { 'X-Api-Key': key }, cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.articles || []).map((a, i) => ({
    id: a.url || String(i),
    domain: region === 'IN'
      ? (/india|bollywood/i.test(((a.source?.name || '') + ' ' + a.title)) ? 'bollywood' : 'hollywood')
      : (/hollywood|us|uk|variety|hollywood/i.test(((a.source?.name || '') + ' ' + a.title)) ? 'hollywood' : 'bollywood'),
    title: a.title || 'Untitled',
    summary: a.description || '',
    image: a.urlToImage || '',
    url: a.url || '#',
    spice: 0.5 + Math.random() * 0.5,
    publishedAt: new Date(a.publishedAt || Date.now()).getTime()
  }));
}

// --- RSS HELPERS ---
function extract(tag, text) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = text.match(re);
  return m ? m[1] : '';
}

function parseRSS(xmlText, domain) {
  const items = [];
  const parts = xmlText.split(/<item>/i).slice(1);
  for (const chunk of parts) {
    const title = extract('title', chunk).replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    const link = extract('link', chunk).trim();
    const pubDate = extract('pubDate', chunk).trim();
    const desc = extract('description', chunk).replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    if (!title) continue;
    items.push({
      id: link || title,
      domain,
      title,
      summary: desc.replace(/<[^>]+>/g, ''),
      image: '',
      url: link || '#',
      spice: 0.5 + Math.random() * 0.5,
      publishedAt: pubDate ? new Date(pubDate).getTime() : Date.now()
    });
  }
  return items;
}

export async function fetchRSS(region) {
  const qBol = 'Bollywood celebrity';
  const qHol = 'Hollywood celebrity';
  const inURL = `https://news.google.com/rss/search?q=${encodeURIComponent(qBol)}&hl=en-IN&gl=IN&ceid=IN:en`;
  const usURL = `https://news.google.com/rss/search?q=${encodeURIComponent(qHol)}&hl=en-US&gl=US&ceid=US:en`;

  const targets = region === 'IN'
    ? [{ url: inURL, domain: 'bollywood' }, { url: usURL, domain: 'hollywood' }]
    : [{ url: usURL, domain: 'hollywood' }, { url: inURL, domain: 'bollywood' }];

  const results = [];
  for (const t of targets) {
    try {
      const res = await fetch(t.url, { cache: 'no-store' });
      if (res.ok) {
        const txt = await res.text();
        results.push(...parseRSS(txt, t.domain));
      }
    } catch (e) {
      console.error('RSS fetch error', e);
    }
  }
  return results;
}
