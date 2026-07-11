import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { ApiPlayer } from "./types";

export interface StoredSquad {
  teamId: string;
  teamName: string;
  externalId: string;
  ratingsVersion: string;
  fetchedAt: string;
  players: ApiPlayer[];
}

const SQUADS_DIR = join(process.cwd(), "src/lib/football/data/squads");
const RATINGS_VERSION = "fc26-csv-20250921";

function squadPath(teamId: string): string {
  const safe = teamId.replace(/[^a-zA-Z0-9-_]/g, "_");
  return join(SQUADS_DIR, `${safe}.json`);
}

export function readStoredSquad(teamId: string): StoredSquad | null {
  const path = squadPath(teamId);
  if (!existsSync(path)) return null;

  try {
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw) as StoredSquad;
    if (data.ratingsVersion !== RATINGS_VERSION || !Array.isArray(data.players)) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeStoredSquad(squad: StoredSquad): void {
  mkdirSync(SQUADS_DIR, { recursive: true });
  writeFileSync(squadPath(squad.teamId), JSON.stringify(squad, null, 2));
}

export function storedSquadPlayers(teamId: string): ApiPlayer[] | null {
  return readStoredSquad(teamId)?.players ?? null;
}

export { RATINGS_VERSION };
