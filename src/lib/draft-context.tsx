"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import type { ApiPlayer, ApiTeam } from "@/lib/football/types";
import type { FootballDataType, LeagueCode } from "@/lib/football/constants";

export interface DraftConfig {
  sport: "football";
  dataType: FootballDataType;
  league?: LeagueCode;
  selectedTeamIds: string[];
  teams: ApiTeam[];
  formation: string;
  /** single = 1 squad builder, multi = 2 players take turns */
  draftMode: "single" | "multi";
  humanPlayers: 1 | 2;
  /** Manager/team name per drafter (1 for single, 2 for multi) */
  teamNames: string[];
  maxFromClub: number | "unlimited";
  draftOrder: "random" | "manual";
  snakeDraft: boolean;
}

interface DraftContextValue {
  config: DraftConfig | null;
  setConfig: (config: DraftConfig) => void;
  clearConfig: () => void;
  fetchTeams: (type: FootballDataType, league?: LeagueCode) => Promise<ApiTeam[]>;
  fetchPlayers: (team: ApiTeam) => Promise<ApiPlayer[]>;
}

const DraftContext = createContext<DraftContextValue | null>(null);

const STORAGE_KEY = "squad-forge-draft";

function loadConfig(): DraftConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DraftConfig) : null;
  } catch {
    return null;
  }
}

function saveConfig(config: DraftConfig | null) {
  if (typeof window === "undefined") return;
  if (config) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  else sessionStorage.removeItem(STORAGE_KEY);
}

export function DraftProvider({ children }: { children: ReactNode }) {
  const setConfig = useCallback((config: DraftConfig) => {
    saveConfig(config);
  }, []);

  const clearConfig = useCallback(() => {
    saveConfig(null);
  }, []);

  const fetchTeams = useCallback(async (type: FootballDataType, league?: LeagueCode) => {
    const params = new URLSearchParams({ type });
    if (league) params.set("league", league);
    const res = await fetch(`/api/football?${params}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Failed to fetch teams");
    return json.data as ApiTeam[];
  }, []);

  const fetchPlayers = useCallback(async (team: ApiTeam) => {
    const params = new URLSearchParams({
      type: "players",
      teamId: team.id,
      externalId: team.externalId,
    });
    const res = await fetch(`/api/football?${params}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Failed to fetch players");
    return json.data as ApiPlayer[];
  }, []);

  const value = useMemo(
    () => ({ config: null, setConfig, clearConfig, fetchTeams, fetchPlayers }),
    [setConfig, clearConfig, fetchTeams, fetchPlayers]
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraft() {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error("useDraft must be used within DraftProvider");
  return ctx;
}

export function getStoredConfig(): DraftConfig | null {
  return loadConfig();
}

export function storeConfig(config: DraftConfig) {
  saveConfig(config);
}
