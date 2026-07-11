"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2, RotateCcw, Share2, Users } from "lucide-react";
import { FootballPitch } from "@/components/board/FootballPitch";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { TeamCrest } from "@/components/ui/TeamBadge";
import { OverallRating } from "@/components/ui/OverallRating";
import { getFormationSlots } from "@/lib/football/formations";
import { getRatingColor } from "@/lib/football/ratings";
import { getDraftResult, type DraftResult } from "@/lib/draft-result";
import { shareSquad } from "@/lib/share";
import { captureElementToBlob, shareOrDownloadImage } from "@/lib/capture";
import type { DraftedPlayer } from "@/components/modal/PositionPickerModal";
import type { ApiTeam } from "@/lib/football/types";
import type { Position } from "@/lib/types";

const PLAYER_COLORS = ["#00D084", "#4F7CFF"] as const;

const LINE_GROUPS: { key: Position; label: string; color: string }[] = [
  { key: "ATT", label: "Attack", color: "#FF5C5C" },
  { key: "MID", label: "Midfield", color: "#00D084" },
  { key: "DEF", label: "Defense", color: "#4F7CFF" },
  { key: "GK", label: "Goalkeeper", color: "#FFB547" },
];

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: ["#00D084", "#4F7CFF", "#FFB547", "#FF5C5C", "#FFFFFF"][i % 5],
      size: 4 + Math.random() * 6,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: 360 + Math.random() * 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, background: p.color }}
        />
      ))}
    </div>
  );
}

