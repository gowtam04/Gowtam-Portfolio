/** Time-of-day presets for the room (ported verbatim from the prototype's TODS). */

export type Phase = "night" | "dawn" | "day" | "dusk";
export type TimeMode = "auto" | Phase;

export const PHASES: readonly Phase[] = ["night", "dawn", "day", "dusk"];
export const TIME_MODE_ORDER: readonly TimeMode[] = ["auto", "night", "dawn", "day", "dusk"];

export interface PhaseConfig {
  /** Sky gradient stops, top to horizon. */
  sky: [string, string, string];
  fog: string;
  sun: string;
  sunI: number;
  sunPos: [number, number, number];
  hemiSky: string;
  hemiGround: string;
  hemiI: number;
  fill: string;
  fillI: number;
  /** Whether room lamps default to on in this phase. */
  lamps: boolean;
  stars: boolean;
  moon: boolean;
  exposure: number;
}

export const TODS: Record<Phase, PhaseConfig> = {
  night: {
    sky: ["#050a1a", "#15234a", "#2d3b66"],
    fog: "#1b2946",
    sun: "#9db4ff",
    sunI: 0.9,
    sunPos: [-16, 11, -6],
    hemiSky: "#5a6ea8",
    hemiGround: "#1b1512",
    hemiI: 0.55,
    fill: "#8193c4",
    fillI: 0.3,
    lamps: true,
    stars: true,
    moon: true,
    exposure: 1.05,
  },
  dawn: {
    sky: ["#6f84c9", "#f3b7a0", "#ffd9a8"],
    fog: "#f0c3a8",
    sun: "#ffc49a",
    sunI: 2.4,
    sunPos: [-18, 7, -9],
    hemiSky: "#f7d6c4",
    hemiGround: "#5b4535",
    hemiI: 0.95,
    fill: "#ffe2cc",
    fillI: 0.6,
    lamps: false,
    stars: false,
    moon: false,
    exposure: 1.0,
  },
  day: {
    sky: ["#3a8ae0", "#8cc4f2", "#e3f3ff"],
    fog: "#dcebf7",
    sun: "#fff4e0",
    sunI: 3.2,
    sunPos: [-15, 13, -5],
    hemiSky: "#e6f2ff",
    hemiGround: "#b38e6a",
    hemiI: 1.15,
    fill: "#fff6ea",
    fillI: 0.9,
    lamps: false,
    stars: false,
    moon: false,
    exposure: 1.0,
  },
  dusk: {
    sky: ["#2e2c66", "#c46a7c", "#ffa35c"],
    fog: "#e59a7c",
    sun: "#ff9a5a",
    sunI: 2.2,
    sunPos: [-18, 6, 5],
    hemiSky: "#ffcfae",
    hemiGround: "#4a2f2a",
    hemiI: 0.8,
    fill: "#ffd0b0",
    fillI: 0.45,
    lamps: true,
    stars: false,
    moon: false,
    exposure: 1.0,
  },
};

/** night 20:00-5:59, dawn 6:00-7:59, day 8:00-16:59, dusk 17:00-19:59. */
export function phaseFromHour(h: number): Phase {
  if (h >= 20 || h < 6) return "night";
  if (h < 8) return "dawn";
  if (h < 17) return "day";
  return "dusk";
}

export function resolvePhase(mode: TimeMode, now: Date = new Date()): Phase {
  return mode === "auto" ? phaseFromHour(now.getHours()) : mode;
}

export function isTimeMode(v: string | null | undefined): v is TimeMode {
  return v != null && (TIME_MODE_ORDER as readonly string[]).includes(v);
}
