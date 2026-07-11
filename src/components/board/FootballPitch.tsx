"use client";

import { motion } from "framer-motion";
import type { ApiTeam } from "@/lib/football/types";
import type { DraftedPlayer } from "@/components/modal/PositionPickerModal";
import { getFormationSlots, type FormationSlot } from "@/lib/football/formations";
import { SafeImage } from "@/components/ui/SafeImage";
import { getPlayerPhotoUrl, getPlayerPlaceholderDataUri } from "@/lib/football/utils";
import { getRatingColor } from "@/lib/football/ratings";
import { TeamCrest } from "@/components/ui/TeamBadge";

const positionColors: Record<string, string> = {
  GK: "#FFB547",
  DEF: "#4F7CFF",
  MID: "#00D084",
  ATT: "#FF5C5C",
};

interface FootballPitchProps {
  formation?: string;
  slots?: FormationSlot[];
  assignments?: DraftedPlayer[];
  teams?: ApiTeam[];
  compact?: boolean;
  fifa?: boolean;
  highlightSlotId?: string | null;
}

export function FootballPitch({
  formation = "4-3-3",
  slots: slotsProp,
  assignments = [],
  teams = [],
  compact = false,
  fifa = false,
  highlightSlotId = null,
}: FootballPitchProps) {
  const slots = slotsProp ?? getFormationSlots(formation);
  const assignmentBySlot = new Map(assignments.map((a) => [a.slotId, a]));

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);

  const tokenSize = fifa ? "w-[76px] h-[76px] sm:w-[88px] sm:h-[88px]" : compact ? "w-11 h-11 sm:w-12 sm:h-12" : "w-12 h-12 sm:w-14 sm:h-14";
  const ratingSize = fifa ? "w-8 h-8 text-xs" : "w-4 h-4 text-[8px]";
  const nameClass = fifa
    ? "text-[12px] font-bold max-w-[96px]"
    : "text-[9px] font-semibold max-w-[64px]";

  return (
    <div
      className={`relative w-full h-full rounded-[18px] overflow-hidden border ${
        fifa
          ? "border-accent/25 shadow-[0_0_80px_rgba(0,208,132,0.18)] aspect-[3/4] min-h-[480px]"
          : `border-white/10 ${compact ? "aspect-[3/4]" : "aspect-[3/4] lg:aspect-[4/5]"}`
      }`}
    >
      <div className={`absolute inset-0 ${fifa ? "pitch-pattern-fifa" : "pitch-pattern"}`} />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect x="5" y="5" width="90" height="90" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.3" />
        <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
        <rect x="25" y="5" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
        <rect x="25" y="77" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
      </svg>

      {!fifa && (
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-bg/60 backdrop-blur-sm border border-white/10">
          <span className="text-[10px] font-bold text-text-secondary tracking-wider">{formation}</span>
        </div>
      )}

      {fifa && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-bg/70 backdrop-blur-md border border-white/10">
          <span className="text-xs font-display font-bold text-text-primary tracking-wider">{formation}</span>
        </div>
      )}

      {slots.map((slot) => {
        const player = assignmentBySlot.get(slot.id);
        const isEmpty = !player;
        const isHighlight = highlightSlotId === slot.id;
        const posColor = player ? positionColors[player.position] ?? "#A9B2C3" : "#6b7589";
        const ratingColor = player ? getRatingColor(player.overall) : undefined;
        const team = player ? getTeam(player.sourceTeamId ?? player.teamId) : undefined;
        const fallback = player ? getPlayerPlaceholderDataUri(player.name) : undefined;
        const photoUrl = player ? getPlayerPhotoUrl(player.photo, player.name) : undefined;

        return (
          <motion.div
            key={slot.id}
            animate={isHighlight ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, repeat: isHighlight ? Infinity : 0, repeatDelay: 0.5 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
          >
            <div className={`flex flex-col items-center ${fifa ? "gap-1" : "gap-0.5"}`}>
              {isEmpty ? (
                <div
                  className={`${fifa ? "w-14 h-14" : "w-10 h-10 sm:w-11 sm:h-11"} rounded-full border-2 border-dashed flex items-center justify-center ${
                    isHighlight ? "border-accent bg-accent/10" : "border-white/20 bg-bg/40"
                  }`}
                >
                  <span className="text-[9px] font-bold text-text-muted">{slot.label}</span>
                </div>
              ) : (
                <div className="relative flex flex-col items-center">
                  {fifa && (
                    <div
                      className="mb-1 px-2 py-0.5 rounded-md font-bold text-xs tabular-nums"
                      style={{
                        background: `${ratingColor}22`,
                        color: ratingColor,
                        border: `1px solid ${ratingColor}44`,
                      }}
                    >
                      {player.overall}
                    </div>
                  )}
                  <div className="relative">
                    <div
                      className={`${tokenSize} rounded-full overflow-hidden border-2 flex items-center justify-center font-bold`}
                      style={{
                        borderColor: `${posColor}${fifa ? "" : "88"}`,
                        boxShadow: fifa
                          ? `0 8px 24px ${posColor}55, 0 0 0 3px ${posColor}22`
                          : `0 4px 12px ${posColor}33`,
                      }}
                    >
                      {photoUrl && fallback ? (
                        <SafeImage
                          src={photoUrl}
                          fallback={fallback}
                          alt={player.name}
                          fill
                          className="object-cover object-top"
                        />
                      ) : (
                        <span className={fifa ? "text-base" : "text-xs"} style={{ color: ratingColor }}>
                          {player.overall}
                        </span>
                      )}
                    </div>
                    {!fifa && (
                      <div className={`absolute -bottom-0.5 -right-0.5 ${ratingSize} rounded-full bg-bg flex items-center justify-center`}>
                        <span className="font-bold tabular-nums" style={{ color: ratingColor }}>
                          {player.overall}
                        </span>
                      </div>
                    )}
                    {team && !fifa && (
                      <div className="absolute -top-0.5 -left-0.5">
                        <TeamCrest team={team} size={14} />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <span
                className={`${nameClass} px-1.5 py-0.5 rounded backdrop-blur-sm truncate ${
                  isEmpty ? "text-text-muted bg-bg/40" : "text-white/90 bg-bg/60"
                }`}
              >
                {player ? (fifa ? player.name.split(" ").pop() : player.name.split(" ").pop()) : slot.label}
              </span>
              {fifa && player && (
                <span className="text-[9px] text-text-muted font-medium">{slot.label}</span>
              )}
            </div>
          </motion.div>
        );
      })}

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-bg/20" />
    </div>
  );
}
