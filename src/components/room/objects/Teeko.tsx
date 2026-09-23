"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Hotspot } from "../Hotspot";
import { cachedGeometry, cylinder, plane, sphere } from "../geometry";
import { TEEKO, std } from "../materials";
import type { Phase } from "../timeOfDay";
import { useRoomStore } from "../store";
import { canvasFont, createCanvasTexture, redraw, useFontsReady } from "../textures";

/**
 * Teeko: a small black-and-tan chihuahua. Asleep, curled up in his round dog bed
 * on the rug (night and dawn); awake, trotting around the room floor (day and dusk).
 *
 * Dog-local frame: +x is where his nose points, +y is up, +z is the belly side of
 * the curl (turned toward the camera when he lies in bed). The bed sits at ROOT;
 * the dog has his own group, moved every frame in world space with heading =
 * rotation.y. In bed he sits at ROOT with heading ORIENT so his face and ears read
 * from the overview camera and from the teeko close-up.
 *
 * Everything is driven from the store inside useFrame (no per-frame renders):
 * - Asleep: hover or nav focus = stirs and looks at the camera; poke = hop, "yip!",
 *   fast wag; open panel = stays awake and attentive; otherwise back to sleep.
 * - Awake: wanders a waypoint graph (trot, idle sit / sniff / look, zoomies); hover,
 *   nav focus or a poke stop him to look at the camera; an open panel sits him down.
 * - Phase changes walk him to bed (hop on, turn a circle, lie down) or wake him up
 *   (stand, play bow stretch, hop off). The first resolution after mount snaps.
 *
 * He writes `store.fx.teeko` every frame so the pick box, hover chip and camera follow him.
 */

const ROOT: [number, number, number] = [0.85, 0.04, 1.35];
const ORIENT = 0.6;
/** Top of the bed cushion, where the dog lies (dog-local units). */
const BED_TOP = 0.085;
const SCALE = 1.2;
/** Top of the rug (world y). Off the rug the floor is y = 0. */
const RUG_TOP = 0.04;
const TAU = Math.PI * 2;

/* ------------------------------------------------------------ geometry */

const capsule = (r: number, len: number) =>
  cachedGeometry(`teeko:capsule:${r}:${len}`, () => new THREE.CapsuleGeometry(r, len, 4, 10));
const cone = (r: number, h: number) => cachedGeometry(`teeko:cone:${r}:${h}`, () => new THREE.ConeGeometry(r, h, 14, 1));
const torus = (r: number, tube: number, arc: number, rs = 8, ts = 24) =>
  cachedGeometry(`teeko:torus:${r}:${tube}:${arc}:${rs}:${ts}`, () => new THREE.TorusGeometry(r, tube, rs, ts, arc));

/* ------------------------------------------------------------ tail */

/** Asleep: the tail leaves the rump low and wraps around the belly side on the cushion. */
const TAIL_SLEEP: [number, number, number][] = [
  [0, 0, 0],
  [-0.045, -0.045, 0.03],
  [-0.05, -0.075, 0.09],
  [-0.012, -0.08, 0.135],
  [0.045, -0.08, 0.152],
  [0.095, -0.078, 0.148],
];
/** Awake: the classic chihuahua sickle tail, up and curling forward over the back. */
const TAIL_AWAKE: [number, number, number][] = [
  [0, 0, 0],
  [-0.05, 0.06, 0],
  [-0.06, 0.14, 0.005],
  [-0.025, 0.205, 0.01],
  [0.035, 0.22, 0.01],
  [0.085, 0.185, 0.005],
];
const TAIL_ROOT_R = 0.021;
const TAIL_TIP_R = 0.009;

/**
 * One smooth tapered tube with a morph target: base = asleep, target 0 = awake.
 * Both poses use parallel-transported frames from the same reference so their
 * vertices correspond and the morph does not twist.
 */
