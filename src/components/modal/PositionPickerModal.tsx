"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Player } from "@/lib/types";
import type { FormationSlot } from "@/lib/football/formations";
import { SafeImage } from "@/components/ui/SafeImage";
import { getPlayerPhotoUrl, getPlayerPlaceholderDataUri } from "@/lib/football/utils";
import { OverallRating } from "@/components/ui/OverallRating";

export interface DraftedPlayer extends Player {
  slotId: string;
  slotLabel: string;
  /** Wheel team the player was drafted from */
  sourceTeamId: string;
  sourceTeamName?: string;
  drafterIndex?: number;
}

interface PositionPickerModalProps {
  open: boolean;
  player: Player | null;
  slots: FormationSlot[];
  filledSlotIds: string[];
  onConfirm: (slotId: string) => void;
  onClose: () => void;
}

export function PositionPickerModal({
  open,
  player,
  slots,
  filledSlotIds,
  onConfirm,
  onClose,
}: PositionPickerModalProps) {
  if (!open || !player) return null;

  const filled = new Set(filledSlotIds);
  const fallback = getPlayerPlaceholderDataUri(player.name);
  const photoUrl = getPlayerPhotoUrl(player.photo, player.name);

  const visibleSlots =
    player.position === "GK"
      ? slots.filter((s) => s.id === "GK")
      : slots.filter((s) => s.id !== "GK");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-[20px] glass-strong overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-display font-bold text-lg text-text-primary">Assign Position</h3>
            <p className="text-xs text-text-muted mt-0.5">Where should {player.name.split(" ").pop()} play?</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex items-center gap-4 px-5 py-4 border-b border-border">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-accent/30 shrink-0">
            <SafeImage src={photoUrl} fallback={fallback} alt={player.name} width={56} height={56} className="object-cover object-top w-full h-full" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">{player.name}</p>
            <p className="text-xs text-text-muted flex items-center gap-1">
              {player.position} · OVR <OverallRating overall={player.overall} size="sm" />
            </p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto">
          {visibleSlots.map((slot) => {
            const taken = filled.has(slot.id);
            const recommended = slot.accepts.includes(player.position);
            return (
              <button
                key={slot.id}
                disabled={taken}
                onClick={() => onConfirm(slot.id)}
                className={`
                  p-3 rounded-[12px] text-center transition-all cursor-pointer border
                  ${taken
                    ? "opacity-35 cursor-not-allowed border-border bg-surface-elevated/30"
                    : recommended
                      ? "border-accent/40 bg-accent/8 hover:bg-accent/15"
                      : "border-border bg-surface-elevated hover:border-border-strong"
                  }
                `}
              >
                <p className="font-display font-bold text-sm text-text-primary">{slot.label}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{slot.id}</p>
                {taken && <p className="text-[9px] text-error mt-1">Filled</p>}
                {!taken && recommended && (
                  <p className="text-[9px] text-accent mt-1">Suggested</p>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
