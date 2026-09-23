"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeElements } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Hotspot } from "../Hotspot";
import { useLampLevel } from "../Lighting";
import { box, cachedGeometry, cylinder, plane, rodTransform, roundedBox, seededRange, sphere } from "../geometry";
import type { Vec3 } from "../hotspots";
import { C, screenMaterial, std } from "../materials";
import { useRoom, useRoomStore } from "../store";
import {
  canvasFont,
  createCanvasTexture,
  redraw,
  roundRect,
  softTexture,
  useFontsReady,
  useThrottledRedraw,
} from "../textures";
import type { DrawFn } from "../textures";

/* ================================================================ helpers */

type PartProps = ThreeElements["mesh"] & { shadow?: boolean };

/** A mesh that casts and receives shadows by default (the prototype's `place`). */
function Part({ shadow = true, ...rest }: PartProps) {
  return <mesh castShadow={shadow} receiveShadow={shadow} {...rest} />;
}

const UP = new THREE.Vector3(0, 1, 0);
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();

/** Bake a fresh geometry into place (position, XYZ euler, scale) for merging. */
function baked(geo: THREE.BufferGeometry, pos: Vec3, rot: Vec3 = [0, 0, 0], scl: Vec3 = [1, 1, 1]): THREE.BufferGeometry {
  tmpQ.setFromEuler(tmpE.set(rot[0], rot[1], rot[2]));
  tmpM.compose(new THREE.Vector3(...pos), tmpQ, new THREE.Vector3(...scl));
  return geo.applyMatrix4(tmpM);
}

/** Merge many small parts sharing one material into one cached geometry (one draw call). */
function merged(key: string, build: () => THREE.BufferGeometry[]): THREE.BufferGeometry {
  return cachedGeometry(`desk:${key}`, () => {
    const parts = build();
    const out = mergeGeometries(parts, false);
    parts.forEach((p) => p.dispose());
    if (!out) throw new Error(`DeskSet: could not merge ${key}`);
    return out;
  });
}

const vec = (v: THREE.Vector3): Vec3 => [v.x, v.y, v.z];

/* ================================================================ materials (shared, cached) */

const M = {
  oak: std(C.oak, { roughness: 0.6 }),
  metal: std("#2e2a2a", { roughness: 0.5, metalness: 0.4 }),
  cabinet: std("#ebe4d6", { roughness: 0.7 }),
  drawerLine: std("#b9ae9c"),
  brass: std(C.brass, { metalness: 0.7, roughness: 0.35 }),
  standBase: std("#1b202b", { roughness: 0.4 }),
  standNeck: std("#232938", { roughness: 0.4, metalness: 0.3 }),
  bezel: std("#161b26", { roughness: 0.35 }),
  sticky: std("#ffe27a"),
  keyboard: std("#1e2430", { roughness: 0.5 }),
  kbPlate: std("#141922", { roughness: 0.8 }),
  keyAlpha: std("#384154", { roughness: 0.55, flatShading: true }),
  keyMod: std("#2a3142", { roughness: 0.55, flatShading: true }),
  keyAccent: std("#5ee7f7", { roughness: 0.45, flatShading: true, emissive: C.cyan, emissiveIntensity: 0.35 }),
  kbGlow: std("#0b3a44", { emissive: C.cyan, emissiveIntensity: 0.9 }),
  mousePad: std("#26344f", { roughness: 0.9 }),
  mouse: std("#e9e6df", { roughness: 0.4 }),
  mug: std(C.cream, { roughness: 0.45 }),
  mugBand: std(C.cyan, { roughness: 0.5 }),
  coffee: std("#3b2416", { roughness: 0.2 }),
  lamp: std(C.coral, { roughness: 0.5 }),
  shade: std(C.coral, { roughness: 0.5, side: THREE.DoubleSide }),
  terracotta: std("#d98a6a"),
  soil: std("#4a3226", { roughness: 0.95 }),
  succulent: std("#7aa35e", { flatShading: true }),
  seat: std(C.navy, { roughness: 0.75 }),
  chrome: std("#9aa3b2", { metalness: 0.8, roughness: 0.3 }),
  rubber: std("#1b1f27"),
  stripe: std(C.cyan, { roughness: 0.5 }),
  phone: std("#12151c", { roughness: 0.3, metalness: 0.2 }),
  shelfWood: std("#a8744a", { roughness: 0.6 }),
  bracket: std("#2e2a2a"),
  bookBand: std("#f3e3b8"),
  trophyBase: std("#3a2a22"),
  gold: std("#e8b93a", { metalness: 0.75, roughness: 0.28, side: THREE.DoubleSide }),
  toyRed: std(C.red, { roughness: 0.4, metalness: 0.2 }),
  toyGlass: std("#22303f"),
  tire: std("#15181f"),
  pot: std("#e9e2d4"),
  leaf: std("#5f9150", { flatShading: true }),
  vine: std("#3f6b45"),
};

