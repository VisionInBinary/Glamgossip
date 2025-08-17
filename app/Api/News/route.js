
import { NextResponse } from "next/server";
import { detectRegion, fetchNewsAPI, fetchGNews, weightNews, paginate } from "@/lib/getNews";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);

  const region = await detectRegion();
  const [newsapi, gnews] = await Promise.all([
    fetchNewsAPI(region === "IN" ? "Bollywood" : "Hollywood"),
    fetchGNews(region === "IN" ? "Bollywood" : "Hollywood"),
  ]);

  const allNews = [...newsapi, ...gnews];
  const weighted = weightNews(allNews, region);
  const data = paginate(weighted, page, pageSize);

  return NextResponse.json(data);
}
