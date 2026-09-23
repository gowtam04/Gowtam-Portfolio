"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Hotspot } from "../Hotspot";
import type { Vec3 } from "../hotspots";
import { useLampLevel } from "../Lighting";
import { box, cachedGeometry, cylinder, mulberry32, plane, roundedBox, sphere } from "../geometry";
import { C, screenMaterial, std, stdUnique } from "../materials";
import type { DrawFn } from "../textures";
import { createCanvasTexture, roundRect, useThrottledRedraw } from "../textures";

/* ------------------------------------------------------------ layout */

/** TV stand: against the left wall, z 1.65..4.45. */
const STAND = { x: -4.5, z: 3.05, len: 2.8 };
/** TV panel center (screen faces +x). */
const TV: Vec3 = [-4.78, 1.62, 3.1];
/** Bean bag center (the squashed sphere's origin). */
const BEAN: Vec3 = [-2.4, 0.52, 3.15];
/** Arc lamp: base tucked into the front-left corner past the stand, dome over the bean bag. */
const LAMP_BASE: Vec3 = [-4.35, 0, 4.7];
const LAMP_DOME: Vec3 = [-2.12, 3.2, 3.45];
const LAMP_LIGHT: Vec3 = [LAMP_DOME[0], LAMP_DOME[1] - 0.2, LAMP_DOME[2]];
const TV_LIGHT: Vec3 = [-4.0, 1.6, 3.1];

/* ------------------------------------------------------------ small mesh helper */

interface PartProps {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position?: Vec3;
  rotation?: Vec3;
  scale?: Vec3;
  shadow?: boolean;
}

function Part({ geometry, material, position, rotation, scale, shadow = true }: PartProps) {
  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow={shadow}
      receiveShadow={shadow}
    />
  );
}

/* ------------------------------------------------------------ family photo */

const HAIR = "#1b1514";
const INK = "#241a17";
const TAU = Math.PI * 2;

function blob(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string, rot = 0) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, rot, 0, TAU);
  c.fillStyle = fill;
  c.fill();
}

/** Rounded-shoulder torso running off the bottom of the picture. */
function torso(c: CanvasRenderingContext2D, cx: number, top: number, half: number, fill: string) {
  const r = Math.min(26, half * 0.6);
  c.beginPath();
  c.moveTo(cx - half - 4, 300);
  c.lineTo(cx - half, top + r);
  c.quadraticCurveTo(cx - half, top, cx - half + r, top);
  c.lineTo(cx + half - r, top);
  c.quadraticCurveTo(cx + half, top, cx + half, top + r);
  c.lineTo(cx + half + 4, 300);
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}

function stroke(c: CanvasRenderingContext2D, color: string, width: number) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.stroke();
}

/** Eyes, brows, cheeks and smile; `k` scales the spacing for the little one. */
function features(c: CanvasRenderingContext2D, x: number, y: number, k = 1) {
  const ex = 11 * k;
  blob(c, x - ex, y - 2, 2.6 * k, 3 * k, INK);
  blob(c, x + ex, y - 2, 2.6 * k, 3 * k, INK);
  for (const sx of [-1, 1]) {
    c.beginPath();
    c.moveTo(x + sx * (ex - 6 * k), y - 12 * k);
    c.quadraticCurveTo(x + sx * ex, y - 15 * k, x + sx * (ex + 6 * k), y - 12 * k);
    stroke(c, HAIR, 2.4 * k);
    blob(c, x + sx * (ex + 6 * k), y + 9 * k, 5 * k, 3 * k, "rgba(232,110,110,.35)");
  }
  c.beginPath();
  c.arc(x, y + 9 * k, 7 * k, 0.15 * Math.PI, 0.85 * Math.PI);
  stroke(c, "#5a2a22", 2.2 * k);
}

function glasses(c: CanvasRenderingContext2D, x: number, y: number, rx: number, round: boolean) {
  c.fillStyle = "rgba(255,255,255,.14)";
  for (const sx of [-1, 1]) {
    const lx = x + sx * 11;
    if (round) {
      c.beginPath();
      c.arc(lx, y - 2, 8, 0, TAU);
    } else {
      roundRect(c, lx - 8.5, y - 8, 17, 12.5, 3);
    }
    c.fill();
    stroke(c, INK, 2.1);
    // lens glint
    c.beginPath();
    c.moveTo(lx - 4, y - 5);
    c.lineTo(lx - 1.5, y - 7);
    stroke(c, "rgba(255,255,255,.75)", 1.4);
  }
  c.beginPath();
  c.moveTo(x - 3, y - 4);
  c.quadraticCurveTo(x, y - 6, x + 3, y - 4);
  c.moveTo(x - 19, y - 4);
  c.lineTo(x - rx + 1, y - 6);
  c.moveTo(x + 19, y - 4);
  c.lineTo(x + rx - 1, y - 6);
  stroke(c, INK, 2);
}