/* ================================================================ desk lamp geometry */

const LAMP_J0: Vec3 = [4.1, 1.62, -4.55];
const LAMP_J1: Vec3 = [4.0, 2.4, -4.72];
const LAMP_HEAD: Vec3 = [3.55, 2.55, -4.12];
const LAMP_TARGET: Vec3 = [3.0, 1.55, -3.85];
const lampDown = new THREE.Vector3(...LAMP_TARGET).sub(new THREE.Vector3(...LAMP_HEAD)).normalize();
const alongLamp = (d: number): Vec3 => vec(new THREE.Vector3(...LAMP_HEAD).addScaledVector(lampDown, d));
const SHADE_POS = alongLamp(0.1);
const BULB_POS = alongLamp(0.17);
const SPOT_POS = alongLamp(0.12);
const SHADE_QUAT = new THREE.Quaternion().setFromUnitVectors(UP, lampDown.clone().negate());
const LAMP_ARM_A = rodTransform(LAMP_J0, LAMP_J1);
const LAMP_ARM_B = rodTransform(LAMP_J1, LAMP_HEAD);

const MONITOR_LIGHT_POS: Vec3 = [2.4, 2.4, -3.8];
const MUG_TOP = new THREE.Vector3(3.6, 1.8, -3.75);

/* ================================================================ code screen */

const CODE = `// agent.ts
import { Agent, tool } from "./runtime";

const searchDocs = tool({
  name: "search_docs",
  description: "Find sources, cite them",
  run: async ({ query }) => index.search(query, { k: 8 }),
});

export const oak = new Agent({
  model: "reasoning-large",
  tools: [searchDocs, readTable, calc],
  memory: { kind: "episodic", ttl: "7d" },
  guardrails: ["cite-sources", "flag-uncertainty"],
});

async function answer(question: string) {
  const plan = await oak.plan(question);
  for (const step of plan.steps) {
    const result = await oak.act(step);
    if (result.confidence < 0.7) {
      await oak.reflect(step, result);
    }
  }
  return oak.respond({ cite: true });
}

// evals keep us honest
describe("oak", () => {
  it("cites every claim", async () => {
    const r = await answer("best counter to Garchomp?");
    expect(r.citations.length).toBeGreaterThan(0);
  });
});
`.split("\n");

const TOK = {
  plain: "#c8d3e6",
  comment: "#5c6b87",
  string: "#a5e075",
  kw: "#c792ea",
  num: "#f78c6c",
  fn: "#22d3ee",
  prop: "#ffcb6b",
} as const;

const TOKEN_RE =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(import|from|const|let|export|new|async|await|function|for|of|if|return|true|false)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_]\w*)(?=\s*\()|([A-Za-z_]\w*)(?=\s*:)/g;

interface CodeToken {
  text: string;
  color: string;
  /** Column (monospace character offset) where the token starts. */
  col: number;
}

/** Tokenized once; the draw loop only positions by column (monospace), no measuring. */
const CODE_TOKENS: CodeToken[][] = CODE.map((line) => {
  const out: CodeToken[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN_RE)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ text: line.slice(last, at), color: TOK.plain, col: last });
    const color = m[1] ? TOK.comment : m[2] ? TOK.string : m[3] ? TOK.kw : m[4] ? TOK.num : m[5] ? TOK.fn : TOK.prop;
    out.push({ text: m[0], color, col: at });
    last = at + m[0].length;
  }
  if (last < line.length) out.push({ text: line.slice(last), color: TOK.plain, col: last });
  return out;
});

/** Minimap blocks: one per non-blank token run. */
const MINIMAP = CODE_TOKENS.flatMap((tokens, line) =>
  tokens
    .filter((tk) => tk.text.trim().length > 0)
    .map((tk) => {
      const lead = tk.text.length - tk.text.trimStart().length;
      return { line, col: tk.col + lead, len: tk.text.trim().length, color: tk.color };
    }),
);

const LINE_NUMBERS = CODE.map((_, i) => String(i + 1));
const STATUS_RIGHT = CODE.map((line, i) => `TypeScript   Ln ${i + 1}, Col ${line.length + 1}`);
const CODE_FONT = "17px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const TRAFFIC = ["#ff5f57", "#febc2e", "#28c840"];

