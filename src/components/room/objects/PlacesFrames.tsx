"use client";

import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { Hotspot } from "../Hotspot";
import { box, plane, roundedBox, seededRange } from "../geometry";
import type { Vec3 } from "../hotspots";
import { C, std } from "../materials";
import { useRoom, useRoomActions } from "../store";
import type { DrawFn } from "../textures";
import { canvasFont, createCanvasTexture, redraw, useFontsReady } from "../textures";

/* ------------------------------------------------------------ dimensions (frame-local units) */

/** Outer frame size: width along the wall, height. */
const FW = 0.76;
const FH = 0.98;
/** Moulding width and how far it stands off the wall. */
const RAIL = 0.055;
const DEPTH = 0.075;
/** Mat (inside the moulding) and the picture opening cut into it. */
const MW = FW - RAIL * 2;
const MH = FH - RAIL * 2;
const OW = 0.54;
const OH = 0.56;
const O_TOP = 0.06;
/** Opening center, relative to the mat center. */
const O_CY = MH / 2 - O_TOP - OH / 2;
/** Mat sits recessed inside the moulding; picture a hair in front of it. */
const MAT_Z = DEPTH - 0.028;

type Place = "usa" | "india";

interface FrameDef {
  place: Place;
  label: string;
  /** World position of the frame's back center on the left wall (x = -5). */
  pos: Vec3;
  /** Small hang tilt, radians. */
  tilt: number;
  frame: string;
  draw: DrawFn;
  flag: (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void;
}

/* ------------------------------------------------------------ illustrated scenes */

/** USA: an open desert road through red mesas under a big sky, late afternoon. */
const drawUsa: DrawFn = (g, w, h) => {
  const hz = h * 0.58;
  const sky = g.createLinearGradient(0, 0, 0, hz);
  sky.addColorStop(0, "#3d78c2");
  sky.addColorStop(0.55, "#86bde6");
  sky.addColorStop(1, "#ffd9a3");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, hz + 2);

