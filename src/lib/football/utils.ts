/** Inline SVG placeholder — no external requests, no console noise */
export function getPlayerPlaceholderDataUri(name: string): string {
  const initial = (name.trim().charAt(0) || "?").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" fill="#151B26"/>
    <circle cx="64" cy="48" r="22" fill="#1c2433" stroke="#00D084" stroke-width="2" opacity="0.6"/>
    <text x="64" y="54" text-anchor="middle" fill="#00D084" font-size="22" font-family="system-ui,sans-serif" font-weight="700">${initial}</text>
    <ellipse cx="64" cy="108" rx="36" ry="28" fill="#1c2433" stroke="#00D084" stroke-width="1.5" opacity="0.4"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function getTeamCrestUrl(team: { crestUrl?: string | null; crestId?: number; fotmobId?: string }): string | null {
  if (team.crestUrl) return team.crestUrl;
  if (team.fotmobId) return `https://images.fotmob.com/image_resources/logo/teamlogo/${team.fotmobId}.png`;
  if (team.crestId) return `https://crests.football-data.org/${team.crestId}.png`;
  return null;
}

export function getPlayerPhotoUrl(
  photo: string | null | undefined,
  name: string,
  fotmobPlayerId?: string
): string {
  if (photo) return photo;
  if (fotmobPlayerId) return `https://images.fotmob.com/image_resources/playerimages/${fotmobPlayerId}.png`;
  return getPlayerPlaceholderDataUri(name);
}

export function getTeamPlaceholderDataUri(shortName: string, color = "#00D084"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#151B26" stroke="${color}" stroke-width="2"/>
    <text x="32" y="38" text-anchor="middle" fill="${color}" font-size="14" font-family="system-ui,sans-serif" font-weight="700">${shortName.slice(0, 3)}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
