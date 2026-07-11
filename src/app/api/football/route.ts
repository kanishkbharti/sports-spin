import { NextRequest, NextResponse } from "next/server";
import type { FootballDataType } from "@/lib/football/constants";
import { CURATED_LEAGUES, type LeagueCode } from "@/lib/football/constants";
import {
  getClubTeams,
  getCountryTeams,
  getTeamPlayers,
  getWorldCupTeams,
} from "@/lib/football/service";
import type { FootballApiResponse } from "@/lib/football/types";
import type { ApiPlayer, ApiTeam } from "@/lib/football/types";

export const dynamic = "force-dynamic";

const VALID_TYPES: (FootballDataType | "players")[] = ["club", "worldcup26", "country", "players"];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") as FootballDataType | "players" | null;
  const league = searchParams.get("league") as LeagueCode | null;
  const teamId = searchParams.get("teamId");
  const externalId = searchParams.get("externalId");
  const teamName = searchParams.get("teamName");

  const fetchedAt = new Date().toISOString();

  try {
    // Players sub-resource
    if (type === "players" || (teamId && externalId)) {
      if (!teamId || !externalId || !teamName) {
        return NextResponse.json(
          { success: false, error: "teamId, externalId, and teamName are required for players" },
          { status: 400 }
        );
      }

      const players = await getTeamPlayers(externalId, teamId, teamName);
      const response: FootballApiResponse<ApiPlayer[]> = {
        success: true,
        type: "players",
        teamId,
        cached: true,
        fetchedAt,
        count: players.length,
        data: players,
      };
      return NextResponse.json(response, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid type. Use one of: ${VALID_TYPES.join(", ")}, or type=players`,
          leagues: Object.keys(CURATED_LEAGUES),
        },
        { status: 400 }
      );
    }

    let teams: ApiTeam[];

    switch (type as FootballDataType) {
      case "club":
        if (!league || !(league in CURATED_LEAGUES)) {
          return NextResponse.json(
            { success: false, error: "league is required for club type (pl, laliga, seriea, bundesliga, ligue1)" },
            { status: 400 }
          );
        }
        teams = await getClubTeams(league);
        break;
      case "worldcup26":
        teams = await getWorldCupTeams();
        break;
      case "country":
        teams = await getCountryTeams();
        break;
    }

    const response: FootballApiResponse<ApiTeam[]> = {
      success: true,
      type,
      league: league ?? undefined,
      cached: true,
      fetchedAt,
      count: teams.length,
      data: teams,
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message, fetchedAt } satisfies Partial<FootballApiResponse<never>>,
      { status: 500 }
    );
  }
}
