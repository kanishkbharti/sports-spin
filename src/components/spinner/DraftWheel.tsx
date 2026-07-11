"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { ApiTeam } from "@/lib/football/types";
import { getTeamCrestUrl, getTeamPlaceholderDataUri } from "@/lib/football/utils";
import { SafeImage } from "@/components/ui/SafeImage";

interface DraftWheelProps {
  teams: ApiTeam[];
  onSpinComplete: (team: ApiTeam) => void;
  disabled?: boolean;
}

export function DraftWheel({ teams, onSpinComplete, disabled = false }: DraftWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const sliceAngle = teams.length > 0 ? 360 / teams.length : 0;

  const spin = useCallback(() => {
    if (spinning || teams.length === 0 || disabled) return;
    setSpinning(true);

    const winnerIndex = Math.floor(Math.random() * teams.length);
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    // Pointer is fixed at top; rotate wheel so slice center aligns under it
    const targetMod = (360 - (winnerIndex + 0.5) * sliceAngle + 360) % 360;

    setRotation((prev) => {
      const currentMod = ((prev % 360) + 360) % 360;
      let delta = targetMod - currentMod;
      if (delta <= 0) delta += 360;
      delta += extraSpins * 360;
      return prev + delta;
    });

    setTimeout(() => {
      setSpinning(false);
      onSpinComplete(teams[winnerIndex]);
    }, 4500);
  }, [spinning, teams, sliceAngle, onSpinComplete, disabled]);

  if (teams.length === 0) {
    return (
      <div className="text-center text-text-muted py-12">
        <p className="text-sm">No teams selected.</p>
      </div>
    );
  }

  const wheelSize = teams.length > 16 ? 280 : teams.length > 10 ? 300 : 340;

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute -top-4 z-20">
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-accent" />
      </div>

      <div
        className={`absolute rounded-full transition-opacity duration-500 ${spinning ? "wheel-spinning opacity-100" : "opacity-30"}`}
        style={{
          width: wheelSize + 40,
          height: wheelSize + 40,
          background: "radial-gradient(circle, rgba(0,208,132,0.12) 0%, transparent 70%)",
        }}
      />

      <motion.div
        animate={{ rotate: rotation }}
        transition={{ duration: spinning ? 4.5 : 0, ease: [0.17, 0.67, 0.12, 0.99] }}
        className="relative rounded-full overflow-hidden"
        style={{
          width: wheelSize,
          height: wheelSize,
          boxShadow: spinning
            ? "0 0 50px rgba(0,208,132,0.25)"
            : "0 0 24px rgba(0,0,0,0.4)",
        }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {teams.map((team, i) => {
            const startAngle = (i * sliceAngle - 90) * (Math.PI / 180);
            const endAngle = ((i + 1) * sliceAngle - 90) * (Math.PI / 180);
            const cx = 200;
            const cy = 200;
            const r = 200;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const largeArc = sliceAngle > 180 ? 1 : 0;
            const midAngle = ((i + 0.5) * sliceAngle - 90) * (Math.PI / 180);
            const textR = r * 0.65;
            const textX = cx + textR * Math.cos(midAngle);
            const textY = cy + textR * Math.sin(midAngle);
            const textRot = i * sliceAngle + sliceAngle / 2;

            return (
              <g key={`${team.id}-${i}`}>
                <path
                  d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={i % 2 === 0 ? team.color : `${team.color}cc`}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                {teams.length <= 20 && (
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize={teams.length > 14 ? "7" : "10"}
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRot}, ${textX}, ${textY})`}
                    opacity="0.9"
                  >
                    {team.shortName}
                  </text>
                )}
              </g>
            );
          })}
          <circle cx="200" cy="200" r="55" fill="#151B26" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        </svg>

        {teams.length <= 16 &&
          teams.map((team, i) => {
            const midAngle = ((i + 0.5) * sliceAngle - 90) * (Math.PI / 180);
            const crestR = 130;
            const x = 50 + (crestR / 200) * 50 * Math.cos(midAngle);
            const y = 50 + (crestR / 200) * 50 * Math.sin(midAngle);
            const crestUrl = getTeamCrestUrl(team);
            const fallback = getTeamPlaceholderDataUri(team.shortName, team.color);

            return (
              <div
                key={`crest-${team.id}-${i}`}
                className="absolute w-6 h-6 sm:w-7 sm:h-7 pointer-events-none"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
              >
                <SafeImage
                  src={crestUrl ?? fallback}
                  fallback={fallback}
                  alt={team.name}
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
            );
          })}
      </motion.div>

      <button
        onClick={spin}
        disabled={spinning || disabled}
        className={`
          absolute z-10 w-[84px] h-[84px] sm:w-[92px] sm:h-[92px] rounded-full
          font-display font-extrabold text-sm tracking-wider transition-all cursor-pointer
          ${spinning || disabled
            ? "bg-surface-elevated text-text-muted cursor-not-allowed"
            : "bg-gradient-to-br from-accent to-accent-dim text-bg btn-glow hover:scale-105"
          }
        `}
      >
        {spinning ? "..." : disabled ? "FULL" : "SPIN"}
      </button>
    </div>
  );
}