function makeCodeDraw(uiFont: string): DrawFn {
  return (g, W, H, t) => {
    const top = 34;
    const bottom = H - 26;
    const lh = 25;
    const mapW = 66;
    const n = CODE.length;

    g.fillStyle = "#0b1220";
    g.fillRect(0, 0, W, H);

    // Title bar with window controls and tabs.
    g.fillStyle = "#070c17";
    g.fillRect(0, 0, W, top);
    for (let i = 0; i < 3; i++) {
      g.fillStyle = TRAFFIC[i];
      g.beginPath();
      g.arc(18 + i * 18, 17, 5.5, 0, Math.PI * 2);
      g.fill();
    }
    g.font = uiFont;
    g.textBaseline = "middle";
    g.textAlign = "left";
    g.fillStyle = "#0b1220";
    g.fillRect(84, 4, 110, 30);
    g.fillStyle = "#e8eef7";
    g.fillText("agent.ts", 104, 20);
    g.fillStyle = C.cyan;
    g.fillRect(84, 31, 110, 3);
    g.fillStyle = "#5c6b87";
    g.fillText("evals.ts", 214, 20);
    g.fillText("runtime.ts", 300, 20);

    // Scrolling code.
    const scroll = t * 18;
    const first = Math.floor(scroll / lh);
    const off = scroll % lh;
    const activeY = top + (bottom - top) * 0.55;
    let activeLine = first % n;

    g.save();
    g.beginPath();
    g.rect(0, top, W - mapW, bottom - top);
    g.clip();
    g.fillStyle = "#0a101c";
    g.fillRect(0, top, 50, bottom - top);
    g.fillStyle = "rgba(34,211,238,.07)";
    g.fillRect(50, activeY - lh / 2, W, lh);
    g.font = CODE_FONT;
    const cw = g.measureText("M").width;
    const rows = Math.ceil((bottom - top) / lh) + 1;
    for (let i = 0; i <= rows; i++) {
      const li = (first + i) % n;
      const y = top + 16 + i * lh - off;
      const active = Math.abs(y - activeY) < lh / 2;
      if (active) activeLine = li;
      g.fillStyle = active ? "#8aa0c4" : "#3b4a66";
      g.textAlign = "right";
      g.fillText(LINE_NUMBERS[li], 40, y);
      g.textAlign = "left";
      for (const tk of CODE_TOKENS[li]) {
        g.fillStyle = tk.color;
        g.fillText(tk.text, 64 + tk.col * cw, y);
      }
      if (active && Math.floor(t * 2) % 2 === 0) {
        g.fillStyle = C.cyan;
        g.fillRect(64 + CODE[li].length * cw + 3, y - 10, 9, 20);
      }
    }
    g.restore();

    // Minimap with the visible window.
    const mx = W - mapW;
    g.fillStyle = "#0a101c";
    g.fillRect(mx, top, mapW, bottom - top);
    g.globalAlpha = 0.6;
    for (const b of MINIMAP) {
      g.fillStyle = b.color;
      g.fillRect(mx + 8 + b.col * 0.9, top + 8 + b.line * 4.5, Math.max(1, b.len * 0.9), 2.4);
    }
    g.globalAlpha = 1;
    g.fillStyle = "rgba(200,211,230,.08)";
    g.fillRect(mx, top + 6 + ((scroll / lh) % n) * 4.5, mapW, rows * 4.5);

    // Status bar.
    g.fillStyle = "#0e7490";
    g.fillRect(0, H - 26, W, 26);
    g.fillStyle = "#e6fbff";
    g.font = uiFont;
    g.textAlign = "left";
    g.fillText("main   ✓ 42 evals passing", 14, H - 13);
    g.textAlign = "right";
    g.fillText(STATUS_RIGHT[activeLine], W - 14, H - 13);
    g.textAlign = "left";
  };
}

/* ================================================================ static canvas textures */

const drawPhone: DrawFn = (g, w, h) => {
  const W = 128;
  const H = 240;
  g.save();
  g.scale(w / W, h / H);
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "#0e1a33");
  gr.addColorStop(1, "#0b1220");
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  // Camera pill.
  g.fillStyle = "#04070d";
  roundRect(g, 50, 7, 28, 8, 4);
  g.fill();
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  g.fillStyle = "#e8eef7";
  g.font = canvasFont("body", 26, 600);
  g.fillText("9:41", W / 2, 50);
  // "say hi" chat bubble.
  g.fillStyle = C.cyan;
  roundRect(g, 16, 90, 96, 44, 16);
  g.fill();
  g.beginPath();
  g.moveTo(30, 132);
  g.lineTo(24, 146);
  g.lineTo(44, 132);
  g.fill();
  g.fillStyle = "#04121a";
  g.font = canvasFont("body", 20, 700);
  g.fillText("say hi", W / 2, 119);
  g.fillStyle = "rgba(232,238,247,.35)";
  roundRect(g, 44, 214, 40, 5, 3);
  g.fill();
  g.restore();
};

const drawSticky: DrawFn = (g, w, h) => {
  g.fillStyle = "#ffe27a";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(120,80,0,.07)";
  g.fillRect(0, 0, w, h * 0.16);
  g.save();
  g.translate(w / 2, h / 2);
  g.rotate(-0.06);
  g.fillStyle = "#2b3f63";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = canvasFont("hand", w * 0.3, 600);
  g.fillText("evals", 0, -h * 0.14);
  g.fillText("first!", 0, h * 0.2);
  g.restore();
};

