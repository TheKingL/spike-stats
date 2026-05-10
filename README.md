# spike-stats

## What is this

spike-stats is a volleyball stats dashboard for Adelaide University teams competing in the South Australian Volleyball League (SAVL). It automatically scrapes volleyballsa.com.au every Saturday night and displays standings, fixtures, results, and set-by-set charts for all 5 divisions, with special highlighting for Adelaide Uni teams.

## Live site

https://spike-stats.vercel.app/

## Local development

```bash
git clone https://github.com/TheKingL/spike-stats.git
cd spike-stats
npm install
cp .env.example .env   # fill in your values
npm run dev
```

Visit http://localhost:5173

## Seed data manually

Trigger the scraper locally before the first cron run:

```bash
curl http://localhost:3000/api/scrape
```

Or via Vercel CLI after deploy:

```bash
vercel env pull
curl https://spike-stats.vercel.app/api/scrape
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project at vercel.com
3. Add these 4 environment variables in the Vercel dashboard:
   - `GITHUB_TOKEN` — fine-grained PAT with `contents:write` on this repo
   - `GITHUB_OWNER` — your GitHub username
   - `GITHUB_REPO` — `spike-stats`
   - `GITHUB_BRANCH` — `main`
4. Deploy — the cron fires automatically every Saturday at 22:00 ACST

## Cron schedule

The scraper runs at `30 12 * * 6` (12:30 UTC = 22:00 ACST, UTC+9:30, Adelaide winter time).

In October when Adelaide switches to ACDT (UTC+10:30), update `vercel.json` to `"30 11 * * 6"`.

## Data structure

All data files are committed automatically by the scraper and read directly by the frontend via `raw.githubusercontent.com`.

| File | Contents |
|---|---|
| `data/standings.json` | League table for all 5 divisions (rank, team, W/L/D, sets, points) |
| `data/fixtures.json` | All scheduled matches per division (round, date, home, away, venue, time) |
| `data/results.json` | Completed matches per division (scores + scorecard ID) |
| `data/scorecards/{id}.json` | Set-by-set breakdown for one match |

## Tech stack

React · Vite · Tailwind CSS · Nivo charts · Cheerio · node-fetch · Vercel (hosting + cron + serverless) · GitHub Contents API (data storage)
