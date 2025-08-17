
   "use client";

import { useEffect, useState } from "react";
import { getNews } from "@/lib/clientGetNews";   // ✅ Correct import

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(null);

  useEffect(() => {
    loadNews(page);
  }, []);

  async function loadNews(p) {
    setLoading(true);
    const data = await getNews(p, 12); // fetch 12 per page
    setArticles(prev => [...prev, ...data.items]);
    setNextPage(data.nextPage);
    setLoading(false);
  }

  // Infinite scroll
  useEffect(() => {
    function handleScroll() {
      if (
        window.innerHeight + document.documentElement.scrollTop + 200 >=
        document.documentElement.offsetHeight
      ) {
        if (!loading && nextPage) {
          loadNews(nextPage);
          setPage(nextPage);
        }
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [nextPage, loading]);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Latest Celebrity Gossip</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((a, idx) => (
          <div key={idx} className="rounded-lg shadow p-4 bg-white">
            {a.image && (
              <img
                src={a.image}
                alt={a.title}
                className="mb-2 w-full h-48 object-cover rounded"
              />
            )}
            <h2 className="font-semibold text-lg">{a.title}</h2>
            <p className="text-sm text-gray-600">{a.summary}</p>
            <a
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 text-sm mt-2 block"
            >
              Read more →
            </a>
          </div>
        ))}
      </div>
      {loading && <p className="mt-4">Loading...</p>}
    </main>
  );
}
 