  // sun and glow
  const glow = g.createRadialGradient(w * 0.24, hz - 40, 6, w * 0.24, hz - 40, 150);
  glow.addColorStop(0, "rgba(255,244,210,.95)");
  glow.addColorStop(0.3, "rgba(255,226,160,.45)");
  glow.addColorStop(1, "rgba(255,226,160,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, w, hz);
  g.fillStyle = "#fff4d2";
  g.beginPath();
  g.arc(w * 0.24, hz - 40, 26, 0, Math.PI * 2);
  g.fill();

  // puffy clouds
  const cloud = (x: number, y: number, s: number) => {
    g.fillStyle = "rgba(255,255,255,.92)";
    g.beginPath();
    g.ellipse(x, y, 42 * s, 13 * s, 0, 0, Math.PI * 2);
    g.ellipse(x - 18 * s, y - 8 * s, 20 * s, 14 * s, 0, 0, Math.PI * 2);
    g.ellipse(x + 12 * s, y - 12 * s, 24 * s, 17 * s, 0, 0, Math.PI * 2);
    g.fill();
  };
  cloud(w * 0.7, h * 0.12, 1.1);
  cloud(w * 0.38, h * 0.2, 0.75);
  cloud(w * 0.92, h * 0.28, 0.6);

  // far mesas (hazy)
  g.fillStyle = "#dd9a78";
  g.beginPath();
  g.moveTo(0, hz);
  g.lineTo(0, hz - 34);
  g.lineTo(w * 0.1, hz - 38);
  g.lineTo(w * 0.14, hz - 16);
  g.lineTo(w * 0.62, hz - 14);
  g.lineTo(w * 0.66, hz - 44);
  g.lineTo(w * 0.8, hz - 46);
  g.lineTo(w * 0.83, hz - 18);
  g.lineTo(w, hz - 20);
  g.lineTo(w, hz);
  g.fill();

  // two big buttes, lit face and shadow face
  const butte = (x0: number, x1: number, top: number, cap: number, lit: string, shade: string) => {
    const base = hz + 2;
    g.fillStyle = lit;
    g.beginPath();
    g.moveTo(x0 - 26, base);
    g.lineTo(x0, top + cap);
    g.lineTo(x0 + 6, top);
    g.lineTo(x1 - 6, top);
    g.lineTo(x1, top + cap);
    g.lineTo(x1 + 26, base);
    g.fill();
    g.fillStyle = shade;
    g.beginPath();
    g.moveTo((x0 + x1) / 2 + 10, top);
    g.lineTo(x1 - 6, top);
    g.lineTo(x1, top + cap);
    g.lineTo(x1 + 26, base);
    g.lineTo((x0 + x1) / 2 + 30, base);
    g.fill();
    // strata
    g.fillStyle = "rgba(90,30,15,.18)";
    for (let i = 1; i < 4; i++) g.fillRect(x0 - i * 4, top + cap + i * 16, x1 - x0 + i * 8, 3);
  };
  butte(w * 0.1, w * 0.3, hz - 118, 18, "#c9623e", "#9c4630");
  butte(w * 0.7, w * 0.84, hz - 150, 22, "#c05a3a", "#8e3f2c");

  // desert floor
  const ground = g.createLinearGradient(0, hz, 0, h);
  ground.addColorStop(0, "#e2a36c");
  ground.addColorStop(1, "#c87a47");
  g.fillStyle = ground;
  g.fillRect(0, hz, w, h - hz);

  // road to the horizon
  const vx = w * 0.52;
  g.fillStyle = "#3a3d46";
  g.beginPath();
  g.moveTo(vx - 5, hz);
  g.lineTo(vx + 5, hz);
  g.lineTo(w * 0.98, h);
  g.lineTo(w * 0.06, h);
  g.fill();
  // edge lines
  g.strokeStyle = "rgba(245,240,230,.85)";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(vx - 4, hz + 1);
  g.lineTo(w * 0.1, h);
  g.moveTo(vx + 4, hz + 1);
  g.lineTo(w * 0.94, h);
  g.stroke();
  // center dashes in perspective
  g.fillStyle = "#ffd24a";
  for (let i = 0; i < 7; i++) {
    const t0 = Math.pow(i / 7, 1.7);
    const t1 = Math.pow((i + 0.55) / 7, 1.7);
    const y0 = hz + (h - hz) * t0;
    const y1 = hz + (h - hz) * t1;
    const x0 = vx + (w * 0.52 - vx) * t0;
    const hw0 = 1 + 7 * t0;
    const hw1 = 1 + 7 * t1;
    g.beginPath();
    g.moveTo(x0 - hw0, y0);
    g.lineTo(x0 + hw0, y0);
    g.lineTo(x0 + hw1, y1);
    g.lineTo(x0 - hw1, y1);
    g.fill();
  }

  // sagebrush and a saguaro
  const rand = seededRange(11);
  for (let i = 0; i < 26; i++) {
    const y = hz + 8 + rand(0, h - hz - 10);
    const t = (y - hz) / (h - hz);
    const side = rand(0, 1) > 0.5;
    const roadEdge = side ? vx + (w * 0.98 - vx) * t + 12 : vx + (w * 0.06 - vx) * t - 12;
    const x = side ? rand(roadEdge, w + 20) : rand(-20, roadEdge);
    if (side ? x < roadEdge : x > roadEdge) continue;
    g.fillStyle = rand(0, 1) > 0.5 ? "#8c8f58" : "#a3a068";
    g.beginPath();
    g.ellipse(x, y, 4 + 10 * t, 2.5 + 6 * t, 0, 0, Math.PI * 2);
    g.fill();
  }
  const sx = w * 0.88;
  const sy = h * 0.8;
  g.fillStyle = "#4f7d4a";
  const arm = (x: number, y: number, ww: number, hh: number) => {
    g.beginPath();
    g.roundRect(x, y, ww, hh, ww / 2);
    g.fill();
  };
  arm(sx - 8, sy - 84, 16, 96);
  arm(sx - 30, sy - 58, 12, 34);
  arm(sx - 30, sy - 30, 26, 10);
  arm(sx + 16, sy - 70, 12, 30);
  arm(sx + 4, sy - 46, 24, 10);
  g.fillStyle = "rgba(255,255,255,.15)";
  g.fillRect(sx - 4, sy - 80, 3, 84);
};

/** India: a warm sunrise over a lakeside town, pastel houses with arched windows, palms, a small boat. */
const drawIndia: DrawFn = (g, w, h) => {
  const hz = h * 0.6;
  const sky = g.createLinearGradient(0, 0, 0, hz);
  sky.addColorStop(0, "#c98fb4");
  sky.addColorStop(0.45, "#f6a57c");
  sky.addColorStop(1, "#ffd99a");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, hz + 2);

