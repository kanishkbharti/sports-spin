import type { DraftedPlayer } from "@/components/modal/PositionPickerModal";

const SHARE_URL = "https://trysquadr.com";

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

interface ShareSquadInput {
  teamName: string;
  formation: string;
  players: DraftedPlayer[];
}

function buildShareText(
  { teamName, formation, players }: ShareSquadInput,
  includeUrl: boolean
): string {
  const rated = players.filter((p) => typeof p.overall === "number");
  const avg =
    rated.length > 0
      ? (rated.reduce((s, p) => s + p.overall, 0) / rated.length).toFixed(1)
      : "0";

  const lineup = players
    .slice()
    .sort((a, b) => b.overall - a.overall)
    .map((p) => `${p.slotLabel}: ${p.name} (${p.overall})`)
    .join("\n");

  const base = [
    `${teamName} · Ultimate XI (${formation})`,
    `Team rating: ${avg}`,
    "",
    lineup,
  ].join("\n");

  // Only append the URL for the clipboard fallback. When using the Web Share
  // API we pass the link via the `url` field instead, so it isn't duplicated.
  return includeUrl ? `${base}\n\nBuild yours at ${SHARE_URL}` : base;
}

/**
 * Shares the finished squad via the Web Share API when available,
 * falling back to copying a summary to the clipboard.
 */
export async function shareSquad(input: ShareSquadInput): Promise<ShareOutcome> {
  const title = `${input.teamName} · Ultimate XI`;

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    const data: ShareData = { title, text: buildShareText(input, false), url: SHARE_URL };
    try {
      if (!navigator.canShare || navigator.canShare(data)) {
        await navigator.share(data);
        return "shared";
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "cancelled";
      }
      // fall through to clipboard
    }
  }

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(buildShareText(input, true));
      return "copied";
    }
  } catch {
    // ignore, handled below
  }

  return "failed";
}
