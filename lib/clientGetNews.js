
export async function getNews(page = 1, pageSize = 12) {
  const res = await fetch(`/api/news?page=${page}&pageSize=${pageSize}`);
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}
