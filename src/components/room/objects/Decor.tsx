"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Hotspot } from "../Hotspot";
import { useLampLevel } from "../Lighting";
import { box, cachedGeometry, cylinder, roundedBox, seededRange, sphere } from "../geometry";
import type { Vec3 } from "../hotspots";
import { C, std } from "../materials";
import { useRoomActions, useRoomStore } from "../store";
import type { DrawFn } from "../textures";
import { canvasFont, createCanvasTexture, redraw, roundRect, useFontsReady } from "../textures";
import type { Phase } from "../timeOfDay";

const METAL = { metalness: 0.8, roughness: 0.3 } as const;
const BRASS = { metalness: 0.7, roughness: 0.35 } as const;

/* ================================================================ clock */

const CLOCK: Vec3 = [0.3, 4.4, -4.94];

function WallClock() {
  const hour = useRef<THREE.Group>(null);
  const minute = useRef<THREE.Group>(null);
  const second = useRef<THREE.Group>(null);
  const acc = useRef(Infinity);
  const ring = useMemo(() => new THREE.TorusGeometry(0.3, 0.03, 8, 28), []);
  useEffect(() => () => ring.dispose(), [ring]);

  useFrame((_, dt) => {
    acc.current += dt;
    if (acc.current < 0.2) return;
    acc.current = 0;
    const now = new Date();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    if (second.current) second.current.rotation.z = -(Math.floor(s) / 60) * Math.PI * 2;
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2;
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2;
  });

  const ink = std("#2b3f63");
  const handM = std("#1b2233");
  const [x, y, z] = CLOCK;
  return (
    <group>
      <mesh
        geometry={cylinder(0.3, 0.3, 0.05, 28)}
        material={std("#f7f2e8", { roughness: 0.5 })}
        position={[x, y, z]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      />
      <mesh geometry={ring} material={ink} position={[x, y, z + 0.01]} castShadow />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            geometry={box(0.02, i % 3 === 0 ? 0.06 : 0.035, 0.01)}
            material={ink}
            position={[x + Math.sin(a) * 0.24, y + Math.cos(a) * 0.24, z + 0.03]}
            rotation={[0, 0, -a]}
          />
        );
      })}
      <group ref={hour} position={[x, y, z + 0.035]}>
        <mesh geometry={box(0.025, 0.15, 0.01)} material={handM} position={[0, 0.075, 0]} />
      </group>
      <group ref={minute} position={[x, y, z + 0.04]}>
        <mesh geometry={box(0.018, 0.22, 0.01)} material={handM} position={[0, 0.11, 0]} />
      </group>
      <group ref={second} position={[x, y, z + 0.045]}>
        <mesh geometry={box(0.008, 0.25, 0.006)} material={std(C.coral)} position={[0, 0.09, 0]} />
      </group>
      <mesh geometry={sphere(0.02, 8, 6)} material={std(C.coral)} position={[x, y, z + 0.05]} />
    </group>
  );
}

/* ================================================================ light switch */

function LightSwitch() {
  const store = useRoomStore();
  const pivot = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    const p = pivot.current;
    if (!p) return;
    const st = store.getState();
    const want = st.lightsOn ? -0.35 : 0.35;
    p.rotation.x = st.reducedMotion ? want : p.rotation.x + (want - p.rotation.x) * Math.min(1, dt * 14);
  });

  return (
    <Hotspot id="switch">
      <mesh
        geometry={roundedBox(0.2, 0.32, 0.03, 0.012)}
        material={std("#f7f2e8", { roughness: 0.5 })}
        position={[0.3, 2.55, -4.975]}
        castShadow
        receiveShadow
      />
      {/* screws */}
      {[0.12, -0.12].map((dy) => (
        <mesh
          key={dy}
          geometry={cylinder(0.012, 0.012, 0.006, 8)}
          material={std("#c9ccd2", METAL)}
          position={[0.3, 2.55 + dy, -4.958]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      ))}
      <group ref={pivot} position={[0.3, 2.55, -4.955]} rotation={[-0.35, 0, 0]}>
        <mesh geometry={roundedBox(0.06, 0.12, 0.05, 0.012)} material={std("#e3dccd", { roughness: 0.4 })} position={[0, 0, 0.015]} castShadow />
      </group>
    </Hotspot>
  );
}

