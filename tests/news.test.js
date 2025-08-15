
import assert from 'node:assert/strict';
import { weightNews, paginate, normalizeArticles } from '../lib/news.js';

{
  const out = normalizeArticles([{ title:'X' }, {}]);
  assert.equal(out.length, 2);
  assert.equal(out[0].title, 'X');
  assert.ok(out[1].title);
}
{
  const items = weightNews([{domain:'bollywood', spice:0.9, title:'A'}, {domain:'hollywood', spice:0.95, title:'B'}], 'IN');
  assert.ok(items.some(x=>x.domain==='bollywood'));
}
{
  const items = weightNews([{domain:'hollywood', spice:0.9, title:'A'}, {domain:'bollywood', spice:0.95, title:'B'}], 'USUK');
  assert.ok(items.some(x=>x.domain==='hollywood'));
}
{
  const res = paginate(Array.from({length:25}, (_,i)=>i), 1, 12);
  assert.equal(res.items.length, 12);
  assert.equal(res.nextPage, 2);
}
console.log('✓ tests passed');
