export const FOTMOB_LEAGUES = {
  pl: { id: 47, name: "Premier League", searchName: "English Premier League" },
  laliga: { id: 87, name: "La Liga", searchName: "Spanish La Liga" },
  seriea: { id: 55, name: "Serie A", searchName: "Italian Serie A" },
  bundesliga: { id: 54, name: "Bundesliga", searchName: "German Bundesliga" },
  ligue1: { id: 53, name: "Ligue 1", searchName: "French Ligue 1" },
} as const;

export const FOTMOB_WORLD_CUP_LEAGUE_ID = 77;

export const TOP_LEAGUES = {
  pl: { id: "4328", name: "Premier League", searchName: "English Premier League", country: "England", fotmobId: 47 },
  laliga: { id: "4335", name: "La Liga", searchName: "Spanish La Liga", country: "Spain", fotmobId: 87 },
  seriea: { id: "4332", name: "Serie A", searchName: "Italian Serie A", country: "Italy", fotmobId: 55 },
  bundesliga: { id: "4331", name: "Bundesliga", searchName: "German Bundesliga", country: "Germany", fotmobId: 54 },
  ligue1: { id: "4334", name: "Ligue 1", searchName: "French Ligue 1", country: "France", fotmobId: 53 },
} as const;

export type LeagueCode = keyof typeof TOP_LEAGUES;
export type FootballDataType = "club" | "worldcup26" | "country";

/** Curated 2025-26 club pools — no random lower-league noise */
export const CURATED_LEAGUES: Record<
  LeagueCode,
  {
    name: string;
    season: string;
    fotmobLeagueId: number;
    description: string;
    /** "all" = every team in the FotMob league table; "allowlist" = only teamIds */
    mode: "all" | "allowlist";
    teamIds?: number[];
  }
> = {
  pl: {
    name: "Premier League",
    season: "2025-26",
    fotmobLeagueId: 47,
    description: "All 20 clubs · 2025-26 season",
    mode: "allowlist",
    teamIds: [
      9825, // Arsenal
      10252, // Aston Villa
      8678, // Bournemouth
      9937, // Brentford
      10204, // Brighton
      8455, // Chelsea
      9826, // Crystal Palace
      8668, // Everton
      9879, // Fulham
      9902, // Ipswich Town
      8197, // Leicester City
      8650, // Liverpool
      8456, // Manchester City
      10260, // Manchester United
      10261, // Newcastle United
      10203, // Nottingham Forest
      8466, // Southampton
      8586, // Tottenham Hotspur
      8654, // West Ham United
      8602, // Wolverhampton Wanderers
    ],
  },
  laliga: {
    name: "La Liga",
    season: "2025-26",
    fotmobLeagueId: 87,
    description: "All 20 clubs incl. Real Madrid & Barcelona",
    mode: "all",
  },
  seriea: {
    name: "Serie A",
    season: "2025-26",
    fotmobLeagueId: 55,
    description: "Top 6 · Inter, Milan, Napoli, Juve, Atalanta, Roma",
    mode: "allowlist",
    teamIds: [
      8636, // Inter
      8564, // Milan
      9875, // Napoli
      9885, // Juventus
      8524, // Atalanta
      8686, // Roma
    ],
  },
  bundesliga: {
    name: "Bundesliga",
    season: "2025-26",
    fotmobLeagueId: 54,
    description: "Bayern · Dortmund · RB Leipzig",
    mode: "allowlist",
    teamIds: [
      9823, // Bayern München
      9789, // Borussia Dortmund
      178475, // RB Leipzig
    ],
  },
  ligue1: {
    name: "Ligue 1",
    season: "2025-26",
    fotmobLeagueId: 53,
    description: "PSG · Monaco · Lyon",
    mode: "allowlist",
    teamIds: [
      9847, // Paris Saint-Germain
      9829, // Monaco
      9748, // Lyon
    ],
  },
};

export const WORLD_CUP_2026_NATIONS = [
  "United States", "Mexico", "Canada", "Argentina", "Brazil", "France", "Germany",
  "Spain", "England", "Portugal", "Netherlands", "Belgium", "Croatia", "Italy",
  "Uruguay", "Colombia", "Ecuador", "Japan", "South Korea", "Australia", "Morocco",
  "Senegal", "Switzerland", "Austria", "Norway", "Scotland", "Paraguay", "Qatar",
  "Saudi Arabia", "Iran", "Tunisia", "Algeria", "South Africa", "New Zealand",
  "Curaçao", "Haiti", "Cape Verde", "Jordan", "Uzbekistan", "Ghana", "Ivory Coast",
  "Egypt", "Panama", "Costa Rica",
] as const;

export const COUNTRY_NATIONS = [
  "England", "Spain", "Germany", "France", "Italy", "Brazil", "Argentina", "Portugal",
  "Netherlands", "Belgium", "Croatia", "Uruguay", "Colombia", "Mexico", "United States",
  "Japan", "South Korea", "Morocco", "Senegal", "Nigeria", "Egypt", "Australia",
  "Switzerland", "Denmark", "Sweden", "Poland", "Serbia", "Ukraine", "Turkey",
  "Scotland", "Wales", "Ireland", "Austria", "Czech Republic", "Norway", "Chile",
  "Peru", "Ecuador", "Paraguay", "Venezuela", "Cameroon", "Ghana", "Ivory Coast",
  "Tunisia", "Algeria", "Iran", "Saudi Arabia", "Qatar", "India", "China",
] as const;

export const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
