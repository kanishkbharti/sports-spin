import type { DraftedPlayer } from "@/components/modal/PositionPickerModal";

export function countFromSourceTeam(
  assignments: DraftedPlayer[],
  sourceTeamId: string
): number {
  return assignments.filter((a) => a.sourceTeamId === sourceTeamId).length;
}

export function isClubLimitReached(
  assignments: DraftedPlayer[],
  sourceTeamId: string,
  maxFromClub: number | "unlimited"
): boolean {
  if (maxFromClub === "unlimited") return false;
  return countFromSourceTeam(assignments, sourceTeamId) >= maxFromClub;
}

export function nextDrafterIndex(current: number, humanPlayers: number): number {
  return (current + 1) % humanPlayers;
}
