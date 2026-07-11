import { isPlaceholderTeamName } from "./team-filters";

export { isPlaceholderTeamName } from "./team-filters";

const FOTMOB = "https://www.fotmob.com/api";
const FOTMOB_IMG = "https://images.fotmob.com/image_resources/playerimages";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; SportsSquadForge/1.0)",
  Accept: "application/json",
};

interface FotmobLeagueRow {
  id: number;
  name: string;
  shortName?: string;
}

interface FotmobSquadMember {
  id: number;
  name: string;
  ccode?: string;
  cname?: string;
  positionId?: number;
  shirtNumber?: string;
  role?: { key?: string };
}

interface FotmobTeamResponse {
  details?: { id?: number; name?: string; shortName?: string };
  squad?: {
    isNationalTeam?: boolean;
    squad?: { title?: string; members?: FotmobSquadMember[] }[];
  };
}

async function fotmobFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${FOTMOB}${path}`, {
    headers: HEADERS,
    next: { revalidate: 21600 },
  });
  if (!res.ok) throw new Error(`FotMob fetch failed: ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export function fotmobPlayerPhotoUrl(playerId: number | string): string {
  return `${FOTMOB_IMG}/${playerId}.png`;
}

export function fotmobTeamCrestUrl(teamId: number | string): string {
  return `https://images.fotmob.com/image_resources/logo/teamlogo/${teamId}.png`;
}

export async function fetchFotmobLeagueTeams(leagueId: number): Promise<FotmobLeagueRow[]> {
  const data = await fotmobFetch<{
    table?: { data?: { table?: { all?: FotmobLeagueRow[] } } }[];
  }>(`/data/leagues?id=${leagueId}`);

  const rows = data.table?.[0]?.data?.table?.all ?? [];
  return rows.filter((r) => r.id && r.name && !String(r.id).includes("/"));
}

export async function fetchFotmobWorldCupTeams(): Promise<FotmobLeagueRow[]> {
  const data = await fotmobFetch<{
    overview?: { leagueOverviewMatches?: { home: { id: string; name: string }; away: { id: string; name: string } }[] };
  }>(`/data/leagues?id=77`);

  const map = new Map<string, FotmobLeagueRow>();
  for (const m of data.overview?.leagueOverviewMatches ?? []) {
    for (const side of [m.home, m.away]) {
      if (!side?.id || !side?.name || side.id.includes("/")) continue;
      if (isPlaceholderTeamName(side.name)) continue;
      map.set(side.id, { id: Number(side.id), name: side.name });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchFotmobTeamById(teamId: number): Promise<FotmobLeagueRow | null> {
  const data = await fotmobFetch<FotmobTeamResponse>(`/data/teams?id=${teamId}`);
  const details = data.details;
  if (!details?.id || !details?.name) return null;
  return {
    id: details.id,
    name: details.name,
    shortName: details.shortName,
  };
}

export async function fetchFotmobTeamsByIds(ids: number[]): Promise<FotmobLeagueRow[]> {
  const results = await Promise.all(ids.map(fetchFotmobTeamById));
  return results.filter((t): t is FotmobLeagueRow => t !== null);
}

export async function fetchFotmobSquad(teamId: number | string): Promise<FotmobSquadMember[]> {
  const data = await fotmobFetch<FotmobTeamResponse>(`/data/teams?id=${teamId}`);
  const groups = data.squad?.squad ?? [];

  return groups
    .filter((group) => group.title !== "coach")
    .flatMap((group) => (group.members ?? []).filter((m) => m.role?.key !== "coach"));
}

export async function resolveFotmobNationalTeam(name: string): Promise<FotmobLeagueRow | null> {
  const wc = await fetchFotmobWorldCupTeams();
  const aliases: Record<string, string[]> = {
    "united states": ["usa", "united states"],
    "south korea": ["korea republic", "south korea"],
    "ivory coast": ["côte d'ivoire", "ivory coast"],
    "czech republic": ["czechia"],
    "cape verde": ["cape verde"],
    "curaçao": ["curacao", "curaçao"],
  };

  const norm = name.toLowerCase();
  const candidates = [norm, ...(aliases[norm] ?? [])];

  for (const c of candidates) {
    const exact = wc.find((t) => t.name.toLowerCase() === c);
    if (exact) return exact;
  }
  for (const c of candidates) {
    const partial = wc.find(
      (t) => t.name.toLowerCase().includes(c) || c.includes(t.name.toLowerCase())
    );
    if (partial) return partial;
  }
  return null;
}
