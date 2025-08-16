
""use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getNews } from "./lib/clientGetNews";

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(null);

  const loaderRef = useRef(null);

  // Load news function
  const loadNews = useCallback(async (p) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await getNews(p, 12); // 12 items per page
      setArticles((prev) => [...prev, ...data.items]);
      setNextPage(data.nextPage);
    } catch (err) {
      console.error("Error loading news:", err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Load first page
  useEffect(() => {
    loadNews(1);
  }, [loadNews]);

  // Infinite scroll using IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPage && !loading) {
          loadNews(nextPage);
          setPage(nextPage);
        }
      },
      { threshold: 1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [nextPage, loading, loadNews]);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">✨ Latest Celebrity Gossip</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((a) => (
          <div key={a.id} className="rounded-lg shadow p-4 bg-white hover:shadow-lg transition">
            {a.image && (
              <img
                src={a.image}
                alt={a.title}
                className="mb-2 w-full h-48 object-cover rounded"
              />
            )}
            <h2 className="font-semibold text-lg line-clamp-2">{a.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-3">{a.summary}</p>
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm mt-2 block"
            >
              Read more →
            </a>
          </div>
        ))}
      </div>

      {/* Loader / Observer target */}
      <div ref={loaderRef} className="mt-10 flex justify-center">
        {loading && <p className="text-gray-500">Loading more news...</p>}
        {!nextPage && !loading && articles.length > 0 && (
          <p className="text-gray-400">✅ No more news available</p>
        )}
      </div>
    </main>
  );
}
