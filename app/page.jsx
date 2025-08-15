
'use client';
import { useEffect, useState } from 'react';

function Card({ item }) {
  return (
    <a className="card" href={item.url} target="_blank" rel="noreferrer">
      {item.image ? <img className="thumb" src={item.image} alt="" /> : <div className="thumb" />}
      <div className="pad">
        <div className="row">
          <span className="badge">{item.domain}</span>
          <span className="tag">{new Date(item.publishedAt).toLocaleString()}</span>
        </div>
        <div className="h2" style={{margin:'6px 0 6px'}}>{item.title}</div>
        <div className="muted">{item.summary || ''}</div>
      </div>
    </a>
  );
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [nextPage, setNextPage] = useState(2);
  const [loading, setLoading] = useState(false);

  const load = async (p=1) => {
    setLoading(true);
    const res = await fetch(`/api/news?page=${p}`, { cache: 'no-store' });
    const data = await res.json();
    setItems(prev => p===1 ? data.items : [...prev, ...data.items]);
    setNextPage(data.nextPage);
    setLoading(false);
  };

  useEffect(()=>{ load(1); },[]);

  return (
    <main>
      <div className="container" style={{padding:'18px 16px'}}>
        <div className="h1" style={{margin:'6px 0 14px'}}>Latest Celebrity News</div>
        <div className="grid">
          {items.map((it)=> <Card key={it.id} item={it} />)}
        </div>
        <div style={{marginTop:18}}>
          <button className="loadmore" disabled={loading} onClick={()=> load(nextPage)}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
        <div className="notice">Homepage shows only the continuous news feed. Other categories are accessible via the top menu.</div>
      </div>
    </main>
  );
}
