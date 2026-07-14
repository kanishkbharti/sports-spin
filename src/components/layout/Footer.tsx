"use client";

import { usePathname } from "next/navigation";

const HIDDEN_PREFIXES = [
  "/football/spinner",
  "/football/board",
  "/football/results",
  "/spinner",
  "/board",
  "/results",
];

export function Footer() {
  const pathname = usePathname();
  const hide = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (hide) return null;

  return (
    <footer className="relative z-[1] border-t border-border glass-strong">
      <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Squadr. Spin, draft, forge your ultimate XI.
        </p>
        <a
          href="https://www.producthunt.com/products/squadr?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-squadr"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Squadr - Spin for clubs. Draft players. Beat your friends. ⚽ | Product Hunt"
            width={250}
            height={54}
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1193696&theme=light&t=1783842052083"
          />
        </a>
      </div>
    </footer>
  );
}
