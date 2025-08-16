
import { NextResponse } from "next/server";

function detectRegion(headers) {
  const country = headers.get("x-vercel-ip-country") || "US";
  return country === "IN" ? "IN" : "US";
}

function weightNews(articles, region) {
  return articles
    .map(a => ({
      ...a,
      weight:
        a.domain === "bollywood"
          ? region === "IN" ? 2 : 1
          : region !== "IN" ? 2 : 1,
    }))
    .sort((a, b) => b.weight - a.weight || b.publishedAt - a.publishedAt);
}

function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    nextPage: end < items.length ? page + 1 : null,
  };
}

async function fetchNewsAPI(region) {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return [];
  const domFilter = region === "IN" ? "Bollywood" : "Hollywood";
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    domFilter + " celebrity"
  )}&language=en&sortBy=publishedAt&pageSize=50`;

  const res = await fetch(url, {
    headers: { "X-Api-Key": key },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.articles || []).map((a, i) => ({
    id: a.url || String(i),
    domain:
      region === "IN"
        ? /india|bollywood/i.test(
            ((a.source?.name || "") + " " + a.title)
          )
          ? "bollywood"
          : "hollywood"
        : /hollywood|us|uk|variety/i.test(
            ((a.source?.name || "") + " " + a.title)
          )
        ? "hollywood"
        : "bollywood",
    title: a.title || "Untitled",
    summary: a.description || "",
    image: a.urlToImage || "",
    url: a.url || "#",
    spice: 0.5 + Math.random() * 0.5,
    publishedAt: new Date(a.publishedAt || Date.now()).getTime(),
  }));
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);

  let region = searchParams.get("region");
  if (!region) region = detectRegion(req.headers);

  let articles = [];
  try {
    articles = await fetchNewsAPI(region);
  } catch (e) {
    console.error("NewsAPI error", e);
  }

  const weighted = weightNews(articles, region);
  const { items, nextPage } = paginate(weighted, page, pageSize);

  return NextResponse.json({ region, page, pageSize, items, nextPage });
}
