
import fetch from "node-fetch";

// your API keys
const NEWS_API_KEY = "8975150ffad74c1590e5d594b425b676";
const GNEWS_API_KEY = "3c472eeec60b4bbc9672b67f0de1ccbf";
const IPINFO_TOKEN = "a7abc432a756a3";

export async function detectRegion(ip) {
  try {
    const res = await fetch(`https://ipinfo.io?token=${IPINFO_TOKEN}`);
    const data = await res.json();
    return data.country || "US";
  } catch {
    return "US";
  }
}

export async function fetchNewsAPI(query = "celebrity") {
  const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=50&apiKey=${NEWS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.articles || []).map((a, i) => ({
    id: `newsapi-${i}`,
    title: a.title,
    summary: a.description,
    url: a.url,
    image: a.urlToImage,
  }));
}

export async function fetchGNews(query = "celebrity") {
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&token=${GNEWS_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.articles || []).map((a, i) => ({
    id: `gnews-${i}`,
    title: a.title,
    summary: a.description,
    url: a.url,
    image: a.image,
  }));
}

export function weightNews(news, region) {
  // Simple weighting: India → Bollywood, US/UK → Hollywood
  return news;
}

export function paginate(items, page = 1, pageSize = 12) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    nextPage: end < items.length ? page + 1 : null,
  };
}