/* ================================================================ string lights */

const BULB_COLORS = ["#ffd08a", "#ffb36b", "#fff1c9", "#ffd08a", "#8ff0ff"];

interface Strand {
  a: Vec3;
  b: Vec3;
  segs: number;
  sag: number;
}

const STRANDS: Strand[] = [
  { a: [-4.9, 5.55, -4.92], b: [4.85, 5.55, -4.92], segs: 4, sag: 0.28 },
  { a: [-4.92, 5.55, -4.8], b: [-4.92, 5.55, 4.85], segs: 4, sag: 0.28 },
];

function strandCurve({ a, b, segs, sag }: Strand): THREE.CatmullRomCurve3 {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const pts: THREE.Vector3[] = [];
  for (let s = 0; s < segs; s++) {
    for (let k = 0; k <= 12; k++) {
      if (s > 0 && k === 0) continue;
      const f = (s + k / 12) / segs;
      const p = new THREE.Vector3().lerpVectors(va, vb, f);
      p.y -= Math.sin((Math.PI * k) / 12) * sag;
      pts.push(p);
    }
  }
  return new THREE.CatmullRomCurve3(pts);
}

/** Brightness of an unlit bulb (tinted glass catching the room light) per phase. */
const BULB_OFF: Record<Phase, number> = { night: 0.14, dusk: 0.24, dawn: 0.36, day: 0.38 };