function buildTailGeometry(radial = 9, tubular = 26): THREE.BufferGeometry {
  const ref = new THREE.Vector3(0, 0, 1);
  const ring = (pts: [number, number, number][]) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q)));
    const pos: number[] = [];
    const nor: number[] = [];
    const n = new THREE.Vector3();
    const bi = new THREE.Vector3();
    const dir = new THREE.Vector3();
    for (let j = 0; j <= tubular; j++) {
      const u = j / tubular;
      const p = curve.getPointAt(u);
      const tan = curve.getTangentAt(u).normalize();
      if (j === 0) n.crossVectors(ref, tan).normalize();
      else n.addScaledVector(tan, -tan.dot(n)).normalize();
      bi.crossVectors(tan, n).normalize();
      // Taper, then round the tip closed.
      const tip = u > 0.9 ? Math.sqrt(Math.max(0, 1 - ((u - 0.9) / 0.1) ** 2)) : 1;
      const r = lerp(TAIL_ROOT_R, TAIL_TIP_R, u) * Math.max(0.12, tip);
      for (let k = 0; k <= radial; k++) {
        const th = (k / radial) * Math.PI * 2;
        dir.copy(n).multiplyScalar(Math.cos(th)).addScaledVector(bi, Math.sin(th));
        pos.push(p.x + dir.x * r, p.y + dir.y * r, p.z + dir.z * r);
        nor.push(dir.x, dir.y, dir.z);
      }
    }
    return { pos, nor };
  };
  const a = ring(TAIL_SLEEP);
  const b = ring(TAIL_AWAKE);
  const index: number[] = [];
  for (let j = 0; j < tubular; j++) {
    for (let k = 0; k < radial; k++) {
      const i0 = j * (radial + 1) + k;
      const i1 = (j + 1) * (radial + 1) + k;
      index.push(i0, i1, i0 + 1, i1, i1 + 1, i0 + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setIndex(index);
  g.setAttribute("position", new THREE.Float32BufferAttribute(a.pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(a.nor, 3));
  g.morphAttributes.position = [new THREE.Float32BufferAttribute(b.pos, 3)];
  g.morphAttributes.normal = [new THREE.Float32BufferAttribute(b.nor, 3)];
  g.computeBoundingSphere();
  // Cover both poses so frustum culling never drops the awake tail.
  if (g.boundingSphere) g.boundingSphere.radius += 0.25;
  return g;
}

/* ------------------------------------------------------------ helpers */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
const ease = (cur: number, want: number, rate: number, dt: number) => cur + (want - cur) * Math.min(1, dt * rate);
/** Wrap an angle to -PI..PI. */
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
/** Heading (rotation.y) that points the dog's nose (+x) from one floor point to another. */
const headingTo = (fx: number, fz: number, tx: number, tz: number) => Math.atan2(-(tz - fz), tx - fx);
const isAwakePhase = (p: Phase) => p === "day" || p === "dusk";

/** Hoisted scratch objects (no allocations inside useFrame). */
const camLocal = new THREE.Vector3();
const bubbleAt = new THREE.Vector3();
const furGlow = new THREE.Color();
/** Emissive added to the fur at full hover: enough to lift him, not enough to turn him grey. */
const FUR_HOVER = new THREE.Color(0.006, 0.01, 0.014);
/** Where the "yip!" bubble points, relative to the neck pivot (in the trunk frame): just above his head. */
const BUBBLE_OFFSET: [number, number, number] = [0.05, 0.24, 0];

const BUBBLE_HIDDEN = "translate(6px, -100%) scale(0.55)";
const BUBBLE_SHOWN = "translate(6px, -100%) scale(1)";

/**
 * The "yip!" speech bubble: plain DOM laid over the canvas and positioned from
 * useFrame (no React root per bubble, no re-renders). Never takes pointer events.
 */
function createBubble(): { root: HTMLDivElement; inner: HTMLDivElement } {
  const root = document.createElement("div");
  root.setAttribute("aria-hidden", "true");
  Object.assign(root.style, {
    position: "absolute",
    left: "0px",
    top: "0px",
    // Above the hover chip (which sits right over him while he is hovered).
    zIndex: "40",
    pointerEvents: "none",
    userSelect: "none",
    visibility: "hidden",
  });
  const inner = document.createElement("div");
  inner.textContent = "yip!";
  Object.assign(inner.style, {
    position: "relative",
    opacity: "0",
    transform: BUBBLE_HIDDEN,
    transformOrigin: "0% 100%",
    transition: "opacity 160ms ease-out, transform 240ms cubic-bezier(.3,1.6,.5,1)",
    whiteSpace: "nowrap",
    background: "#fffaf0",
    color: "#1a1f2a",
    fontFamily: "var(--font-fraunces), Georgia, serif",
    fontStyle: "italic",
    fontWeight: "600",
    fontSize: "18px",
    lineHeight: "1",
    padding: "8px 13px 9px",
    borderRadius: "14px",
    boxShadow: "0 6px 18px rgba(10, 14, 26, .28)",
    marginTop: "-10px",
  });
  const tail = document.createElement("span");
  Object.assign(tail.style, {
    position: "absolute",
    left: "7px",
    bottom: "-4px",
    width: "12px",
    height: "12px",
    background: "#fffaf0",
    transform: "rotate(45deg)",
    borderRadius: "2px",
  });
  inner.appendChild(tail);
  root.appendChild(inner);
  return { root, inner };
}

/* ------------------------------------------------------------ rig */

/** Trunk pivot height (dog-local): curled on the cushion, standing, sitting, play bow. */
const TRUNK_CURL_Y = 0.115;
const TRUNK_STAND_Y = 0.25;
const SIT_Y = 0.17;
const SIT_PITCH = 0.55;
const BOW_Y = 0.16;
const BOW_PITCH = -0.45;
/** Shoulder or hip pivot to the bottom of the paw, standing straight. */
const LEG = 0.2;

interface Morph {
  p0: THREE.Vector3;
  s0: THREE.Vector3;
  p1: THREE.Vector3;
  s1: THREE.Vector3;
}
const morph = (p0: number[], s0: number[], p1: number[], s1: number[]): Morph => ({
  p0: new THREE.Vector3().fromArray(p0),
  s0: new THREE.Vector3().fromArray(s0),
  p1: new THREE.Vector3().fromArray(p1),
  s1: new THREE.Vector3().fromArray(s1),
});

type CoatKey = "coat" | "tan" | "tanShade";

/**
 * Body pieces in the trunk frame, curled (p0, s0) to standing (p1, s1). The curled
 * values are the original sleeping pose; standing, the torso narrows and rounds,
 * the curl-side hip and thigh become the rump, and the tan chest moves to the front.
 */
const BODY: { r: number; ws: number; hs: number; mat: CoatKey; m: Morph }[] = [
  // Torso.
  { r: 0.2, ws: 22, hs: 16, mat: "coat", m: morph([-0.02, 0, 0], [0.96, 0.58, 0.76], [-0.02, 0, 0], [0.98, 0.64, 0.62]) },
  // Hip on the visible side, then the rump.
  { r: 0.1, ws: 16, hs: 12, mat: "coat", m: morph([-0.14, 0, 0.04], [1, 0.95, 1.05], [-0.15, -0.005, 0], [0.95, 0.92, 1.08]) },
  // Thigh on the visible side (tucks into the rump standing).
  { r: 0.08, ws: 14, hs: 10, mat: "coat", m: morph([-0.11, -0.015, 0.11], [1.15, 0.9, 0.62], [-0.12, -0.02, 0], [0.9, 0.8, 0.8]) },
  // Tan chest.
  { r: 0.085, ws: 14, hs: 10, mat: "tan", m: morph([0.12, -0.015, 0.065], [0.8, 0.95, 0.85], [0.135, -0.02, 0], [0.75, 1.05, 0.95]) },
  // Tan belly.
  { r: 0.1, ws: 14, hs: 10, mat: "tanShade", m: morph([-0.02, -0.05, 0.07], [1.2, 0.45, 0.7], [-0.01, -0.1, 0], [1.3, 0.4, 0.8]) },
  // Tan patch under the tail.
  { r: 0.03, ws: 10, hs: 8, mat: "tanShade", m: morph([-0.2, -0.03, 0.03], [0.7, 1, 1], [-0.205, 0, 0], [0.7, 1, 1]) },
  // Tan throat, bridging chest and chin standing (hidden in the chest curled).
  { r: 0.055, ws: 12, hs: 10, mat: "tan", m: morph([0.12, -0.02, 0.06], [0.8, 1.3, 0.9], [0.19, 0.05, 0], [0.8, 1.3, 0.9]) },
  // Scruff: the back of the neck.
  { r: 0.07, ws: 14, hs: 10, mat: "coat", m: morph([0.06, 0, 0.02], [1, 1, 0.85], [0.13, 0.085, 0], [1, 1, 0.85]) },
];

const TAIL_CURL = new THREE.Vector3(-0.215, -0.015, 0.03);
const TAIL_STAND = new THREE.Vector3(-0.21, 0.04, 0);
/** Neck pivot (trunk frame): asleep chin on the paws, awake in bed, standing. */
const NECK_ASLEEP: [number, number, number] = [0.15, -0.005, 0.08];
const NECK_AWAKE: [number, number, number] = [0.19, 0.085, 0.04];
const NECK_STAND: [number, number, number] = [0.17, 0.1, 0];

/** Legs: 0 front (+z), 1 front (-z), 2 hind (+z), 3 hind (-z). Standing pivots in the trunk frame. */
const LEG_STAND: [number, number, number][] = [
  [0.1, -0.05, 0.055],
  [0.1, -0.05, -0.055],
  [-0.14, -0.05, 0.06],
  [-0.14, -0.05, -0.06],
];
/** Curled front legs: offset in the paw-pillow frame (which yaws as he wakes) and a splay. */
const FRONT_CURL: [number, number, number, number][] = [
  [0.01, -0.087, 0.04, 0.1],
  [0, -0.087, -0.045, -0.1],
];
const FRONT_PILLOW: [number, number] = [0.12, 0.06];
/** Curled hind legs: pivot (trunk frame), yaw, length. The -z one is tucked out of sight. */
const HIND_CURL: [number, number, number, number, number][] = [
  [-0.053, -0.083, 0.125, 0.15, 0.52],
  [-0.07, -0.08, -0.03, -0.15, 0.52],
];
/** Gait phase offsets: trot moves diagonal pairs together; the gallop is a rotary bound. */
const TROT_OFF = [0, Math.PI, Math.PI, 0];
const GALLOP_OFF = [0, 0.35, Math.PI, Math.PI + 0.35];

/* ------------------------------------------------------------ roaming */

/**
 * Free-floor waypoints (world x, z, pick weight). Every edge below was checked
 * offline against the bean bag, TV stand, desk and chair, snake plant, arc lamp
 * base and his own bed (with 0.3 of clearance), so straight moves between
 * neighbors never clip furniture. Weighted toward the visible front right and the rug.
 */
const WP: readonly (readonly [number, number, number])[] = [
  [2.4, 0.3, 1.2], // 0 right of the rug, by the desk corner
  [3.7, 1.3, 1.2], // 1 right edge
  [3.5, 3.5, 1.2], // 2 front right corner
  [2.3, 2.9, 1.4], // 3 front right
  [0.9, 3.7, 1.2], // 4 front
  [-0.6, 2.7, 1.1], // 5 rug, front left
  [-0.5, 0.5, 1.1], // 6 rug, middle
  [-1.7, 1.3, 1], // 7 rug, left
  [-3.2, 1.1, 0.7], // 8 left, under the frames
  [-3.2, -1.2, 0.7], // 9 back left, under the window
  [-1.5, -1.5, 0.7], // 10 back, under the corkboard
  [0.7, -1.0, 0.8], // 11 back middle
  [3.8, -1.3, 0.9], // 12 back right, beside the desk
  [1.9, 1.15, 1.3], // 13 beside the bed (wake, bedtime, parking)
  [-0.9, 4.0, 1], // 14 front left
  [2.2, 4.1, 1.2], // 15 front
  [0.5, 0.05, 0.9], // 16 behind the bed
  [1.1, 2.75, 1.4], // 17 in front of the bed
];
const BESIDE = 13;
const EDGES: readonly [number, number][] = [
  [0, 1], [0, 13], [0, 16], [0, 12], [0, 11], [1, 2], [1, 3], [1, 13], [1, 12], [2, 3], [2, 15], [3, 17],
  [3, 15], [3, 13], [3, 4], [4, 17], [4, 15], [4, 5], [4, 14], [5, 14], [5, 7], [5, 17], [5, 6], [6, 7],
  [6, 16], [6, 10], [6, 11], [7, 8], [7, 10], [8, 9], [9, 10], [10, 11], [10, 16], [11, 12], [11, 16],
];
const ADJ: number[][] = WP.map(() => []);
for (const [p, q] of EDGES) {
  ADJ[p].push(q);
  ADJ[q].push(p);
}

/** World units per second. */
const TROT = 1.0;
const ZOOM = 2.4;
/** Awake snap: beside the bed, turned three-quarters to the overview camera. */
const SNAP_HEADING = -0.35;
/** Face the camera three-quarters on (so his profile and tail read), not head on. */
const FACE_OFFSET = 0.45;

type Mode = "sleep" | "wake" | "roam" | "bed";
type IdleKind = "sit" | "sniff" | "look";
const IDLE_KINDS: IdleKind[] = ["sit", "sniff", "look"];

/** Where he is and what he is doing (world units). Pose blends live in `Anim`. */
interface Brain {
  mode: Mode;
  /** Step inside the wake or bed sequence, and when it started. */
  step: number;
  stepT: number;
  x: number;
  z: number;
  heading: number;
  speed: number;
  /** World distance covered this frame (drives the gait). */
  moved: number;
  floorY: number;
  /** Lift above the floor in the dog frame (BED_TOP on the cushion). */
  elev: number;
  /** Last waypoint reached, the one walked to, and the one before (no backtracking). */
  node: number;
  to: number;
  prev: number;
  path: number[];
  walking: boolean;
  idle: IdleKind;
  idleUntil: number;
  zoom: boolean;
  lastZoom: number;
  pantUntil: number;
  holdUntil: number;
  /** Hop start (x, z), and the heading target of a turn or bed circle. */
  fromX: number;
  fromZ: number;
  turnFrom: number;
  turnTo: number;
  fxAwake: boolean;
  /** Reduced motion: parked beside the bed, sitting. */
  parked: boolean;
  /** Turning to face the camera (hysteresis, so camera parallax does not make him fidget). */
  facing: boolean;
}

const newBrain = (): Brain => ({
  mode: "sleep",
  step: 0,
  stepT: 0,
  x: ROOT[0],
  z: ROOT[2],
  heading: ORIENT,
  speed: 0,
  moved: 0,
  floorY: RUG_TOP,
  elev: BED_TOP,
  node: BESIDE,
  to: BESIDE,
  prev: -1,
  path: [],
  walking: false,
  idle: "look",
  idleUntil: 0,
  zoom: false,
  lastZoom: 0,
  pantUntil: 0,
  holdUntil: 0,
  fromX: 0,
  fromZ: 0,
  turnFrom: 0,
  turnTo: 0,
  fxAwake: false,
  parked: false,
  facing: false,
});

interface Anim {
  wake: number;
  eyes: number;
  lastAttention: number;
  wagPhase: number;
  wagAmp: number;
  wagSpeed: number;
  lookYaw: number;
  lookPitch: number;
  twitchAt: number[];
  twitchStart: number[];
  blinkAt: number;
  glow: number;
  bubbleOn: boolean;
  bubbleOffAt: number;
  tongue: number;
  lastPoke: number;
  mountT: number;
  /** Pose blends: 0 curled .. 1 standing; sit, play bow, sniff, look at the camera, airborne. */
  stand: number;
  sit: number;
  bow: number;
  sniff: number;
  lookCam: number;
  air: number;
  gaitPhase: number;
  gaitAmp: number;
  gallop: number;
  turning: boolean;
}

function pickNeighbor(node: number, avoid: number): number {
  const all = ADJ[node];
  let total = 0;
  for (const n of all) if (n !== avoid || all.length === 1) total += WP[n][2];
  let r = Math.random() * total;
  for (const n of all) {
    if (n === avoid && all.length > 1) continue;
    r -= WP[n][2];
    if (r <= 0) return n;
  }
  return all[all.length - 1];
}

/** Shortest hop route (breadth first), excluding `from`. Only runs at bedtime. */
function pathTo(from: number, goal: number): number[] {
  if (from === goal) return [];
  const prev = new Array<number>(WP.length).fill(-1);
  prev[from] = from;
  const queue = [from];
  for (let i = 0; i < queue.length; i++) {
    const n = queue[i];
    if (n === goal) break;
    for (const m of ADJ[n]) {
      if (prev[m] < 0) {
        prev[m] = n;
        queue.push(m);
      }
    }
  }
  const out: number[] = [];
  for (let n = goal; n !== from && n >= 0; n = prev[n]) out.unshift(n);
  return out;
}

/** Turn on the spot with little steps. Returns the angle still to go. */
function turnToward(a: Anim, b: Brain, want: number, rate: number, dt: number): number {
  const d = wrap(want - b.heading);
  if (Math.abs(d) < 0.02) return Math.abs(d);
  const step = clamp(d, -rate * dt, rate * dt);
  b.heading += step;
  a.gaitPhase += Math.abs(step) * 1.8;
  a.turning = true;
  return Math.abs(d - step);
}

/**
 * Turn to face the camera three-quarters on, only once it is well off to the
 * side, then all the way round. Returns the angle still to go.
 */
function faceCamera(a: Anim, b: Brain, want: number, rate: number, dt: number): number {
  const d = Math.abs(wrap(want - b.heading));
  if (!b.facing && d < 0.35) return d;
  b.facing = true;
  const left = turnToward(a, b, want, rate, dt);
  if (left < 0.03) b.facing = false;
  return left;
}

/**
 * Trot (or run) along the current edge toward `b.to`, then on along `b.path`.
 * Position only ever moves along the edge, so turning or stopping never leaves
 * the checked lines. Returns true on arriving at the end of the route.
 */
function walk(a: Anim, b: Brain, dt: number, held: boolean, top: number): boolean {
  const tx = WP[b.to][0];
  const tz = WP[b.to][1];
  let dx = tx - b.x;
  let dz = tz - b.z;
  const dist = Math.hypot(dx, dz);
  if (dist > 1e-5) {
    dx /= dist;
    dz /= dist;
  }
  const want = Math.atan2(-dz, dx);
  const dh = wrap(want - b.heading);
  const brake = b.zoom ? 4 : 2.5;
  if (held) {
    b.speed = Math.max(0, b.speed - 6 * dt);
  } else if (Math.abs(dh) > 0.5 && b.speed < 0.35) {
    // Big change of direction: turn in place first.
    b.speed = Math.max(0, b.speed - brake * dt);
    turnToward(a, b, want, 3.5, dt);
  } else {
    // Brake for the end of the route, or ease off for a sharp corner.
    let vEnd = 0;
    const next = b.path[0];
    if (next !== undefined) {
      const ex = WP[next][0] - tx;
      const ez = WP[next][1] - tz;
      const straight = (dx * ex + dz * ez) / (Math.hypot(ex, ez) || 1);
      vEnd = lerp(0.4, top, (straight + 1) / 2);
    }
    const target = Math.min(top, Math.sqrt(vEnd * vEnd + 2 * brake * dist));
    b.speed =
      b.speed < target ? Math.min(target, b.speed + (b.zoom ? 5 : 2.5) * dt) : Math.max(target, b.speed - 2 * brake * dt);
    b.heading += dh * Math.min(1, dt * (b.zoom ? 9 : 6));
  }
  const step = Math.min(b.speed * dt, dist);
  b.x += dx * step;
  b.z += dz * step;
  b.moved += step;
  if (dist - step > 0.004) return false;
  b.x = tx;
  b.z = tz;
  b.prev = b.node;
  b.node = b.to;
  const nextNode = b.path.shift();
  if (nextNode !== undefined) {
    b.to = nextNode;
    return false;
  }
  b.walking = false;
  b.speed = 0;
  return true;
}

function startIdle(b: Brain, kind: IdleKind, t: number, secs: number): void {
  b.walking = false;
  b.facing = false;
  b.idle = kind;
  b.idleUntil = t + secs;
}

/** Leave a waypoint: sometimes zoomies (a fast lap through 3 to 5 waypoints), else trot to a neighbor. */
function nextMove(b: Brain, t: number): void {
  const since = t - b.lastZoom;
  b.path.length = 0;
  b.facing = false;
  if (since > 38 || (since > 12 && Math.random() < 0.22)) {
    let cur = b.node;
    let prv = b.prev;
    const laps = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < laps; i++) {
      const nx = pickNeighbor(cur, prv);
      b.path.push(nx);
      prv = cur;
      cur = nx;
    }
    b.zoom = true;
    b.lastZoom = t;
    b.to = b.path.shift() ?? b.node;
  } else {
    b.zoom = false;
    b.to = pickNeighbor(b.node, b.prev);
  }
  b.walking = b.to !== b.node;
}

function onArrive(b: Brain, t: number, held: boolean): void {
  if (b.zoom) {
    b.zoom = false;
    b.pantUntil = t + 3.5;
    startIdle(b, "look", t, 2 + Math.random());
  } else if (held || Math.random() < 0.55) {
    startIdle(b, held ? "look" : IDLE_KINDS[Math.floor(Math.random() * 3)], t, 2 + Math.random() * 4);
  } else {
    nextMove(b, t);
  }
}

function setStep(b: Brain, step: number, t: number): void {
  b.step = step;
  b.stepT = t;
}

/** Awake, no animation: standing (or sitting) beside the bed. */
function snapAwake(a: Anim, b: Brain, t: number, sit: boolean, parked: boolean): void {
  b.mode = "roam";
  setStep(b, 0, t);
  b.x = WP[BESIDE][0];
  b.z = WP[BESIDE][1];
  b.heading = SNAP_HEADING;
  b.speed = 0;
  b.elev = 0;
  b.floorY = RUG_TOP;
  b.node = BESIDE;
  b.to = BESIDE;
  b.prev = -1;
  b.path.length = 0;
  b.zoom = false;
  b.parked = parked;
  b.fxAwake = true;
  startIdle(b, sit ? "sit" : "look", t, 1.5 + Math.random() * 1.5);
  a.stand = 1;
  a.sit = sit ? 1 : 0;
  a.bow = 0;
  a.sniff = 0;
  a.air = 0;
  a.lookCam = 1;
  a.wake = 1;
  a.eyes = 1;
  a.lastAttention = t;
}

/** Asleep, no animation: curled in bed exactly as the original pose. */
function snapAsleep(a: Anim, b: Brain, t: number): void {
  b.mode = "sleep";
  setStep(b, 0, t);
  b.x = ROOT[0];
  b.z = ROOT[2];
  b.heading = ORIENT;
  b.speed = 0;
  b.elev = BED_TOP;
  b.floorY = RUG_TOP;
  b.path.length = 0;
  b.walking = false;
  b.zoom = false;
  b.parked = false;
  b.fxAwake = false;
  a.stand = 0;
  a.sit = 0;
  a.bow = 0;
  a.sniff = 0;
  a.air = 0;
  a.lookCam = 1;
  a.wake = 0;
  a.eyes = 0;
}

/** Bedtime: finish the current edge, then take the shortest route to the spot beside the bed. */
function startBed(b: Brain, t: number): void {
  b.mode = "bed";
  setStep(b, 0, t);
  b.zoom = false;
  if (b.walking) {
    b.path = pathTo(b.to, BESIDE);
  } else {
    b.path = pathTo(b.node, BESIDE);
    const first = b.path.shift();
    if (first !== undefined) {
      b.to = first;
      b.walking = true;
    }
  }
}

/** Hop between the floor and the cushion (u 0..1), with a little arc. */
function hopAlong(a: Anim, b: Brain, u: number, e0: number, e1: number, tx: number, tz: number): void {
  b.x = lerp(b.fromX, tx, u);
  b.z = lerp(b.fromZ, tz, u);
  b.elev = lerp(e0, e1, u) + Math.sin(u * Math.PI) * 0.13;
  a.air = Math.sin(u * Math.PI);
}

/** One full-ish turn on the cushion that ends exactly at ORIENT. */
function circleTarget(from: number): number {
  let pos = ORIENT + Math.round((from - ORIENT) / TAU) * TAU;
  while (pos < from + 1.2 * Math.PI) pos += TAU;
  let neg = pos;
  while (neg > from - 1.2 * Math.PI) neg -= TAU;
  return pos - from <= from - neg ? pos : neg;
}

/* ------------------------------------------------------------ materials */

interface Materials {
  coat: THREE.MeshPhysicalMaterial;
  lift: THREE.MeshPhysicalMaterial;
  tan: THREE.MeshPhysicalMaterial;
  tanShade: THREE.MeshPhysicalMaterial;
  muzzle: THREE.MeshPhysicalMaterial;
  innerEar: THREE.MeshStandardMaterial;
  nose: THREE.MeshStandardMaterial;
  eye: THREE.MeshStandardMaterial;
  glint: THREE.MeshBasicMaterial;
  tongue: THREE.MeshStandardMaterial;
}

function makeMaterials(): Materials {
  // Black fur that still reads in the dark: not pure black, a velvet sheen that
  // catches grazing light on the silhouette, and a whisper of emissive lift.
  // The tan points get the same treatment with a warm sheen and a warm dark lift.
  const fur = (color: string, lift: string, sheenColor = "#5f6482", sheen = 0.8) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.62,
      metalness: 0,
      sheen,
      sheenColor: new THREE.Color(sheenColor),
      sheenRoughness: 0.42,
      emissive: new THREE.Color(lift),
      emissiveIntensity: 1,
      userData: { baseEmissive: new THREE.Color(lift) },
    });
  return {
    coat: fur(TEEKO.coat, "#0a090e"),
    lift: fur(TEEKO.coatLift, "#0d0b11"),
    tan: fur(TEEKO.tan, "#1a110a", "#e6c08f", 0.5),
    tanShade: fur(TEEKO.tanShade, "#140d08", "#d2a577", 0.5),
    muzzle: fur(TEEKO.muzzle, "#1a110a", "#e6c08f", 0.5),
    innerEar: new THREE.MeshStandardMaterial({ color: TEEKO.innerEar, roughness: 0.75, emissive: "#170e0f" }),
    nose: new THREE.MeshStandardMaterial({ color: TEEKO.nose, roughness: 0.22 }),
    eye: new THREE.MeshStandardMaterial({ color: TEEKO.eye, roughness: 0.08 }),
    glint: new THREE.MeshBasicMaterial({ color: TEEKO.eyeHighlight, toneMapped: false }),
    tongue: new THREE.MeshStandardMaterial({ color: TEEKO.tongue, roughness: 0.5 }),
  };
}

