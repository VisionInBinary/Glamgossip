
export async function getNews(category, page = 1, pageSize = 10) {
  const NEWSAPI_KEY = process.env.NEXT_PUBLIC_NEWSAPI_KEY;
  const GNEWS_KEY = process.env.NEXT_PUBLIC_GNEWS_KEY;

  let query;
  let url;

  // Map custom categories to keywords
  if (category === "bollywood") {
    query = "Bollywood";
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&page=${page}&pageSize=${pageSize}&apiKey=${NEWSAPI_KEY}`;
  } else if (category === "hollywood") {
    query = "Hollywood";
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&page=${page}&pageSize=${pageSize}&apiKey=${NEWSAPI_KEY}`;
  } else {
    // entertainment or other official categories
    url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&page=${page}&pageSize=${pageSize}&apiKey=${NEWSAPI_KEY}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("NewsAPI request failed");
    const data = await res.json();

    // If NewsAPI returns empty, fall back to GNews
    if (data.articles && data.articles.length > 0) {
      return data.articles;
    } else {
      console.warn("NewsAPI returned empty, using GNews fallback...");
      return await fetchFromGNews(query || category, page, pageSize, GNEWS_KEY);
    }
  } catch (err) {
    console.error("Error fetching from NewsAPI:", err);
    return await fetchFromGNews(query || category, page, pageSize, GNEWS_KEY);
  }
}

async function fetchFromGNews(query, page, pageSize, apiKey) {
  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${pageSize}&page=${page}&token=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("GNews request failed");
    const data = await res.json();

    // GNews articles format slightly different
    return data.articles.map(a => ({
      title: a.title,
      description: a.description,
      url: a.url,
      urlToImage: a.image,
      publishedAt: a.publishedAt,
      source: { name: a.source.name }
    }));
  } catch (err) {
    console.error("Error fetching from GNews:", err);
    return [];
  }
}
