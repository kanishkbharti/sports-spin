"use client";

import { motion } from "framer-motion";
import { FootballPitch } from "@/components/board/FootballPitch";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { DRAFT_PLAYERS } from "@/lib/data";
import { getFormationSlots } from "@/lib/football/formations";

export default function FootballBoardPage() {
  const formation = "4-3-3";
  const slots = getFormationSlots(formation);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-xs text-accent font-medium uppercase tracking-wider mb-1">Football</p>
        <h1 className="font-display font-bold text-2xl text-text-primary">Live Draft Board</h1>
        <p className="text-sm text-text-secondary mt-0.5">Continue drafting from the spinner page</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <FootballPitch formation={formation} slots={slots} assignments={[]} teams={[]} />

        <Card>
          <CardHeader>
            <h2 className="font-display font-bold text-base">Draft Status</h2>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {DRAFT_PLAYERS.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-[12px] ${
                  player.isCurrentTurn ? "bg-accent/8 border border-accent/20" : "bg-surface-elevated/50"
                }`}
              >
                <span className="text-sm font-medium">{player.name}</span>
                <span className="text-sm font-bold">
                  {player.picks}/{player.maxPicks}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