  // rising sun and glow
  const sunX = w * 0.58;
  const sunY = hz - 128;
  const glow = g.createRadialGradient(sunX, sunY, 10, sunX, sunY, 200);
  glow.addColorStop(0, "rgba(255,240,196,.9)");
  glow.addColorStop(0.35, "rgba(255,206,140,.45)");
  glow.addColorStop(1, "rgba(255,206,140,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, w, hz);
  g.fillStyle = "#fff0c0";
  g.beginPath();
  g.arc(sunX, sunY, 54, 0, Math.PI * 2);
  g.fill();

  // birds
  g.strokeStyle = "rgba(70,40,60,.7)";
  g.lineWidth = 3;
  g.lineCap = "round";
  const bird = (x: number, y: number, s: number) => {
    g.beginPath();
    g.moveTo(x - 9 * s, y - 4 * s);
    g.quadraticCurveTo(x - 4 * s, y - 6 * s, x, y);
    g.quadraticCurveTo(x + 4 * s, y - 6 * s, x + 9 * s, y - 4 * s);
    g.stroke();
  };
  bird(w * 0.26, h * 0.14, 1.2);
  bird(w * 0.34, h * 0.1, 0.9);
  bird(w * 0.3, h * 0.2, 0.8);

  // distant hills
  g.fillStyle = "#c48e96";
  g.beginPath();
  g.moveTo(0, hz);
  g.lineTo(0, hz - 60);
  g.quadraticCurveTo(w * 0.18, hz - 96, w * 0.38, hz - 58);
  g.quadraticCurveTo(w * 0.62, hz - 30, w * 0.8, hz - 74);
  g.quadraticCurveTo(w * 0.92, hz - 96, w, hz - 70);
  g.lineTo(w, hz);
  g.fill();

  // town on the far shore: flat roofs, parapets, arched windows, a small domed pavilion
  interface House {
    x: number;
    ww: number;
    hh: number;
    col: string;
  }
  const houses: House[] = [
    { x: 0, ww: 62, hh: 70, col: "#e79a8e" },
    { x: 58, ww: 70, hh: 104, col: "#f0c56e" },
    { x: 124, ww: 56, hh: 80, col: "#8fcac4" },
    { x: 176, ww: 84, hh: 132, col: "#f4e6cf" },
    { x: 256, ww: 60, hh: 88, col: "#d97a52" },
    { x: 312, ww: 72, hh: 112, col: "#e9a3b5" },
    { x: 380, ww: 58, hh: 76, col: "#f0c56e" },
    { x: 434, ww: 80, hh: 96, col: "#8fcac4" },
  ];
  const sxk = w / 512;
  const base = hz + 6;
  houses.forEach((hs, i) => {
    const x = hs.x * sxk;
    const ww = hs.ww * sxk;
    const top = base - hs.hh;
    g.fillStyle = hs.col;
    g.fillRect(x, top, ww, hs.hh);
    // parapet with crenels
    g.fillRect(x - 3, top - 6, ww + 6, 6);
    for (let k = 0; k < ww; k += 14) g.fillRect(x + k, top - 12, 7, 6);
    // shade on the right side
    g.fillStyle = "rgba(90,40,40,.14)";
    g.fillRect(x + ww * 0.72, top, ww * 0.28, hs.hh);
    // arched windows
    const rows = Math.max(1, Math.floor((hs.hh - 20) / 36));
    const cols = Math.max(1, Math.floor(ww / 26));
    for (let r = 0; r < rows; r++) {
      for (let cIdx = 0; cIdx < cols; cIdx++) {
        const wx = x + (ww / cols) * (cIdx + 0.5);
        const wy = top + 16 + r * 36;
        const lit = (i + r + cIdx) % 3 === 0;
        g.fillStyle = lit ? "#ffd27a" : "#3f5d6b";
        g.beginPath();
        g.moveTo(wx - 5, wy + 18);
        g.lineTo(wx - 5, wy + 5);
        g.arc(wx, wy + 5, 5, Math.PI, 0);
        g.lineTo(wx + 5, wy + 18);
        g.fill();
      }
    }
  });
  // domed pavilion (chhatri) on the tall cream house
  const cx = (176 + 42) * sxk;
  const ct = base - 132 - 12;
  g.fillStyle = "#f4e6cf";
  g.fillRect(cx - 24, ct - 4, 48, 5);
  [-18, -6, 6, 18].forEach((dx) => g.fillRect(cx + dx - 2, ct - 26, 4, 22));
  g.fillRect(cx - 26, ct - 30, 52, 5);
  g.beginPath();
  g.arc(cx, ct - 30, 20, Math.PI, 0);
  g.fill();
  g.fillStyle = "#e0b95c";
  g.fillRect(cx - 1.5, ct - 60, 3, 12);
  g.beginPath();
  g.arc(cx, ct - 60, 3.5, 0, Math.PI * 2);
  g.fill();

  // lake with the sun's reflection
  const water = g.createLinearGradient(0, base, 0, h);
  water.addColorStop(0, "#f2b489");
  water.addColorStop(1, "#b77a8e");
  g.fillStyle = water;
  g.fillRect(0, base, w, h - base);
  g.fillStyle = "rgba(255,240,196,.75)";
  for (let i = 0; i < 9; i++) {
    const y = base + 10 + i * 17;
    const len = 90 - i * 7;
    g.fillRect(sunX - len / 2 + (i % 2 ? 8 : -6), y, len, 4);
  }
  // soft reflections of the houses
  g.globalAlpha = 0.22;
  houses.forEach((hs) => {
    g.fillStyle = hs.col;
    g.fillRect(hs.x * sxk, base, hs.ww * sxk, hs.hh * 0.35);
  });
  g.globalAlpha = 1;

  // small wooden boat
  const bx = w * 0.3;
  const by = h * 0.86;
  g.fillStyle = "#6b3f2a";
  g.beginPath();
  g.moveTo(bx - 60, by - 10);
  g.quadraticCurveTo(bx, by + 18, bx + 60, by - 10);
  g.lineTo(bx + 44, by - 2);
  g.quadraticCurveTo(bx, by + 6, bx - 44, by - 2);
  g.fill();
  g.fillStyle = "#e0a35a";
  g.fillRect(bx - 18, by - 12, 36, 5);

  // coconut palms on the right, framing the scene
  const palm = (x: number, y: number, hgt: number, lean: number) => {
    g.strokeStyle = "#5a3d2e";
    g.lineWidth = 9;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + lean * 0.3, y - hgt * 0.6, x + lean, y - hgt);
    g.stroke();
    const tx = x + lean;
    const ty = y - hgt;
    g.fillStyle = "#2f6b48";
    for (let k = 0; k < 7; k++) {
      const a = -Math.PI + (k / 6) * Math.PI + (k % 2 ? 0.15 : -0.1);
      const ex = tx + Math.cos(a) * 64;
      const ey = ty + Math.sin(a) * 30 + 26;
      g.beginPath();
      g.moveTo(tx, ty);
      g.quadraticCurveTo((tx + ex) / 2, ty + Math.sin(a) * 40 - 12, ex, ey);
      g.quadraticCurveTo((tx + ex) / 2 + 4, ty + Math.sin(a) * 30 + 2, tx, ty + 6);
      g.fill();
    }
    g.fillStyle = "#6b4a2a";
    g.beginPath();
    g.arc(tx - 5, ty + 8, 5, 0, Math.PI * 2);
    g.arc(tx + 5, ty + 9, 5, 0, Math.PI * 2);
    g.fill();
  };
  palm(w * 0.9, h * 0.74, h * 0.46, -34);
  palm(w * 1.02, h * 0.8, h * 0.36, -24);
  // near bank
  g.fillStyle = "#4e6b3f";
  g.beginPath();
  g.moveTo(w * 0.7, h);
  g.quadraticCurveTo(w * 0.85, h * 0.74, w, h * 0.76);
  g.lineTo(w, h);
  g.fill();