/* ------------------------------------------------------------ parts */

function Ear({ side, mats, pivot }: { side: 1 | -1; mats: Materials; pivot: (g: THREE.Group | null) => void }) {
  return (
    <group ref={pivot} position={[-0.025, 0.06, side * 0.05]} rotation={[0, -side * 0.4, 0]}>
      {/* Big upright triangle, flattened so its broad face looks forward. */}
      <mesh geometry={cone(0.068, 0.2)} material={mats.coat} position={[0, 0.1, 0]} scale={[0.45, 1, 1]} />
      <mesh geometry={cone(0.048, 0.15)} material={mats.innerEar} position={[0.017, 0.083, 0]} scale={[0.25, 1, 1]} />
    </group>
  );
}

function Eye({
  side,
  mats,
  lidMat,
  ball,
  lid,
}: {
  side: 1 | -1;
  mats: Materials;
  lidMat: THREE.Material;
  ball: (g: THREE.Group | null) => void;
  lid: (m: THREE.Mesh | null) => void;
}) {
  return (
    <group position={[0.064, 0.014, side * 0.061]} rotation={[0, -side * 0.55, 0]}>
      {/* Socket: a slightly lighter ring so the dark eye separates from the coat. */}
      <group ref={ball}>
        <mesh geometry={sphere(0.031, 14, 10)} material={mats.lift} scale={[0.4, 1, 1]} />
        <mesh geometry={sphere(0.027, 16, 12)} material={mats.eye} position={[0.009, 0, 0]} />
        <mesh geometry={sphere(0.0095, 8, 6)} material={mats.glint} position={[0.03, 0.011, -side * 0.006]} />
        <mesh geometry={sphere(0.0045, 6, 4)} material={mats.glint} position={[0.033, -0.009, side * 0.008]} />
      </group>
      {/* Closed eye: a content downward curve. */}
      <mesh ref={lid} geometry={torus(0.019, 0.0048, Math.PI, 5, 10)} material={lidMat} position={[0.028, 0.004, 0]} rotation={[Math.PI, Math.PI / 2, 0]} />
    </group>
  );
}

