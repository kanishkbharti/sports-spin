export type Position = "GK" | "DEF" | "MID" | "ATT";

export type Formation = "4-3-3" | "4-2-3-1" | "4-4-2" | "3-5-2" | "3-4-3";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  secondaryColor: string;
  league: string;
  crestId?: number;
  crestUrl?: string | null;
  externalId?: string;
}

export interface Player {
  id: string;
  name: string;
  overall: number;
  position: Position;
  country: string;
  countryCode: string;
  teamId: string;
  photo?: string | null;
  number?: string;
}

export interface DraftPlayer {
  id: string;
  name: string;
  picks: number;
  maxPicks: number;
  isCurrentTurn: boolean;
  color: string;
}

export interface DraftSettings {
  formation: Formation;
  playersPerDraft: number;
  maxFromClub: number | "unlimited";
  draftOrder: "random" | "manual";
  snakeDraft: boolean;
  selectedTeams: string[];
  competition: string | null;
}

export interface PickedPlayer extends Player {
  pickedBy: string;
  slot?: string;
}

export interface ClubLimit {
  teamId: string;
  teamName: string;
  count: number;
  max: number;
  color: string;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
  status: "active" | "coming_soon";
  href?: string;
  description: string;
  accent: string;
}
