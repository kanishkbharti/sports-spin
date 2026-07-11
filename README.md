# Squadr

Home of Sports Squad Forge, a multi-sport draft platform where you spin, draft, and build your ultimate squad.

**Football is live.** Basketball, Cricket, NFL, F1, and Hockey coming soon.

## Football API

```
GET /api/football?type=club                    # All top 5 league clubs
GET /api/football?type=club&league=pl          # Single league (pl|laliga|seriea|bundesliga|ligue1)
GET /api/football?type=worldcup26              # World Cup 2026 nations
GET /api/football?type=country                 # International nations
GET /api/football?type=players&teamId=X&externalId=Y  # Squad with photos
```

Data sourced from [TheSportsDB](https://www.thesportsdb.com) with 6-hour server-side cache. Player photos use cutout/thumb when available, otherwise generated placeholders.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