/**
 * One leg on a shoulder or hip pivot, hanging down its local -y: black upper leg
 * (a thicker thigh behind), tan forearm or hock, tan paw. The limb group stretches
 * (length), the paw group stays level with the ground.
 */
function Leg({
  mats,
  hind,
  pivot,
  limb,
  paw,
}: {
  mats: Materials;
  hind: boolean;
  pivot: (g: THREE.Group | null) => void;
  limb: (g: THREE.Group | null) => void;
  paw: (g: THREE.Group | null) => void;
}) {
  return (
    <group ref={pivot} rotation={[0, 0, 0, "YZX"]}>
      <group ref={limb}>
        <mesh geometry={hind ? capsule(0.032, 0.05) : capsule(0.025, 0.065)} material={mats.coat} position={[0, -0.045, 0]} />
        <mesh geometry={capsule(0.018, 0.075)} material={mats.tan} position={[0, -0.13, 0]} />
      </group>
      <group ref={paw} position={[0, -0.185, 0]}>
        <mesh geometry={sphere(0.024, 10, 8)} material={mats.tan} position={[0.012, 0, 0]} scale={[1.35, 0.7, 1]} />
      </group>
    </group>
  );
}

function DogBed() {
  const rim = std(TEEKO.bed, { roughness: 0.9 });
  const cushion = std(TEEKO.bedCushion, { roughness: 0.95 });
  const bone = std("#f1e6d2", { roughness: 0.7 });
  return (
    <group>
      <mesh geometry={cylinder(0.46, 0.48, 0.05, 28)} material={rim} position={[0, 0.025, 0]} castShadow receiveShadow />
      <mesh geometry={torus(0.4, 0.085, Math.PI * 2, 10, 28)} material={rim} position={[0, 0.085, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.85]} castShadow receiveShadow />
      <mesh geometry={cylinder(0.37, 0.37, 0.05, 28)} material={cushion} position={[0, 0.06, 0]} receiveShadow />
      {/* A little chew bone beside the bed. */}
      <group position={[0.42, 0.02, 0.42]} rotation={[0, 0.9, 0]}>
        <mesh geometry={capsule(0.018, 0.12)} material={bone} rotation={[0, 0, Math.PI / 2]} castShadow />
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <mesh key={`${sx}${sz}`} geometry={sphere(0.024, 10, 8)} material={bone} position={[sx * 0.078, 0.004, sz * 0.02]} castShadow />
          )),
        )}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------ Teeko */

