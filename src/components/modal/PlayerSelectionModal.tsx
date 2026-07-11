"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { Button } from "@/components/ui/Button";
import { TeamCrest } from "@/components/ui/TeamBadge";
import type { ApiTeam } from "@/lib/football/types";
import type { Player, Position } from "@/lib/types";

interface PlayerSelectionModalProps {
  open: boolean;
  onClose: () => void;
  team: ApiTeam | null;
  pickedIds?: string[];
  gkFilled?: boolean;
  onSelect?: (player: Player) => void;
}

const FILTERS: (Position | "All")[] = ["All", "GK", "DEF", "MID", "ATT"];

export function PlayerSelectionModal({
  open,
  onClose,
  team,
  pickedIds = [],
  gkFilled = false,
  onSelect,
}: PlayerSelectionModalProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Position | "All">("All");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlayers = useCallback(async () => {
    if (!team) return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      type: "players",
      teamId: team.id,
      externalId: team.fotmobId ?? team.externalId,
      teamName: team.name,
    });

    try {
      const res = await fetch(`/api/football?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("failed");
      setPlayers(json.data);
    } catch {
      setError("Couldn't load this squad. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [team]);

  useEffect(() => {
    if (!open || !team) return;
    setSearch("");
    setFilter("All");
    loadPlayers();
  }, [open, team, loadPlayers]);

  if (!team) return null;

  const pickedSet = new Set(pickedIds);

  const filtered = players.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || p.position === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[8%] bottom-[8%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[720px] sm:top-[10%] sm:bottom-[10%] z-50 flex flex-col rounded-[20px] glass-strong overflow-hidden"
          >
            <div className="flex items-center gap-4 px-6 py-5 border-b border-border shrink-0">
              <TeamCrest team={team} size={48} />
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-bold text-xl text-text-primary">{team.name}</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {loading ? "Loading squad..." : `${players.length} players available`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-surface-elevated flex items-center justify-center hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="px-6 py-4 border-b border-border space-y-3 shrink-0">
              <Input
                icon
                placeholder="Search players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      filter === f
                        ? "bg-accent text-bg"
                        : "bg-surface-elevated text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading ? (
                <div className="flex items-center justify-center h-full gap-3 text-text-muted">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Fetching live squad data...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
                  <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-error" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary mb-1">
                      Something went wrong
                    </p>
                    <p className="text-xs text-text-muted">{error}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={loadPlayers}>
                    <RotateCcw className="w-4 h-4" />
                    Try again
                  </Button>
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filtered.map((player, i) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.5) }}
                    >
                      <PlayerCard
                        player={player}
                        team={team}
                        locked={pickedSet.has(player.id) || (gkFilled && player.position === "GK")}
        onClick={() => {
                          if (!pickedSet.has(player.id) && !(gkFilled && player.position === "GK")) {
                            onSelect?.(player);
                          }
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-text-muted">No players match your search</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