/* ================================================================ merged small parts */

const drawerLinesGeo = () =>
  merged("drawer-lines", () =>
    [0, 1, 2].map((i) => baked(new THREE.BoxGeometry(0.86, 0.015, 0.01), [3.95, 0.3 + i * 0.44, -3.572])),
  );
const drawerKnobsGeo = () =>
  merged("drawer-knobs", () =>
    [0, 1, 2].map((i) => baked(new THREE.SphereGeometry(0.035, 10, 8), [3.95, 0.5 + i * 0.44, -3.56])),
  );
const succulentGeo = () =>
  merged("succulent", () =>
    Array.from({ length: 6 }, (_, i) =>
      baked(
        new THREE.ConeGeometry(0.04, 0.16, 4),
        [1.05 + Math.cos(i) * 0.03, 1.74, -4.65 + Math.sin(i) * 0.03],
        [Math.sin(i * 2) * 0.5, 0, Math.cos(i * 2) * 0.5],
      ),
    ),
  );
const chairLegsGeo = () =>
  merged("chair-legs", () =>
    Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2;
      return baked(new THREE.BoxGeometry(0.46, 0.06, 0.08), [Math.cos(a) * 0.23, 0.14, Math.sin(a) * 0.23], [0, -a, 0]);
    }),
  );
const chairCastersGeo = () =>
  merged("chair-casters", () =>
    Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2;
      return baked(new THREE.SphereGeometry(0.055, 8, 6), [Math.cos(a) * 0.46, 0.055, Math.sin(a) * 0.46]);
    }),
  );
const chairArmsGeo = () =>
  merged("chair-arms", () => [
    baked(new THREE.BoxGeometry(0.06, 0.06, 0.55), [-0.47, 1.1, 0.05]),
    baked(new THREE.BoxGeometry(0.06, 0.06, 0.55), [0.47, 1.1, 0.05]),
    baked(new THREE.BoxGeometry(0.04, 0.26, 0.04), [-0.47, 0.95, 0.2]),
    baked(new THREE.BoxGeometry(0.04, 0.26, 0.04), [0.47, 0.95, 0.2]),
  ]);

/* ---------------------------------------------------------------- keyboard (compact ANSI, keycaps in units) */

type KeyKind = "alpha" | "mod" | "accent";
type KeyDef = [width: number, kind: KeyKind];
/** A key at an explicit spot: left edge and row (fractional rows drop a key lower), in units. */
type PlacedKey = { x: number; row: number; w: number; kind: KeyKind };

const keys = (count: number, kind: KeyKind = "alpha", w = 1): KeyDef[] =>
  Array.from({ length: count }, () => [w, kind]);

/** Main block, back row first, packed from the left edge. Accents: Esc, Enter and WASD. */
const KB_ROWS: KeyDef[][] = [
  // Esc, 1-0, - =, Backspace
  [[1, "accent"], ...keys(12), [2, "mod"]],
  // Tab, Q W ... P [ ], \
  [[1.5, "mod"], [1, "alpha"], [1, "accent"], ...keys(10), [1.5, "mod"]],
  // Caps, A S D, F ... L ; ', Enter
  [[1.75, "mod"], ...keys(3, "accent"), ...keys(8), [2.25, "accent"]],
  // Shift, Z ... /, Shift (short, to leave room for the Up arrow)
  [[2.25, "mod"], ...keys(10), [1.75, "mod"]],
  // Ctrl Win Alt, Space, Alt Fn
  [...keys(3, "mod", 1.25), [6.25, "alpha"], ...keys(2, "mod", 1.25)],
];

/** Nav column set off by a gap, and an inverted-T arrow cluster dropped a quarter row below the main block. */
const KB_EXTRA: PlacedKey[] = [
  { x: 15.25, row: 0, w: 1, kind: "mod" }, // Del
  { x: 15.25, row: 1, w: 1, kind: "mod" }, // PgUp
  { x: 15.25, row: 2, w: 1, kind: "mod" }, // PgDn
  { x: 14.25, row: 3.25, w: 1, kind: "mod" }, // Up
  { x: 13.25, row: 4.25, w: 1, kind: "mod" }, // Left
  { x: 14.25, row: 4.25, w: 1, kind: "mod" }, // Down
  { x: 15.25, row: 4.25, w: 1, kind: "mod" }, // Right
];

const KB_WIDTH_U = 16.25;
const KB_DEPTH_U = 5.25;

const KB_KEYS: PlacedKey[] = [
  ...KB_ROWS.flatMap((row, r) => {
    let x = 0;
    return row.map(([w, kind]) => {
      const key = { x, row: r, w, kind };
      x += w;
      return key;
    });
  }),
  ...KB_EXTRA,
];

const KB_CENTER: Vec3 = [2.25, 1.55, -3.95]; // y is the desk top
const KB_U = 0.06;
const KB_GAP = 0.008;
const KB_CAP_H = 0.022;
const KB_CAP_Y = KB_CENTER[1] + 0.047 + KB_CAP_H / 2;

