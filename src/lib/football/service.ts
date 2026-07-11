import type { Position } from "@/lib/types";
import type { ApiPlayer, ApiTeam } from "./types";
import {
  CACHE_TTL_MS,
  COUNTRY_NATIONS,
  CURATED_LEAGUES,
  TOP_LEAGUES,
  WORLD_CUP_2026_NATIONS,
  type LeagueCode,
} from "./constants";
import { cacheKey, getCached, setCache } from "./cache";
import {
  fetchFotmobLeagueTeams,
  fetchFotmobSquad,
  fetchFotmobTeamsByIds,
  fetchFotmobWorldCupTeams,
  fotmobPlayerPhotoUrl,
  fotmobTeamCrestUrl,
  isPlaceholderTeamName,
  resolveFotmobNationalTeam,
} from "./fotmob";
import { resolvePlayerOverall } from "./fc26-ratings";
import { RATINGS_VERSION, storedSquadPlayers, writeStoredSquad } from "./squad-store";

const SPORTS_DB = "https://www.thesportsdb.com/api/v1/json/3";

const TEAM_COLORS: Record<string, [string, string]> = {
  Arsenal: ["#EF0107", "#FFFFFF"],
  Liverpool: ["#C8102E", "#F6EB61"],
  Barcelona: ["#A50044", "#004D98"],
  "Real Madrid": ["#FEBE10", "#FFFFFF"],
  "Manchester City": ["#6CABDD", "#FFFFFF"],
  Chelsea: ["#034694", "#FFFFFF"],
  England: ["#FFFFFF", "#CE1124"],
  Brazil: ["#FFDF00", "#009B3A"],
  Germany: ["#FFFFFF", "#000000"],
  France: ["#002395", "#ED2939"],
};

interface SportsDbTeam {
  idTeam: string;
  strTeam: string;
  strTeamShort: string;
  strBadge: string;
  strColour1?: string;
  strColour2?: string;
  strLeague: string;
  strCountry?: string;
  strSport?: string;
}

interface SportsDbPlayer {
  idPlayer: string;
  strPlayer: string;
  strNationality: string;
  strPosition: string;
  strNumber?: string;
  strThumb?: string;
  strCutout?: string;
  strRender?: string;
}

async function fetchSportsDb<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 21600 } });
  if (!res.ok) throw new Error(`SportsDB fetch failed: ${res.status}`);
  return res.json() as Promise<T>;
}

function hashToRating(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return 68 + (Math.abs(h) % 24);
}

function mapFotmobPosition(positionId?: number, roleKey?: string): Position {
  if (positionId === 0 || roleKey?.includes("keeper")) return "GK";
  if (positionId === 1 || roleKey?.includes("defender") || roleKey?.includes("back")) return "DEF";
  if (positionId === 3 || roleKey?.includes("attack") || roleKey?.includes("striker")) return "ATT";
  return "MID";
}

function mapSportsDbPosition(raw: string): Position {
  const p = raw.toLowerCase();
  if (p.includes("goal")) return "GK";
  if (p.includes("def") || p.includes("back")) return "DEF";
  if (p.includes("forward") || p.includes("attack") || p.includes("striker") || p.includes("wing"))
    return "ATT";
  return "MID";
}

function countryToCode(country: string): string {
  const map: Record<string, string> = {
    England: "gb-eng",
    Scotland: "gb-sct",
    Wales: "gb-wls",
    "United States": "us",
    USA: "us",
    "South Korea": "kr",
    "Ivory Coast": "ci",
    "Czech Republic": "cz",
    Czechia: "cz",
    Netherlands: "nl",
    Germany: "de",
    France: "fr",
    Spain: "es",
    Italy: "it",
    Brazil: "br",
    Argentina: "ar",
    Portugal: "pt",
    Belgium: "be",
    Mexico: "mx",
    Canada: "ca",
    Japan: "jp",
    Australia: "au",
    Morocco: "ma",
    Senegal: "sn",
    Nigeria: "ng",
    Egypt: "eg",
    Uruguay: "uy",
    Colombia: "co",
    Croatia: "hr",
    Switzerland: "ch",
    Austria: "at",
    Norway: "no",
    Denmark: "dk",
    Sweden: "se",
    Poland: "pl",
    Serbia: "rs",
    Ukraine: "ua",
    Turkey: "tr",
    Ireland: "ie",
    Chile: "cl",
    Peru: "pe",
    Ecuador: "ec",
    Paraguay: "py",
    Venezuela: "ve",
    Cameroon: "cm",
    Ghana: "gh",
    Tunisia: "tn",
    Algeria: "dz",
    Iran: "ir",
    "Saudi Arabia": "sa",
    Qatar: "qa",
    India: "in",
    China: "cn",
    Jordan: "jo",
    Uzbekistan: "uz",
    "South Africa": "za",
    "New Zealand": "nz",
    Haiti: "ht",
    Panama: "pa",
    "Costa Rica": "cr",
    Curaçao: "cw",
    "Cape Verde": "cv",
  };
  return map[country] ?? country.slice(0, 2).toLowerCase();
}

