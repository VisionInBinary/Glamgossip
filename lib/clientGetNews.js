
// /lib/clientGetNews.js
export async function getNews(page = 1, pageSize = 12) {
  try {
    const res = await fetch(`/api/news?page=${page}&pageSize=${pageSize}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Failed to fetch news:", res.status);
      return { items: [], nextPage: null };
    }
    return await res.json();
  } catch (e) {
    console.error("Error fetching news:", e);
    return { items: [], nextPage: null };
  }
}