/** A keycap: a box whose top face is inset on every side, so it tapers like a real cap. */
function keycap(w: number, d: number, h: number, inset = 0.009): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(w, h, d);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) <= 0) continue;
    pos.setX(i, pos.getX(i) - Math.sign(pos.getX(i)) * inset);
    pos.setZ(i, pos.getZ(i) - Math.sign(pos.getZ(i)) * inset);
  }
  geo.computeVertexNormals();
  return geo;
}

const keycapsGeo = (kind: KeyKind) =>
  merged(`kb-${kind}`, () => {
    const x0 = KB_CENTER[0] - (KB_WIDTH_U * KB_U) / 2;
    const z0 = KB_CENTER[2] - (KB_DEPTH_U * KB_U) / 2;
    return KB_KEYS.filter((k) => k.kind === kind).map(({ x, row, w }) =>
      baked(keycap(w * KB_U - KB_GAP, KB_U - KB_GAP, KB_CAP_H), [
        x0 + (x + w / 2) * KB_U,
        KB_CAP_Y,
        z0 + (row + 0.5) * KB_U,
      ]),
    );
  });

/* ---------------------------------------------------------------- shelf layout (seeded, stable) */

const BOOK_COLORS = ["#d35f4a", "#e8b04a", "#3d6b8c", "#6d9a6b", "#c9c1b1", "#2b3f63", "#b5654e"];
interface Book {
  x: number;
  y: number;
  w: number;
  h: number;
  tilt: number;
  color: string;
}
const BOOKS: Book[] = (() => {
  const rand = seededRange(11);
  const out: Book[] = [];
  let x = 1.28;
  for (let i = 0; i < 8; i++) {
    const w = Math.round(rand(0.09, 0.15) * 1000) / 1000;
    const h = Math.round(rand(0.44, 0.62) * 1000) / 1000;
    const lean = i === 7;
    out.push({
      x: x + w / 2 + (lean ? 0.1 : 0),
      y: 4.24 + h / 2 - (lean ? 0.03 : 0),
      w,
      h,
      tilt: lean ? -0.32 : 0,
      color: BOOK_COLORS[i % BOOK_COLORS.length],
    });
    x += w + 0.01;
  }
  return out;
})();

const TROPHY_PROFILE: [number, number][] = [
  [0.001, 0],
  [0.07, 0],
  [0.07, 0.03],
  [0.025, 0.05],
  [0.02, 0.16],
  [0.05, 0.2],
  [0.12, 0.26],
  [0.14, 0.4],
  [0.13, 0.4],
  [0.11, 0.28],
  [0.001, 0.24],
];
const trophyCupGeo = () =>
  cachedGeometry("desk:trophy-cup", () => new THREE.LatheGeometry(TROPHY_PROFILE.map(([a, b]) => new THREE.Vector2(a, b)), 20));
const trophyHandleGeo = () => cachedGeometry("desk:trophy-handle", () => new THREE.TorusGeometry(0.06, 0.012, 6, 12));
const mugHandleGeo = () => cachedGeometry("desk:mug-handle", () => new THREE.TorusGeometry(0.06, 0.018, 8, 14));

const VINE_POINTS = Array.from({ length: 12 }, (_, i) => {
  const t = i / 11;
  return new THREE.Vector3(3.95 + Math.sin(t * 5) * 0.06 + t * 0.12, 4.38 - t * 1.25, -4.55 + Math.cos(t * 4) * 0.05);
});
const vineGeo = () =>
  cachedGeometry("desk:pothos-vine", () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(VINE_POINTS), 40, 0.012, 4));
const pothosLeavesGeo = () =>
  merged("pothos-leaves", () => {
    const leaves = VINE_POINTS.map((p, i) =>
      baked(
        new THREE.SphereGeometry(0.075, 6, 4),
        [p.x + (i % 2 ? 0.05 : -0.05), p.y, p.z + 0.02],
        [0, 0, i % 2 ? 0.7 : -0.7],
        [1, 0.3, 0.75],
      ),
    );
    // A few leaves bunched at the pot rim so the plant reads as full.
    const crown = [0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2 + 0.4;
      return baked(
        new THREE.SphereGeometry(0.075, 6, 4),
        [3.85 + Math.cos(a) * 0.09, 4.45 + (i % 2) * 0.03, -4.72 + Math.sin(a) * 0.08],
        [Math.sin(a) * 0.6, a, Math.cos(a) * 0.6],
        [1, 0.3, 0.75],
      );
    });
    return [...leaves, ...crown];
  });

/* ================================================================ pieces */

