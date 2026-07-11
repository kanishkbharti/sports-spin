"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { Player } from "@/lib/types";
import type { ApiTeam } from "@/lib/football/types";
import { getPlayerPhotoUrl, getPlayerPlaceholderDataUri } from "@/lib/football/utils";
import { getRatingColor, getRatingBgColor } from "@/lib/football/ratings";
import { SafeImage } from "./SafeImage";
import { TeamCrest } from "./TeamBadge";

interface PlayerCardProps {
  player: Player;
  team?: ApiTeam | null;
  locked?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const positionColors: Record<string, string> = {
  GK: "#FFB547",
  DEF: "#4F7CFF",
  MID: "#00D084",
  ATT: "#FF5C5C",
};

export function PlayerCard({
  player,
  team,
  locked = false,
  compact = false,
  onClick,
}: PlayerCardProps) {
  const posColor = positionColors[player.position] ?? "#A9B2C3";
  const ratingColor = getRatingColor(player.overall);
  const fallback = getPlayerPlaceholderDataUri(player.name);
  const photoUrl = getPlayerPhotoUrl(player.photo, player.name);

  if (compact) {
    return (
      <motion.div
        layout
        whileHover={!locked ? { scale: 1.03, y: -2 } : undefined}
        className={`
          relative flex flex-col items-center gap-1 p-2 rounded-[14px] cursor-pointer
          bg-surface-elevated border border-border
          ${locked ? "opacity-40 cursor-not-allowed" : "hover:border-accent/30"}
        `}
        onClick={!locked ? onClick : undefined}
      >
        <div
          className="relative w-12 h-12 rounded-full overflow-hidden border-2"
          style={{ borderColor: `${posColor}44` }}
        >
          <SafeImage src={photoUrl} fallback={fallback} alt={player.name} fill className="object-cover object-top" />
        </div>
        <span className="text-[10px] font-bold tabular-nums" style={{ color: ratingColor }}>
          {player.overall}
        </span>
        <span className="text-[10px] font-medium text-text-secondary text-center leading-tight max-w-[60px] truncate">
          {player.name.split(" ").pop()}
        </span>
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg/40 rounded-[14px]">
            <Lock className="w-4 h-4 text-text-muted" />
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={!locked ? { y: -4, transition: { duration: 0.2 } } : undefined}
      whileTap={!locked ? { scale: 0.98 } : undefined}
      onClick={!locked ? onClick : undefined}
      className={`
        relative group rounded-[16px] overflow-hidden cursor-pointer
        bg-surface-elevated border border-border
        ${locked ? "opacity-45 cursor-not-allowed grayscale" : "hover:border-accent/40"}
      `}
    >
      <div
        className="absolute top-3 left-3 z-10 w-10 h-10 rounded-[10px] flex items-center justify-center font-bold text-sm tabular-nums"
        style={{ background: getRatingBgColor(player.overall), color: ratingColor }}
      >
        {player.overall}
      </div>

      <div
        className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider"
        style={{ background: `${posColor}22`, color: posColor }}
      >
        {player.position}
      </div>

      <div
        className="h-32 flex items-end justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${posColor}06 0%, ${posColor}12 100%)` }}
      >
        <SafeImage
          src={photoUrl}
          fallback={fallback}
          alt={player.name}
          width={120}
          height={120}
          className="object-contain object-bottom h-28 w-auto"
        />
      </div>

      <div className="px-3 py-3 border-t border-border bg-surface/80">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{player.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-text-muted uppercase tracking-wide">
                {player.countryCode}
              </span>
              {team && <TeamCrest team={team} size={14} />}
            </div>
          </div>
        </div>
      </div>

      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/50 backdrop-blur-[2px]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-border">
            <Lock className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs text-text-muted font-medium">Picked</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
