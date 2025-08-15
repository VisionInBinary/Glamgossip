"use client";
import { useState, useEffect } from "react";
import { getNews } from "../lib/getNews";

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [geoCategory, setGeoCategory] = useState("entertainment"); // default before location is known

  useEffect(() => {
    detectLocationAndLoad();
    // eslint-disable-next-line
  }, []);

  async function detectLocationAndLoad() {
    // First news load happens AFTER detecting location
    setLoading(true);
    const location = await fetch(`https://ipinfo.io?token=${process.env.NEXT_PUBLIC_IPINFO_KEY}`);
    const data = await location.json();
    const country = data.country;

    // Decide category based on country
    let category;
    if (country === "IN") {
      category = "bollywood"; // not an official NewsAPI category, but handled in getNews()
    } else if (country === "US" || country === "GB") {
      category = "hollywood";
    } else {
      category = "entertainment";
    }
    setGeoCategory(category);

    const newArticles = await getNews(category, page, 10);
    setArticles(newArticles);
    setPage(prev => prev + 1);
    setLoading(false);
  }

  async function loadMore() {
    setLoading(true);
    const newArticles = await getNews(geoCategory, page, 10);
    setArticles(prev => [...prev, ...newArticles]);
    setPage(prev => prev + 1);
    setLoading(false);
  }

  return (
    <main style={{ padding: "20px" }}>
      <h1>Latest Celebrity News</h1>
      {articles.map((a, idx) => (
        <div key={idx} style={{ marginBottom: "20px" }}>
          <h3>{a.title}</h3>
          {a.urlToImage && <img src={a.urlToImage} alt="" style={{ maxWidth: "100%" }} />}
          <p>{a.description}</p>
          <a href={a.url} target="_blank" rel="noopener noreferrer">Read more</a>
        </div>
      ))}
      <button onClick={loadMore} disabled={loading}>
        {loading ? "Loading..." : "Load More"}
      </button>
    </main>
  );
}