/** Additive soft glow decal (light spill). Own material so its opacity can animate. */
function useGlowMaterial(color: string, opacity: number): THREE.MeshBasicMaterial {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: softTexture(),
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    [color, opacity],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

function Monitor({ fontsReady }: { fontsReady: boolean }) {
  const codeTex = useMemo(() => createCanvasTexture(768, 432), []);
  const screenMat = useMemo(() => screenMaterial(codeTex), [codeTex]);
  const stickyTex = useMemo(() => createCanvasTexture(128, 128, drawSticky), []);
  const stickyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffffff", map: stickyTex, roughness: 0.85 }),
    [stickyTex],
  );
  // Rebuild the font string once web fonts load (canvasFont reads computed styles, so it is not called per frame).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const drawCode = useMemo(() => makeCodeDraw(canvasFont("body", 13, 600)), [fontsReady]);
  useThrottledRedraw(codeTex, 20, drawCode);

  useEffect(() => {
    if (fontsReady) redraw(stickyTex);
  }, [fontsReady, stickyTex]);
  useEffect(
    () => () => {
      codeTex.dispose();
      screenMat.dispose();
      stickyTex.dispose();
      stickyMat.dispose();
    },
    [codeTex, screenMat, stickyTex, stickyMat],
  );

  return (
    <group>
      <Part geometry={roundedBox(0.62, 0.04, 0.34, 0.015)} material={M.standBase} position={[2.4, 1.57, -4.62]} />
      <Part geometry={box(0.1, 0.62, 0.07)} material={M.standNeck} position={[2.4, 1.88, -4.7]} />
      <Part geometry={roundedBox(2.0, 1.16, 0.08, 0.03)} material={M.bezel} position={[2.4, 2.5, -4.62]} />
      <mesh geometry={plane(1.9, 1.07)} material={screenMat} position={[2.4, 2.5, -4.572]} />
      {/* Sticky note on the bezel. */}
      <Part geometry={box(0.16, 0.16, 0.005)} material={M.sticky} position={[3.33, 2.95, -4.565]} rotation={[0, 0, 0.12]} />
      <mesh geometry={plane(0.155, 0.155)} material={stickyMat} position={[3.33, 2.95, -4.5622]} rotation={[0, 0, 0.12]} />
    </group>
  );
}

function Keyboard() {
  const spill = useGlowMaterial(C.cyan, 0.2);
  return (
    <group>
      <Part geometry={roundedBox(1.05, 0.045, 0.36, 0.015)} material={M.keyboard} position={[2.25, 1.5725, -3.95]} />
      {/* Dark plate between the keycaps. */}
      <Part geometry={box(0.99, 0.004, 0.33)} material={M.kbPlate} position={[2.25, 1.596, -3.95]} />
      <Part geometry={keycapsGeo("alpha")} material={M.keyAlpha} />
      <Part geometry={keycapsGeo("mod")} material={M.keyMod} />
      <Part geometry={keycapsGeo("accent")} material={M.keyAccent} />
      {/* Cyan underglow: a thin rim peeking out plus a soft spill on the desk. */}
      <mesh geometry={box(1.07, 0.012, 0.38)} material={M.kbGlow} position={[2.25, 1.553, -3.95]} />
      <mesh
        geometry={plane(1.55, 0.8)}
        material={spill}
        position={[2.25, 1.5525, -3.95]}
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ noHighlight: true }}
      />
    </group>
  );
}

function DeskLamp() {
  const lampLevel = useLampLevel();
  const bulbMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#fff4dc", emissive: "#ffcf8a", emissiveIntensity: 3 }),
    [],
  );
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(...LAMP_TARGET);
    return o;
  }, []);
  useEffect(() => () => bulbMat.dispose(), [bulbMat]);

  useFrame(() => {
    const level = lampLevel();
    bulbMat.emissiveIntensity = 0.1 + 2.9 * level;
    if (spot.current) spot.current.intensity = 22 * level;
  });

  return (
    <group>
      <Part geometry={cylinder(0.17, 0.19, 0.05)} material={M.lamp} position={[4.1, 1.575, -4.55]} />
      <Part geometry={sphere(0.045, 10, 8)} material={M.brass} position={LAMP_J0} />
      <Part geometry={cylinder(0.025, 0.025, 1, 10)} material={M.lamp} {...LAMP_ARM_A} />
      <Part geometry={sphere(0.045, 10, 8)} material={M.brass} position={LAMP_J1} />
      <Part geometry={cylinder(0.025, 0.025, 1, 10)} material={M.lamp} {...LAMP_ARM_B} />
      <Part geometry={sphere(0.04, 10, 8)} material={M.brass} position={LAMP_HEAD} />
      <Part geometry={cylinder(0.07, 0.2, 0.3, 20, true)} material={M.shade} position={SHADE_POS} quaternion={SHADE_QUAT} />
      <mesh geometry={sphere(0.06, 12, 8)} material={bulbMat} position={BULB_POS} userData={{ noHighlight: true }} />
      <primitive object={target} />
      <spotLight
        ref={spot}
        color={C.warmLight}
        intensity={22}
        distance={9}
        angle={0.75}
        penumbra={0.6}
        decay={2}
        position={SPOT_POS}
        target={target}
      />
    </group>
  );
}

