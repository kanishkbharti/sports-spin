"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, RotateCcw, Share2 } from "lucide-react";
import { FootballPitch } from "@/components/board/FootballPitch";
import { Button } from "@/components/ui/Button";
import { OverallRating } from "@/components/ui/OverallRating";
import { shareSquad } from "@/lib/share";
import { captureElementToBlob, shareOrDownloadImage } from "@/lib/capture";
import type { DraftedPlayer } from "@/components/modal/PositionPickerModal";
import type { ApiTeam } from "@/lib/football/types";
import type { FormationSlot } from "@/lib/football/formations";

interface FifaSquadRevealProps {
  formation: string;
  slots: FormationSlot[];
  assignments: DraftedPlayer[];
  teams: ApiTeam[];
  title?: string;
  onEdit?: () => void;
}

export function FifaSquadReveal({
  formation,
  slots,
  assignments,
  teams,
  title = "Your Ultimate XI",
  onEdit,
}: FifaSquadRevealProps) {
  const avgRating =
    assignments.length > 0
      ? (assignments.reduce((s, p) => s + p.overall, 0) / assignments.length).toFixed(1)
      : "0";

  const pitchRef = useRef<HTMLDivElement>(null);
  const [shareState, setShareState] = useState<
    "idle" | "sharing" | "copied" | "shared" | "downloaded"
  >("idle");

  const handleShare = async () => {
    if (shareState === "sharing") return;
    const stripped = title.replace(/(?:’s|'s)?\s*Ultimate XI$/i, "").trim();
    const teamName = !stripped || /^your$/i.test(stripped) ? "My Team" : stripped;
    const caption = `${teamName} · Ultimate XI (${formation})`;

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
      // Fallback: share/copy a text summary.
      const outcome = await shareSquad({ teamName, formation, players: assignments });
      setShareState(outcome === "shared" || outcome === "copied" ? outcome : "idle");
      if (outcome === "shared" || outcome === "copied") {
        setTimeout(() => setShareState("idle"), 2500);
      }
    } catch {
      setShareState("idle");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-bg flex flex-col overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,208,132,0.12),transparent_60%)]" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-bg via-bg/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg via-bg/90 to-transparent" />
      </div>

      <div className="relative z-10 px-4 sm:px-8 pt-6 pb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-1">
            Squad Complete
          </p>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-text-primary">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center px-4 py-2 rounded-[14px] glass-strong">
            <p className="text-[9px] text-text-muted uppercase tracking-wider">Rating</p>
            <p className="font-display font-bold text-2xl text-gradient-accent">{avgRating}</p>
          </div>
          <div className="text-center px-4 py-2 rounded-[14px] glass-strong">
            <p className="text-[9px] text-text-muted uppercase tracking-wider">Formation</p>
            <p className="font-display font-bold text-2xl text-text-primary">{formation}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-10 pb-2 min-h-0">
        <motion.div
          ref={pitchRef}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[640px] h-full max-h-[min(78vh,820px)]"
        >
          <FootballPitch
            formation={formation}
            slots={slots}
            assignments={assignments}
            teams={teams}
            fifa
          />
        </motion.div>
      </div>

      <div className="relative z-10 px-4 sm:px-8 pb-5 flex flex-wrap items-center justify-center gap-3">
        {onEdit && (
          <Button variant="secondary" onClick={onEdit}>
            <RotateCcw className="w-4 h-4" />
            Edit Squad
          </Button>
        )}
        <Button glow onClick={handleShare} disabled={shareState === "sharing"}>
          {shareState === "sharing" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing…
            </>
          ) : shareState === "copied" ? (
            <>
              <Check className="w-4 h-4" />
              Copied
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
        <Link href="/football/results">
          <Button variant="ghost">View Results</Button>
        </Link>
      </div>

      <div className="relative z-10 px-4 pb-4 flex gap-2 overflow-x-auto justify-center">
        {assignments
          .slice()
          .sort((a, b) => b.overall - a.overall)
          .map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass shrink-0"
            >
              <OverallRating overall={p.overall} size="xs" />
              <span className="text-[10px] font-medium text-text-primary whitespace-nowrap">
                {p.name.split(" ").pop()}
              </span>
            </div>
          ))}
      </div>
    </motion.div>
  );
}
