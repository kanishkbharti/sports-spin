import type { DraftedPlayer } from "@/components/modal/PositionPickerModal";
import type { ApiTeam } from "@/lib/football/types";
import type { FootballDataType } from "@/lib/football/constants";

export interface DraftResult {
  formation: string;
  dataType: FootballDataType;
  draftMode: "single" | "multi";
  teamNames: string[];
  teams: ApiTeam[];
  squads: DraftedPlayer[][];
  completedAt: string;
}

const RESULT_KEY = "squad-forge-result";

export function storeDraftResult(result: DraftResult) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
  } catch {
    // ignore quota / serialization errors
  }
}

export function getDraftResult(): DraftResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw) as DraftResult) : null;
  } catch {
    return null;
  }
}

export function clearDraftResult() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RESULT_KEY);
}