function Chair() {
  return (
    <group position={[2.35, 0, -2.72]} rotation={[0, -0.28, 0]}>
      <Part geometry={chairLegsGeo()} material={M.chrome} />
      <Part geometry={chairCastersGeo()} material={M.rubber} />
      <Part geometry={cylinder(0.045, 0.045, 0.6, 10)} material={M.chrome} position={[0, 0.45, 0]} />
      <Part geometry={roundedBox(0.98, 0.16, 0.92, 0.07)} material={M.seat} position={[0, 0.82, 0]} />
      <Part geometry={roundedBox(0.92, 1.15, 0.16, 0.07)} material={M.seat} position={[0, 1.52, 0.46]} rotation={[-0.08, 0, 0]} />
      <Part geometry={box(0.12, 0.85, 0.012)} material={M.stripe} position={[0, 1.55, 0.548]} rotation={[-0.08, 0, 0]} />
      <Part geometry={chairArmsGeo()} material={M.rubber} />
    </group>
  );
}

function Desk() {
  return (
    <group>
      <Part geometry={roundedBox(3.7, 0.1, 1.5, 0.03)} material={M.oak} position={[2.6, 1.5, -4.22]} />
      <Part geometry={box(0.08, 1.45, 0.08)} material={M.metal} position={[0.88, 0.725, -4.85]} />
      <Part geometry={box(0.08, 1.45, 0.08)} material={M.metal} position={[0.88, 0.725, -3.6]} />
      <Part geometry={box(0.06, 0.06, 1.25)} material={M.metal} position={[0.88, 0.3, -4.22]} />
      {/* Drawer cabinet. */}
      <Part geometry={roundedBox(0.95, 1.42, 1.35, 0.04)} material={M.cabinet} position={[3.95, 0.72, -4.25]} />
      <Part geometry={drawerLinesGeo()} material={M.drawerLine} />
      <Part geometry={drawerKnobsGeo()} material={M.brass} />
      {/* Mouse and pad. */}
      <Part geometry={box(0.5, 0.012, 0.42)} material={M.mousePad} position={[3.05, 1.556, -3.95]} />
      <Part geometry={sphere(0.08, 12, 8)} material={M.mouse} position={[3.05, 1.58, -3.95]} scale={[0.8, 0.45, 1.2]} />
      {/* Mug. */}
      <Part geometry={cylinder(0.11, 0.1, 0.22)} material={M.mug} position={[3.6, 1.66, -3.75]} />
      <Part geometry={cylinder(0.112, 0.112, 0.05)} material={M.mugBand} position={[3.6, 1.68, -3.75]} />
      <Part geometry={cylinder(0.095, 0.095, 0.01)} material={M.coffee} position={[3.6, 1.765, -3.75]} />
      <Part geometry={mugHandleGeo()} material={M.mug} position={[3.72, 1.66, -3.75]} />
      {/* Tiny succulent. */}
      <Part geometry={cylinder(0.1, 0.08, 0.14, 14)} material={M.terracotta} position={[1.05, 1.62, -4.65]} />
      <Part geometry={cylinder(0.088, 0.088, 0.01, 14)} material={M.soil} position={[1.05, 1.69, -4.65]} />
      <Part geometry={succulentGeo()} material={M.succulent} />
    </group>
  );
}

function Phone({ fontsReady }: { fontsReady: boolean }) {
  const store = useRoomStore();
  const phoneTex = useMemo(() => createCanvasTexture(256, 480, drawPhone), []);
  const screenMat = useMemo(() => screenMaterial(phoneTex), [phoneTex]);
  const halo = useGlowMaterial(C.cyan, 0.3);

  useEffect(() => {
    if (fontsReady) redraw(phoneTex);
  }, [fontsReady, phoneTex]);
  useEffect(
    () => () => {
      phoneTex.dispose();
      screenMat.dispose();
    },
    [phoneTex, screenMat],
  );

  // Faint breathing glow so the phone is easy to spot from the overview.
  useFrame(({ clock }) => {
    const calm = store.getState().reducedMotion;
    halo.opacity = calm ? 0.3 : 0.26 + Math.sin(clock.elapsedTime * 2.2) * 0.08;
  });

  return (
    <group position={[1.28, 1.565, -3.88]} rotation={[0, 0.35, 0]}>
      <mesh
        geometry={plane(0.62, 0.86)}
        material={halo}
        position={[0, -0.0125, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ noHighlight: true }}
      />
      <Part geometry={roundedBox(0.25, 0.03, 0.47, 0.012)} material={M.phone} />
      <mesh geometry={plane(0.22, 0.42)} material={screenMat} position={[0, 0.0165, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    </group>
  );
}

const STEAM_COUNT = 5;

function Steam() {
  const reduced = useRoom((s) => s.reducedMotion);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const mats = useMemo(
    () =>
      Array.from(
        { length: STEAM_COUNT },
        () =>
          new THREE.SpriteMaterial({
            map: softTexture(),
            color: "#ffffff",
            transparent: true,
            opacity: 0,
            depthWrite: false,
          }),
      ),
    [],
  );
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < STEAM_COUNT; i++) {
      const s = sprites.current[i];
      if (!s) continue;
      const ph = i / STEAM_COUNT;
      const p = (t * 0.35 + ph) % 1;
      s.position.set(MUG_TOP.x + Math.sin(p * 7 + ph * 9) * 0.04, MUG_TOP.y + p * 0.55, MUG_TOP.z);
      mats[i].opacity = Math.sin(p * Math.PI) * 0.28;
      s.scale.setScalar(0.1 + p * 0.18);
    }
  });

  if (reduced) return null;
  return (
    <group>
      {mats.map((m, i) => (
        <sprite
          key={i}
          ref={(s) => {
            sprites.current[i] = s;
          }}
          material={m}
          position={[MUG_TOP.x, MUG_TOP.y, MUG_TOP.z]}
          scale={0.1}
        />
      ))}
    </group>
  );
}

