/**
 * Rejects bracket/placeholder entries that aren't real teams, e.g.
 * "Argentina/Switzerland", "Winner SF 1", "Loser SF 2", "Qualifier 2",
 * "Group A Runner-up", "Play-off Winner", "TBD".
 *
 * Pure + client-safe (no server-only imports) so it can run in the browser too.
 */
export function isPlaceholderTeamName(name: string): boolean {
  const n = (name ?? "").trim();
  if (!n) return true;
  if (n.includes("/")) return true; // "Argentina/Switzerland"
  if (/\d/.test(n)) return true; // any digit => bracket slot ("Winner SF 1", "Qualifier 2")
  return /\b(winner|loser|runner[- ]?up|qualifier|play[- ]?off|group|tbd|third\s*place|\bsf\b|\bqf\b|\br16\b)\b/i.test(
    n
  );
}

export function filterRealTeams<T extends { name: string }>(teams: T[]): T[] {
  return teams.filter((t) => !isPlaceholderTeamName(t.name));
}
