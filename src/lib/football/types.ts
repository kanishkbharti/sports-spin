export interface ApiTeam {
  id: string;
  externalId: string;
  fotmobId?: string;
  name: string;
  shortName: string;
  crestUrl: string | null;
  color: string;
  secondaryColor: string;
  league: string;
  leagueCode?: string;
  country?: string;
  type: "club" | "national";
}

export interface ApiPlayer {
  id: string;
  externalId: string;
  name: string;
  overall: number;
  position: import("@/lib/types").Position;
  country: string;
  countryCode: string;
  teamId: string;
  photo: string | null;
  number?: string;
}

export interface FootballApiResponse<T> {
  success: boolean;
  type: string;
  league?: string;
  teamId?: string;
  cached: boolean;
  fetchedAt: string;
  count: number;
  data: T;
  error?: string;
}
