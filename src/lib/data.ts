import type { Sport } from "./types";
import { CURATED_LEAGUES, type LeagueCode } from "./football/constants";

export const SPORTS: Sport[] = [
  {
    id: "football",
    name: "Football",
    icon: "⚽",
    status: "active",
    href: "/football/create",
    description: "Spin clubs, nations, or World Cup 26 squads",
    accent: "#00D084",
  },
  {
    id: "basketball",
    name: "Basketball",
    icon: "🏀",
    status: "coming_soon",
    description: "NBA & international roster drafts",
    accent: "#FF6B35",
  },
  {
    id: "cricket",
    name: "Cricket",
    icon: "🏏",
    status: "coming_soon",
    description: "IPL, T20 World Cup & Test XI builders",
    accent: "#FFB547",
  },
  {
    id: "nfl",
    name: "NFL",
    icon: "🏈",
    status: "coming_soon",
    description: "Fantasy roster spin drafts",
    accent: "#4F7CFF",
  },
  {
    id: "f1",
    name: "Formula 1",
    icon: "🏎️",
    status: "coming_soon",
    description: "Constructor & driver draft rooms",
    accent: "#FF5C5C",
  },
  {
    id: "hockey",
    name: "Hockey",
    icon: "🏒",
    status: "coming_soon",
    description: "NHL & international squad spins",
    accent: "#6EC6FF",
  },
];

export const FORMATIONS = ["4-3-3", "4-2-3-1", "4-4-2", "3-5-2", "3-4-3"] as const;

export const FORMATION_SLOTS: Record<string, string[]> = {
  "4-3-3": ["GK", "LB", "CB1", "CB2", "RB", "CM1", "CM2", "CM3", "LW", "ST", "RW"],
  "4-2-3-1": ["GK", "LB", "CB1", "CB2", "RB", "CDM1", "CDM2", "LAM", "CAM", "RAM", "ST"],
  "4-4-2": ["GK", "LB", "CB1", "CB2", "RB", "LM", "CM1", "CM2", "RM", "ST1", "ST2"],
  "3-5-2": ["GK", "CB1", "CB2", "CB3", "LWB", "CM1", "CM2", "CM3", "RWB", "ST1", "ST2"],
  "3-4-3": ["GK", "CB1", "CB2", "CB3", "LM", "CM1", "CM2", "RM", "LW", "ST", "RW"],
};

export const FOOTBALL_LEVELS = [
  {
    id: "club" as const,
    name: "Club Level",
    description: "Curated pools from Europe's top leagues",
    detail: "Premier League, La Liga, Serie A top 6, Bundesliga & Ligue 1 elites",
  },
  {
    id: "worldcup26" as const,
    name: "World Cup 26",
    description: "FIFA World Cup 2026 national teams",
    detail: "Hosts, qualifiers & confirmed nations",
  },
  {
    id: "country" as const,
    name: "Country Level",
    description: "International sides from around the world",
    detail: "50+ national teams with live rosters",
  },
];

export const LEAGUE_OPTIONS = (Object.keys(CURATED_LEAGUES) as LeagueCode[]).map((code) => ({
  id: code,
  name: CURATED_LEAGUES[code].name,
  description: CURATED_LEAGUES[code].description,
  season: CURATED_LEAGUES[code].season,
}));

// Demo data for board/results screens until full draft state is wired
export const DRAFT_PLAYERS = [
  { id: "dp1", name: "Player 1", picks: 8, maxPicks: 11, isCurrentTurn: false, color: "#00D084" },
  { id: "dp2", name: "Player 2", picks: 6, maxPicks: 11, isCurrentTurn: true, color: "#4F7CFF" },
  { id: "dp3", name: "Player 3", picks: 7, maxPicks: 11, isCurrentTurn: false, color: "#FFB547" },
  { id: "dp4", name: "Player 4", picks: 5, maxPicks: 11, isCurrentTurn: false, color: "#FF5C5C" },
];

export const DEMO_TEAMS = [
  { id: "demo-liv", name: "Liverpool", shortName: "LIV", color: "#C8102E", secondaryColor: "#F6EB61", league: "pl", crestUrl: "https://r2.thesportsdb.com/images/media/team/badge/ywxwvq1448817130.png" },
  { id: "demo-bar", name: "Barcelona", shortName: "BAR", color: "#A50044", secondaryColor: "#004D98", league: "laliga", crestUrl: "https://r2.thesportsdb.com/images/media/team/badge/ywxwvq1448817130.png" },
];

export const CLUB_LIMITS = [
  { teamId: "demo-liv", teamName: "Liverpool", count: 2, max: 3, color: "#C8102E" },
  { teamId: "demo-bar", teamName: "Barcelona", count: 1, max: 3, color: "#A50044" },
];

export const ALREADY_PICKED = [
  { id: "p1", name: "Salah", overall: 91, position: "ATT" as const, country: "Egypt", countryCode: "eg", teamId: "demo-liv", pickedBy: "Player 1" },
  { id: "p2", name: "Haaland", overall: 92, position: "ATT" as const, country: "Norway", countryCode: "no", teamId: "demo-mci", pickedBy: "Player 2" },
  { id: "p3", name: "Pedri", overall: 89, position: "MID" as const, country: "Spain", countryCode: "es", teamId: "demo-bar", pickedBy: "Player 1" },
];

export function getTeamById(id: string) {
  return DEMO_TEAMS.find((t) => t.id === id);
}