function ToyCar() {
  return (
    <group position={[2.75, 4.24, -4.66]} rotation={[0, 0.4, 0]}>
      <Part geometry={roundedBox(0.34, 0.08, 0.16, 0.03)} material={M.toyRed} position={[0, 0.07, 0]} />
      <Part geometry={roundedBox(0.16, 0.07, 0.13, 0.02)} material={M.toyGlass} position={[-0.02, 0.14, 0]} />
      {(
        [
          [-0.11, 0.08],
          [0.11, 0.08],
          [-0.11, -0.08],
          [0.11, -0.08],
        ] as const
      ).map(([a, b]) => (
        <Part
          key={`${a}:${b}`}
          geometry={cylinder(0.035, 0.035, 0.03, 10)}
          material={M.tire}
          position={[a, 0.035, b]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
    </group>
  );
}

function Shelf() {
  return (
    <group>
      <Part geometry={roundedBox(2.9, 0.08, 0.5, 0.02)} material={M.shelfWood} position={[2.5, 4.2, -4.74]} />
      <Part geometry={box(0.05, 0.25, 0.4)} material={M.bracket} position={[1.4, 4.04, -4.78]} />
      <Part geometry={box(0.05, 0.25, 0.4)} material={M.bracket} position={[3.6, 4.04, -4.78]} />
      {BOOKS.map((b, i) => (
        <group key={i} position={[b.x, b.y, -4.74]} rotation={[0, 0, b.tilt]}>
          <Part geometry={roundedBox(b.w, b.h, 0.36, 0.012)} material={std(b.color, { roughness: 0.8 })} />
          <Part geometry={box(b.w + 0.004, 0.035, 0.34)} material={M.bookBand} position={[0, b.h * 0.25, 0]} />
        </group>
      ))}
      {/* Trophy. */}
      <Part geometry={roundedBox(0.32, 0.1, 0.32, 0.02)} material={M.trophyBase} position={[3.35, 4.29, -4.74]} />
      <Part geometry={trophyCupGeo()} material={M.gold} position={[3.35, 4.34, -4.74]} />
      <Part geometry={trophyHandleGeo()} material={M.gold} position={[3.2, 4.66, -4.74]} />
      <Part geometry={trophyHandleGeo()} material={M.gold} position={[3.5, 4.66, -4.74]} />
      <ToyCar />
      {/* Trailing pothos. */}
      <Part geometry={cylinder(0.13, 0.1, 0.18, 14)} material={M.pot} position={[3.85, 4.33, -4.72]} />
      <Part geometry={cylinder(0.118, 0.118, 0.01, 14)} material={M.soil} position={[3.85, 4.42, -4.72]} />
      <mesh geometry={vineGeo()} material={M.vine} />
      <Part geometry={pothosLeavesGeo()} material={M.leaf} />
    </group>
  );
}

/* ================================================================ export */

/**
 * The desk corner on the back wall: desk, monitor with live code, keyboard,
 * mug, coral lamp, chair (work); the phone (contact); and the wall shelf (decor).
 * Owns the desk lamp spot light and the monitor's cyan glow.
 */
export function DeskSet() {
  const fontsReady = useFontsReady();
  return (
    <group>
      <Hotspot id="work">
        <Desk />
        <Monitor fontsReady={fontsReady} />
        <Keyboard />
        <DeskLamp />
        <Chair />
      </Hotspot>
      <Hotspot id="contact">
        <Phone fontsReady={fontsReady} />
      </Hotspot>
      <Shelf />
      <Steam />
      <pointLight color={C.cyan} intensity={3.5} distance={5.5} decay={2} position={MONITOR_LIGHT_POS} />
    </group>
  );
}