function teamColors(name: string): [string, string] {
  if (TEAM_COLORS[name]) return TEAM_COLORS[name];
  const h = hashToRating(name);
  return [`hsl(${h * 7}, 65%, 45%)`, "#151B26"];
}

function fromFotmobTeam(
  row: { id: number; name: string; shortName?: string },
  leagueCode: string,
  type: "club" | "national"
): ApiTeam {
  const [color, secondary] = teamColors(row.name);
  return {
    id: `${type}-${leagueCode}-${row.id}`,
    externalId: String(row.id),
    fotmobId: String(row.id),
    name: row.name,
    shortName: row.shortName?.slice(0, 3).toUpperCase() || row.name.slice(0, 3).toUpperCase(),
    crestUrl: fotmobTeamCrestUrl(row.id),
    color,
    secondaryColor: secondary,
    league: leagueCode,
    leagueCode,
    type,
  };
}

function dedupeTeams(teams: ApiTeam[]): ApiTeam[] {
  const seen = new Set<string>();
  return teams.filter((t) => {
    const key = t.fotmobId ?? t.externalId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchLeagueTeams(leagueCode: LeagueCode): Promise<ApiTeam[]> {
  const key = cacheKey("curated-league", leagueCode);
  const cached = getCached<ApiTeam[]>(key);
  if (cached) return cached;

  const curated = CURATED_LEAGUES[leagueCode];
  let rows: { id: number; name: string; shortName?: string }[];

  if (curated.mode === "allowlist" && curated.teamIds) {
    rows = await fetchFotmobTeamsByIds(curated.teamIds);
  } else {
    rows = await fetchFotmobLeagueTeams(curated.fotmobLeagueId);
  }

  const teams = rows.map((r) => fromFotmobTeam(r, leagueCode, "club"));
  setCache(key, teams, CACHE_TTL_MS);
  return teams;
}

export async function getClubTeams(league?: LeagueCode): Promise<ApiTeam[]> {
  if (!league) {
    throw new Error("league parameter is required for club teams");
  }
  return fetchLeagueTeams(league);
}

async function fetchNationalFromSportsDb(name: string): Promise<ApiTeam | null> {
  const data = await fetchSportsDb<{ teams: SportsDbTeam[] | null }>(
    `${SPORTS_DB}/searchteams.php?t=${encodeURIComponent(name)}`
  );
  const match =
    data.teams?.find(
      (t) =>
        t.strSport === "Soccer" &&
        (t.strLeague?.includes("World Cup") || t.strTeam === name)
    ) ?? data.teams?.find((t) => t.strSport === "Soccer" && t.strTeam === name);

  if (!match) return null;

  const [color, secondary] = teamColors(match.strTeam);
  return {
    id: `national-national-${match.idTeam}`,
    externalId: match.idTeam,
    name: match.strTeam,
    shortName: match.strTeamShort?.slice(0, 3).toUpperCase() || match.strTeam.slice(0, 3).toUpperCase(),
    crestUrl: match.strBadge || null,
    color: match.strColour1?.startsWith("#") ? match.strColour1 : color,
    secondaryColor: match.strColour2?.startsWith("#") ? match.strColour2 : secondary,
    league: "national",
    leagueCode: "national",
    type: "national",
  };
}

async function fetchNationalTeam(name: string): Promise<ApiTeam | null> {
  const key = cacheKey("national-team", name);
  const cached = getCached<ApiTeam>(key);
  if (cached) return cached;

  const fotmob = await resolveFotmobNationalTeam(name);
  let team: ApiTeam | null = null;

  if (fotmob) {
    team = fromFotmobTeam(fotmob, "national", "national");
  } else {
    team = await fetchNationalFromSportsDb(name);
  }

  if (team) setCache(key, team, CACHE_TTL_MS);
  return team;
}

async function fetchNationalTeams(names: readonly string[]): Promise<ApiTeam[]> {
  const key = cacheKey("nationals", String(names.length), names[0]);
  const cached = getCached<ApiTeam[]>(key);
  if (cached) return cached;

  const results = await Promise.all(names.map(fetchNationalTeam));
  const teams = dedupeTeams(results.filter((t): t is ApiTeam => t !== null));
  setCache(key, teams, CACHE_TTL_MS);
  return teams;
}


export async function getWorldCupTeams(): Promise<ApiTeam[]> {
  const key = cacheKey("worldcup26-fotmob");
  const cached = getCached<ApiTeam[]>(key);
  if (cached) return cached;

  const rows = await fetchFotmobWorldCupTeams();
  const fromWc = rows.map((r) => fromFotmobTeam(r, "worldcup26", "national"));

  const wcNames = new Set(fromWc.map((t) => t.name.toLowerCase()));
  const missing = WORLD_CUP_2026_NATIONS.filter((n) => !wcNames.has(n.toLowerCase()));
  const extras = await fetchNationalTeams(missing);

  const teams = dedupeTeams([...fromWc, ...extras]).filter(
    (t) => !isPlaceholderTeamName(t.name)
  );
  setCache(key, teams, CACHE_TTL_MS);
  return teams;
}

export async function getCountryTeams(): Promise<ApiTeam[]> {
  const key = cacheKey("countries-all");
  const cached = getCached<ApiTeam[]>(key);
  if (cached) return cached;

  const wc = await getWorldCupTeams();
  const wcNames = new Set(wc.map((t) => t.name.toLowerCase()));
  const extraNames = COUNTRY_NATIONS.filter((n) => !wcNames.has(n.toLowerCase()));
  const extras = await fetchNationalTeams(extraNames);
  const teams = dedupeTeams([...wc, ...extras]).filter(
    (t) => !isPlaceholderTeamName(t.name)
  );
  setCache(key, teams, CACHE_TTL_MS);
  return teams;
}

async function fetchSportsDbPlayers(team: ApiTeam): Promise<ApiPlayer[]> {
  const data = await fetchSportsDb<{ player: SportsDbPlayer[] | null }>(
    `${SPORTS_DB}/lookup_all_players.php?id=${team.externalId}`
  );

  return (data.player ?? [])
    .filter((p) => {
      const pos = (p.strPosition ?? "").toLowerCase();
      return !pos.includes("coach") && !pos.includes("manager") && !pos.includes("assistant");
    })
    .map((p) => ({
      id: `player-sdb-${p.idPlayer}`,
      externalId: p.idPlayer,
      name: p.strPlayer,
      overall: resolvePlayerOverall(
        p.strPlayer,
        team.name,
        mapSportsDbPosition(p.strPosition ?? ""),
        p.strNumber
      ),
      position: mapSportsDbPosition(p.strPosition ?? ""),
      country: p.strNationality?.replace("The ", "") ?? "Unknown",
      countryCode: countryToCode(p.strNationality?.replace("The ", "") ?? ""),
      teamId: team.id,
      photo: p.strCutout || p.strRender || p.strThumb || null,
      number: p.strNumber,
    }));
}

export async function getTeamPlayers(
  externalTeamId: string,
  teamId: string,
  teamName: string
): Promise<ApiPlayer[]> {
  const fromDisk = storedSquadPlayers(teamId);
  if (fromDisk) return fromDisk;

  const key = cacheKey("players-fc26-v4", teamId, externalTeamId, normalizeTeamCacheKey(teamName));
  const cached = getCached<ApiPlayer[]>(key);
  if (cached) return cached;

  const fotmobId = externalTeamId;
  let players: ApiPlayer[] = [];

  try {
    const squad = await fetchFotmobSquad(fotmobId);
    if (squad.length > 0) {
      players = squad.map((p) => {
        const position = mapFotmobPosition(p.positionId, p.role?.key);
        return {
          id: `player-fotmob-${teamId}-${p.id}`,
          externalId: String(p.id),
          name: p.name,
          overall: resolvePlayerOverall(p.name, teamName, position, p.shirtNumber),
          position,
          country: p.cname ?? "Unknown",
          countryCode: countryToCode(p.cname ?? p.ccode ?? ""),
          teamId,
          photo: fotmobPlayerPhotoUrl(p.id),
          number: p.shirtNumber,
        };
      });
    }
  } catch {
    // fall through to SportsDB
  }

  if (players.length === 0) {
    players = await fetchSportsDbPlayers({
      id: teamId,
      externalId: externalTeamId,
      fotmobId: undefined,
      name: teamName,
      shortName: teamName.slice(0, 3).toUpperCase(),
      crestUrl: null,
      color: "#00D084",
      secondaryColor: "#151B26",
      league: "",
      type: "club",
    });
  }

  players.sort((a, b) => b.overall - a.overall);

  writeStoredSquad({
    teamId,
    teamName,
    externalId: externalTeamId,
    ratingsVersion: RATINGS_VERSION,
    fetchedAt: new Date().toISOString(),
    players,
  });

  setCache(key, players, CACHE_TTL_MS);
  return players;
}

function normalizeTeamCacheKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export async function getTeamPlayersForTeam(team: ApiTeam): Promise<ApiPlayer[]> {
  const id = team.fotmobId ?? team.externalId;
  return getTeamPlayers(id, team.id, team.name);
}
