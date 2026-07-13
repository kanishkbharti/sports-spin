"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "./Logo";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/football/create", label: "Football" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border glass-strong">
      <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo
            size={30}
            className="transition-transform duration-300 group-hover:rotate-[18deg]"
          />
          <span className="font-display font-bold text-sm tracking-tight hidden sm:block">
            Squadr
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="relative px-3 py-1.5">
                <span
                  className={`text-xs font-medium transition-colors ${
                    active ? "text-accent" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
