"use client";

import { motion } from "framer-motion";
import { getTeamCrestUrl, getTeamPlaceholderDataUri } from "@/lib/football/utils";
import { SafeImage } from "./SafeImage";

interface TeamLike {
  id: string;
  name: string;
  shortName: string;
  color: string;
  secondaryColor: string;
  crestId?: number;
  crestUrl?: string | null;
  fotmobId?: string;
}

interface TeamBadgeProps {
  team: TeamLike;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const sizeMap = {
  sm: { container: "w-8 h-8", image: 24, text: "text-[10px]" },
  md: { container: "w-10 h-10", image: 32, text: "text-xs" },
  lg: { container: "w-14 h-14", image: 44, text: "text-sm" },
};

function CrestImage({ team, size }: { team: TeamLike; size: number }) {
  const crestUrl = getTeamCrestUrl(team);
  const fallback = getTeamPlaceholderDataUri(team.shortName, team.color);

  if (crestUrl) {
    return (
      <SafeImage
        src={crestUrl}
        fallback={fallback}
        alt={team.name}
        width={size}
        height={size}
        className="object-contain p-0.5"
      />
    );
  }

  return (
    <span className="font-bold text-xs" style={{ color: team.color }}>
      {team.shortName}
    </span>
  );
}

export function TeamBadge({ team, size = "md", showName = false }: TeamBadgeProps) {
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${s.container} rounded-full flex items-center justify-center overflow-hidden shrink-0`}
        style={{ background: `linear-gradient(135deg, ${team.color}22, ${team.secondaryColor}11)` }}
      >
        <CrestImage team={team} size={s.image} />
      </div>
      {showName && (
        <span className="text-sm font-medium text-text-primary truncate">{team.name}</span>
      )}
    </div>
  );
}

interface TeamCrestProps {
  team: TeamLike;
  size?: number;
  className?: string;
}

export function TeamCrest({ team, size = 40, className = "" }: TeamCrestProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`rounded-full flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${team.color}33, ${team.secondaryColor}22)`,
      }}
    >
      <CrestImage team={team} size={size * 0.75} />
    </motion.div>
  );
}
