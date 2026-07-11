"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { OverallRating } from "@/components/ui/OverallRating";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { DraftWheel } from "@/components/spinner/DraftWheel";
import { PlayerSelectionModal } from "@/components/modal/PlayerSelectionModal";
import { PositionPickerModal, type DraftedPlayer } from "@/components/modal/PositionPickerModal";
import { FootballPitch } from "@/components/board/FootballPitch";
import { FifaSquadReveal } from "@/components/board/FifaSquadReveal";
import { TeamCrest } from "@/components/ui/TeamBadge";
import { getStoredConfig, type DraftConfig } from "@/lib/draft-context";
import { storeDraftResult } from "@/lib/draft-result";
import { filterRealTeams } from "@/lib/football/team-filters";
import { getFormationSlots } from "@/lib/football/formations";
import { isClubLimitReached, drafterForPick } from "@/lib/football/draft-rules";
import type { ApiTeam } from "@/lib/football/types";
import type { Player, Position } from "@/lib/types";

const PLAYER_COLORS = ["#00D084", "#4F7CFF"] as const;

const POSITION_GROUPS: { key: Position; label: string; color: string }[] = [
  { key: "GK", label: "GK", color: "#FFB547" },
  { key: "DEF", label: "DEF", color: "#4F7CFF" },
  { key: "MID", label: "MID", color: "#00D084" },
  { key: "ATT", label: "ATT", color: "#FF5C5C" },
];

function normalizeConfig(c: DraftConfig): DraftConfig {
  const draftMode = c.draftMode ?? "single";
  return {
    ...c,
    draftMode,
    humanPlayers: draftMode === "multi" ? 2 : 1,
  };
}

function emptySquads(count: number): DraftedPlayer[][] {
  return Array.from({ length: count }, () => []);
}