  // marigold garland across the top
  const beads = 22;
  for (let i = 0; i <= beads; i++) {
    const t = i / beads;
    const x = t * w;
    const y = 10 + Math.sin(t * Math.PI) * 26;
    g.fillStyle = i % 2 ? "#f59e1b" : "#ffc53d";
    g.beginPath();
    g.arc(x, y, 10, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(160,70,10,.35)";
    g.beginPath();
    g.arc(x + 2, y + 2, 4, 0, Math.PI * 2);
    g.fill();
  }
};

/* ------------------------------------------------------------ flags and mat */

const flagUsa = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  for (let i = 0; i < 7; i++) {
    g.fillStyle = i % 2 ? "#f7f2ea" : "#b8323a";
    g.fillRect(x, y + (h / 7) * i, w, h / 7 + 0.5);
  }
  g.fillStyle = "#2b3f73";
  g.fillRect(x, y, w * 0.42, h * (4 / 7));
  g.fillStyle = "#f7f2ea";
  for (let r = 0; r < 3; r++) {
    for (let cIdx = 0; cIdx < 4; cIdx++) {
      g.beginPath();
      g.arc(x + w * 0.06 + cIdx * w * 0.1, y + h * 0.1 + r * h * 0.16, 1.4, 0, Math.PI * 2);
      g.fill();
    }
  }
};