function drawBackdrop(c: CanvasRenderingContext2D) {
  const sky = c.createLinearGradient(0, 0, 0, 210);
  sky.addColorStop(0, "#86c3e8");
  sky.addColorStop(1, "#e3f1ef");
  c.fillStyle = sky;
  c.fillRect(0, 0, 400, 300);
  const sun = c.createRadialGradient(345, 48, 6, 345, 48, 95);
  sun.addColorStop(0, "rgba(255,244,200,1)");
  sun.addColorStop(0.25, "rgba(255,232,170,.7)");
  sun.addColorStop(1, "rgba(255,232,170,0)");
  c.fillStyle = sun;
  c.fillRect(0, 0, 400, 300);
  for (const [cx, cy, k] of [
    [70, 48, 1],
    [205, 30, 0.8],
  ]) {
    for (const [dx, dy, r] of [
      [-18, 4, 12],
      [0, -3, 16],
      [18, 3, 12],
      [4, 6, 13],
    ]) {
      blob(c, cx + dx * k, cy + dy * k, r * k * 1.3, r * k, "#f8fbfc");
    }
  }
  // far hills and trees
  c.beginPath();
  c.moveTo(0, 188);
  c.bezierCurveTo(90, 160, 220, 200, 400, 172);
  c.lineTo(400, 300);
  c.lineTo(0, 300);
  c.fillStyle = "#a8cf8e";
  c.fill();
  for (const [tx, ty, k] of [
    [38, 176, 1],
    [372, 168, 1.15],
    [335, 178, 0.7],
  ]) {
    c.fillStyle = "#6b4a32";
    c.fillRect(tx - 3 * k, ty, 6 * k, 34 * k);
    blob(c, tx, ty - 14 * k, 20 * k, 24 * k, "#5f9c58");
    blob(c, tx - 8 * k, ty - 4 * k, 13 * k, 12 * k, "#528d4d");
    blob(c, tx + 6 * k, ty - 26 * k, 10 * k, 10 * k, "#6eab63");
  }
  // near meadow with a few flowers
  c.beginPath();
  c.moveTo(0, 226);
  c.bezierCurveTo(120, 198, 260, 238, 400, 212);
  c.lineTo(400, 300);
  c.lineTo(0, 300);
  c.fillStyle = "#7db86a";
  c.fill();
  for (let i = 0; i < 26; i++) {
    const fx = (i * 67) % 400;
    const fy = 236 + ((i * 29) % 60);
    blob(c, fx, fy, 1.8, 1.8, i % 3 ? "#fff6e0" : "#ffd35a");
  }
}

function drawWife(c: CanvasRenderingContext2D) {
  const x = 122;
  const y = 120;
  const rx = 29;
  const ry = 34;
  const skin = "#a86e4d";
  torso(c, x, 170, 50, "#e2766b");
  // scoop neckline and neck
  c.beginPath();
  c.arc(x, 170, 17, 0, Math.PI);
  c.fillStyle = skin;
  c.fill();
  c.fillStyle = skin;
  c.fillRect(x - 9, y + 20, 18, 34);

  c.save();
  c.translate(x, y + 34);
  c.rotate(0.1);
  c.translate(-x, -(y + 34));
  // shoulder-length hair behind the face
  c.beginPath();
  c.moveTo(x - rx - 7, y + 50);
  c.bezierCurveTo(x - rx - 15, y + 8, x - rx - 12, y - ry - 14, x, y - ry - 7);
  c.bezierCurveTo(x + rx + 12, y - ry - 14, x + rx + 15, y + 8, x + rx + 7, y + 50);
  c.quadraticCurveTo(x + 14, y + 58, x + 11, y + 40);
  c.lineTo(x - 11, y + 40);
  c.quadraticCurveTo(x - 14, y + 58, x - rx - 7, y + 50);
  c.fillStyle = HAIR;
  c.fill();
  blob(c, x, y, rx, ry, skin);
  features(c, x, y);
  // side-swept fringe
  c.beginPath();
  c.moveTo(x - rx - 1, y + 6);
  c.bezierCurveTo(x - rx - 2, y - ry - 18, x + rx + 2, y - ry - 18, x + rx + 1, y + 6);
  c.bezierCurveTo(x + rx - 5, y - 12, x + 6, y - 22, x - 8, y - 19);
  c.bezierCurveTo(x - 17, y - 13, x - rx + 3, y - 6, x - rx - 1, y + 6);
  c.fillStyle = HAIR;
  c.fill();
  glasses(c, x, y, rx, true);
  c.restore();
}