export default function FootballSpinnerPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<DraftConfig | null>(null);
  const [wheelTeams, setWheelTeams] = useState<ApiTeam[]>([]);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<ApiTeam | null>(null);
  const [pendingPlayer, setPendingPlayer] = useState<Player | null>(null);
  const [squads, setSquads] = useState<DraftedPlayer[][]>([[], []]);
  const [currentDrafter, setCurrentDrafter] = useState(0);
  const [startDrafter, setStartDrafter] = useState(0);
  const [viewDrafter, setViewDrafter] = useState(0);
  const [highlightSlot, setHighlightSlot] = useState<string | null>(null);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [showFifaReveal, setShowFifaReveal] = useState(false);
  const [revealDrafter, setRevealDrafter] = useState(0);

  const formation = config?.formation ?? "4-3-3";
  const slots = getFormationSlots(formation);
  const humanPlayers = config?.humanPlayers ?? 1;
  const maxFromClub = config?.maxFromClub ?? 3;
  const snakeDraft = config?.snakeDraft ?? false;
  const isMulti = humanPlayers === 2;

  const teamNames = config?.teamNames ?? (isMulti ? ["Player 1", "Player 2"] : ["My Team"]);
  const labelFor = (idx: number) => teamNames[idx] || `Player ${idx + 1}`;

  const activeAssignments = squads[currentDrafter] ?? [];
  const allAssignments = useMemo(() => squads.flat(), [squads]);
  const revealAssignments = squads[revealDrafter] ?? [];

  // Only spin on teams the current drafter can still draft from. A team is
  // dropped once they've hit the max-from-club/nation limit, so spins are
  // never wasted on a maxed-out team.
  const eligibleTeams = useMemo(
    () => wheelTeams.filter((t) => !isClubLimitReached(activeAssignments, t.id, maxFromClub)),
    [wheelTeams, activeAssignments, maxFromClub]
  );

  useEffect(() => {
    setViewDrafter(currentDrafter);
  }, [currentDrafter]);

  const handleDismissFifaReveal = () => {
    setShowFifaReveal(false);
    setCurrentDrafter(revealDrafter);
  };

  const assignPlayer = (player: Player, team: ApiTeam, slotId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    const drafted: DraftedPlayer = {
      ...player,
      teamId: team.id,
      slotId,
      slotLabel: slot?.label ?? slotId,
      sourceTeamId: team.id,
      sourceTeamName: team.name,
      drafterIndex: currentDrafter,
    };

    // Build next state purely so turn/completion can be derived reliably
    // (do NOT compute these as side effects inside the setSquads updater).
    const nextSquads = squads.map((s, i) =>
      i === currentDrafter ? [...s.filter((a) => a.slotId !== slotId), drafted] : s
    );

    const complete = nextSquads.map((s) => s.length >= slots.length);
    const thisJustCompleted = complete[currentDrafter];
    const everyoneComplete = complete.slice(0, humanPlayers).every(Boolean);

    let nextTurn = currentDrafter;
    if (!everyoneComplete && isMulti) {
      const totalPicks = nextSquads.reduce((sum, a) => sum + a.length, 0);
      nextTurn = drafterForPick(totalPicks, startDrafter, humanPlayers, snakeDraft);
      // safety: never hand over to a drafter who is already full
      if (complete[nextTurn]) {
        const firstIncomplete = complete.findIndex((c) => !c);
        if (firstIncomplete !== -1) nextTurn = firstIncomplete;
      }
    }

    setSquads(nextSquads);
    setHighlightSlot(`${currentDrafter}-${slotId}`);
    setTimeout(() => setHighlightSlot(null), 1200);

    if (everyoneComplete) {
      setRevealDrafter(currentDrafter);
      setShowFifaReveal(true);
    } else if (isMulti) {
      if (thisJustCompleted) {
        setNoticeMessage(
          `${labelFor(currentDrafter)}'s XI is complete! Over to ${labelFor(nextTurn)}.`
        );
      }
      setCurrentDrafter(nextTurn);
    }
  };

  const handleRemovePlayer = (playerId: string, drafterIdx: number) => {
    setSquads((prev) => {
      const next = [...prev];
      next[drafterIdx] = (next[drafterIdx] ?? []).filter((p) => p.id !== playerId);
      return next;
    });
    setShowFifaReveal(false);
    setNoticeMessage(null);
    setCurrentDrafter(drafterIdx);
  };

  useEffect(() => {
    const c = getStoredConfig();
    if (!c || c.teams.length === 0) {
      router.replace("/football/create");
      return;
    }
    const normalized = normalizeConfig(c);
    setConfig(normalized);
    setWheelTeams(filterRealTeams(normalized.teams));
    setSquads(emptySquads(normalized.humanPlayers));

    // Decide who picks first. Random order draws a starting player; manual
    // (and single player) always starts with Player 1.
    const multi = normalized.humanPlayers === 2;
    const start =
      multi && normalized.draftOrder === "random" ? Math.floor(Math.random() * 2) : 0;
    setStartDrafter(start);
    setCurrentDrafter(start);

    if (multi) {
      const names = normalized.teamNames ?? ["Player 1", "Player 2"];
      const startLabel = names[start] || `Player ${start + 1}`;
      setNoticeMessage(
        normalized.draftOrder === "random"
          ? `Random draw: ${startLabel} picks first.${normalized.snakeDraft ? " Snake order is on." : ""}`
          : `${startLabel} picks first.${normalized.snakeDraft ? " Snake order is on." : ""}`
      );
    }

    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready || !config) return;
    if (squads.every((s) => s.length === 0)) return;
    storeDraftResult({
      formation,
      dataType: config.dataType,
      draftMode: config.draftMode,
      teamNames,
      teams: wheelTeams,
      squads,
      completedAt: new Date().toISOString(),
    });
  }, [ready, config, squads, formation, wheelTeams]);

  const handleSpinComplete = useCallback(
    (team: ApiTeam) => {
      setLimitMessage(null);
      setNoticeMessage(null);

      if (activeAssignments.length >= slots.length) {
        setLimitMessage(`${labelFor(currentDrafter)}'s XI is complete. Remove a player to spin again.`);
        return;
      }

      if (isClubLimitReached(activeAssignments, team.id, maxFromClub)) {
        const maxLabel = maxFromClub === "unlimited" ? "∞" : maxFromClub;
        setLimitMessage(
          `${labelFor(currentDrafter)} already has ${maxLabel} from ${team.name}. Spin again.`
        );
        return;
      }

      setSelectedTeam(team);
      setPlayerModalOpen(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeAssignments, maxFromClub, currentDrafter, slots.length, teamNames]
  );

  const handlePlayerSelect = (player: Player) => {
    if (!selectedTeam) return;

    setPlayerModalOpen(false);

    if (player.position === "GK") {
      const gkTaken = activeAssignments.some((a) => a.slotId === "GK");
      if (gkTaken) {
        setLimitMessage("GK position is already filled.");
        setSelectedTeam(null);
        return;
      }
      assignPlayer(player, selectedTeam, "GK");
      setSelectedTeam(null);
      return;
    }

    setPendingPlayer(player);
    setPositionModalOpen(true);
  };

  const handlePositionConfirm = (slotId: string) => {
    if (!pendingPlayer || !selectedTeam) return;

    assignPlayer(pendingPlayer, selectedTeam, slotId);

    setPositionModalOpen(false);
    setPendingPlayer(null);
    setSelectedTeam(null);
  };

  if (!ready || !config) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100dvh-3.5rem)] gap-3 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading draft...</span>
      </div>
    );
  }

  const globalPickedIds = allAssignments.map((a) => a.id);
  const filledSlotIds = activeAssignments.map((a) => a.slotId);
  const picksDrafter = isMulti ? viewDrafter : 0;
  const displayPicks = squads[picksDrafter] ?? [];
  const squadFull = activeAssignments.length >= slots.length;
  const gkFilled = activeAssignments.some((a) => a.slotId === "GK");
  const noEligibleTeams = !squadFull && eligibleTeams.length === 0;

  return (
    <>
      {showFifaReveal && (
        <FifaSquadReveal
          formation={formation}
          slots={slots}
          assignments={revealAssignments}
          teams={wheelTeams}
          title={isMulti ? `${labelFor(revealDrafter)}'s Ultimate XI` : `${labelFor(0)}'s Ultimate XI`}
          onEdit={handleDismissFifaReveal}
        />
      )}

      <div className={`max-w-[1440px] mx-auto px-4 sm:px-6 py-6 min-h-[calc(100dvh-3.5rem)] overflow-x-hidden ${showFifaReveal ? "hidden" : ""}`}>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="min-w-0">
          <p className="text-xs text-accent font-medium uppercase tracking-wider mb-1">Live Draft</p>
          <h1 className="font-display font-bold text-xl text-text-primary truncate">Spin & Build</h1>
        </div>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm shrink-0"
          style={isMulti ? { borderColor: `${PLAYER_COLORS[currentDrafter]}44` } : undefined}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: isMulti ? PLAYER_COLORS[currentDrafter] : "#4F7CFF" }}
          />
          <span className="font-medium whitespace-nowrap">
            {isMulti ? (
              <>
                <span className="truncate max-w-[160px] inline-block align-bottom">
                  {labelFor(currentDrafter)}
                </span>
                <span className="text-text-muted font-normal ml-1">
                  · {activeAssignments.length}/{slots.length}
                </span>
              </>
            ) : (
              <>
                <span className="truncate max-w-[160px] inline-block align-bottom">
                  {labelFor(0)}
                </span>
                <span className="text-text-muted font-normal ml-1">
                  · {squads[0].length}/{slots.length}
                </span>
              </>
            )}
          </span>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 gap-6 lg:gap-8 items-start ${
          isMulti
            ? "lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]"
            : "lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]"
        }`}
      >
        {/* Left — Wheel + picks (fixed width column, no blowout) */}
        <div className="flex flex-col min-w-0 max-w-full">
          {limitMessage && (
            <div className="mb-3 flex items-start gap-2 px-3 py-2.5 rounded-[12px] bg-warning/10 border border-warning/30">
              <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning leading-relaxed">{limitMessage}</p>
            </div>
          )}
          {noticeMessage && !limitMessage && (
            <div className="mb-3 flex items-start gap-2 px-3 py-2.5 rounded-[12px] bg-accent/10 border border-accent/30">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-accent leading-relaxed">{noticeMessage}</p>
            </div>
          )}

          <div className="flex items-center justify-center py-4 min-h-[320px] max-h-[380px]">
            <DraftWheel
              teams={eligibleTeams.length > 0 ? eligibleTeams : wheelTeams}
              onSpinComplete={handleSpinComplete}
              disabled={squadFull || noEligibleTeams}
            />
          </div>
          {squadFull && (
            <p className="text-center text-xs text-text-muted -mt-2 mb-2">
              {labelFor(currentDrafter)}&apos;s XI complete. Remove a player to spin again
            </p>
          )}
          {noEligibleTeams && (
            <p className="text-center text-xs text-warning -mt-2 mb-2">
              Every remaining team is maxed out for {labelFor(currentDrafter)}. Raise the
              max-per-team limit or add more teams to keep drafting.
            </p>
          )}

          <div className="mt-2 max-h-[320px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between gap-2 mb-3 sticky top-0 bg-bg/90 backdrop-blur-sm py-1 z-10">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider truncate">
                {isMulti && (
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                    style={{ background: PLAYER_COLORS[picksDrafter] }}
                  />
                )}
                {labelFor(picksDrafter)} · Picks ({displayPicks.length})
              </p>
              {isMulti && picksDrafter !== currentDrafter && (
                <span className="text-[10px] text-text-muted shrink-0">viewing</span>
              )}
            </div>
            {displayPicks.length === 0 ? (
              <p className="text-xs text-text-muted py-2">Spin the wheel to draft your first player</p>
            ) : (
              <div className="space-y-3">
                {POSITION_GROUPS.map((group) => {
                  const groupPicks = displayPicks
                    .filter((p) => p.position === group.key)
                    .sort((a, b) => b.overall - a.overall);
                  if (groupPicks.length === 0) return null;

                  return (
                    <div key={group.key}>
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider mb-1.5 px-1"
                        style={{ color: group.color }}
                      >
                        {group.label}
                        <span className="text-text-muted font-medium ml-1.5">({groupPicks.length})</span>
                      </p>
                      <div className="space-y-1.5">
                        {groupPicks.map((pick) => {
                          const team = wheelTeams.find((t) => t.id === pick.sourceTeamId);
                          return (
                            <div
                              key={`${pick.id}-${pick.slotId}`}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-[12px] glass group"
                            >
                              {team && <TeamCrest team={team} size={24} />}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-text-primary truncate">{pick.name}</p>
                                <p className="text-[10px] text-text-muted">{pick.slotLabel}</p>
                              </div>
                              <OverallRating overall={pick.overall} size="sm" className="shrink-0" />
                              <button
                                type="button"
                                onClick={() => handleRemovePlayer(pick.id, picksDrafter)}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-error hover:bg-error/10 transition-colors shrink-0 cursor-pointer"
                                aria-label={`Remove ${pick.name}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right — Formation(s) */}
        <div className="lg:sticky lg:top-20 w-full min-w-0">
          {isMulti ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[0, 1].map((idx) => {
                const isTurn = idx === currentDrafter;
                const isViewing = idx === viewDrafter;
                const avg =
                  squads[idx].length > 0
                    ? Math.round(
                        squads[idx].reduce((s, p) => s + p.overall, 0) / squads[idx].length
                      )
                    : 0;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setViewDrafter(idx)}
                    className={`text-left rounded-[18px] p-2 transition-all cursor-pointer ${
                      isViewing ? "bg-surface-elevated/40" : "hover:bg-surface-elevated/20"
                    }`}
                    style={
                      isTurn
                        ? { boxShadow: `0 0 0 2px ${PLAYER_COLORS[idx]}88` }
                        : isViewing
                          ? { boxShadow: `0 0 0 1px ${PLAYER_COLORS[idx]}55` }
                          : undefined
                    }
                  >
                    <div className="mb-2 flex items-center justify-between px-1 gap-2">
                      <p className="text-xs font-semibold text-text-primary truncate flex items-center min-w-0">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0"
                          style={{ background: PLAYER_COLORS[idx] }}
                        />
                        <span className="truncate">{labelFor(idx)}</span>
                      </p>
                      <span className="text-[11px] text-text-secondary shrink-0 tabular-nums">
                        {avg > 0 && <span className="text-text-primary font-semibold mr-1.5">{avg}</span>}
                        {squads[idx].length}/{slots.length}
                      </span>
                    </div>
                    {isTurn && (
                      <p className="px-1 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                        On the clock
                      </p>
                    )}
                    <FootballPitch
                      formation={formation}
                      slots={slots}
                      assignments={squads[idx]}
                      teams={wheelTeams}
                      compact
                      highlightSlotId={
                        highlightSlot?.startsWith(`${idx}-`)
                          ? highlightSlot.replace(`${idx}-`, "")
                          : null
                      }
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto max-w-[420px]">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider truncate">
                  {labelFor(0)} · {formation}
                </p>
                <span className="text-xs text-text-secondary">
                  {squads[0].length}/{slots.length}
                </span>
              </div>
              <FootballPitch
                formation={formation}
                slots={slots}
                assignments={squads[0]}
                teams={wheelTeams}
                compact
                highlightSlotId={highlightSlot?.replace(/^0-/, "") ?? null}
              />
            </div>
          )}
        </div>
      </div>

      <PlayerSelectionModal
        open={playerModalOpen}
        onClose={() => {
          setPlayerModalOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
        pickedIds={globalPickedIds}
        gkFilled={gkFilled}
        onSelect={handlePlayerSelect}
      />

      <PositionPickerModal
        open={positionModalOpen}
        player={pendingPlayer}
        slots={slots}
        filledSlotIds={filledSlotIds}
        onConfirm={handlePositionConfirm}
        onClose={() => {
          setPositionModalOpen(false);
          setPendingPlayer(null);
          setSelectedTeam(null);
        }}
      />
    </div>
    </>
  );
}
