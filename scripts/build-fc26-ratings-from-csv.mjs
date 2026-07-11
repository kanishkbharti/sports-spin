#!/usr/bin/env node
/**
 * Builds src/lib/football/data/fc26-ratings.json from a sofifa-style FC26 CSV
 * (e.g. ~/Downloads/FC26_20250921.csv).
 *
 * Produces name→team→overall keys for BOTH club_name and nationality_name, with
 * multiple name-key variants so FotMob's "Firstname Lastname" names match the
 * CSV's full legal names (e.g. "Lionel Messi" ↔ "Lionel Andrés Messi Cuccitini").
 *
 * Run: node scripts/build-fc26-ratings-from-csv.mjs [path-to-csv]
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/lib/football/data/fc26-ratings.json");
const CSV_PATH =
  process.argv[2] || join(homedir(), "Downloads/FC26_20250921.csv");
const SOURCE_TAG = "fc26-csv-20250921";

function normalize(str) {
  return (str ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Minimal CSV line parser handling double-quoted fields. */
function parseLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        q = !q;
      }
    } else if (c === "," && !q) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

/**
 * Generates matchable name keys for a player.
 * FotMob commonly uses "Firstname Lastname"; the CSV long_name may contain
 * middle names and multiple surnames. We emit:
 *  - full normalized long name
 *  - short name (covers mononyms like "Rodri", "Vini Jr")
 *  - first token + each single later token   ("lionel messi")
 *  - first token + each trailing suffix       ("rodrigo de paul")
 */
function nameKeys(longName, shortName) {
  const keys = new Set();
  const ln = normalize(longName);
  const sn = normalize(shortName);
  if (ln) keys.add(ln);
  if (sn) keys.add(sn);

  const toks = ln.split(" ").filter(Boolean);
  if (toks.length >= 2) {
    const first = toks[0];
    for (let j = 1; j < toks.length; j++) {
      keys.add(`${first} ${toks[j]}`);
      keys.add(`${first} ${toks.slice(j).join(" ")}`);
    }
    // adjacent token pairs — catches names where the common name uses a
    // middle token, e.g. "Damián Emiliano Martínez" ↔ "Emiliano Martínez"
    for (let i = 0; i < toks.length - 1; i++) {
      keys.add(`${toks[i]} ${toks[i + 1]}`);
    }
    // last two tokens as a standalone surname (e.g. "mac allister")
    keys.add(toks.slice(-2).join(" "));
  }
  return [...keys].filter(Boolean);
}

function main() {
  console.log(`Reading ${CSV_PATH}`);
  const raw = readFileSync(CSV_PATH, "utf8");
  const lines = raw.split("\n");
  const header = parseLine(lines[0]);
  const col = {};
  [
    "short_name",
    "long_name",
    "overall",
    "club_name",
    "nationality_name",
    "fifa_update",
  ].forEach((k) => (col[k] = header.indexOf(k)));

  // key `${name}|${team}` -> max overall
  const byKey = new Map();
  // name -> best overall (any team)
  const byName = new Map();
  let rows = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const f = parseLine(line);
    const overall = parseInt(f[col.overall], 10);
    if (!Number.isFinite(overall)) continue;

    const longName = f[col.long_name];
    const shortName = f[col.short_name];
    const club = normalize(f[col.club_name]);
    const nation = normalize(f[col.nationality_name]);
    const keys = nameKeys(longName, shortName);
    if (keys.length === 0) continue;
    rows++;

    const teams = [club, nation].filter(Boolean);
    for (const name of keys) {
      for (const team of teams) {
        const k = `${name}|${team}`;
        const prev = byKey.get(k);
        if (prev == null || overall > prev) byKey.set(k, overall);
      }
      const prevN = byName.get(name);
      if (prevN == null || overall > prevN.overall) {
        byName.set(name, { overall, team: teams[0] ?? "" });
      }
    }
  }

  const byTeam = [...byKey.entries()].map(([k, overall]) => {
    const [name, team] = k.split("|");
    return [name, team, overall];
  });
  const nameFallback = [...byName.entries()].map(([name, v]) => [
    name,
    v.team,
    v.overall,
  ]);

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify({
      version: SOURCE_TAG,
      fetchedAt: new Date().toISOString(),
      count: byTeam.length,
      byTeam,
      byName: nameFallback,
    })
  );

  console.log(
    `Parsed ${rows} players → ${byTeam.length} team keys, ${nameFallback.length} name keys`
  );
  console.log(`Wrote ${OUT}`);
}

main();