function drawGowtam(c: CanvasRenderingContext2D) {
  const x = 226;
  const y = 106;
  const rx = 31;
  const ry = 37;
  const skin = "#9a6244";
  torso(c, x, 160, 58, "#2b3f63");
  c.fillStyle = skin;
  c.fillRect(x - 10, y + 22, 20, 40);
  // open collar: skin V with cyan-edged flaps
  c.beginPath();
  c.moveTo(x - 13, 160);
  c.lineTo(x, 182);
  c.lineTo(x + 13, 160);
  c.fillStyle = skin;
  c.fill();
  for (const sx of [-1, 1]) {
    c.beginPath();
    c.moveTo(x + sx * 4, 160);
    c.lineTo(x + sx * 20, 158);
    c.lineTo(x + sx * 9, 178);
    c.closePath();
    c.fillStyle = "#3a5585";
    c.fill();
    stroke(c, "#22324f", 1.2);
  }
  // ears, head
  blob(c, x - rx, y + 2, 6, 9, skin);
  blob(c, x + rx, y + 2, 6, 9, skin);
  blob(c, x, y, rx, ry, skin);
  features(c, x, y);
  // moustache and goatee framing the smile
  c.beginPath();
  c.moveTo(x - 11, y + 10);
  c.quadraticCurveTo(x, y + 2, x + 11, y + 10);
  c.quadraticCurveTo(x, y + 6.5, x - 11, y + 10);
  c.fillStyle = HAIR;
  c.fill();
  stroke(c, HAIR, 1.6);
  c.beginPath();
  c.moveTo(x - 10.5, y + 10);
  c.quadraticCurveTo(x - 11, y + 20, x - 6, y + 24);
  c.moveTo(x + 10.5, y + 10);
  c.quadraticCurveTo(x + 11, y + 20, x + 6, y + 24);
  stroke(c, HAIR, 1.8);
  c.beginPath();
  c.moveTo(x - 8, y + 22);
  c.quadraticCurveTo(x, y + 19, x + 8, y + 22);
  c.quadraticCurveTo(x + 5, y + 32, x, y + 35);
  c.quadraticCurveTo(x - 5, y + 32, x - 8, y + 22);
  c.fill();
  // short hair cap
  c.beginPath();
  c.moveTo(x - rx - 2, y - 2);
  c.bezierCurveTo(x - rx - 5, y - ry - 13, x + rx + 5, y - ry - 13, x + rx + 2, y - 2);
  c.bezierCurveTo(x + rx - 3, y - 16, x + 8, y - 25, x - 4, y - 23);
  c.bezierCurveTo(x - 16, y - 21, x - rx + 3, y - 14, x - rx - 2, y - 2);
  c.fillStyle = HAIR;
  c.fill();
  glasses(c, x, y, rx, false);
}