const flagIndia = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = "#f28c28";
  g.fillRect(x, y, w, h / 3 + 0.5);
  g.fillStyle = "#f7f2ea";
  g.fillRect(x, y + h / 3, w, h / 3 + 0.5);
  g.fillStyle = "#2a8a3e";
  g.fillRect(x, y + (h * 2) / 3, w, h / 3);
  g.strokeStyle = "#1f3a8a";
  g.lineWidth = 1.6;
  g.beginPath();
  g.arc(x + w / 2, y + h / 2, h / 7, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#1f3a8a";
  g.beginPath();
  g.arc(x + w / 2, y + h / 2, 1.2, 0, Math.PI * 2);
  g.fill();
};

function matDraw(def: FrameDef): DrawFn {
  return (g, w, h) => {
    const s = w / MW; // px per unit
    g.fillStyle = "#f4ede0";
    g.fillRect(0, 0, w, h);
    // faint paper tooth
    const rand = seededRange(def.place === "usa" ? 3 : 5);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = rand(0, 1) > 0.5 ? "rgba(120,100,70,.05)" : "rgba(255,255,255,.25)";
      g.fillRect(rand(0, w), rand(0, h), 2, 2);
    }
    // bevel around the opening
    const ox = (MW - OW) / 2;
    const oy = O_TOP;
    const bev = 0.012 * s;
    g.fillStyle = "#fffaf0";
    g.fillRect(ox * s - bev, oy * s - bev, OW * s + bev * 2, OH * s + bev * 2);
    g.fillStyle = "rgba(0,0,0,.08)";
    g.fillRect(ox * s - bev, oy * s - bev, OW * s + bev * 2, bev * 0.5);
    g.fillRect(ox * s - bev, oy * s - bev, bev * 0.5, OH * s + bev * 2);
    g.fillStyle = "#6d6457";
    g.fillRect(ox * s, oy * s, OW * s, OH * s);

    // label: flag + letter-spaced name
    const labelY = (oy + OH) * s + (MH - oy - OH) * s * 0.5;
    const size = 38;
    g.font = canvasFont("body", size, 700);
    g.textBaseline = "middle";
    const spacing = 9;
    const chars = def.label.split("");
    const textW = chars.reduce((acc, ch) => acc + g.measureText(ch).width + spacing, -spacing);
    const fw = 42;
    const fh = 28;
    const gap = 16;
    const total = fw + gap + textW;
    let x = (w - total) / 2;
    g.fillStyle = "rgba(0,0,0,.18)";
    g.fillRect(x + 1.5, labelY - fh / 2 + 1.5, fw, fh);
    def.flag(g, x, labelY - fh / 2, fw, fh);
    x += fw + gap;
    g.fillStyle = "#2b3f63";
    g.textAlign = "left";
    chars.forEach((ch) => {
      g.fillText(ch, x, labelY + 1);
      x += g.measureText(ch).width + spacing;
    });
  };
}

/* ------------------------------------------------------------ frames */

/** Left wall, between the window's right curtain (z ~0.36) and the PLAYER 1 poster (z ~2.33). */
const FRAMES: FrameDef[] = [
  {
    place: "india",
    label: "INDIA",
    pos: [-5, 3.47, 1.8],
    tilt: 0.012,
    frame: C.walnut,
    draw: drawIndia,
    flag: flagIndia,
  },
  {
    place: "usa",
    label: "USA",
    pos: [-5, 3.43, 0.9],
    tilt: -0.01,
    frame: "#262a33",
    draw: drawUsa,
    flag: flagUsa,
  },
];

