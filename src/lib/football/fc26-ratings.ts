import ratingsData from "./data/fc26-ratings.json";

type RatingEntry = [string, string, number];

/** FotMob / common club names → EA FC 26 team labels */
const TEAM_ALIASES: Record<string, string[]> = {
  "manchester united": ["man utd", "manchester united"],
  "man united": ["man utd"],
  "tottenham hotspur": ["spurs", "tottenham hotspur"],
  "spurs": ["spurs"],
  "paris saint germain": ["paris sg", "psg", "paris saint germain"],
  "psg": ["paris sg"],
  "inter": ["lombardia fc", "inter milan", "inter"],
  "inter milan": ["lombardia fc", "inter milan"],
  "ac milan": ["milano fc", "ac milan", "milan"],
  "milan": ["milano fc", "ac milan"],
  "barcelona": ["fc barcelona", "barcelona"],
  "fc barcelona": ["fc barcelona"],
  "bayern munich": ["fc bayern munchen", "bayern munich", "bayern munchen"],
  "bayern munchen": ["fc bayern munchen", "bayern munchen"],
  "borussia dortmund": ["borussia dortmund"],
  "rb leipzig": ["rb leipzig", "rasenballsport leipzig"],
  "napoli": ["ssc napoli", "napoli"],
  "ssc napoli": ["ssc napoli"],
  "roma": ["as roma", "roma"],
  "as roma": ["as roma"],
  "atalanta": ["atalanta bergamasca calcio", "atalanta"],
  "juventus": ["juventus", "juventus fc"],
  "lyon": ["ol lyonnes", "olympique lyonnais", "lyon"],
  "olympique lyonnais": ["ol lyonnes", "lyon"],
  "monaco": ["as monaco", "monaco"],
  "as monaco": ["as monaco"],
  "atletico madrid": ["atletico de madrid", "atletico madrid"],
  "real madrid": ["real madrid"],
  "liverpool": ["liverpool"],
  "chelsea": ["chelsea"],
  "arsenal": ["arsenal"],
  "manchester city": ["manchester city"],
  "aston villa": ["aston villa"],
  "newcastle united": ["newcastle united", "newcastle utd"],
  "west ham united": ["west ham united", "west ham"],
  "brighton": ["brighton hove albion", "brighton"],
  "brighton hove albion": ["brighton hove albion", "brighton"],
  "crystal palace": ["crystal palace"],
  "fulham": ["fulham"],
  "brentford": ["brentford"],
  "bournemouth": ["afc bournemouth", "bournemouth"],
  "wolverhampton wanderers": ["wolves", "wolverhampton wanderers"],
  "wolves": ["wolves"],
  "nottingham forest": ["nottingham forest"],
  "everton": ["everton"],
  "leicester city": ["leicester city"],
  "ipswich town": ["ipswich town"],
  "southampton": ["southampton"],
};

function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function teamVariants(teamName: string): string[] {
  const n = normalize(teamName);
  const aliases = TEAM_ALIASES[n] ?? [];
  return [...new Set([n, ...aliases.map(normalize)])];
}

let byTeamKey: Map<string, number> | null = null;
let rosterByTeam: Map<string, Map<string, number>> | null = null;
let byNameBest: Map<string, number> | null = null;

function buildIndexes() {
  if (byTeamKey && rosterByTeam && byNameBest) return;
  byTeamKey = new Map();
  rosterByTeam = new Map();
  byNameBest = new Map();

  for (const [name, team, overall] of ratingsData.byTeam as RatingEntry[]) {
    byTeamKey.set(`${name}|${team}`, overall);
    if (!rosterByTeam.has(team)) rosterByTeam.set(team, new Map());
    rosterByTeam.get(team)!.set(name, overall);

    const prev = byNameBest.get(name);
    if (prev == null || overall > prev) byNameBest.set(name, overall);
  }

  for (const [name, _team, overall] of (ratingsData.byName ?? []) as RatingEntry[]) {
    const prev = byNameBest.get(name);
    if (prev == null || overall > prev) byNameBest.set(name, overall);
  }
}

/**
 * Look up EA FC 26 overall rating by player + club name.
 * Returns null if no confident match found.
 */
export function lookupFc26Rating(playerName: string, teamName: string): number | null {
  buildIndexes();
  const nName = normalize(playerName);
  const teams = teamVariants(teamName);
  const parts = nName.split(" ").filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts[parts.length - 1] ?? "";

  const candidates: string[] = [nName];
  if (firstName && firstName !== nName) candidates.push(firstName);
  if (lastName && lastName !== nName && lastName !== firstName) {
    candidates.push(lastName);
  }

  for (const team of teams) {
    for (const name of candidates) {
      const hit = byTeamKey!.get(`${name}|${team}`);
      if (hit != null) return hit;
    }

    const roster = rosterByTeam!.get(team);
    if (!roster) continue;

    for (const [keyName, overall] of roster) {
      if (nName.startsWith(keyName + " ") || nName === keyName) return overall;
      if (keyName.startsWith(nName + " ") || keyName === nName) return overall;
    }
  }

  return null;
}

/** Best FC 26 rating for a player across all clubs (for national team drafts). */
export function lookupFc26RatingByName(playerName: string): number | null {
  buildIndexes();
  const nName = normalize(playerName);
  const parts = nName.split(" ").filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts[parts.length - 1] ?? "";

  const direct = byNameBest!.get(nName);
  if (direct != null) return direct;

  // "julian alvarez" vs stored key, or partial first+last
  let best: number | null = null;
  for (const [key, overall] of byNameBest!) {
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

/** Fallback for youth / missing players — conservative squad depth rating */
export function fallbackSquadRating(position: string, shirtNumber?: string): number {
  const num = shirtNumber ? parseInt(shirtNumber, 10) : 99;
  const base = position === "GK" ? 68 : 66;
  if (!isNaN(num) && num <= 11) return base + 4;
  if (!isNaN(num) && num <= 20) return base + 2;
  return base;
}

export function resolvePlayerOverall(
  playerName: string,
  teamName: string,
  position: string,
  shirtNumber?: string
): number {
  return (
    lookupFc26Rating(playerName, teamName) ??
    lookupFc26RatingByName(playerName) ??
    fallbackSquadRating(position, shirtNumber)
  );
}