function drawDaughter(c: CanvasRenderingContext2D) {
  const x = 290;
  const y = 150;
  const r = 20;
  const skin = "#ae7654";
  const dadSkin = "#9a6244";
  // dress, flared, sitting on dad's forearm
  c.beginPath();
  c.moveTo(x - 17, y + 22);
  c.lineTo(x + 17, y + 22);
  c.quadraticCurveTo(x + 24, y + 22, x + 24, y + 34);
  c.lineTo(x + 32, y + 102);
  c.quadraticCurveTo(x, y + 110, x - 30, y + 102);
  c.lineTo(x - 24, y + 34);
  c.quadraticCurveTo(x - 24, y + 22, x - 17, y + 22);
  c.fillStyle = "#f2c440";
  c.fill();
  // legs dangling over his arm, little pink shoes
  for (const [lx, ly, ex, ey] of [
    [x - 2, y + 102, x + 6, y + 128],
    [x + 16, y + 100, x + 27, y + 122],
  ]) {
    c.beginPath();
    c.moveTo(lx, ly);
    c.lineTo(ex, ey);
    stroke(c, skin, 9);
    blob(c, ex + 2, ey + 3, 7, 4.5, "#e86a92", 0.4);
  }
  // dad's arm under her, hand at her hip
  c.beginPath();
  c.moveTo(248, 266);
  c.quadraticCurveTo(284, 272, x + 22, y + 98);
  stroke(c, "#2b3f63", 16);
  blob(c, x + 25, y + 95, 7.5, 7, dadSkin);
  // puff sleeves and her hand on dad's chest
  blob(c, x - 22, y + 29, 8.5, 6.5, "#f5d060");
  blob(c, x + 22, y + 29, 8.5, 6.5, "#f5d060");
  c.beginPath();
  c.moveTo(x - 24, y + 34);
  c.quadraticCurveTo(x - 32, y + 46, x - 40, y + 42);
  stroke(c, skin, 7.5);
  blob(c, x - 41, y + 41, 4.5, 4, skin);
  c.fillStyle = skin;
  c.fillRect(x - 6, y + 12, 12, 12);
  // short bob behind the face
  c.beginPath();
  c.moveTo(x - r - 5, y + 13);
  c.bezierCurveTo(x - r - 9, y - r - 12, x + r + 9, y - r - 12, x + r + 5, y + 13);
  c.quadraticCurveTo(x + r, y + 17, x + r - 3, y + 11);
  c.lineTo(x - r + 3, y + 11);
  c.quadraticCurveTo(x - r, y + 17, x - r - 5, y + 13);
  c.fillStyle = HAIR;
  c.fill();
  blob(c, x, y + 1, r, r, skin);
  features(c, x, y + 3, 0.7);
  // fringe with a little cyan clip
  c.beginPath();
  c.moveTo(x - r - 1, y + 2);
  c.bezierCurveTo(x - r - 2, y - r - 12, x + r + 2, y - r - 12, x + r + 1, y + 2);
  c.quadraticCurveTo(x + r - 4, y - 9, x + 8, y - 8);
  c.quadraticCurveTo(x, y - 5, x - 8, y - 8);
  c.quadraticCurveTo(x - r + 4, y - 9, x - r - 1, y + 2);
  c.fillStyle = HAIR;
  c.fill();
  blob(c, x + 12, y - 12, 3.5, 2.4, "#22d3ee", -0.5);

  // the doll: pink dress, yarn hair, dot eyes
  const dx = x + 36;
  const dy = y + 50;
  c.beginPath();
  c.moveTo(dx - 3, dy + 6);
  c.lineTo(dx - 11, dy + 32);
  c.lineTo(dx + 11, dy + 32);
  c.lineTo(dx + 3, dy + 6);
  c.fillStyle = "#f08bb0";
  c.fill();
  blob(c, dx, dy, 9, 9, "#c89a78");
  c.beginPath();
  c.arc(dx, dy - 1, 10, Math.PI * 1.05, Math.PI * 1.95);
  stroke(c, "#d0562f", 4);
  for (const sx of [-1, 1]) {
    c.beginPath();
    c.moveTo(dx + sx * 9, dy - 4);
    c.quadraticCurveTo(dx + sx * 13, dy + 4, dx + sx * 10, dy + 11);
    stroke(c, "#d0562f", 3);
    blob(c, dx + sx * 3.2, dy, 1.2, 1.3, INK);
  }
  // her arm hugging the doll
  c.beginPath();
  c.moveTo(x + 22, y + 34);
  c.quadraticCurveTo(x + 24, y + 70, dx + 6, dy + 18);
  stroke(c, skin, 8);
  blob(c, dx + 7, dy + 17, 5, 4.5, skin);
}

/** Illustrated portrait of Gowtam, his wife and their daughter, in 400 x 300 units. */
const drawFamilyPhoto: DrawFn = (c, w, h) => {
  c.save();
  c.scale(w / 400, h / 300);
  drawBackdrop(c);
  drawWife(c);
  drawGowtam(c);
  drawDaughter(c);
  // soft print vignette
  const v = c.createRadialGradient(200, 150, 110, 200, 150, 260);
  v.addColorStop(0, "rgba(60,36,14,0)");
  v.addColorStop(1, "rgba(60,36,14,.26)");
  c.fillStyle = v;
  c.fillRect(0, 0, 400, 300);
  c.restore();
};

/* ------------------------------------------------------------ TV game */

interface GameState {
  py: number;
  vy: number;
  scroll: number;
  score: number;
  pipes: number[];
  coins: { x: number; got: boolean }[];
  clouds: [number, number][];
  rand: () => number;
}

function createGame(): GameState {
  const rand = mulberry32(1337);
  const pipes: number[] = [];
  for (let i = 0; i < 4; i++) pipes.push(120 + i * 75 + rand() * 30);
  const coins: GameState["coins"] = [];
  for (let i = 0; i < 3; i++) coins.push({ x: 90 + i * 60, got: false });
  return { py: 0, vy: 0, scroll: 0, score: 4210, pipes, coins, clouds: [[20, 14], [90, 22], [140, 10]], rand };
}

