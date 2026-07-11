import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B0F17",
          backgroundImage:
            "radial-gradient(circle at 30% 25%, rgba(0,208,132,0.22), transparent 55%), radial-gradient(circle at 78% 80%, rgba(79,124,255,0.2), transparent 55%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoDataUri} width={132} height={132} alt="" />
      </div>
    ),
    { ...size }
  );
}
