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

/**
 * Returns which drafter owns a given global pick (0-indexed), honouring the
 * starting drafter and snake ordering.
 *
 * - Straight draft: every round keeps the same order, e.g. P0, P1, P0, P1…
 * - Snake draft: order reverses each round, e.g. P0, P1, P1, P0, P0, P1…
 */
export function drafterForPick(
  pickIndex: number,
  startDrafter: number,
  humanPlayers: number,
  snake: boolean
): number {
  if (humanPlayers <= 1) return 0;
  const round = Math.floor(pickIndex / humanPlayers);
  const posInRound = pickIndex % humanPlayers;
  const reversed = snake && round % 2 === 1;
  const offset = reversed ? humanPlayers - 1 - posInRound : posInRound;
  return (startDrafter + offset) % humanPlayers;
}