function stepAndDrawGame(gm: GameState, c: CanvasRenderingContext2D, W: number, H: number, t: number, rawDt: number) {
  const dt = Math.min(rawDt, 0.1);
  const gy = 78;
  const px = 34;
  const speed = 46;
  gm.scroll += speed * dt;
  gm.vy += 420 * dt;
  gm.py += gm.vy * dt;
  if (gm.py > 0) {
    gm.py = 0;
    gm.vy = 0;
  }
  const onGround = gm.py === 0;
  for (let i = 0; i < gm.pipes.length; i++) {
    gm.pipes[i] -= speed * dt;
    if (gm.pipes[i] < -14) {
      let far = -Infinity;
      for (const p of gm.pipes) far = Math.max(far, p);
      gm.pipes[i] = far + 60 + gm.rand() * 40;
    }
    const ahead = gm.pipes[i] - (px + 8);
    if (onGround && ahead > 1 && ahead < 10) gm.vy = -165;
  }
  for (const co of gm.coins) {
    co.x -= speed * dt;
    if (co.x < -8) {
      co.x = 170 + gm.rand() * 60;
      co.got = false;
    }
    if (!co.got && Math.abs(co.x - (px + 4)) < 6 && gy + gm.py - 12 < gy - 26) {
      co.got = true;
      gm.score += 100;
    }
  }
  gm.score += Math.round(dt * 30);

  // sky and parallax
  c.fillStyle = "#5c94fc";
  c.fillRect(0, 0, W, H);
  c.fillStyle = "#f7f7ff";
  for (const [cx, cy] of gm.clouds) {
    const x = ((((cx - gm.scroll * 0.2) % 190) + 190) % 190) - 20;
    c.fillRect(x, cy, 18, 5);
    c.fillRect(x + 4, cy - 3, 10, 3);
  }
  c.fillStyle = "#3aa85a";
  for (let i = 0; i < 4; i++) {
    const x = ((((i * 60 - gm.scroll * 0.45) % 240) + 240) % 240) - 40;
    c.beginPath();
    c.moveTo(x, gy);
    c.lineTo(x + 25, gy - 22);
    c.lineTo(x + 50, gy);
    c.fill();
  }

  // brick ground
  c.fillStyle = "#c8663b";
  c.fillRect(0, gy, W, H - gy);
  c.fillStyle = "#7ec850";
  c.fillRect(0, gy, W, 3);
  c.fillStyle = "#9a4a28";
  for (let x = -(gm.scroll % 12); x < W; x += 12) {
    c.fillRect(x, gy + 8, 1, 10);
    c.fillRect(x + 6, gy + 3, 1, 5);
  }
  c.fillRect(0, gy + 8, W, 1);

  // pipes and coins
  for (const p of gm.pipes) {
    const x = Math.round(p);
    c.fillStyle = "#2fb344";
    c.fillRect(x, gy - 14, 12, 14);
    c.fillStyle = "#1e8a31";
    c.fillRect(x - 1, gy - 16, 14, 4);
    c.fillStyle = "#7fe08e";
    c.fillRect(x + 2, gy - 12, 2, 12);
  }
  c.fillStyle = "#ffd84a";
  for (const co of gm.coins) {
    if (co.got) continue;
    const cw = Math.abs(Math.sin(t * 6 + co.x)) * 4 + 1;
    c.fillRect(Math.round(co.x + 3 - cw / 2), gy - 36, Math.round(cw), 7);
  }

  // the runner
  const y = Math.round(gy + gm.py - 12);
  const run = Math.floor(t * 10) % 2;
  c.fillStyle = "#e5484d";
  c.fillRect(px + 1, y, 6, 2);
  c.fillRect(px, y + 2, 8, 1);
  c.fillStyle = "#f2c29b";
  c.fillRect(px + 1, y + 3, 6, 3);
  c.fillStyle = "#1b1f27";
  c.fillRect(px + 5, y + 4, 1, 1);
  c.fillStyle = "#22d3ee";
  c.fillRect(px + 1, y + 6, 6, 3);
  c.fillStyle = "#2b3f63";
  c.fillRect(px + 1, y + 9, 6, 1);
  if (!onGround) {
    c.fillRect(px + 1, y + 10, 2, 2);
    c.fillRect(px + 5, y + 10, 2, 2);
  } else if (run) {
    c.fillRect(px, y + 10, 2, 2);
    c.fillRect(px + 5, y + 10, 2, 2);
  } else {
    c.fillRect(px + 2, y + 10, 2, 2);
    c.fillRect(px + 4, y + 10, 2, 2);
  }

  // HUD
  c.fillStyle = "#ffffff";
  c.font = "bold 8px monospace";
  c.textBaseline = "top";
  c.textAlign = "left";
  c.fillText(`SCORE ${String(gm.score).padStart(6, "0")}`, 4, 3);
  c.fillText(`x${String(Math.floor(gm.score / 700) % 100).padStart(2, "0")}`, 128, 3);
}

