interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Squadr brand mark: a segmented "draft wheel" with a pointer,
 * echoing the spin-to-draft mechanic. Colours track the app palette.
 */
export function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="ssf-ring"
          x1="8"
          y1="8"
          x2="56"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00D084" />
          <stop offset="1" stopColor="#4F7CFF" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#0B0F17" />
      <rect
        x="0.75"
        y="0.75"
        width="62.5"
        height="62.5"
        rx="15.25"
        stroke="url(#ssf-ring)"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <g transform="rotate(-18 32 32)">
        <path d="M32 32 L50 32 A18 18 0 0 1 32 50 Z" fill="#00D084" />
        <path d="M32 32 L32 50 A18 18 0 0 1 14 32 Z" fill="#4F7CFF" />
        <path d="M32 32 L14 32 A18 18 0 0 1 32 14 Z" fill="#FFB547" />
        <path d="M32 32 L32 14 A18 18 0 0 1 50 32 Z" fill="#00A86B" />
        <circle cx="32" cy="32" r="18" stroke="#0B0F17" strokeWidth="2.5" fill="none" />
        <circle cx="32" cy="32" r="7.5" fill="#0B0F17" />
        <circle cx="32" cy="32" r="3" fill="#FFFFFF" />
      </g>
      <path d="M32 6 L37 15 H27 Z" fill="#FFFFFF" />
    </svg>
  );
}
