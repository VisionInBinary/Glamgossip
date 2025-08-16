
// lib/clientGetNews.js

export async function getNews(page = 1, pageSize = 12) {
  try {
    const res = await fetch(`/api/news?page=${page}&pageSize=${pageSize}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Client getNews error:", err);
    return { items: [], nextPage: null };
  }
}