/* ------------------------------------------------------------ geometry builders */

function makeBeanBagGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.85, 18, 12);
  const bp = geo.attributes.position;
  for (let i = 0; i < bp.count; i++) {
    const x = bp.getX(i);
    const y = bp.getY(i);
    const z = bp.getZ(i);
    let ny = y * 0.62;
    if (y > 0.3) ny -= (1 - Math.hypot(x, z) / 0.85) * 0.18;
    const n = 1 + Math.sin(x * 9 + z * 7) * 0.025;
    bp.setXYZ(i, x * n, ny, z * n);
  }
  geo.computeVertexNormals();
  return geo;
}

function makeArcGeometry(): THREE.TubeGeometry {
  const [bx, , bz] = LAMP_BASE;
  const [dx, dy, dz] = LAMP_DOME;
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(bx, 0.1, bz),
    new THREE.Vector3(bx, 3.5, bz),
    new THREE.Vector3((bx + dx) / 2, 4.4, (bz + dz) / 2 + 0.1),
    new THREE.Vector3(dx, dy + 0.45, dz),
  );
  return new THREE.TubeGeometry(curve, 56, 0.035, 8);
}

/* ------------------------------------------------------------ pieces */

function TvAndStand() {
  const tex = useMemo(() => createCanvasTexture(160, 96, undefined, { nearest: true }), []);
  const screen = useMemo(() => screenMaterial(tex), [tex]);
  const game = useMemo(() => createGame(), []);
  const draw = useMemo<DrawFn>(() => (c, w, h, t, dt) => stepAndDrawGame(game, c, w, h, t, dt), [game]);
  useThrottledRedraw(tex, 24, draw);
  useEffect(
    () => () => {
      screen.dispose();
      tex.dispose();
    },
    [screen, tex],
  );

  const m = useMemo(
    () => ({
      stand: std("#7a5238", { roughness: 0.6 }),
      foot: std("#2e2a2a"),
      inset: std("#3a281d", { roughness: 0.9 }),
      knob: std(C.brass, { metalness: 0.6, roughness: 0.4 }),
      consoleShell: std("#eceef2", { roughness: 0.4 }),
      black: std("#1b1f27"),
      led: std(C.cyan, { emissive: C.cyan, emissiveIntensity: 1.6 }),
      bezel: std("#12151c", { roughness: 0.35 }),
      power: std("#ff5e5e", { emissive: "#ff5e5e", emissiveIntensity: 1.2 }),
      cases: ["#2b3f63", "#d35f4a", "#1b1f27", "#e8b04a"].map((col) => std(col, { roughness: 0.6 })),
      caseSpine: std("#f3ede2", { roughness: 0.7 }),
    }),
    [],
  );

  const { x: sx, z: sz, len } = STAND;
  const z0 = sz - len / 2;
  const z1 = sz + len / 2;
  const insetW = (len - 0.3) / 2;
  const insetZ = [z0 + 0.1 + insetW / 2, z1 - 0.1 - insetW / 2];
  const front = sx + 0.475;

  return (
    <>
      {/* media stand on short feet, two inset door panels with knobs */}
      <Part geometry={roundedBox(0.95, 0.62, len, 0.04)} material={m.stand} position={[sx, 0.41, sz]} />
      {[sx - 0.35, sx + 0.35].flatMap((x) =>
        [z0 + 0.1, z1 - 0.1].map((z) => (
          <Part key={`${x}:${z}`} geometry={cylinder(0.03, 0.025, 0.1, 8)} material={m.foot} position={[x, 0.05, z]} />
        )),
      )}
      {insetZ.map((z, i) => (
        <group key={z}>
          <Part geometry={box(0.02, 0.44, insetW)} material={m.inset} position={[front + 0.005, 0.41, z]} shadow={false} />
          <Part
            geometry={cylinder(0.022, 0.022, 0.035, 10)}
            material={m.knob}
            position={[front + 0.03, 0.47, i === 0 ? z + insetW / 2 - 0.12 : z - insetW / 2 + 0.12]}
            rotation={[0, 0, Math.PI / 2]}
          />
        </group>
      ))}

      {/* console with a cyan LED strip */}
      <Part geometry={roundedBox(0.55, 0.12, 0.78, 0.03)} material={m.consoleShell} position={[-4.42, 0.78, 2.3]} />
      <Part geometry={box(0.5, 0.02, 0.7)} material={m.black} position={[-4.42, 0.845, 2.3]} />
      <Part geometry={box(0.01, 0.018, 0.6)} material={m.led} position={[-4.14, 0.8, 2.3]} shadow={false} />

      {/* stack of game cases */}
      {m.cases.map((mat, i) => (
        <group key={i} position={[-4.42, 0.745 + i * 0.047, 3.95]} rotation={[0, i % 2 ? 0.08 : -0.06, 0]}>
          <Part geometry={roundedBox(0.42, 0.045, 0.32, 0.01)} material={mat} />
          <Part geometry={box(0.004, 0.03, 0.22)} material={m.caseSpine} position={[0.211, 0, 0]} shadow={false} />
        </group>
      ))}

      {/* TV on a foot and neck */}
      <Part geometry={box(0.2, 0.05, 0.45)} material={m.black} position={[-4.62, 0.745, TV[2]]} />
      <Part geometry={box(0.06, 0.24, 0.06)} material={m.black} position={[-4.72, 0.86, TV[2]]} />
      <Part geometry={roundedBox(0.1, 1.35, 2.35, 0.03)} material={m.bezel} position={TV} />
      <mesh
        geometry={plane(2.22, 1.24)}
        material={screen}
        position={[TV[0] + 0.056, TV[1], TV[2]]}
        rotation={[0, Math.PI / 2, 0]}
        userData={{ noHighlight: true }}
      />
      <Part geometry={box(0.01, 0.018, 0.018)} material={m.power} position={[TV[0] + 0.051, TV[1] - 0.645, TV[2] + 1.02]} shadow={false} />
    </>
  );
}

