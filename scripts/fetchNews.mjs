
import fs from 'node:fs/promises';

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function fetchNewsAPI(region) {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return [];
  const domFilter = region === 'IN' ? 'Bollywood' : 'Hollywood';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(domFilter + ' celebrity')}&language=en&sortBy=publishedAt&pageSize=50`;
  const res = await fetch(url, { headers: { 'X-Api-Key': key } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.articles || []).map((a, i) => ({
    id: a.url || String(i),
    domain: region === 'IN'
      ? (/india|bollywood/i.test(((a.source?.name||'') + ' ' + a.title)) ? 'bollywood' : 'hollywood')
      : (/hollywood|us|uk|variety|hollywood/i.test(((a.source?.name||'') + ' ' + a.title)) ? 'hollywood' : 'bollywood'),
    title: a.title || 'Untitled',
    summary: a.description || '',
    image: a.urlToImage || '',
    url: a.url || '#',
    spice: 0.5 + Math.random()*0.5,
    publishedAt: new Date(a.publishedAt || Date.now()).getTime()
  }));
}
function extract(tag, text) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = text.match(re);
  return m ? m[1] : '';
}
function parseRSS(xmlText, domain) {
  const items = [];
  const parts = xmlText.split(/<item>/i).slice(1);
  for (const chunk of parts) {
    const title = extract('title', chunk).replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim();
    const link = extract('link', chunk).trim();
    const pubDate = extract('pubDate', chunk).trim();
    const desc = extract('description', chunk).replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim();
    if (!title) continue;
    items.push({
      id: link || title,
      domain,
      title,
      summary: desc.replace(/<[^>]+>/g, ''),
      image: '',
      url: link || '#',
      spice: 0.5 + Math.random()*0.5,
      publishedAt: pubDate ? new Date(pubDate).getTime() : Date.now()
    });
  }
  return items;
}
async function fetchRSS(region) {
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
      const res = await fetch(t.url);
      if (res.ok) {
        const txt = await res.text();
        results.push(...parseRSS(txt, t.domain));
      }
    } catch(e) {}
    await sleep(300);
  }
  return results;
}
function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = (it.title || '') + (it.url || '');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}
async function main() {
  const inItems = await fetchNewsAPI('IN').catch(()=>[]);
  const usItems = await fetchNewsAPI('USUK').catch(()=>[]);
  let items = dedupe([...(inItems||[]), ...(usItems||[])]);
  if (!items.length) {
    const r1 = await fetchRSS('IN').catch(()=>[]);
    const r2 = await fetchRSS('USUK').catch(()=>[]);
    items = dedupe([...(r1||[]), ...(r2||[])]);
  }
  const payload = { generatedAt: new Date().toISOString(), items: items.slice(0, 120) };
  await fs.mkdir('content', { recursive: true });
  await fs.writeFile('content/news.json', JSON.stringify(payload, null, 2), 'utf8');
  console.log('Wrote content/news.json with', payload.items.length, 'items');
}
main().catch(e=>{ console.error(e); process.exit(1); });