export function Teeko() {
  const store = useRoomStore();
  const fontsReady = useFontsReady();
  const mats = useMemo(() => makeMaterials(), []);
  const tailGeo = useMemo(() => buildTailGeometry(), []);
  const furMats = useMemo(() => [mats.coat, mats.lift, mats.tan, mats.tanShade, mats.muzzle], [mats]);

  const dog = useRef<THREE.Group>(null);
  const hop = useRef<THREE.Group>(null);
  const trunk = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const bodyParts = useRef<(THREE.Mesh | null)[]>(BODY.map(() => null));
  const legPivots = useRef<(THREE.Group | null)[]>([null, null, null, null]);
  const legLimbs = useRef<(THREE.Group | null)[]>([null, null, null, null]);
  const legPaws = useRef<(THREE.Group | null)[]>([null, null, null, null]);
  const neck = useRef<THREE.Group>(null);
  const ears = useRef<(THREE.Group | null)[]>([null, null]);
  const eyeBalls = useRef<(THREE.Group | null)[]>([null, null]);
  const lids = useRef<(THREE.Mesh | null)[]>([null, null]);
  const nose = useRef<THREE.Mesh>(null);
  const tongue = useRef<THREE.Mesh>(null);
  const tailWag = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Mesh>(null);
  const zzz = useRef<(THREE.Sprite | null)[]>([null, null, null]);
  const rim = useRef<THREE.PointLight>(null);
  const blob = useRef<THREE.Mesh>(null);
  const bubble = useRef<{ root: HTMLDivElement; inner: HTMLDivElement } | null>(null);
  const gl = useThree((st) => st.gl);

  const brain = useRef<Brain>(newBrain());
  const anim = useRef<Anim>({
    wake: 0,
    eyes: 0,
    lastAttention: -100,
    wagPhase: 0,
    wagAmp: 0,
    wagSpeed: 0,
    lookYaw: 0,
    lookPitch: 0,
    twitchAt: [3, 6],
    twitchStart: [-10, -10],
    blinkAt: 2,
    glow: 0,
    bubbleOn: false,
    bubbleOffAt: -10,
    tongue: 0,
    lastPoke: 0,
    mountT: -1,
    stand: 0,
    sit: 0,
    bow: 0,
    sniff: 0,
    lookCam: 1,
    air: 0,
    gaitPhase: 0,
    gaitAmp: 0,
    gallop: 0,
    turning: false,
  });

  // Decide asleep or awake at mount and publish his position right away, so the
  // camera (which snaps on mount, e.g. a direct load of /about#teeko during the
  // day) and the pick box already frame the right spot before the first frame.
  const [startAwake] = useState(() => {
    const awake = isAwakePhase(store.getState().phase);
    const fx = store.fx.teeko;
    fx.x = awake ? WP[BESIDE][0] : ROOT[0];
    fx.z = awake ? WP[BESIDE][1] : ROOT[2];
    fx.heading = awake ? SNAP_HEADING : ORIENT;
    fx.awake = awake;
    return awake;
  });

  const zTex = useMemo(
    () =>
      createCanvasTexture(64, 64, (g, w) => {
        g.clearRect(0, 0, w, w);
        g.font = canvasFont("display", 44, 600, "italic");
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.lineJoin = "round";
        g.lineWidth = 5;
        g.strokeStyle = "rgba(26,31,42,.45)";
        g.strokeText("z", w / 2, w / 2);
        g.fillStyle = "#f7f2e8";
        g.fillText("z", w / 2, w / 2);
      }),
    [],
  );
  const zMats = useMemo(
    () =>
      [0, 1, 2].map(
        () => new THREE.SpriteMaterial({ map: zTex, transparent: true, opacity: 0, depthWrite: false }),
      ),
    [zTex],
  );
  const lidMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8a7a74", roughness: 0.7, emissive: "#2a2220" }), []);
  // Soft contact shadow: he no longer casts into the static shadow map, so a
  // dark radial blob follows him instead (oval along his length when standing).
  const blobTex = useMemo(
    () =>
      createCanvasTexture(64, 64, (g, w) => {
        const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
        gr.addColorStop(0, "rgba(255,255,255,1)");
        gr.addColorStop(0.45, "rgba(255,255,255,.6)");
        gr.addColorStop(1, "rgba(255,255,255,0)");
        g.clearRect(0, 0, w, w);
        g.fillStyle = gr;
        g.fillRect(0, 0, w, w);
      }),
    [],
  );
  const blobMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#000000",
        map: blobTex,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    [blobTex],
  );

  useEffect(() => {
    const parent = gl.domElement.parentElement;
    if (!parent) return;
    const b = createBubble();
    parent.appendChild(b.root);
    bubble.current = b;
    return () => {
      b.root.remove();
      bubble.current = null;
    };
  }, [gl]);

  useEffect(() => {
    if (fontsReady) redraw(zTex);
  }, [fontsReady, zTex]);

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
      zMats.forEach((m) => m.dispose());
      zTex.dispose();
      lidMat.dispose();
      blobMat.dispose();
      blobTex.dispose();
      tailGeo.dispose();
    },
    [mats, zMats, zTex, lidMat, blobMat, blobTex, tailGeo],
  );

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const t = state.clock.elapsedTime;
    const s = store.getState();
    const a = anim.current;
    const b = brain.current;
    const rm = s.reducedMotion;
    const now = performance.now();
    const cam = state.camera.position;

    const pokeAgo = s.teekoPokedAt ? (now - s.teekoPokedAt) / 1000 : Infinity;
    if (s.teekoPokedAt !== a.lastPoke) {
      a.lastPoke = s.teekoPokedAt;
      a.blinkAt = t + 2.5;
    }
    const poked = pokeAgo < 3;
    const open = s.openSpot === "teeko";
    const hover = s.hoveredSpot === "teeko" || s.navFocus === "teeko";

    /* ---- day or night: snap on the first resolution after mount (and under
       reduced motion); otherwise walk to bed or wake up, once the panel is closed */
    if (a.mountT < 0) {
      a.mountT = t;
      if (startAwake) snapAwake(a, b, t, open || rm, rm);
      else snapAsleep(a, b, t);
    }
    const wantAwake = isAwakePhase(s.phase);
    if (t - a.mountT < 1.2 || (rm && !open)) {
      if (wantAwake) {
        if (b.mode !== "roam" || (rm && !b.parked)) snapAwake(a, b, t, open || rm, rm);
      } else if (b.mode !== "sleep") {
        snapAsleep(a, b, t);
      }
    } else if (!open) {
      if (wantAwake && b.mode === "sleep") {
        b.mode = "wake";
        setStep(b, 0, t);
      } else if (wantAwake && b.mode === "bed" && b.step === 0) {
        // Changed his mind on the way to bed: finish the current edge and carry on.
        b.mode = "roam";
        b.path.length = 0;
      } else if (!wantAwake && b.mode === "roam") {
        startBed(b, t);
      }
    }

    /* ---- attention: hover, nav focus, a poke or his open panel stop him; he
       resumes ~1.5 s after it ends */
    if (hover || open || pokeAgo < 1.6) b.holdUntil = t + 1.5;
    const held = t < b.holdUntil;
    const camH = headingTo(b.x, b.z, cam.x, cam.z) + FACE_OFFSET;

    /* ---- behavior: sets position, heading, elevation and the pose wants */
    let standW = 1;
    let sitW = 0;
    let bowW = 0;
    let sniffW = 0;
    let lookW = 1;
    a.turning = false;
    a.air = 0;
    b.moved = 0;
    const st = t - b.stepT;

    if (b.mode === "sleep") {
      standW = 0;
    } else if (b.mode === "wake") {
      // Eyes open, stand up on the cushion, play bow stretch, hop off beside the bed.
      if (b.step === 0) {
        standW = 0;
        if (st > (a.wake > 0.9 ? 0.25 : 0.8)) setStep(b, 1, t);
      } else if (b.step === 1) {
        a.stand = smooth(st / 0.8);
        standW = a.stand;
        b.fxAwake = true;
        if (st >= 0.8) setStep(b, 2, t);
      } else if (b.step === 2) {
        a.bow = smooth(st / 0.35) * (1 - smooth((st - 0.8) / 0.4));
        bowW = a.bow;
        lookW = 0.4;
        // Stays up on the bed while his panel is open (the camera framed him there).
        if (st >= 1.2 && !open) {
          setStep(b, 3, t);
          b.turnTo = headingTo(b.x, b.z, WP[BESIDE][0], WP[BESIDE][1]);
        }
      } else if (b.step === 3) {
        lookW = 0;
        if (turnToward(a, b, b.turnTo, 3, dt) < 0.03) {
          setStep(b, 4, t);
          b.fromX = b.x;
          b.fromZ = b.z;
        }
      } else {
        lookW = 0;
        const u = clamp01(st / 0.6);
        hopAlong(a, b, u, BED_TOP, 0, WP[BESIDE][0], WP[BESIDE][1]);
        if (u >= 1) {
          b.mode = "roam";
          b.elev = 0;
          b.node = BESIDE;
          b.to = BESIDE;
          b.prev = -1;
          b.path.length = 0;
          startIdle(b, "look", t, 1 + Math.random());
        }
      }
    } else if (b.mode === "roam") {
      if (!rm && b.parked) b.parked = false;
      if (rm) {
        // Reduced motion: no roaming, he sits beside the bed and watches.
        sitW = 1;
      } else if (b.walking) {
        const arrived = walk(a, b, dt, held, b.zoom ? ZOOM : TROT);
        lookW = held ? 1 : 0;
        if (held && b.speed < 0.25 && faceCamera(a, b, camH, 3, dt) < 0.4 && open) sitW = 1;
        if (arrived) onArrive(b, t, held);
      } else if (held) {
        if (faceCamera(a, b, camH, 3, dt) < 0.4 && open) sitW = 1;
        b.idleUntil = Math.max(b.idleUntil, t + 0.6);
      } else {
        if (b.idle === "sniff") {
          sniffW = 1;
          lookW = 0;
        } else if (faceCamera(a, b, camH, 2.2, dt) < 0.4 && b.idle === "sit") {
          sitW = 1;
        }
        if (t > b.idleUntil) nextMove(b, t);
      }
    } else {
      // Bedtime: trot to the bed, hop on, turn a circle, lie down.
      if (b.step === 0) {
        lookW = held ? 1 : 0;
        if (b.walking) {
          walk(a, b, dt, held, TROT);
          if (held && b.speed < 0.25) faceCamera(a, b, camH, 3, dt);
        }
        if (!b.walking) {
          if (b.node !== BESIDE) {
            startBed(b, t);
          } else if (!held) {
            setStep(b, 1, t);
          } else {
            faceCamera(a, b, camH, 3, dt);
          }
        }
      } else if (b.step === 1) {
        lookW = 0;
        if (turnToward(a, b, headingTo(b.x, b.z, ROOT[0], ROOT[2]), 3, dt) < 0.03 && !open) {
          setStep(b, 2, t);
          b.fromX = b.x;
          b.fromZ = b.z;
        }
      } else if (b.step === 2) {
        lookW = 0;
        const u = clamp01(st / 0.7);
        hopAlong(a, b, u, 0, BED_TOP, ROOT[0], ROOT[2]);
        if (u >= 1) {
          setStep(b, 3, t);
          b.elev = BED_TOP;
          b.turnFrom = b.heading;
          b.turnTo = circleTarget(b.heading);
        }
      } else if (b.step === 3) {
        lookW = 0;
        const u = clamp01(st / 2.2);
        const h = lerp(b.turnFrom, b.turnTo, smooth(u));
        a.gaitPhase += Math.abs(h - b.heading) * 1.6;
        a.turning = true;
        b.heading = h;
        const r = 0.06 * Math.sin(u * Math.PI);
        b.x = ROOT[0] - Math.cos(h) * r;
        b.z = ROOT[2] + Math.sin(h) * r;
        if (u >= 1) {
          b.heading = ORIENT;
          b.x = ROOT[0];
          b.z = ROOT[2];
          b.fxAwake = false;
          setStep(b, 4, t);
        }
      } else {
        a.stand = 1 - smooth(st / 1.1);
        standW = a.stand;
        if (st >= 1.1) b.mode = "sleep";
      }
    }
    if (!(b.mode === "bed" && b.step === 3)) b.heading = wrap(b.heading);

    const onRug = ((b.x + 0.4) / 2.6) ** 2 + ((b.z - 1.15) / 1.95) ** 2 < 1;
    b.floorY = ease(b.floorY, onRug ? RUG_TOP : 0, 25, dt);

    const fxT = store.fx.teeko;
    fxT.x = b.x;
    fxT.z = b.z;
    fxT.heading = b.heading;
    fxT.awake = b.fxAwake;

    /* ---- pose blends and gait */
    const pr = rm ? 10 : 4;
    a.stand = ease(a.stand, standW, rm ? 10 : 3, dt);
    a.sit = ease(a.sit, sitW, pr, dt);
    a.bow = ease(a.bow, bowW, pr, dt);
    a.sniff = ease(a.sniff, sniffW, pr, dt);
    a.lookCam = ease(a.lookCam, lookW, 4, dt);
    a.gallop = ease(a.gallop, clamp01((b.speed - 1.3) / 0.9), 4, dt);
    // Stride (dog-local units per cycle): a quick trot, a longer bounding run.
    a.gaitPhase += (b.moved / SCALE / lerp(0.3, 0.5, a.gallop)) * TAU;
    a.gaitAmp = ease(a.gaitAmp, b.speed > 0.04 ? clamp01(b.speed / 0.5) : a.turning ? 0.5 : 0, 8, dt);
    const gp = a.gaitPhase;
    const ga = a.gaitAmp;
    const s1 = a.stand;

    /* ---- wake level: fast to rise, lingers, then slowly settles */
    const want = poked || open || b.mode !== "sleep" ? 1 : hover ? 0.62 : 0;
    if (want > 0) a.lastAttention = t;
    if (want >= a.wake) a.wake = ease(a.wake, want, rm ? 10 : poked ? 9 : 4, dt);
    else if (t - a.lastAttention > 2.5) a.wake = ease(a.wake, want, rm ? 3 : 0.9, dt);
    if (Math.abs(a.wake - want) < 0.001) a.wake = want;
    const w = a.wake;
    const lift = smooth(w / 0.6);

    /* ---- place the dog and the trunk (bob, sit, bow, gallop rock) */
    const dg = dog.current;
    if (dg) {
      dg.position.set(b.x, b.floorY, b.z);
      dg.rotation.y = b.heading;
    }
    const bob = (-Math.cos(gp * 2) * 0.007 * (1 - a.gallop) + Math.sin(gp) * 0.02 * a.gallop) * ga;
    const rock = Math.sin(gp + 0.8) * 0.12 * a.gallop * ga;
    const tyStand =
      TRUNK_STAND_Y + (SIT_Y - TRUNK_STAND_Y) * a.sit + (BOW_Y - TRUNK_STAND_Y) * a.bow - 0.02 * a.sniff + bob;
    const pitch = (SIT_PITCH * a.sit + BOW_PITCH * a.bow - 0.12 * a.sniff + rock) * s1;
    const ty = lerp(TRUNK_CURL_Y, tyStand, s1);
    const tr = trunk.current;
    if (tr) {
      tr.position.set(0, ty, 0);
      tr.rotation.z = pitch;
    }
    for (let i = 0; i < BODY.length; i++) {
      const m = bodyParts.current[i];
      if (!m) continue;
      const mo = BODY[i].m;
      m.position.lerpVectors(mo.p0, mo.p1, s1);
      m.scale.lerpVectors(mo.s0, mo.s1, s1);
    }

    /* ---- breathing (slow and deep asleep, quicker awake) */
    const bd = body.current;
    if (bd) {
      const rate = lerp(1.7, 3.4, w);
      const depth = rm ? 0.012 : lerp(0.04, 0.025, w);
      const br = Math.sin(t * rate) * depth;
      bd.scale.set(1 + br * 0.3, 1 + br, 1 + br * 0.6);
    }

    /* ---- legs: tucked in the curl, straight under him standing; trot or gallop
       swing by distance, folded for sit (hind) and play bow (front) */
    const yawF = lerp(-0.85, 0, lift);
    const cyF = Math.cos(yawF);
    const syF = Math.sin(yawF);
    const sinP = Math.sin(pitch);
    const cosP = Math.cos(pitch);
    const swingAmp = lerp(0.42, 0.68, a.gallop) * ga;
    const liftAmp = lerp(0.16, 0.24, a.gallop) * ga;
    for (let i = 0; i < 4; i++) {
      const pv = legPivots.current[i];
      if (!pv) continue;
      const hind = i >= 2;
      const sp = LEG_STAND[i];
      const ph = gp + lerp(TROT_OFF[i], GALLOP_OFF[i], a.gallop);
      const swing = Math.sin(ph) * swingAmp * (hind ? 0.85 : 1);
      const raise = Math.max(0, Math.cos(ph)) * liftAmp;
      const fold = hind ? a.sit : a.bow;
      const ang = swing + fold * 1.3 + (hind ? -0.5 : 0.55) * a.air;
      // Pivot height over the ground: the leg stretches so the paw stays planted.
      const hy = ty + sp[0] * sinP + sp[1] * cosP;
      const kv = clamp(hy / (LEG * Math.cos(swing)), 0.45, 1.3);
      const k = lerp(lerp(kv, 0.75, fold), 0.8, a.air) * (1 - raise);
      let cx: number;
      let cy: number;
      let cz: number;
      let cYaw: number;
      let cK: number;
      if (!hind) {
        const o = FRONT_CURL[i];
        cx = FRONT_PILLOW[0] + o[0] * cyF + o[2] * syF;
        cy = o[1];
        cz = FRONT_PILLOW[1] - o[0] * syF + o[2] * cyF;
        cYaw = yawF + o[3];
        cK = 0.78;
      } else {
        const o = HIND_CURL[i - 2];
        cx = o[0];
        cy = o[1];
        cz = o[2];
        cYaw = o[3];
        cK = o[4];
      }
      pv.position.set(lerp(cx, sp[0], s1), lerp(cy, sp[1], s1), lerp(cz, sp[2], s1));
      pv.rotation.set(0, lerp(cYaw, 0, s1), lerp(Math.PI / 2, ang - pitch, s1));
      const kk = lerp(cK, k, s1);
      const lb = legLimbs.current[i];
      if (lb) lb.scale.y = kk;
      const pw = legPaws.current[i];
      if (pw) {
        pw.position.y = -0.185 * kk;
        pw.rotation.z = -pv.rotation.z - pitch;
      }
    }

    /* ---- tail root follows the rump */
    const tw = tailWag.current;
    if (tw) tw.position.lerpVectors(TAIL_CURL, TAIL_STAND, s1);

    /* ---- head: rests on the paws asleep; looks at the camera when attentive,
       ahead while trotting, down at the floor while sniffing */
    const n = neck.current;
    if (n && tr) {
      camLocal.copy(cam);
      tr.worldToLocal(camLocal);
      const dx = camLocal.x - n.position.x;
      const dy = camLocal.y - n.position.y;
      const dz = camLocal.z - n.position.z;
      const camYaw = clamp(-Math.atan2(dz, dx), lerp(-1.25, -1.1, s1), lerp(0.6, 1.1, s1));
      const camPitch = clamp(Math.atan2(dy, Math.hypot(dx, dz)) * 0.7, -0.2, 0.55);
      const lc = a.lookCam;
      const fwdYaw = rm ? 0 : Math.sin(t * 1.3) * 0.3 * a.sniff;
      const fwdPitch = 0.05 + Math.sin(gp * 2) * 0.04 * ga - 0.95 * a.sniff - pitch;
      const lookRate = lerp(8, 3, lc);
      a.lookYaw = ease(a.lookYaw, lerp(fwdYaw, camYaw, lc), lookRate, dt);
      a.lookPitch = ease(a.lookPitch, lerp(fwdPitch, camPitch, lc), lookRate, dt);
      const up = Math.max(lift, s1);
      n.position.set(
        lerp(lerp(NECK_ASLEEP[0], NECK_AWAKE[0], lift), NECK_STAND[0] + 0.01 * a.sniff, s1),
        lerp(lerp(NECK_ASLEEP[1], NECK_AWAKE[1], lift), NECK_STAND[1] - 0.12 * a.sniff, s1),
        lerp(lerp(NECK_ASLEEP[2], NECK_AWAKE[2], lift), NECK_STAND[2], s1),
      );
      // Asleep: head turned in toward the curl, chin down on the paws.
      const breathNod = rm ? 0 : Math.sin(t * 1.7) * 0.02 * (1 - up);
      n.rotation.y = lerp(-1.3, a.lookYaw, up);
      n.rotation.z = lerp(-0.2 + breathNod, a.lookPitch, up);
      // A curious head tilt when he is fully awake and watching.
      n.rotation.x = lerp(0, 0.18 * Math.sin(t * 0.8) * (rm ? 0 : 1), smooth((w - 0.7) / 0.3)) * lc;
    }

    /* ---- nose twitch while sniffing */
    const ns = nose.current;
    if (ns) {
      const tw2 = rm ? 0 : a.sniff * Math.max(0, Math.sin(t * 26)) * (Math.sin(t * 3) > 0 ? 0.14 : 0);
      ns.scale.set(0.9 * (1 + tw2), 0.8 * (1 + tw2 * 0.5), 1.15);
    }

    /* ---- ears: relaxed back asleep, perked when awake; random twitches; they
       bounce with the trot and fold back at a run */
    for (let i = 0; i < 2; i++) {
      const ear = ears.current[i];
      if (!ear) continue;
      const side = i === 0 ? 1 : -1;
      if (t > a.twitchAt[i]) {
        a.twitchStart[i] = t;
        a.twitchAt[i] = t + 2.5 + Math.random() * 6;
      }
      const tt = t - a.twitchStart[i];
      const twitch = rm || tt > 0.45 ? 0 : Math.sin(tt * 28) * Math.exp(-tt * 7) * 0.35;
      const perk = smooth(w / 0.5);
      const bounce = Math.sin(gp * 2) * 0.1 * ga;
      ear.rotation.x = side * (lerp(0.7, 0.6, perk) + twitch + bounce);
      ear.rotation.z = lerp(0.95, 0.05, perk) + twitch * 0.6 + a.gallop * ga * 0.5;
    }

    /* ---- eyes: curved lids asleep, big and shiny awake, occasional blink */
    const eyeWant = w > 0.3 ? 1 : 0;
    a.eyes = ease(a.eyes, eyeWant, eyeWant ? 7 : 3, dt);
    let blink = 1;
    if (a.eyes > 0.9) {
      if (t > a.blinkAt) a.blinkAt = t + 2.5 + Math.random() * 3.5;
      const bt = a.blinkAt - t;
      if (bt < 0.14) blink = Math.abs(bt - 0.07) / 0.07;
    }
    const openness = Math.max(0.06, a.eyes * blink);
    for (let i = 0; i < 2; i++) {
      const eb = eyeBalls.current[i];
      if (eb) {
        eb.scale.set(1, openness, 1);
        eb.visible = openness > 0.12;
      }
      const lid = lids.current[i];
      if (lid) {
        const l = clamp01(1 - a.eyes * 1.6);
        lid.visible = l > 0.02;
        lid.scale.setScalar(Math.max(0.001, l));
      }
    }

    /* ---- tongue: blep while he yips, panting during and after zoomies */
    const panting = b.zoom || t < b.pantUntil;
    const tg = tongue.current;
    if (tg) {
      a.tongue = ease(a.tongue, pokeAgo < 1.6 || panting ? 1 : 0, 10, dt);
      tg.visible = a.tongue > 0.02;
      const pant = panting && !rm ? 1 + 0.25 * Math.sin(t * 15) : 1;
      tg.scale.set(1, 0.45 * a.tongue * pant, 0.8 * a.tongue);
    }

    /* ---- tail: wraps him asleep, sickle-curls up and wags awake */
    const tailUp = smooth((w - 0.15) / 0.5);
    const tm = tail.current;
    if (tm?.morphTargetInfluences) tm.morphTargetInfluences[0] = tailUp;
    // Asleep: lazy unless disturbed. Awake: always going, fastest for zoomies and attention.
    let wagSpeed = 8;
    let wagAmp = 0.32;
    if (poked) {
      wagSpeed = 20;
      wagAmp = 0.55;
    } else if (b.mode === "sleep") {
      wagSpeed = open ? 7 : hover ? 11 : 1.2;
      wagAmp = open ? 0.32 : hover ? 0.4 : 0.03;
    } else if (b.zoom || hover) {
      wagSpeed = b.zoom ? 17 : 15;
      wagAmp = b.zoom ? 0.5 : 0.45;
    } else if (open) {
      wagAmp = 0.35;
    } else if (b.speed > 0.1) {
      wagSpeed = 9;
      wagAmp = 0.3;
    } else if (b.mode === "roam" && b.idle === "sniff" && !b.walking) {
      wagSpeed = 5;
      wagAmp = 0.22;
    }
    if (rm) wagAmp = w > 0.3 ? 0.12 : 0;
    a.wagSpeed = ease(a.wagSpeed, wagSpeed, 4, dt);
    a.wagAmp = ease(a.wagAmp, wagAmp, 3, dt);
    a.wagPhase += dt * (rm ? Math.min(a.wagSpeed, 5) : a.wagSpeed);
    if (tw) {
      const wag = Math.sin(a.wagPhase) * a.wagAmp;
      tw.rotation.x = wag * tailUp;
      tw.rotation.y = wag * (1 - tailUp) * 0.8 + wag * tailUp * 0.35;
    }

    /* ---- hop with squash and stretch on a poke (wherever he is) */
    let pokeUp = 0;
    const hg = hop.current;
    if (hg) {
      if (!rm && pokeAgo < 0.9) {
        const p = pokeAgo / 0.9;
        pokeUp = Math.max(0, Math.sin(p * Math.PI * 2)) * 0.2 * (1 - p);
        const sq = 1 + Math.sin(p * Math.PI * 4) * 0.13 * (1 - p);
        const inv = 1 / Math.sqrt(sq);
        hg.scale.set(inv, sq, inv);
      } else {
        hg.scale.set(1, 1, 1);
      }
      hg.position.y = b.elev + pokeUp;
    }

    /* ---- contact shadow: on the cushion or the floor under him, fading as he leaves the ground */
    const bl = blob.current;
    if (bl) {
      const surf = Math.hypot(b.x - ROOT[0], b.z - ROOT[2]) < 0.5 ? BED_TOP : 0;
      bl.position.set(lerp(0.02, 0.03, s1), surf + 0.006, 0.02 * (1 - s1));
      bl.scale.set(lerp(0.55, 0.62, s1), lerp(0.48, 0.34, s1), 1);
      blobMat.opacity = 0.45 * (1 - clamp01((b.elev + pokeUp - surf) / 0.3) * 0.6);
    }

    /* ---- "yip!" bubble, anchored just above his head */
    const showBubble = pokeAgo < 1.6;
    const bub = bubble.current;
    if (bub && tr && n) {
      if (showBubble !== a.bubbleOn) {
        a.bubbleOn = showBubble;
        a.bubbleOffAt = t;
        bub.inner.style.opacity = showBubble ? "1" : "0";
        bub.inner.style.transform = showBubble ? BUBBLE_SHOWN : BUBBLE_HIDDEN;
        if (showBubble) bub.root.style.visibility = "visible";
      }
      // Track his head while visible (and during the fade out).
      if (showBubble || t - a.bubbleOffAt < 0.3) {
        bubbleAt.set(n.position.x + BUBBLE_OFFSET[0], n.position.y + BUBBLE_OFFSET[1], n.position.z + BUBBLE_OFFSET[2]);
        tr.updateWorldMatrix(true, false);
        tr.localToWorld(bubbleAt);
        state.camera.updateMatrixWorld();
        bubbleAt.project(state.camera);
        const x = (bubbleAt.x * 0.5 + 0.5) * state.size.width;
        const y = (-bubbleAt.y * 0.5 + 0.5) * state.size.height;
        bub.root.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      } else if (bub.root.style.visibility !== "hidden") {
        bub.root.style.visibility = "hidden";
      }
    }

    /* ---- sleepy z's (only while he is asleep in bed) */
    const zVis = b.mode === "sleep" ? clamp01(1 - w * 5) * (pokeAgo < 2.5 ? 0 : 1) : 0;
    for (let i = 0; i < 3; i++) {
      const z = zzz.current[i];
      if (!z) continue;
      const p = rm ? 0.25 + i * 0.25 : (t * 0.24 + i / 3) % 1;
      z.position.set(0.3 + p * 0.28 + Math.sin(p * 6) * 0.05, 0.36 + p * 0.75, -0.02 + p * 0.05);
      z.scale.setScalar(0.12 + p * 0.13);
      zMats[i].opacity = Math.sin(p * Math.PI) * 0.9 * zVis;
      z.visible = zMats[i].opacity > 0.01;
    }

    /* ---- hover: a subtle cool lift on the fur (not the shared grey-out glow) */
    const glowWant = hover && !open ? 1 : 0;
    if (glowWant !== a.glow || a.glow > 0) {
      a.glow = ease(a.glow, glowWant, 10, dt);
      if (a.glow < 0.002 && glowWant === 0) a.glow = 0;
      for (const m of furMats) {
        m.emissive.copy(m.userData.baseEmissive as THREE.Color).add(furGlow.copy(FUR_HOVER).multiplyScalar(a.glow));
      }
    }

    /* ---- rim light: follows him, lifts his silhouette, most at night with the lamps off */
    const r = rim.current;
    if (r) {
      r.position.set(b.x - 0.504, b.floorY + 0.744, b.z - 0.504);
      const dark = 1 - store.fx.lampLevel;
      const base = s.phase === "night" ? 0.35 : s.phase === "dusk" ? 0.25 : 0.1;
      const extra = s.phase === "night" ? 1.1 : s.phase === "dusk" ? 0.6 : 0.15;
      r.intensity = base + extra * dark;
    }
  });

  return (
    <>
      <group position={ROOT} scale={SCALE}>
        {/* Only the bed takes the shared hover glow: it would turn a black dog grey.
            Teeko gets his own subtle fur lift instead (and he wakes up, which is the real cue). */}
        <Hotspot id="teeko">
          <DogBed />
        </Hotspot>

        {/* Sleepy z's (only in bed). */}
        {zMats.map((m, i) => (
          <sprite
            key={i}
            ref={(sp) => {
              zzz.current[i] = sp;
            }}
            material={m}
            renderOrder={5}
          />
        ))}
      </group>

      {/* The dog: world position and heading set every frame. His meshes do not
          cast into the static shadow map; the blob below stands in for it. */}
      <group ref={dog} position={ROOT} rotation={[0, ORIENT, 0]} scale={SCALE}>
        <mesh
          ref={blob}
          geometry={plane(1, 1)}
          material={blobMat}
          position={[0.02, BED_TOP + 0.006, 0.02]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[0.55, 0.48, 1]}
          renderOrder={1}
        />
        <group ref={hop} position={[0, BED_TOP, 0]}>
          <group ref={trunk} position={[0, TRUNK_CURL_Y, 0]}>
            {/* Body, breathing: torso, rump, black-and-tan chest, belly and throat. */}
            <group ref={body}>
              {BODY.map((p, i) => (
                <mesh
                  key={i}
                  ref={(m) => {
                    bodyParts.current[i] = m;
                  }}
                  geometry={sphere(p.r, p.ws, p.hs)}
                  material={mats[p.mat]}
                  position={p.m.p0}
                  scale={p.m.s0}
                  receiveShadow={i === 0}
                />
              ))}
            </group>

            {/* Four legs on shoulder and hip pivots. */}
            {[0, 1, 2, 3].map((i) => (
              <Leg
                key={i}
                mats={mats}
                hind={i >= 2}
                pivot={(g) => {
                  legPivots.current[i] = g;
                }}
                limb={(g) => {
                  legLimbs.current[i] = g;
                }}
                paw={(g) => {
                  legPaws.current[i] = g;
                }}
              />
            ))}

            {/* Head on a neck pivot (yaw then pitch). */}
            <group ref={neck} position={NECK_ASLEEP} rotation={[0, -1.3, -0.2, "YZX"]}>
              <group position={[0.08, 0.02, 0]} scale={1.1}>
                {/* Apple-dome skull. */}
                <mesh geometry={sphere(0.1, 22, 16)} material={mats.coat} scale={[0.95, 0.9, 1]} />
                <mesh geometry={sphere(0.083, 18, 14)} material={mats.coat} position={[-0.012, 0.036, 0]} />
                {/* Cheeks and jaw, with tan cheek patches. */}
                <mesh geometry={sphere(0.068, 14, 10)} material={mats.coat} position={[0.035, -0.04, 0]} scale={[1, 0.75, 1.2]} />
                {([1, -1] as const).map((side) => (
                  <mesh key={side} geometry={sphere(0.034, 12, 8)} material={mats.tan} position={[0.065, -0.045, side * 0.058]} scale={[1.1, 0.75, 0.8]} />
                ))}
                {/* Tan eyebrow dots. */}
                {([1, -1] as const).map((side) => (
                  <mesh key={side} geometry={sphere(0.012, 10, 8)} material={mats.tan} position={[0.059, 0.059, side * 0.046]} />
                ))}
                {/* Short snout (black bridge), tan muzzle, little nose. */}
                <mesh geometry={sphere(0.034, 14, 10)} material={mats.coat} position={[0.088, -0.012, 0]} scale={[1.3, 0.7, 0.9]} />
                <mesh geometry={sphere(0.038, 16, 12)} material={mats.muzzle} position={[0.098, -0.034, 0]} scale={[1.15, 0.7, 0.85]} />
                <mesh ref={nose} geometry={sphere(0.016, 10, 8)} material={mats.nose} position={[0.14, -0.02, 0]} scale={[0.9, 0.8, 1.15]} />
                <mesh ref={tongue} geometry={sphere(0.02, 10, 8)} material={mats.tongue} position={[0.118, -0.066, 0]} scale={[1, 0.001, 0.001]} visible={false} />
                {([1, -1] as const).map((side, i) => (
                  <Eye
                    key={side}
                    side={side}
                    mats={mats}
                    lidMat={lidMat}
                    ball={(g) => {
                      eyeBalls.current[i] = g;
                    }}
                    lid={(m) => {
                      lids.current[i] = m;
                    }}
                  />
                ))}
                {([1, -1] as const).map((side, i) => (
                  <Ear
                    key={side}
                    side={side}
                    mats={mats}
                    pivot={(g) => {
                      ears.current[i] = g;
                    }}
                  />
                ))}
              </group>
            </group>

            {/* Tail: wag pivot, then one smooth morphing tube (asleep to awake). */}
            <group ref={tailWag} position={TAIL_CURL}>
              <mesh ref={tail} geometry={tailGeo} material={mats.coat} morphTargetInfluences={[0]} />
            </group>
          </group>
        </group>
      </group>

      {/* Soft cool rim light from behind, so a black dog never becomes a black blob. Follows him. */}
      <pointLight
        ref={rim}
        color="#b3c2ff"
        intensity={0.4}
        distance={1.5}
        decay={2}
        position={[ROOT[0] - 0.504, ROOT[1] + 0.744, ROOT[2] - 0.504]}
      />
    </>
  );
}
