
export function detectRegion(headers) {
  const get = (k)=> (headers.get ? headers.get(k) : headers[k]);
  const country = (get('x-vercel-ip-country') || '').toUpperCase();
  if (country === 'IN') return 'IN';
  if (country === 'US' || country === 'GB') return 'USUK';
  return 'USUK';
}

export function normalizeArticles(items=[]) {
  return items.map((a,i)=> ({
    id: a.id || a.url || String(i),
    domain: a.domain || 'hollywood',
    title: a.title || 'Untitled',
    summary: a.summary || '',
    image: a.image || '',
    url: a.url || '#',
    spice: typeof a.spice === 'number' ? a.spice : 0.5 + Math.random()*0.5,
    publishedAt: a.publishedAt || Date.now()
  }));
}

export function weightNews(items, region='USUK') {
  const w = (d)=> region==='IN' ? (d==='bollywood'?2:1) : (d==='hollywood'?2:1);
  return normalizeArticles(items)
    .map(n => ({...n, _rank: (n.spice*100) + (w(n.domain)*50) + (Date.now()-n.publishedAt)/-1e7 }))
    .sort((a,b)=> b._rank - a._rank);
}

export function paginate(items, page=1, pageSize=12) {
  const start = (page-1)*pageSize;
  const end = start + pageSize;
  const slice = items.slice(start, end);
  return { items: slice, nextPage: end < items.length ? page+1 : page+1 };
}
