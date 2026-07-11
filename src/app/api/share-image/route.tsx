import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getFormationSlots } from "@/lib/football/formations";
import { getRatingColor } from "@/lib/football/ratings";

export const runtime = "nodejs";

const POSITION_COLORS: Record<string, string> = {
  GK: "#FFB547",
  DEF: "#4F7CFF",
  MID: "#00D084",
  ATT: "#FF5C5C",
};

const ALLOWED_IMG_HOSTS = new Set([
  "images.fotmob.com",
  "crests.football-data.org",
  "r2.thesportsdb.com",
  "www.thesportsdb.com",
]);

interface SharePlayer {
  name: string;
  overall: number;
  position: string;
  slotId: string;
  slotLabel: string;
  photo?: string | null;
}

interface SharePayload {
  teamName: string;
  formation: string;
  players: SharePlayer[];
}

async function photoToDataUri(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !ALLOWED_IMG_HOSTS.has(parsed.hostname)) return null;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
      },
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/png";
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let payload: SharePayload;
  try {
    payload = (await req.json()) as SharePayload;
  } catch {
    return new Response("Invalid body", { status: 400 });
  }

  const { teamName = "My Team", formation = "4-3-3", players = [] } = payload;
  const slots = getFormationSlots(formation);
  const bySlot = new Map(players.map((p) => [p.slotId, p]));

  const rated = players.filter((p) => typeof p.overall === "number");
  const avg =
    rated.length > 0
      ? (rated.reduce((s, p) => s + p.overall, 0) / rated.length).toFixed(1)
      : "0";

  // Resolve photos to data URIs server-side so Satori never fails on a fetch.
  const photoEntries = await Promise.all(
    players.map(async (p) => [p.slotId, await photoToDataUri(p.photo)] as const)
  );
  const photos = new Map(photoEntries);

  const W = 1080;
  const H = 1350;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0B0F17",
          backgroundImage:
            "radial-gradient(circle at 20% 12%, rgba(0,208,132,0.16), transparent 45%), radial-gradient(circle at 85% 90%, rgba(79,124,255,0.14), transparent 45%)",
          padding: "56px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 30, color: "#00D084", fontWeight: 700, letterSpacing: 2 }}>
              ULTIMATE XI
            </div>
            <div style={{ display: "flex", fontSize: 60, color: "#FFFFFF", fontWeight: 800, letterSpacing: -1 }}>
              {teamName}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px 20px",
                borderRadius: 16,
                backgroundColor: "rgba(21,27,38,0.8)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ display: "flex", fontSize: 18, color: "#6B7589" }}>RATING</div>
              <div style={{ display: "flex", fontSize: 40, color: "#00D084", fontWeight: 800 }}>{avg}</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px 20px",
                borderRadius: 16,
                backgroundColor: "rgba(21,27,38,0.8)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ display: "flex", fontSize: 18, color: "#6B7589" }}>SHAPE</div>
              <div style={{ display: "flex", fontSize: 40, color: "#FFFFFF", fontWeight: 800 }}>{formation}</div>
            </div>
          </div>
        </div>

        {/* Pitch */}
        <div
          style={{
            position: "relative",
            display: "flex",
            marginTop: 40,
            flex: 1,
            borderRadius: 24,
            border: "2px solid rgba(0,208,132,0.3)",
            backgroundColor: "#143d24",
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 35%, rgba(0,0,0,0.35) 100%), repeating-linear-gradient(90deg, #143d24 0px, #143d24 90px, #185a32 90px, #185a32 180px)",
            overflow: "hidden",
          }}
        >
          {slots.map((slot) => {
            const player = bySlot.get(slot.id);
            const posColor = player ? POSITION_COLORS[player.position] ?? "#A9B2C3" : "#6B7589";
            const ratingColor = player ? getRatingColor(player.overall) : "#6B7589";
            const dataUri = player ? photos.get(slot.id) : null;
            const lastName = player ? player.name.split(" ").slice(-1)[0] : slot.label;

            return (
              <div
                key={slot.id}
                style={{
                  position: "absolute",
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {player && (
                  <div
                    style={{
                      display: "flex",
                      marginBottom: 6,
                      padding: "2px 12px",
                      borderRadius: 8,
                      fontSize: 26,
                      fontWeight: 800,
                      color: ratingColor,
                      backgroundColor: "rgba(11,15,23,0.7)",
                      border: `1px solid ${ratingColor}`,
                    }}
                  >
                    {player.overall}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 104,
                    height: 104,
                    borderRadius: 100,
                    border: `4px solid ${posColor}`,
                    backgroundColor: "#0B0F17",
                    overflow: "hidden",
                    boxShadow: `0 8px 24px ${posColor}66`,
                  }}
                >
                  {dataUri ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dataUri} width={104} height={104} alt="" style={{ objectFit: "cover" }} />
                  ) : (
                    <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: posColor }}>
                      {player ? player.overall : slot.label}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 8,
                    padding: "3px 12px",
                    borderRadius: 8,
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    backgroundColor: "rgba(11,15,23,0.72)",
                  }}
                >
                  {lastName}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 32 }}>
          <div style={{ display: "flex", width: 44, height: 7, borderRadius: 99, backgroundColor: "#00D084" }} />
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#00D084" }}>trysquadr.com</div>
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
