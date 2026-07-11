#!/usr/bin/env node
/**
 * Builds squad JSON files with EA FC 26 ratings baked in (one-time per team).
 * Run after fetch-ratings: npm run fetch-ratings && npm run build-squads
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RATINGS_PATH = join(__dirname, "../src/lib/football/data/fc26-ratings.json");
const SQUADS_DIR = join(__dirname, "../src/lib/football/data/squads");
const RATINGS_VERSION = "fc26-csv-20250921";
const FOTMOB = "https://www.fotmob.com/api";
const FOTMOB_IMG = "https://images.fotmob.com/image_resources/playerimages";

const TEAM_ALIASES = {
  "manchester united": ["man utd", "manchester united"],
  "inter milan": ["lombardia fc", "inter milan", "inter"],
  inter: ["lombardia fc", "inter milan", "inter"],
  "ac milan": ["milano fc", "ac milan", "milan"],
  barcelona: ["fc barcelona", "barcelona"],
  "bayern munich": ["fc bayern munchen", "bayern munich", "bayern munchen"],
  psg: ["paris sg", "psg", "paris saint germain"],
  "paris saint germain": ["paris sg", "psg", "paris saint germain"],
};

function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function teamVariants(teamName) {
  const n = normalize(teamName);
  const aliases = TEAM_ALIASES[n] ?? [];
  return [...new Set([n, ...aliases.map(normalize)])];
}

function buildRatingIndexes(ratingsData) {
  const byTeamKey = new Map();
  const rosterByTeam = new Map();
  const byNameBest = new Map();

  for (const [name, team, overall] of ratingsData.byTeam) {
    byTeamKey.set(`${name}|${team}`, overall);
    if (!rosterByTeam.has(team)) rosterByTeam.set(team, new Map());
    rosterByTeam.get(team).set(name, overall);
    const prev = byNameBest.get(name);
    if (prev == null || overall > prev) byNameBest.set(name, overall);
  }

  for (const [name, _team, overall] of ratingsData.byName ?? []) {
    const prev = byNameBest.get(name);
    if (prev == null || overall > prev) byNameBest.set(name, overall);
  }

  return { byTeamKey, rosterByTeam, byNameBest };
}

function lookupFc26Rating(playerName, teamName, indexes) {
  const { byTeamKey, rosterByTeam } = indexes;
  const nName = normalize(playerName);
  const teams = teamVariants(teamName);
  const parts = nName.split(" ").filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts[parts.length - 1] ?? "";
  const candidates = [nName];
  if (firstName && firstName !== nName) candidates.push(firstName);
  if (lastName && lastName !== nName && lastName !== firstName) candidates.push(lastName);

  for (const team of teams) {
    for (const name of candidates) {
      const hit = byTeamKey.get(`${name}|${team}`);
      if (hit != null) return hit;
    }
    const roster = rosterByTeam.get(team);
    if (!roster) continue;
    for (const [keyName, overall] of roster) {
      if (nName.startsWith(keyName + " ") || nName === keyName) return overall;
      if (keyName.startsWith(nName + " ") || keyName === nName) return overall;
    }
  }
  return null;
}

function lookupFc26RatingByName(playerName, indexes) {
  const { byNameBest } = indexes;
  const nName = normalize(playerName);
  const parts = nName.split(" ").filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts[parts.length - 1] ?? "";

  const direct = byNameBest.get(nName);
  if (direct != null) return direct;

  let best = null;
  for (const [key, overall] of byNameBest) {
    if (key === nName) return overall;
    if (nName.startsWith(key + " ") || key.startsWith(nName + " ")) {
      if (best == null || overall > best) best = overall;
    }
    const keyParts = key.split(" ");
    const keyLast = keyParts[keyParts.length - 1];
    if (
      lastName.length > 2 &&
      keyLast === lastName &&
      firstName.length > 0 &&
      keyParts[0]?.[0] === firstName[0]
    ) {
      if (best == null || overall > best) best = overall;
    }
  }
  return best;
}

function resolvePlayerOverall(playerName, teamName, position, shirtNumber, indexes) {
  const hit =
    lookupFc26Rating(playerName, teamName, indexes) ??
    lookupFc26RatingByName(playerName, indexes);
  if (hit != null) return hit;

  const num = shirtNumber ? parseInt(shirtNumber, 10) : 99;
  const base = position === "GK" ? 68 : 66;
  if (!isNaN(num) && num <= 11) return base + 4;
  if (!isNaN(num) && num <= 20) return base + 2;
  return base;
}

function mapFotmobPosition(positionId, roleKey) {
  if (positionId === 0 || roleKey?.includes("keeper")) return "GK";
  if (positionId === 1 || roleKey?.includes("defender") || roleKey?.includes("back")) return "DEF";
  if (positionId === 3 || roleKey?.includes("attack") || roleKey?.includes("striker")) return "ATT";
  return "MID";
}

const COUNTRY_CODES = {
  Argentina: "ar", Brazil: "br", France: "fr", Germany: "de", Spain: "es",
  England: "gb-eng", Portugal: "pt", Netherlands: "nl", Belgium: "be",
  Italy: "it", Uruguay: "uy", Colombia: "co", Mexico: "mx", "United States": "us",
  Japan: "jp", "South Korea": "kr", Australia: "au", Morocco: "ma", Senegal: "sn",
};

function countryToCode(country) {
  return COUNTRY_CODES[country] ?? country.slice(0, 2).toLowerCase();
}

async function fotmobFetch(path) {
  const res = await fetch(`${FOTMOB}${path}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SportsSquadForge/1.0)" },
  });
  if (!res.ok) throw new Error(`FotMob ${res.status}: ${path}`);
  return res.json();
}

function isPlaceholderTeamName(name) {
  const n = (name ?? "").trim();
  if (!n) return true;
  if (n.includes("/")) return true;
  if (/\d/.test(n)) return true;
  return /\b(winner|loser|runner[- ]?up|qualifier|play[- ]?off|group|tbd|third\s*place|\bsf\b|\bqf\b|\br16\b)\b/i.test(
    n
  );
}

async function fetchWorldCupTeams() {
  const data = await fotmobFetch("/data/leagues?id=77");
  const map = new Map();
  for (const m of data.overview?.leagueOverviewMatches ?? []) {
    for (const side of [m.home, m.away]) {
      if (!side?.id || !side?.name || String(side.id).includes("/")) continue;
      if (isPlaceholderTeamName(side.name)) continue;
      map.set(side.id, { id: Number(side.id), name: side.name });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchFotmobSquad(teamId) {
  const data = await fotmobFetch(`/data/teams?id=${teamId}`);
  return (data.squad?.squad ?? [])
    .filter((g) => g.title !== "coach")
    .flatMap((g) => (g.members ?? []).filter((m) => m.role?.key !== "coach"));
}

function squadFilePath(teamId) {
  const safe = teamId.replace(/[^a-zA-Z0-9-_]/g, "_");
  return join(SQUADS_DIR, `${safe}.json`);
}

async function buildSquad(team, indexes) {
  const teamId = `national-worldcup26-${team.id}`;
  const outPath = squadFilePath(teamId);

  if (existsSync(outPath)) {
    console.log(`  skip ${team.name} (already cached)`);
    return;
  }

  const squad = await fetchFotmobSquad(team.id);
  if (squad.length === 0) {
    console.log(`  skip ${team.name} (no squad)`);
    return;
  }

  const players = squad.map((p) => {
    const position = mapFotmobPosition(p.positionId, p.role?.key);
    return {
      id: `player-fotmob-${teamId}-${p.id}`,
      externalId: String(p.id),
      name: p.name,
      overall: resolvePlayerOverall(p.name, team.name, position, p.shirtNumber, indexes),
      position,
      country: p.cname ?? "Unknown",
      countryCode: countryToCode(p.cname ?? p.ccode ?? ""),
      teamId,
      photo: `${FOTMOB_IMG}/${p.id}.png`,
      number: p.shirtNumber,
    };
  });

  players.sort((a, b) => b.overall - a.overall);

  mkdirSync(SQUADS_DIR, { recursive: true });
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        teamId,
        teamName: team.name,
        externalId: String(team.id),
        ratingsVersion: RATINGS_VERSION,
        fetchedAt: new Date().toISOString(),
        players,
      },
      null,
      2
    )
  );

  console.log(`  wrote ${team.name} (${players.length} players)`);
}

async function main() {
  const ratingsData = JSON.parse(readFileSync(RATINGS_PATH, "utf-8"));
  const indexes = buildRatingIndexes(ratingsData);
  const teams = await fetchWorldCupTeams();

  console.log(`Building squad cache for ${teams.length} World Cup teams...`);
  for (const team of teams) {
    try {
      await buildSquad(team, indexes);
      await new Promise((r) => setTimeout(r, 300));
    } catch (e) {
      console.error(`  failed ${team.name}:`, e.message);
    }
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
