
"use client";
import { useState, useEffect } from "react";
import { getNews } from "../../lib/getNews";

export default function DirectoryPage() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line
  }, []);

  async function loadNews() {
    setLoading(true);
    const newArticles = await getNews("general", page, 10);
    setArticles(prev => [...prev, ...newArticles]);
    setPage(prev => prev + 1);
    setLoading(false);
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>Celebrity Directory</h1>
      {articles.map((a, idx) => (
        <div key={idx} style={{ marginBottom: "20px" }}>
          <h3>{a.title}</h3>
          {a.urlToImage && <img src={a.urlToImage} alt="" style={{ maxWidth: "100%" }} />}
          <p>{a.description}</p>
          <a href={a.url} target="_blank" rel="noopener noreferrer">Read more</a>
        </div>
      ))}
      <button onClick={loadNews} disabled={loading}>
        {loading ? "Loading..." : "Load More"}
      </button>
    </main>
  );
}