/** A real photo, cover-fit (center crop) into the mat opening. */
function PhotoPicture({ url }: { url: string }) {
  const tex = useTexture(url);
  const mat = useMemo(() => {
    const img = tex.image as { width?: number; height?: number } | undefined;
    const imgAspect = (img?.width ?? 1) / (img?.height ?? 1);
    const openAspect = OW / OH;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    if (imgAspect > openAspect) tex.repeat.set(openAspect / imgAspect, 1);
    else tex.repeat.set(1, imgAspect / openAspect);
    tex.offset.set((1 - tex.repeat.x) / 2, (1 - tex.repeat.y) / 2);
    tex.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color: "#ffffff", map: tex, roughness: 0.6 });
  }, [tex]);
  useEffect(() => () => mat.dispose(), [mat]);
  return <mesh geometry={plane(OW, OH)} material={mat} position={[0, O_CY, MAT_Z + 0.002]} receiveShadow />;
}

function Frame({ def, photo }: { def: FrameDef; photo: string | null }) {
  const fontsReady = useFontsReady();

  const assets = useMemo(() => {
    const matTex = createCanvasTexture(512, Math.round((512 * MH) / MW), matDraw(def));
    const matMat = new THREE.MeshStandardMaterial({ color: "#ffffff", map: matTex, roughness: 0.9 });
    const picTex = createCanvasTexture(512, Math.round((512 * OH) / OW), def.draw);
    const picMat = new THREE.MeshStandardMaterial({ color: "#ffffff", map: picTex, roughness: 0.6 });
    return { matTex, matMat, picTex, picMat };
  }, [def]);

  useEffect(
    () => () => {
      assets.matTex.dispose();
      assets.matMat.dispose();
      assets.picTex.dispose();
      assets.picMat.dispose();
    },
    [assets],
  );

  useEffect(() => {
    if (fontsReady) redraw(assets.matTex);
  }, [fontsReady, assets]);

  const frameMat = std(def.frame, { roughness: 0.55 });
  const lip = std("#d9c29a", { roughness: 0.5, metalness: 0.3 });
  const railZ = DEPTH / 2;
  const illustrated = (
    <mesh geometry={plane(OW, OH)} material={assets.picMat} position={[0, O_CY, MAT_Z + 0.002]} receiveShadow />
  );

  return (
    // local +z faces the room (+x world); local +x runs toward -z world
    <group position={def.pos} rotation={[0, Math.PI / 2, 0]}>
      <group rotation={[0, 0, def.tilt]}>
        {/* backing board */}
        <mesh geometry={box(FW - 0.02, FH - 0.02, 0.02)} material={std("#3b2a20")} position={[0, 0, 0.012]} />
        {/* moulding */}
        <mesh
          geometry={roundedBox(FW, RAIL, DEPTH, 0.012)}
          material={frameMat}
          position={[0, FH / 2 - RAIL / 2, railZ]}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={roundedBox(FW, RAIL, DEPTH, 0.012)}
          material={frameMat}
          position={[0, -FH / 2 + RAIL / 2, railZ]}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={roundedBox(RAIL, FH - RAIL * 2 + 0.01, DEPTH, 0.012)}
          material={frameMat}
          position={[-FW / 2 + RAIL / 2, 0, railZ]}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={roundedBox(RAIL, FH - RAIL * 2 + 0.01, DEPTH, 0.012)}
          material={frameMat}
          position={[FW / 2 - RAIL / 2, 0, railZ]}
          castShadow
          receiveShadow
        />
        {/* thin gilt lip inside the moulding */}
        <mesh geometry={box(MW + 0.012, 0.008, 0.01)} material={lip} position={[0, MH / 2, MAT_Z + 0.004]} />
        <mesh geometry={box(MW + 0.012, 0.008, 0.01)} material={lip} position={[0, -MH / 2, MAT_Z + 0.004]} />
        <mesh geometry={box(0.008, MH, 0.01)} material={lip} position={[-MW / 2, 0, MAT_Z + 0.004]} />
        <mesh geometry={box(0.008, MH, 0.01)} material={lip} position={[MW / 2, 0, MAT_Z + 0.004]} />
        {/* mat and picture */}
        <mesh geometry={plane(MW, MH)} material={assets.matMat} position={[0, 0, MAT_Z]} receiveShadow />
        {photo ? (
          <Suspense fallback={illustrated}>
            <PhotoPicture url={photo} />
          </Suspense>
        ) : (
          illustrated
        )}
      </group>
    </group>
  );
}

export function PlacesFrames() {
  const photos = useRoom((s) => s.photos);
  const { invalidateShadows } = useRoomActions();
  useEffect(() => invalidateShadows(2), [invalidateShadows]);

  return (
    <Hotspot id="places">
      {FRAMES.map((def) => (
        <Frame key={def.place} def={def} photo={photos[def.place]} />
      ))}
    </Hotspot>
  );
}
