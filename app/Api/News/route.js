
// app/api/news/route.js
import { NextResponse } from "next/server";
import {
  detectRegion,
  weightNews,
  paginate,
  fetchNewsAPI,
  fetchRSS,
} from "../../../lib/getNews";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);

    // detect region from request headers
    const region = detectRegion(req.headers);

    // fetch sources
    const [apiArticles, rssArticles] = await Promise.all([
      fetchNewsAPI(region),
      fetchRSS(region),
    ]);

    // combine & rank
    let allArticles = [...apiArticles, ...rssArticles];
    allArticles = weightNews(allArticles, region);

    // paginate
    const paginated = paginate(allArticles, page, pageSize);

    return NextResponse.json(paginated, { status: 200 });
  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json(
      { error: "Failed to load news" },
      { status: 500 }
    );
  }
}

  