function BeanBag() {
  const geo = useMemo(() => makeBeanBagGeometry(), []);
  useEffect(() => () => geo.dispose(), [geo]);
  const m = useMemo(
    () => ({
      bag: std(C.teal, { roughness: 0.95, flatShading: true }),
      pad: std("#1b1f27", { roughness: 0.45 }),
      stick: std("#394150"),
      buttons: ["#22d3ee", "#ff6b8a", "#ffd86b", "#7ee081"].map((col) => std(col, { roughness: 0.3 })),
    }),
    [],
  );
  const buttonPos: Vec3[] = [
    [0.12, 0.04, -0.03],
    [0.155, 0.04, 0],
    [0.085, 0.04, 0],
    [0.12, 0.04, 0.03],
  ];
  return (
    <>
      <Part geometry={geo} material={m.bag} position={BEAN} />
      {/* controller resting in the dip */}
      <group position={[-2.35, 0.93, 3.05]} rotation={[0.12, 0.7, -0.08]}>
        <Part geometry={roundedBox(0.36, 0.07, 0.2, 0.03)} material={m.pad} />
        <Part geometry={sphere(0.075, 10, 8)} material={m.pad} position={[-0.15, -0.01, 0.08]} scale={[1, 0.6, 1.3]} />
        <Part geometry={sphere(0.075, 10, 8)} material={m.pad} position={[0.15, -0.01, 0.08]} scale={[1, 0.6, 1.3]} />
        <Part geometry={cylinder(0.025, 0.025, 0.03, 8)} material={m.stick} position={[-0.08, 0.05, 0.02]} />
        <Part geometry={cylinder(0.025, 0.025, 0.03, 8)} material={m.stick} position={[0.04, 0.05, 0.05]} />
        {m.buttons.map((mat, i) => (
          <Part key={i} geometry={sphere(0.013, 6, 5)} material={mat} position={buttonPos[i]} shadow={false} />
        ))}
      </group>
    </>
  );
}

/** Family photo frame: outer size along the wall, moulding width, depth off the wall. */
const PHOTO = { w: 1.5, h: 1.2, rail: 0.07, depth: 0.06, picW: 1.2, picH: 0.9 };

