
// app/api/news/route.js
import getNews from "../../../lib/getNews";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);

  // Region detection
  const headers = req.headers;
  const country = headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry");
  const region = country && country.toUpperCase() === "IN" ? "IN" : "US";

  const data = await getNews(region, page, pageSize);
  return Response.json(data);
}
