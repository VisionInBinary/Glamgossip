
# GlamGossip — Easiest Automated Setup

## Upload to GitHub
Upload all files/folders exactly as-is so `package.json` is at the repo root.

## Vercel
- Import repo → Framework: Next.js (auto) → Deploy.
- Optional env: `NEXT_PUBLIC_ADSENSE_CLIENT` for AdSense.

## Automation (GitHub Actions)
- Add secret `NEWSAPI_KEY` (optional). With or without it, news updates.
- Workflow runs every 12 hours and commits `content/news.json` → Vercel redeploys.

## Local Dev
```
npm i
npm run dev
```

## Files
- `app/page.jsx` homepage feed only
- `app/api/news/route.js` serves feed (uses `content/news.json`)
- `scripts/fetchNews.mjs` scheduled updater
- `.github/workflows/update-news.yml` schedule