function FamilyPhoto() {
  const tex = useMemo(() => createCanvasTexture(1024, 768, drawFamilyPhoto), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", map: tex, roughness: 0.6 }), [tex]);
  useEffect(
    () => () => {
      mat.dispose();
      tex.dispose();
    },
    [mat, tex],
  );
  const { w, h, rail, depth, picW, picH } = PHOTO;
  const wood = std(C.walnut, { roughness: 0.55 });
  const rails: [number, number, number, number][] = [
    [0, h / 2 - rail / 2, w, rail],
    [0, -h / 2 + rail / 2, w, rail],
    [-w / 2 + rail / 2, 0, rail, h - rail * 2 + 0.01],
    [w / 2 - rail / 2, 0, rail, h - rail * 2 + 0.01],
  ];
  return (
    // local +z faces the room (+x world); local +x runs toward -z world
    <group position={[-5, 3.7, 3.1]} rotation={[0, Math.PI / 2, 0]}>
      <group rotation={[0, 0, -0.008]}>
        <mesh geometry={box(w - 0.02, h - 0.02, 0.02)} material={std("#3b2a20")} position={[0, 0, 0.012]} />
        {rails.map(([x, y, rw, rh]) => (
          <mesh
            key={`${x}:${y}`}
            geometry={roundedBox(rw, rh, depth, 0.012)}
            material={wood}
            position={[x, y, depth / 2]}
            castShadow
            receiveShadow
          />
        ))}
        <mesh geometry={plane(w - rail * 2, h - rail * 2)} material={std(C.cream, { roughness: 0.9 })} position={[0, 0, depth - 0.025]} receiveShadow />
        <mesh geometry={plane(picW, picH)} material={mat} position={[0, 0, depth - 0.022]} receiveShadow />
      </group>
    </group>
  );
}

function TvLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const l = light.current;
    if (!l) return;
    const t = state.clock.elapsedTime;
    l.intensity = 2.4 + Math.sin(t * 7) * 0.25 + Math.sin(t * 2.3) * 0.2;
  });
  return <pointLight ref={light} args={["#8fb0ff", 2.4, 5.5, 2]} position={TV_LIGHT} />;
}

function ArcLamp() {
  const lampLevel = useLampLevel();
  const light = useRef<THREE.PointLight>(null);
  const arc = useMemo(() => makeArcGeometry(), []);
  const domeGeo = cachedGeometry("games:arcDome", () => new THREE.SphereGeometry(0.46, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2));
  const mats = useMemo(
    () => ({
      dome: stdUnique("#f4e7cf", { roughness: 0.6, side: THREE.DoubleSide, emissive: "#ffb86b", emissiveIntensity: 0.45 }),
      bulb: new THREE.MeshStandardMaterial({ color: "#fff4dc", emissive: "#ffcf8a", emissiveIntensity: 3 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      arc.dispose();
      mats.dome.dispose();
      mats.bulb.dispose();
    },
    [arc, mats],
  );

  useFrame(() => {
    const level = lampLevel();
    if (light.current) light.current.intensity = 16 * level;
    mats.bulb.emissiveIntensity = 0.1 + 2.9 * level;
    mats.dome.emissiveIntensity = 0.45 * level;
  });

  const brass = std(C.brass, { metalness: 0.7, roughness: 0.35 });
  return (
    <>
      <Part
        geometry={cylinder(0.24, 0.27, 0.08, 24)}
        material={std("#2b2f38", { roughness: 0.3, metalness: 0.2 })}
        position={[LAMP_BASE[0], 0.04, LAMP_BASE[2]]}
      />
      <Part geometry={cylinder(0.05, 0.05, 0.06, 12)} material={brass} position={[LAMP_BASE[0], 0.11, LAMP_BASE[2]]} />
      <mesh geometry={arc} material={brass} castShadow />
      <mesh geometry={domeGeo} material={mats.dome} position={LAMP_DOME} castShadow receiveShadow userData={{ noHighlight: true }} />
      <mesh geometry={sphere(0.11, 12, 8)} material={mats.bulb} position={LAMP_DOME} userData={{ noHighlight: true }} />
      <pointLight
        ref={light}
        args={["#ffbf7a", 16, 14, 2]}
        position={LAMP_LIGHT}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.004}
        shadow-radius={4}
      />
    </>
  );
}

/* ------------------------------------------------------------ export */

/**
 * Games corner: TV (live pixel auto-runner), media stand, console, game cases,
 * and bean bag with controller (all the `games` hotspot), plus the TV glow, the
 * arc floor lamp and the family photo above the TV (decor, outside the hotspot).
 */
export function GamesCorner() {
  return (
    <>
      <Hotspot id="games">
        <TvAndStand />
        <BeanBag />
      </Hotspot>
      <FamilyPhoto />
      <TvLight />
      <ArcLamp />
    </>
  );
}
