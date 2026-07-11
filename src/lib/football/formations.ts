import type { Formation } from "@/lib/types";

export interface FormationSlot {
  id: string;
  label: string;
  x: number;
  y: number;
  accepts: ("GK" | "DEF" | "MID" | "ATT")[];
}

const SLOT_COORDS: Record<Formation, FormationSlot[]> = {
  "4-3-3": [
    { id: "GK", label: "GK", x: 50, y: 88, accepts: ["GK"] },
    { id: "LB", label: "LB", x: 15, y: 68, accepts: ["DEF"] },
    { id: "CB1", label: "CB", x: 35, y: 72, accepts: ["DEF"] },
    { id: "CB2", label: "CB", x: 65, y: 72, accepts: ["DEF"] },
    { id: "RB", label: "RB", x: 85, y: 68, accepts: ["DEF"] },
    { id: "CM1", label: "CM", x: 25, y: 48, accepts: ["MID"] },
    { id: "CM2", label: "CM", x: 50, y: 45, accepts: ["MID"] },
    { id: "CM3", label: "CM", x: 75, y: 48, accepts: ["MID"] },
    { id: "LW", label: "LW", x: 20, y: 22, accepts: ["ATT", "MID"] },
    { id: "ST", label: "ST", x: 50, y: 15, accepts: ["ATT"] },
    { id: "RW", label: "RW", x: 80, y: 22, accepts: ["ATT", "MID"] },
  ],
  "4-2-3-1": [
    { id: "GK", label: "GK", x: 50, y: 88, accepts: ["GK"] },
    { id: "LB", label: "LB", x: 15, y: 68, accepts: ["DEF"] },
    { id: "CB1", label: "CB", x: 35, y: 72, accepts: ["DEF"] },
    { id: "CB2", label: "CB", x: 65, y: 72, accepts: ["DEF"] },
    { id: "RB", label: "RB", x: 85, y: 68, accepts: ["DEF"] },
    { id: "CDM1", label: "CDM", x: 38, y: 52, accepts: ["MID", "DEF"] },
    { id: "CDM2", label: "CDM", x: 62, y: 52, accepts: ["MID", "DEF"] },
    { id: "LAM", label: "LAM", x: 20, y: 35, accepts: ["MID", "ATT"] },
    { id: "CAM", label: "CAM", x: 50, y: 32, accepts: ["MID", "ATT"] },
    { id: "RAM", label: "RAM", x: 80, y: 35, accepts: ["MID", "ATT"] },
    { id: "ST", label: "ST", x: 50, y: 15, accepts: ["ATT"] },
  ],
  "4-4-2": [
    { id: "GK", label: "GK", x: 50, y: 88, accepts: ["GK"] },
    { id: "LB", label: "LB", x: 15, y: 68, accepts: ["DEF"] },
    { id: "CB1", label: "CB", x: 35, y: 72, accepts: ["DEF"] },
    { id: "CB2", label: "CB", x: 65, y: 72, accepts: ["DEF"] },
    { id: "RB", label: "RB", x: 85, y: 68, accepts: ["DEF"] },
    { id: "LM", label: "LM", x: 18, y: 42, accepts: ["MID", "ATT"] },
    { id: "CM1", label: "CM", x: 40, y: 48, accepts: ["MID"] },
    { id: "CM2", label: "CM", x: 60, y: 48, accepts: ["MID"] },
    { id: "RM", label: "RM", x: 82, y: 42, accepts: ["MID", "ATT"] },
    { id: "ST1", label: "ST", x: 38, y: 18, accepts: ["ATT"] },
    { id: "ST2", label: "ST", x: 62, y: 18, accepts: ["ATT"] },
  ],
  "3-5-2": [
    { id: "GK", label: "GK", x: 50, y: 88, accepts: ["GK"] },
    { id: "CB1", label: "CB", x: 25, y: 72, accepts: ["DEF"] },
    { id: "CB2", label: "CB", x: 50, y: 75, accepts: ["DEF"] },
    { id: "CB3", label: "CB", x: 75, y: 72, accepts: ["DEF"] },
    { id: "LWB", label: "LWB", x: 12, y: 50, accepts: ["DEF", "MID"] },
    { id: "CM1", label: "CM", x: 35, y: 48, accepts: ["MID"] },
    { id: "CM2", label: "CM", x: 50, y: 45, accepts: ["MID"] },
    { id: "CM3", label: "CM", x: 65, y: 48, accepts: ["MID"] },
    { id: "RWB", label: "RWB", x: 88, y: 50, accepts: ["DEF", "MID"] },
    { id: "ST1", label: "ST", x: 38, y: 18, accepts: ["ATT"] },
    { id: "ST2", label: "ST", x: 62, y: 18, accepts: ["ATT"] },
  ],
  "3-4-3": [
    { id: "GK", label: "GK", x: 50, y: 88, accepts: ["GK"] },
    { id: "CB1", label: "CB", x: 25, y: 72, accepts: ["DEF"] },
    { id: "CB2", label: "CB", x: 50, y: 75, accepts: ["DEF"] },
    { id: "CB3", label: "CB", x: 75, y: 72, accepts: ["DEF"] },
    { id: "LM", label: "LM", x: 18, y: 48, accepts: ["MID", "DEF"] },
    { id: "CM1", label: "CM", x: 42, y: 48, accepts: ["MID"] },
    { id: "CM2", label: "CM", x: 58, y: 48, accepts: ["MID"] },
    { id: "RM", label: "RM", x: 82, y: 48, accepts: ["MID", "DEF"] },
    { id: "LW", label: "LW", x: 20, y: 22, accepts: ["ATT", "MID"] },
    { id: "ST", label: "ST", x: 50, y: 15, accepts: ["ATT"] },
    { id: "RW", label: "RW", x: 80, y: 22, accepts: ["ATT", "MID"] },
  ],
};

export function getFormationSlots(formation: string): FormationSlot[] {
  return SLOT_COORDS[formation as Formation] ?? SLOT_COORDS["4-3-3"];
}