function StringLights() {
  const store = useRoomStore();
  const lampLevel = useLampLevel();
  const bulbs = useRef<THREE.InstancedMesh>(null);
  const light = useRef<THREE.PointLight>(null);

  const data = useMemo(() => {
    const rand = seededRange(21);
    const wires: THREE.TubeGeometry[] = [];
    const positions: THREE.Vector3[] = [];
    const colors: THREE.Color[] = [];
    const phase: number[] = [];
    const speed: number[] = [];
    STRANDS.forEach((st) => {
      const curve = strandCurve(st);
      wires.push(new THREE.TubeGeometry(curve, st.segs * 13 * 3, 0.012, 5));
      const n = st.segs * 9;
      for (let i = 1; i < n; i++) {
        positions.push(curve.getPoint(i / n).add(new THREE.Vector3(0, -0.05, 0)));
        colors.push(new THREE.Color(BULB_COLORS[i % BULB_COLORS.length]));
        phase.push(rand(0, Math.PI * 2));
        speed.push(rand(0.8, 2.2));
      }
    });
    const bulbMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    return { wires, positions, colors, phase, speed, bulbMat, count: positions.length };
  }, []);

  useEffect(
    () => () => {
      data.wires.forEach((w) => w.dispose());
      data.bulbMat.dispose();
    },
    [data],
  );

  useLayoutEffect(() => {
    const mesh = bulbs.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    data.positions.forEach((p, i) => {
      m.makeTranslation(p.x, p.y, p.z);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, data.colors[i]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  useFrame((state) => {
    const L = lampLevel();
    if (light.current) light.current.intensity = 5 * L;
    const mesh = bulbs.current;
    const attr = mesh?.instanceColor;
    if (!attr) return;
    const t = state.clock.elapsedTime;
    const base = BULB_OFF[store.getState().phase];
    const arr = attr.array as Float32Array;
    for (let i = 0; i < data.count; i++) {
      // Unlit bulbs read as tinted glass; lit ones twinkle (values > 1 bloom through tone mapping).
      const k = base + L * (1.4 + Math.sin(t * data.speed[i] + data.phase[i]) * 0.6);
      const c = data.colors[i];
      arr[i * 3] = c.r * k;
      arr[i * 3 + 1] = c.g * k;
      arr[i * 3 + 2] = c.b * k;
    }
    attr.needsUpdate = true;
  });

  const wireMat = std("#2b2622");
  return (
    <group>
      {data.wires.map((geo, i) => (
        <mesh key={i} geometry={geo} material={wireMat} />
      ))}
      <instancedMesh
        ref={bulbs}
        args={[sphere(0.055, 8, 6), data.bulbMat, data.count]}
        frustumCulled={false}
      />
      <pointLight ref={light} color="#ffcf8a" intensity={0} distance={9} decay={2} position={[-2.5, 5.0, -2.5]} />
    </group>
  );
}

/* ================================================================ car keys (cars) */

/** Key hook on the left wall, between the back corner and the window's left curtain. */
const KX = -5;
const KY = 3.4;
const KZ = -4.6;

const plateDraw: DrawFn = (g, w, h) => {
  // vanity plate: cream field, sunset band, embossed lettering, bolt holes
  g.fillStyle = "#2b3f63";
  roundRect(g, 0, 0, w, h, 26);
  g.fill();
  g.fillStyle = "#f6f1e6";
  roundRect(g, 8, 8, w - 16, h - 16, 20);
  g.fill();
  const band = g.createLinearGradient(0, 0, w, 0);
  band.addColorStop(0, "#ff9e6d");
  band.addColorStop(0.5, "#ff6f7d");
  band.addColorStop(1, "#8a5bd6");
  g.fillStyle = band;
  g.fillRect(8, 22, w - 16, 44);
  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = canvasFont("body", 30, 800);
  g.fillText("LET'S  DRIVE", w / 2, 45);
  g.font = canvasFont("body", 124, 800);
  g.fillStyle = "rgba(0,0,0,.25)";
  g.fillText("KEYS", w / 2 + 3, h * 0.62 + 4);
  g.fillStyle = "#1f2f52";
  g.fillText("KEYS", w / 2, h * 0.62);
  g.font = canvasFont("hand", 30, 600);
  g.fillStyle = "#b8323a";
  g.fillText("drive safe", w / 2, h - 26);
  g.fillStyle = "#9aa0aa";
  [
    [40, 44],
    [w - 40, 44],
    [40, h - 30],
    [w - 40, h - 30],
  ].forEach(([x, y]) => {
    g.beginPath();
    g.arc(x, y, 9, 0, Math.PI * 2);
    g.fill();
  });
};

function CarKeys() {
  const fontsReady = useFontsReady();
  const assets = useMemo(() => {
    const plateTex = createCanvasTexture(512, 256, plateDraw);
    const face = new THREE.MeshStandardMaterial({ color: "#ffffff", map: plateTex, roughness: 0.45, metalness: 0.15 });
    const edge = std("#c9ccd2", METAL);
    // BoxGeometry face order: +x (faces the room), -x, +y, -y, +z, -z
    const plateMats: THREE.Material[] = [face, edge, edge, edge, edge, edge];
    const ringLg = new THREE.TorusGeometry(0.06, 0.011, 6, 16);
    const ringSm = new THREE.TorusGeometry(0.035, 0.008, 6, 14);
    return { plateTex, face, plateMats, ringLg, ringSm };
  }, []);

  useEffect(
    () => () => {
      assets.plateTex.dispose();
      assets.face.dispose();
      assets.ringLg.dispose();
      assets.ringSm.dispose();
    },
    [assets],
  );

  useEffect(() => {
    if (fontsReady) redraw(assets.plateTex);
  }, [fontsReady, assets]);

  const pegY = KY - 0.2;
  const pegZs = [KZ - 0.2, KZ, KZ + 0.2];
  const ringM = std("#c9ccd2", METAL);
  const fobM = std("#1b1f27", { roughness: 0.4 });

  return (
    <Hotspot id="cars">
      <group>
        {/* walnut backing board */}
        <mesh
          geometry={roundedBox(0.06, 0.56, 0.72, 0.025)}
          material={std(C.walnut, { roughness: 0.6 })}
          position={[KX + 0.035, KY - 0.02, KZ]}
          castShadow
          receiveShadow
        />
        {/* license-plate sign */}
        <mesh
          geometry={box(0.016, 0.3, 0.6)}
          material={assets.plateMats}
          position={[KX + 0.073, KY + 0.06, KZ]}
          castShadow
          receiveShadow
        />
        {/* brass pegs with knobs */}
        {pegZs.map((z) => (
          <group key={z}>
            <mesh
              geometry={cylinder(0.02, 0.02, 0.15, 8)}
              material={std(C.brass, BRASS)}
              position={[KX + 0.14, pegY, z]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            />
            <mesh geometry={sphere(0.03, 10, 8)} material={std(C.brass, BRASS)} position={[KX + 0.215, pegY, z]} castShadow />
          </group>
        ))}

        {/* peg 1: car key with a chunky fob */}
        <mesh geometry={assets.ringLg} material={ringM} position={[KX + 0.17, pegY - 0.055, pegZs[0]]} rotation={[0, Math.PI / 2, 0]} />
        <group position={[KX + 0.165, pegY - 0.25, pegZs[0]]} rotation={[0.08, 0, 0]}>
          <mesh geometry={roundedBox(0.055, 0.24, 0.13, 0.026)} material={fobM} castShadow />
          <mesh geometry={box(0.004, 0.17, 0.09)} material={std("#2e3440", { roughness: 0.3 })} position={[0.028, -0.01, 0]} />
          <mesh
            geometry={sphere(0.022, 10, 8)}
            material={std(C.cyan, { emissive: C.cyan, emissiveIntensity: 0.8 })}
            position={[0.03, 0.045, 0]}
            scale={[0.5, 1, 1]}
          />
          <mesh geometry={sphere(0.018, 10, 8)} material={std("#e8704f", { roughness: 0.4 })} position={[0.03, -0.01, 0]} scale={[0.5, 1, 1]} />
          <mesh geometry={sphere(0.018, 10, 8)} material={std("#e3dccd", { roughness: 0.4 })} position={[0.03, -0.06, 0]} scale={[0.5, 1, 1]} />
          {/* flip-out blade */}
          <mesh geometry={box(0.016, 0.2, 0.04)} material={std("#c9ccd2", METAL)} position={[-0.005, 0.02, -0.095]} rotation={[0.4, 0, 0]} castShadow />
        </group>

        {/* peg 2: a tiny red keychain car */}
        <mesh geometry={assets.ringSm} material={ringM} position={[KX + 0.17, pegY - 0.035, pegZs[1]]} rotation={[0, Math.PI / 2, 0]} />
        <mesh geometry={cylinder(0.005, 0.005, 0.07, 6)} material={ringM} position={[KX + 0.17, pegY - 0.1, pegZs[1]]} />
        <group position={[KX + 0.17, pegY - 0.19, pegZs[1]]} rotation={[0.1, 0, 0]}>
          <mesh geometry={roundedBox(0.07, 0.06, 0.2, 0.022)} material={std(C.red, { roughness: 0.35, metalness: 0.1 })} castShadow />
          <mesh
            geometry={roundedBox(0.064, 0.05, 0.1, 0.018)}
            material={std(C.red, { roughness: 0.35, metalness: 0.1 })}
            position={[0, 0.045, -0.015]}
            castShadow
          />
          <mesh geometry={box(0.066, 0.034, 0.084)} material={std("#2b3f63", { roughness: 0.2 })} position={[0, 0.048, -0.015]} />
          <mesh geometry={box(0.072, 0.018, 0.018)} material={std("#fff1c9", { emissive: "#fff1c9", emissiveIntensity: 0.4 })} position={[0, 0.005, 0.095]} />
          {[-0.065, 0.065].map((dz) => (
            <mesh
              key={dz}
              geometry={cylinder(0.024, 0.024, 0.078, 12)}
              material={std("#1b1f27", { roughness: 0.6 })}
              position={[0, -0.03, dz]}
              rotation={[0, 0, Math.PI / 2]}
            />
          ))}
        </group>

        {/* peg 3: house key and a leather tag */}
        <mesh geometry={assets.ringLg} material={ringM} position={[KX + 0.17, pegY - 0.055, pegZs[2]]} rotation={[0, Math.PI / 2, 0]} />
        <group position={[KX + 0.165, pegY - 0.17, pegZs[2] - 0.03]} rotation={[-0.12, 0, 0]}>
          <mesh geometry={roundedBox(0.018, 0.07, 0.07, 0.012)} material={std(C.brass, BRASS)} position={[0, 0.04, 0]} castShadow />
          <mesh geometry={box(0.012, 0.13, 0.03)} material={std(C.brass, BRASS)} position={[0, -0.055, 0]} castShadow />
        </group>
        <mesh
          geometry={roundedBox(0.025, 0.2, 0.1, 0.012)}
          material={std("#b5654e", { roughness: 0.75 })}
          position={[KX + 0.17, pegY - 0.18, pegZs[2] + 0.045]}
          rotation={[0.14, 0, 0]}
          castShadow
        />
      </group>
    </Hotspot>
  );
}

/* ================================================================ rug */

const rugDraw: DrawFn = (g, w) => {
  const cols = ["#27405a", "#e9dcc5", "#2a8f8a", "#e9dcc5", "#d8a25e", "#27405a", "#c9714c", "#e9dcc5"];
  g.fillStyle = "#27405a";
  g.fillRect(0, 0, w, w);
  const ring = w / 32;
  for (let r = w / 2, i = 0; r > 4; r -= ring, i++) {
    g.fillStyle = cols[i % cols.length];
    g.beginPath();
    g.arc(w / 2, w / 2, r, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(0,0,0,.12)";
    g.lineWidth = ring * 0.18;
    g.setLineDash([ring * 0.32, ring * 0.32]);
    g.beginPath();
    g.arc(w / 2, w / 2, r - ring / 2, 0, Math.PI * 2);
    g.stroke();
    g.setLineDash([]);
  }
};

function Rug() {
  const assets = useMemo(() => {
    const tex = createCanvasTexture(1024, 1024, rugDraw);
    const top = new THREE.MeshStandardMaterial({ color: "#ffffff", map: tex, roughness: 1 });
    const side = std("#27405a", { roughness: 1 });
    return { tex, top, mats: [side, top, side] };
  }, []);
  useEffect(
    () => () => {
      assets.tex.dispose();
      assets.top.dispose();
    },
    [assets],
  );
  return (
    <mesh
      geometry={cylinder(1, 1, 0.04, 64)}
      material={assets.mats}
      position={[-0.4, 0.02, 1.15]}
      scale={[2.6, 1, 1.95]}
      receiveShadow
    />
  );
}

/* ================================================================ snake plant */

const PLANT: Vec3 = [-4.3, 0, -4.3];
const LEAF_COLORS = ["#4f7d4a", "#6a9a52", "#3f6b45", "#5d8c4e"];

interface Leaf {
  pos: Vec3;
  rot: Vec3;
  height: number;
  color: string;
}

function SnakePlant() {
  const leaves = useMemo<Leaf[]>(() => {
    const rand = seededRange(33);
    return Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return {
        pos: [PLANT[0] + rand(-0.12, 0.12), 0.62, PLANT[2] + rand(-0.12, 0.12)],
        rot: [Math.sin(a) * rand(0.12, 0.42), rand(0, Math.PI), Math.cos(a) * rand(0.12, 0.42)],
        height: rand(1.1, 1.8),
        color: LEAF_COLORS[i % LEAF_COLORS.length],
      };
    });
  }, []);
  // unit-height cone with its base at the origin, scaled per leaf
  const leafGeo = cachedGeometry("decor:snakeLeaf", () => new THREE.ConeGeometry(0.13, 1, 5).translate(0, 0.5, 0));
  const pot = std("#c9714c", { roughness: 0.8 });
  const [px, , pz] = PLANT;
  return (
    <group>
      <mesh geometry={cylinder(0.36, 0.28, 0.62, 18)} material={pot} position={[px, 0.31, pz]} castShadow receiveShadow />
      <mesh geometry={cylinder(0.39, 0.39, 0.08, 18)} material={pot} position={[px, 0.62, pz]} castShadow receiveShadow />
      <mesh geometry={cylinder(0.34, 0.34, 0.02, 18)} material={std("#3a2a22")} position={[px, 0.63, pz]} receiveShadow />
      {leaves.map((l, i) => (
        <mesh
          key={i}
          geometry={leafGeo}
          material={std(l.color, { flatShading: true, roughness: 0.7 })}
          position={l.pos}
          rotation={l.rot}
          scale={[1, l.height, 0.35]}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}

/* ================================================================ decor */

export function Decor() {
  const { invalidateShadows } = useRoomActions();
  useEffect(() => invalidateShadows(2), [invalidateShadows]);
  return (
    <group>
      <WallClock />
      <LightSwitch />
      <StringLights />
      <CarKeys />
      <Rug />
      <SnakePlant />
    </group>
  );
}
