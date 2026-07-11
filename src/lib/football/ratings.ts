/** OVR color tiers: >90 dark green, >80 green, 60–80 yellow, <60 red */
export function getRatingColor(overall: number): string {
  if (overall > 90) return "#0A7A4E";
  if (overall > 80) return "#00D084";
  if (overall >= 60) return "#FFB547";
  return "#FF5C5C";
}

export function getRatingBgColor(overall: number): string {
  const color = getRatingColor(overall);
  return `${color}22`;
}
