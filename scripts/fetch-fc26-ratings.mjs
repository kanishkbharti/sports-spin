#!/usr/bin/env node
/**
 * Fetches EA FC 26 ratings from the official Drop API and writes a compact lookup file.
 * Run: node scripts/fetch-fc26-ratings.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/lib/football/data/fc26-ratings.json");
const API = "https://drop-api.ea.com/rating/ea-sports-fc";
const PAGE_SIZE = 100;

function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function displayName(p) {
  if (p.commonName) return p.commonName.trim();
  return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
}

async function fetchPage(offset) {
  const url = `${API}?limit=${PAGE_SIZE}&offset=${offset}&locale=en`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SportsSquadForge/1.0)" },
  });
  if (!res.ok) throw new Error(`EA API ${res.status} offset ${offset}`);
  return res.json();
}

async function main() {
  console.log("Fetching EA FC 26 ratings...");
  const byKey = new Map();
  const byName = new Map();

  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const data = await fetchPage(offset);
    total = data.totalItems ?? 0;
    const items = data.items ?? [];
    if (items.length === 0) break;

    for (const p of items) {
      const name = displayName(p);
      const team = p.team?.label ?? "";
      const overall = p.overallRating;
      if (!name || !overall) continue;

      const nName = normalize(name);
      const nTeam = normalize(team);
      const key = `${nName}|${nTeam}`;
      byKey.set(key, overall);

      const existing = byName.get(nName);
      if (!existing || overall > existing.overall) {
        byName.set(nName, { overall, team: nTeam });
      }
    }

    offset += items.length;
    if (offset % 1000 === 0 || offset >= total) {
      console.log(`  ${offset} / ${total}`);
    }
  }

  const entries = [...byKey.entries()].map(([key, overall]) => {
    const [name, team] = key.split("|");
    return [name, team, overall];
  });

  const nameFallback = [...byName.entries()].map(([name, v]) => [name, v.team, v.overall]);

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify({
      version: "fc26",
      fetchedAt: new Date().toISOString(),
      count: entries.length,
      byTeam: entries,
      byName: nameFallback,
    })
  );

  console.log(`Wrote ${entries.length} player-team ratings to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
