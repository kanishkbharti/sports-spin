"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TeamCrest } from "@/components/ui/TeamBadge";
import { FOOTBALL_LEVELS, LEAGUE_OPTIONS, FORMATIONS } from "@/lib/data";
import { storeConfig } from "@/lib/draft-context";
import { filterRealTeams } from "@/lib/football/team-filters";
import type { ApiTeam } from "@/lib/football/types";
import type { FootballDataType, LeagueCode } from "@/lib/football/constants";

export default function FootballCreatePage() {
  const router = useRouter();
  const [dataType, setDataType] = useState<FootballDataType>("club");
  const [league, setLeague] = useState<LeagueCode>("pl");
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formation, setFormation] = useState("4-3-3");
  const [draftMode, setDraftMode] = useState<"single" | "multi">("single");
  const [teamNameA, setTeamNameA] = useState("");
  const [teamNameB, setTeamNameB] = useState("");
  const [maxFromClub, setMaxFromClub] = useState<number | "unlimited">(3);
  const [draftOrder, setDraftOrder] = useState<"random" | "manual">("random");
  const [snakeDraft, setSnakeDraft] = useState(true);

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ type: dataType });
      if (dataType === "club") {
        params.set("league", league);
      }
      const res = await fetch(`/api/football?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to load teams");
      const realTeams = filterRealTeams(json.data as ApiTeam[]);
      setTeams(realTeams);
      setSelectedTeams((prev) => {
        const valid = prev.filter((id) => realTeams.some((t) => t.id === id));
        if (valid.length === 0 && realTeams.length > 0) {
          return realTeams.slice(0, Math.min(8, realTeams.length)).map((t) => t.id);
        }
        return valid;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load teams");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [dataType, league]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTeam = (id: string) => {
    setSelectedTeams((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const teamNames =
    draftMode === "multi"
      ? [teamNameA.trim() || "Player 1", teamNameB.trim() || "Player 2"]
      : [teamNameA.trim() || "My Team"];

  const canContinue =
    selectedTeams.length > 0 &&
    !loading &&
    (draftMode === "single"
      ? teamNameA.trim().length > 0
      : teamNameA.trim().length > 0 && teamNameB.trim().length > 0);

  const handleContinue = () => {
    const selected = teams.filter((t) => selectedTeams.includes(t.id));
    if (selected.length === 0 || !canContinue) return;

    storeConfig({
      sport: "football",
      dataType,
      league,
      selectedTeamIds: selectedTeams,
      teams: selected,
      formation,
      draftMode,
      humanPlayers: draftMode === "multi" ? 2 : 1,
      teamNames,
      maxFromClub,
      draftOrder,
      snakeDraft,
    });
    router.push("/football/spinner");
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs text-accent font-medium uppercase tracking-wider mb-1">Football</p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-text-primary">Create Draft</h1>
        <p className="text-text-secondary text-sm mt-1">
          Curated 2025-26 squads. Pick one competition, then select teams
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-8">
          {/* Draft level */}
          <section>
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
              Draft Level
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FOOTBALL_LEVELS.map((level) => (
                <motion.button
                  key={level.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setDataType(level.id);
                  }}
                  className={`
                    relative p-4 rounded-[16px] text-left transition-all duration-200 border cursor-pointer
                    ${
                      dataType === level.id
                        ? "border-accent/50 bg-accent/8"
                        : "border-border glass hover:border-border-strong"
                    }
                  `}
                >
                  {dataType === level.id && (
                    <motion.div
                      layoutId="level-check"
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-bg" />
                    </motion.div>
                  )}
                  <p className="font-semibold text-sm text-text-primary">{level.name}</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{level.description}</p>
                </motion.button>
              ))}
            </div>
          </section>

          {/* League filter for club level */}
          {dataType === "club" && (
            <section>
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
                Competition
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {LEAGUE_OPTIONS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLeague(l.id as LeagueCode)}
                    className={`p-4 rounded-[16px] text-left transition-all cursor-pointer border ${
                      league === l.id
                        ? "border-accent/50 bg-accent/8"
                        : "border-border glass hover:border-border-strong"
                    }`}
                  >
                    <p className="font-semibold text-sm text-text-primary">{l.name}</p>
                    <p className="text-[10px] text-accent mt-0.5">{l.season}</p>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{l.description}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Team grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Select Teams
                {!loading && (
                  <span className="text-text-muted font-normal ml-2">({teams.length} available)</span>
                )}
              </h2>
              <span className="text-xs text-accent font-medium">{selectedTeams.length} selected</span>
            </div>
            <Input
              icon
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />

            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-text-muted">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading live team data...</span>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-sm text-error mb-3">{error}</p>
                <Button variant="secondary" size="sm" onClick={loadTeams}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredTeams.map((team) => {
                    const selected = selectedTeams.includes(team.id);
                    return (
                      <motion.button
                        key={team.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleTeam(team.id)}
                        className={`
                          relative p-4 rounded-[16px] flex flex-col items-center gap-3
                          border transition-all duration-200 cursor-pointer
                          ${
                            selected
                              ? "border-accent/40 bg-accent/6"
                              : "border-border glass hover:border-border-strong"
                          }
                        `}
                      >
                        <TeamCrest team={team} size={44} />
                        <span className="text-xs font-medium text-text-primary text-center leading-tight line-clamp-2">
                          {team.name}
                        </span>
                        {team.leagueCode && dataType === "club" && (
                          <span className="text-[10px] text-text-muted uppercase">
                            {team.leagueCode}
                          </span>
                        )}
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            selected ? "bg-accent border-accent" : "border-border-strong"
                          }`}
                        >
                          {selected && <Check className="w-3 h-3 text-bg" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>

        {/* Rules sidebar */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card className="glass-strong">
            <CardHeader>
              <h2 className="font-display font-bold text-lg">Draft Rules</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 block">
                  Formation
                </label>
                <div className="flex flex-wrap gap-2">
                  {FORMATIONS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormation(f)}
                      className={`px-3.5 py-2 rounded-[10px] text-sm font-medium transition-all cursor-pointer ${
                        formation === f
                          ? "bg-accent text-bg"
                          : "bg-surface-elevated text-text-secondary border border-border"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 block">
                  Draft Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "single" as const, label: "Single Player", desc: "Build one XI" },
                      { id: "multi" as const, label: "2 Players", desc: "Take turns · 2 XIs" },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setDraftMode(mode.id)}
                      className={`p-3 rounded-[12px] text-left transition-all cursor-pointer border ${
                        draftMode === mode.id
                          ? "border-secondary/50 bg-secondary/10"
                          : "border-border bg-surface-elevated hover:border-border-strong"
                      }`}
                    >
                      <p className="text-sm font-semibold text-text-primary">{mode.label}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 block">
                  {draftMode === "multi" ? "Team Names" : "Team Name"}
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    {draftMode === "multi" && (
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                        style={{ background: "#00D084" }}
                      />
                    )}
                    <Input
                      placeholder={draftMode === "multi" ? "Player 1 team name" : "e.g. Dream XI"}
                      value={teamNameA}
                      onChange={(e) => setTeamNameA(e.target.value)}
                      maxLength={24}
                      className={draftMode === "multi" ? "pl-7" : ""}
                    />
                  </div>
                  {draftMode === "multi" && (
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                        style={{ background: "#4F7CFF" }}
                      />
                      <Input
                        placeholder="Player 2 team name"
                        value={teamNameB}
                        onChange={(e) => setTeamNameB(e.target.value)}
                        maxLength={24}
                        className="pl-7"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 block">
                  Max From One {dataType === "club" ? "Club" : "Nation"}
                </label>
                <div className="flex gap-2">
                  {([1, 2, 3, "unlimited"] as const).map((n) => (
                    <button
                      key={String(n)}
                      onClick={() => setMaxFromClub(n)}
                      className={`flex-1 py-2.5 rounded-[10px] text-sm font-semibold transition-all cursor-pointer ${
                        maxFromClub === n
                          ? "bg-warning/20 text-warning border border-warning/30"
                          : "bg-surface-elevated text-text-secondary border border-border"
                      }`}
                    >
                      {n === "unlimited" ? "∞" : n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 block">
                  Draft Order
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["random", "manual"] as const).map((order) => (
                    <button
                      key={order}
                      onClick={() => setDraftOrder(order)}
                      className={`py-2.5 rounded-[10px] text-sm font-medium capitalize transition-all cursor-pointer ${
                        draftOrder === order
                          ? "bg-surface-hover text-text-primary border border-border-strong"
                          : "bg-surface-elevated text-text-secondary border border-border"
                      }`}
                    >
                      {order}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-text-primary">Snake Draft</p>
                  <p className="text-xs text-text-muted">Reverse pick order each round</p>
                </div>
                <button
                  onClick={() => setSnakeDraft(!snakeDraft)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    snakeDraft ? "bg-accent" : "bg-surface-elevated border border-border"
                  }`}
                >
                  <motion.div
                    animate={{ x: snakeDraft ? 20 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              <Button
                size="lg"
                glow
                className="w-full"
                disabled={!canContinue}
                onClick={handleContinue}
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
