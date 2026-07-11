import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const LOGO_SVG = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="r" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00D084"/><stop offset="1" stop-color="#4F7CFF"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="#0B0F17"/>
  <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="url(#r)" stroke-opacity="0.35" stroke-width="1.5"/>
  <g transform="rotate(-18 32 32)">
    <path d="M32 32 L50 32 A18 18 0 0 1 32 50 Z" fill="#00D084"/>
    <path d="M32 32 L32 50 A18 18 0 0 1 14 32 Z" fill="#4F7CFF"/>
    <path d="M32 32 L14 32 A18 18 0 0 1 32 14 Z" fill="#FFB547"/>
    <path d="M32 32 L32 14 A18 18 0 0 1 50 32 Z" fill="#00A86B"/>
    <circle cx="32" cy="32" r="18" stroke="#0B0F17" stroke-width="2.5" fill="none"/>
    <circle cx="32" cy="32" r="7.5" fill="#0B0F17"/>
    <circle cx="32" cy="32" r="3" fill="#FFFFFF"/>
  </g>
  <path d="M32 6 L37 15 H27 Z" fill="#FFFFFF"/>
</svg>`;

const logoDataUri = `data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}`;

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#0B0F17",
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(0,208,132,0.18), transparent 42%), radial-gradient(circle at 88% 82%, rgba(79,124,255,0.16), transparent 45%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoDataUri} width={120} height={120} alt="" />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "10px 22px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.12)",
              backgroundColor: "rgba(21,27,38,0.6)",
              color: "#A9B2C3",
              fontSize: "26px",
              fontWeight: 600,
              letterSpacing: "2px",
            }}
          >
            SPIN · DRAFT · FORGE
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: "88px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-2px",
              lineHeight: 1.05,
            }}
          >
            Squadr
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "24px",
              maxWidth: "900px",
              fontSize: "34px",
              fontWeight: 400,
              color: "#A9B2C3",
              lineHeight: 1.35,
            }}
          >
            Home of Sports Squad Forge. Spin a random team, draft one real
            player at a time, and build your ultimate starting XI.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", width: "40px", height: "6px", borderRadius: "999px", backgroundColor: "#00D084" }} />
          <div style={{ display: "flex", fontSize: "30px", fontWeight: 700, color: "#00D084" }}>
            trysquadr.com
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