function LineRatings({ squad }: { squad: DraftedPlayer[] }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <h2 className="font-display font-bold text-base mb-4">Ratings by Line</h2>
        <div className="space-y-3">
          {LINE_GROUPS.map((group, i) => {
            const players = squad.filter((p) => p.position === group.key);
            const rating = Math.round(avg(players.map((p) => p.overall)));
            const hasPlayers = players.length > 0;
            return (
              <motion.div
                key={group.key}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: group.color }}
                    />
                    <span className="text-xs font-medium text-text-primary">{group.label}</span>
                    <span className="text-[10px] text-text-muted">
                      ({players.length})
                    </span>
                  </div>
                  {hasPlayers ? (
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: getRatingColor(rating) }}
                    >
                      {rating}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">vs</span>
                  )}
                </div>
                <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: hasPlayers ? `${rating}%` : "0%" }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                    className="h-full rounded-full"
                    style={{ background: group.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SourceDistribution({
  squad,
  teams,
  label,
}: {
  squad: DraftedPlayer[];
  teams: ApiTeam[];
  label: string;
}) {
  const distribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of squad) {
      const id = p.sourceTeamId ?? p.teamId;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    const total = squad.length || 1;
    return [...counts.entries()]
      .map(([teamId, count]) => ({
        teamId,
        count,
        pct: Math.round((count / total) * 100),
        team: teams.find((t) => t.id === teamId),
        name: squad.find((p) => (p.sourceTeamId ?? p.teamId) === teamId)?.sourceTeamName,
      }))
      .sort((a, b) => b.count - a.count);
  }, [squad, teams]);

  return (
    <Card>
      <CardContent className="pt-5">
        <h2 className="font-display font-bold text-base mb-4">{label}</h2>
        <div className="space-y-3">
          {distribution.map((item, i) => (
            <motion.div
              key={item.teamId}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  {item.team && <TeamCrest team={item.team} size={20} />}
                  <span className="text-xs font-medium text-text-primary truncate">
                    {item.team?.name ?? item.name ?? "Unknown"}
                  </span>
                </div>
                <span className="text-xs text-text-muted shrink-0">
                  {item.count} {item.count === 1 ? "player" : "players"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.06 }}
                  className="h-full rounded-full"
                  style={{ background: item.team?.color ?? "#00D084" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FootballResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<DraftResult | null>(null);
  const [activeSquad, setActiveSquad] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);
  const [shareState, setShareState] = useState<
    "idle" | "sharing" | "copied" | "shared" | "downloaded"
  >("idle");
  const pitchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = getDraftResult();
    if (!r || r.squads.every((s) => s.length === 0)) {
      router.replace("/football/create");
      return;
    }
    setResult(r);
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] text-text-muted">
        <span className="text-sm">Loading results...</span>
      </div>
    );
  }

  const isMulti = result.draftMode === "multi";
  const squad = result.squads[activeSquad] ?? [];
  const slots = getFormationSlots(result.formation);
  const teamRating = avg(squad.map((p) => p.overall));
  const distLabel =
    result.dataType === "club" ? "Club Distribution" : "Country Distribution";
  const labelFor = (idx: number) =>
    result.teamNames?.[idx] || (isMulti ? `Player ${idx + 1}` : "My Team");

  const handleShare = async () => {
    if (shareState === "sharing") return;
    const teamName = labelFor(activeSquad);
    const caption = `${teamName} · Ultimate XI (${result.formation})`;

    setShareState("sharing");
    try {
      if (pitchRef.current) {
        const blob = await captureElementToBlob(pitchRef.current);
        if (blob) {
          const outcome = await shareOrDownloadImage(
            blob,
            `${teamName.replace(/\s+/g, "-").toLowerCase()}-xi.png`,
            caption
          );
          if (outcome === "shared" || outcome === "downloaded") {
            setShareState(outcome);
            setTimeout(() => setShareState("idle"), 2500);
            return;
          }
          if (outcome === "cancelled") {
            setShareState("idle");
            return;
          }
        }
      }
      const outcome = await shareSquad({
        teamName,
        formation: result.formation,
        players: squad,
      });
      setShareState(outcome === "shared" || outcome === "copied" ? outcome : "idle");
      if (outcome === "shared" || outcome === "copied") {
        setTimeout(() => setShareState("idle"), 2500);
      }
    } catch {
      setShareState("idle");
    }
  };

  return (
    <div className="relative max-w-[1200px] mx-auto px-6 py-8">
      {showConfetti && <Confetti />}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">
          Draft Complete
        </p>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text-primary mb-2">
          {labelFor(activeSquad)}
        </h1>
        <p className="text-sm text-text-muted">Ultimate XI</p>
        <div className="inline-flex items-center gap-4 mt-4">
          <div className="px-5 py-2.5 rounded-[14px] glass">
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Team Rating</p>
            <p className="font-display font-bold text-3xl text-gradient-accent">
              {teamRating.toFixed(1)}
            </p>
          </div>
          <div className="px-5 py-2.5 rounded-[14px] glass">
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Formation</p>
            <p className="font-display font-bold text-3xl text-text-primary">
              {result.formation}
            </p>
          </div>
        </div>
      </motion.div>

      {isMulti && (
        <div className="flex items-center justify-center gap-2 mb-6">
          {result.squads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSquad(idx)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                idx === activeSquad
                  ? "glass-strong text-text-primary"
                  : "glass text-text-muted hover:text-text-secondary"
              }`}
              style={
                idx === activeSquad
                  ? { boxShadow: `0 0 0 2px ${PLAYER_COLORS[idx]}66` }
                  : undefined
              }
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: PLAYER_COLORS[idx] }}
              />
              {labelFor(idx)}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <motion.div
          ref={pitchRef}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-[560px] mx-auto lg:mx-0"
        >
          <FootballPitch
            formation={result.formation}
            slots={slots}
            assignments={squad}
            teams={result.teams}
            fifa
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <LineRatings squad={squad} />

          <SourceDistribution squad={squad} teams={result.teams} label={distLabel} />

          <Card>
            <CardContent className="pt-5">
              <h2 className="font-display font-bold text-base mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Squad ({squad.length})
              </h2>
              <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                {squad
                  .slice()
                  .sort((a, b) => b.overall - a.overall)
                  .map((p) => {
                    const team = result.teams.find(
                      (t) => t.id === (p.sourceTeamId ?? p.teamId)
                    );
                    return (
                      <div
                        key={`${p.id}-${p.slotId}`}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[10px] glass"
                      >
                        {team && <TeamCrest team={team} size={20} />}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-text-primary truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-text-muted">{p.slotLabel}</p>
                        </div>
                        <OverallRating overall={p.overall} size="sm" className="shrink-0" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 pt-2">
            <Button
              glow
              className="w-full"
              onClick={handleShare}
              disabled={shareState === "sharing"}
            >
              {shareState === "sharing" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing image…
                </>
              ) : shareState === "copied" ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied to clipboard
                </>
              ) : shareState === "downloaded" ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved image
                </>
              ) : shareState === "shared" ? (
                <>
                  <Check className="w-4 h-4" />
                  Shared
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share Squad
                </>
              )}
            </Button>
            <Link href="/football/create" className="block">
              <Button variant="ghost" className="w-full">
                <RotateCcw className="w-4 h-4" />
                Start New Draft
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
