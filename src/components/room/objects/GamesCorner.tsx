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
import { canvasFont, createCanvasTexture, redraw, useFontsReady, useThrottledRedraw } from "../textures";

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

/* ------------------------------------------------------------ poster */

const drawPoster: DrawFn = (c, w, h) => {
  const s = w / 256;
  const gr = c.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#1b1f4a");
  gr.addColorStop(0.55, "#8a3f7a");
  gr.addColorStop(0.75, "#ff7a59");
  gr.addColorStop(1, "#ffb36b");
  c.fillStyle = gr;
  c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(255,255,255,.7)";
  for (let i = 0; i < 30; i++) c.fillRect(((i * 97) % 256) * s, ((i * 53) % 132) * s, 2 * s, 2 * s);

  // striped synthwave sun
  const sy = h * 0.62;
  const sr = 70 * s;
  c.save();
  c.beginPath();
  c.arc(w / 2, sy, sr, 0, Math.PI * 2);
  c.clip();
  const sg = c.createLinearGradient(0, sy - sr, 0, sy + sr);
  sg.addColorStop(0, "#ffe27a");
  sg.addColorStop(1, "#ff5e7a");
  c.fillStyle = sg;
  c.fillRect(0, 0, w, h);
  c.fillStyle = "#8a3f7a";
  for (let i = 0; i < 6; i++) c.fillRect(0, sy + i * 12 * s, w, (3 + i) * s);
  c.restore();

  // pixel skyline
  c.fillStyle = "#231b3d";
  const px = 8;
  for (let x = 0; x < 256; x += px) {
    const hh = 30 + Math.abs(Math.sin(x * 0.05) * 40) + (x % 24);
    c.fillRect(x * s, h - hh * s, px * s, hh * s);
  }

  // perspective grid on the skyline base
  c.strokeStyle = "rgba(34,211,238,.35)";
  c.lineWidth = 1 * s;
  const gy0 = h - 22 * s;
  for (let i = -6; i <= 6; i++) {
    c.beginPath();
    c.moveTo(w / 2 + i * 10 * s, gy0);
    c.lineTo(w / 2 + i * 44 * s, h);
    c.stroke();
  }
  for (let k = 0; k < 3; k++) {
    const yy = gy0 + (k * k + 1) * 3.2 * s;
    c.beginPath();
    c.moveTo(0, yy);
    c.lineTo(w, yy);
    c.stroke();
  }

  c.fillStyle = "#f7f2e8";
  c.textAlign = "center";
  c.textBaseline = "alphabetic";
  c.font = canvasFont("body", 34 * s, 800);
  c.fillText("PLAYER 1", w / 2, 62 * s);
  c.font = canvasFont("display", 17 * s, 400, "italic");
  c.fillText("press start", w / 2, 90 * s);
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

function Poster() {
  const tex = useMemo(() => createCanvasTexture(512, 660, drawPoster), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", map: tex, roughness: 0.7 }), [tex]);
  const fontsReady = useFontsReady();
  useEffect(() => {
    if (fontsReady) redraw(tex);
  }, [fontsReady, tex]);
  useEffect(
    () => () => {
      mat.dispose();
      tex.dispose();
    },
    [mat, tex],
  );
  return (
    <>
      <Part geometry={roundedBox(0.05, 1.95, 1.55, 0.02)} material={std("#1b1f27")} position={[-4.97, 3.75, 3.1]} />
      <mesh geometry={plane(1.43, 1.83)} material={mat} position={[-4.94, 3.75, 3.1]} rotation={[0, Math.PI / 2, 0]} receiveShadow />
    </>
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
 * bean bag with controller, and the PLAYER 1 poster (all the `games` hotspot),
 * plus the TV glow and the arc floor lamp (decor, outside the hotspot).
 */
export function GamesCorner() {
  return (
    <>
      <Hotspot id="games">
        <TvAndStand />
        <BeanBag />
        <Poster />
      </Hotspot>
      <TvLight />
      <ArcLamp />
    </>
  );
}
