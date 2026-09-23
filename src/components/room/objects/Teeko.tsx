"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Hotspot } from "../Hotspot";
import { cachedGeometry, cylinder, sphere } from "../geometry";
import { TEEKO, std } from "../materials";
import { useRoomStore } from "../store";
import { canvasFont, createCanvasTexture, redraw, useFontsReady } from "../textures";

/**
 * Teeko: a small black chihuahua curled up asleep in a round dog bed on the rug.
 *
 * Dog-local frame: +x is where his nose points when he is awake, +y is up,
 * +z is the belly side of the curl (turned toward the camera). The bed sits at
 * ROOT; the dog group is rotated by ORIENT so his face and ears read from the
 * overview camera and from the teeko close-up.
 *
 * Reactions are driven from the store inside useFrame (no per-frame renders):
 * hover or nav focus = stirs and looks at the camera; poke = hop, "yip!", fast wag;
 * open panel = stays awake and attentive; otherwise he drifts back to sleep.
 */

const ROOT: [number, number, number] = [0.85, 0.04, 1.35];
const ORIENT = 0.6;
/** Top of the bed cushion, where the dog lies. */
const BED_TOP = 0.085;

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
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
const ease = (cur: number, want: number, rate: number, dt: number) => cur + (want - cur) * Math.min(1, dt * rate);

/** Hoisted scratch objects (no allocations inside useFrame). */
const camLocal = new THREE.Vector3();
const bubbleAt = new THREE.Vector3();
const furGlow = new THREE.Color();
/** Emissive added to the fur at full hover: enough to lift him, not enough to turn him grey. */
const FUR_HOVER = new THREE.Color(0.006, 0.01, 0.014);
/** Where the "yip!" bubble points, in the hop group's frame (just above his awake head). */
const BUBBLE_ANCHOR: [number, number, number] = [0.24, 0.44, 0.04];

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

interface Materials {
  coat: THREE.MeshPhysicalMaterial;
  lift: THREE.MeshPhysicalMaterial;
  muzzle: THREE.MeshStandardMaterial;
  chest: THREE.MeshPhysicalMaterial;
  innerEar: THREE.MeshStandardMaterial;
  nose: THREE.MeshStandardMaterial;
  eye: THREE.MeshStandardMaterial;
  glint: THREE.MeshBasicMaterial;
  tongue: THREE.MeshStandardMaterial;
}

function makeMaterials(): Materials {
  // Black fur that still reads in the dark: not pure black, a velvet sheen that
  // catches grazing light on the silhouette, and a whisper of emissive lift.
  const fur = (color: string, lift: string) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.62,
      metalness: 0,
      sheen: 0.8,
      sheenColor: new THREE.Color("#5f6482"),
      sheenRoughness: 0.42,
      emissive: new THREE.Color(lift),
      emissiveIntensity: 1,
      userData: { baseEmissive: new THREE.Color(lift) },
    });
  return {
    coat: fur(TEEKO.coat, "#0a090e"),
    lift: fur(TEEKO.coatLift, "#0d0b11"),
    chest: fur(TEEKO.chest, "#0d0b11"),
    muzzle: new THREE.MeshStandardMaterial({ color: TEEKO.muzzle, roughness: 0.7, emissive: "#1c1614" }),
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
      <mesh geometry={cone(0.068, 0.2)} material={mats.coat} position={[0, 0.1, 0]} scale={[0.45, 1, 1]} castShadow />
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
  const furMats = useMemo(() => [mats.coat, mats.lift, mats.chest], [mats]);

  const hop = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const neck = useRef<THREE.Group>(null);
  const legs = useRef<THREE.Group>(null);
  const ears = useRef<(THREE.Group | null)[]>([null, null]);
  const eyeBalls = useRef<(THREE.Group | null)[]>([null, null]);
  const lids = useRef<(THREE.Mesh | null)[]>([null, null]);
  const tongue = useRef<THREE.Mesh>(null);
  const tailWag = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Mesh>(null);
  const zzz = useRef<(THREE.Sprite | null)[]>([null, null, null]);
  const rim = useRef<THREE.PointLight>(null);
  const bubble = useRef<{ root: HTMLDivElement; inner: HTMLDivElement } | null>(null);
  const gl = useThree((st) => st.gl);

  const anim = useRef({
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
    shadowDirty: false,
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
      tailGeo.dispose();
    },
    [mats, zMats, zTex, lidMat, tailGeo],
  );

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const t = state.clock.elapsedTime;
    const s = store.getState();
    const a = anim.current;
    const rm = s.reducedMotion;
    const now = performance.now();

    const pokeAgo = s.teekoPokedAt ? (now - s.teekoPokedAt) / 1000 : Infinity;
    if (s.teekoPokedAt !== a.lastPoke) {
      a.lastPoke = s.teekoPokedAt;
      a.blinkAt = t + 2.5;
    }
    const poked = pokeAgo < 3;
    const open = s.openSpot === "teeko";
    const hover = s.hoveredSpot === "teeko" || s.navFocus === "teeko";

    /* ---- wake level: fast to rise, lingers, then slowly settles */
    const want = poked || open ? 1 : hover ? 0.62 : 0;
    if (want > 0) a.lastAttention = t;
    const prevWake = a.wake;
    if (want >= a.wake) a.wake = ease(a.wake, want, rm ? 10 : poked ? 9 : 4, dt);
    else if (t - a.lastAttention > 2.5) a.wake = ease(a.wake, want, rm ? 3 : 0.9, dt);
    if (Math.abs(a.wake - want) < 0.001) a.wake = want;
    const w = a.wake;
    const moving = Math.abs(w - prevWake) > 0.0004;

    /* ---- breathing (slow and deep asleep, quicker awake) */
    const b = body.current;
    if (b) {
      const rate = lerp(1.7, 3.4, w);
      const depth = rm ? 0.012 : lerp(0.04, 0.025, w);
      const br = Math.sin(t * rate) * depth;
      b.scale.set(1 + br * 0.3, 1 + br, 1 + br * 0.6);
    }

    /* ---- head: rests on the paws asleep; lifts and looks toward the camera awake */
    const n = neck.current;
    const hg = hop.current;
    if (n && hg) {
      camLocal.copy(state.camera.position);
      hg.worldToLocal(camLocal);
      const dx = camLocal.x - n.position.x;
      const dy = camLocal.y - n.position.y;
      const dz = camLocal.z - n.position.z;
      const yawToCam = Math.max(-1.25, Math.min(0.6, -Math.atan2(dz, dx)));
      const pitchToCam = Math.max(-0.2, Math.min(0.55, Math.atan2(dy, Math.hypot(dx, dz)) * 0.7));
      a.lookYaw = ease(a.lookYaw, yawToCam, 3, dt);
      a.lookPitch = ease(a.lookPitch, pitchToCam, 3, dt);
      const lift = smooth(w / 0.6);
      n.position.set(lerp(0.15, 0.19, lift), lerp(0.11, 0.2, lift), lerp(0.08, 0.04, lift));
      // Asleep: head turned in toward the curl, chin down on the paws.
      const breathNod = rm ? 0 : Math.sin(t * 1.7) * 0.02 * (1 - lift);
      n.rotation.y = lerp(-1.3, a.lookYaw, lift);
      n.rotation.z = lerp(-0.2 + breathNod, a.lookPitch, lift);
      if (legs.current) legs.current.rotation.y = lerp(-0.85, 0, lift);
      // A curious head tilt when he is fully awake.
      n.rotation.x = lerp(0, 0.18 * Math.sin(t * 0.8) * (rm ? 0 : 1), smooth((w - 0.7) / 0.3));
    }

    /* ---- ears: relaxed back asleep, perked when awake; random twitches */
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
      ear.rotation.x = side * (lerp(0.7, 0.6, perk) + twitch);
      ear.rotation.z = lerp(0.95, 0.05, perk) + twitch * 0.6;
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

    /* ---- tongue blep while he yips */
    const tg = tongue.current;
    if (tg) {
      a.tongue = ease(a.tongue, pokeAgo < 1.6 ? 1 : 0, 10, dt);
      tg.visible = a.tongue > 0.02;
      tg.scale.set(1, 0.45 * a.tongue, 0.8 * a.tongue);
    }

    /* ---- tail: wraps him asleep, sickle-curls up and wags awake */
    const tailUp = smooth((w - 0.15) / 0.5);
    const tm = tail.current;
    if (tm?.morphTargetInfluences) tm.morphTargetInfluences[0] = tailUp;
    const wagSpeed = poked ? 20 : open ? 7 : hover ? 11 : 1.2;
    const wagAmp = rm ? (w > 0.3 ? 0.12 : 0) : poked ? 0.55 : open ? 0.32 : hover ? 0.4 : 0.03;
    a.wagSpeed = ease(a.wagSpeed, wagSpeed, 4, dt);
    a.wagAmp = ease(a.wagAmp, wagAmp, 3, dt);
    a.wagPhase += dt * (rm ? Math.min(a.wagSpeed, 5) : a.wagSpeed);
    const tw = tailWag.current;
    if (tw) {
      const wag = Math.sin(a.wagPhase) * a.wagAmp;
      tw.rotation.x = wag * tailUp;
      tw.rotation.y = wag * (1 - tailUp) * 0.8 + wag * tailUp * 0.35;
    }

    /* ---- hop with squash and stretch on a poke */
    if (hg) {
      if (!rm && pokeAgo < 0.9) {
        const p = pokeAgo / 0.9;
        const up = Math.max(0, Math.sin(p * Math.PI * 2)) * 0.2 * (1 - p);
        const sq = 1 + Math.sin(p * Math.PI * 4) * 0.13 * (1 - p);
        const inv = 1 / Math.sqrt(sq);
        hg.position.y = BED_TOP + up;
        hg.scale.set(inv, sq, inv);
        a.shadowDirty = true;
      } else if (a.shadowDirty) {
        hg.position.y = BED_TOP;
        hg.scale.set(1, 1, 1);
        a.shadowDirty = false;
        store.actions.invalidateShadows(2);
      }
      if (a.shadowDirty || moving) store.actions.invalidateShadows(1);
    }

    /* ---- "yip!" bubble */
    const showBubble = pokeAgo < 1.6;
    const bub = bubble.current;
    if (bub && hg) {
      if (showBubble !== a.bubbleOn) {
        a.bubbleOn = showBubble;
        a.bubbleOffAt = t;
        bub.inner.style.opacity = showBubble ? "1" : "0";
        bub.inner.style.transform = showBubble ? BUBBLE_SHOWN : BUBBLE_HIDDEN;
        if (showBubble) bub.root.style.visibility = "visible";
      }
      // Track his head while visible (and during the fade out).
      if (showBubble || t - a.bubbleOffAt < 0.3) {
        bubbleAt.set(BUBBLE_ANCHOR[0], BUBBLE_ANCHOR[1], BUBBLE_ANCHOR[2]);
        hg.updateWorldMatrix(true, false);
        hg.localToWorld(bubbleAt);
        state.camera.updateMatrixWorld();
        bubbleAt.project(state.camera);
        const x = (bubbleAt.x * 0.5 + 0.5) * state.size.width;
        const y = (-bubbleAt.y * 0.5 + 0.5) * state.size.height;
        bub.root.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      } else if (bub.root.style.visibility !== "hidden") {
        bub.root.style.visibility = "hidden";
      }
    }

    /* ---- sleepy z's */
    const zVis = clamp01(1 - w * 5) * (pokeAgo < 2.5 ? 0 : 1);
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

    /* ---- rim light: lifts his silhouette, most at night with the lamps off */
    const r = rim.current;
    if (r) {
      const dark = 1 - store.fx.lampLevel;
      const base = s.phase === "night" ? 0.35 : s.phase === "dusk" ? 0.25 : 0.1;
      const extra = s.phase === "night" ? 1.1 : s.phase === "dusk" ? 0.6 : 0.15;
      r.intensity = base + extra * dark;
    }
  });

  return (
    <group position={ROOT} scale={1.2}>
      {/* Only the bed takes the shared hover glow: it would turn a black dog grey.
          Teeko gets his own subtle fur lift instead (and he wakes up, which is the real cue). */}
      <Hotspot id="teeko">
        <DogBed />
      </Hotspot>
      <group rotation={[0, ORIENT, 0]}>
        <group ref={hop} position={[0, BED_TOP, 0]}>
          {/* Body, breathing. */}
          <group ref={body} position={[-0.02, 0, 0]}>
            <mesh geometry={sphere(0.2, 22, 16)} material={mats.coat} position={[0, 0.115, 0]} scale={[0.96, 0.58, 0.76]} castShadow receiveShadow />
            {/* Hip and thigh on the visible side. */}
            <mesh geometry={sphere(0.1, 16, 12)} material={mats.coat} position={[-0.12, 0.115, 0.04]} scale={[1, 0.95, 1.05]} castShadow />
            <mesh geometry={sphere(0.08, 14, 10)} material={mats.coat} position={[-0.09, 0.1, 0.11]} scale={[1.15, 0.9, 0.62]} castShadow />
            {/* Lighter chest and throat. */}
            <mesh geometry={sphere(0.085, 14, 10)} material={mats.chest} position={[0.14, 0.1, 0.065]} scale={[0.8, 0.95, 0.85]} castShadow />
          </group>

          {/* Hind leg tucked along the belly. */}
          <mesh geometry={capsule(0.019, 0.06)} material={mats.coat} position={[-0.005, 0.032, 0.118]} rotation={[0, 0.15, Math.PI / 2]} castShadow />
          <mesh geometry={sphere(0.024, 10, 8)} material={mats.lift} position={[0.045, 0.022, 0.118]} scale={[1.35, 0.7, 1]} castShadow />

          {/* Thin front legs stretched out as a pillow. */}
          <group ref={legs} position={[0.12, 0, 0.06]} rotation={[0, -0.85, 0]}>
            {[-0.045, 0.04].map((z, i) => (
              <group key={z}>
                <mesh geometry={capsule(0.019, 0.1)} material={mats.coat} position={[0.07 + i * 0.01, 0.028, z]} rotation={[0, -0.1 * (i ? -1 : 1), Math.PI / 2]} castShadow />
                <mesh geometry={sphere(0.024, 10, 8)} material={mats.lift} position={[0.145 + i * 0.01, 0.022, z + (i ? 0.008 : -0.008)]} scale={[1.35, 0.7, 1]} castShadow />
              </group>
            ))}
          </group>

          {/* Head on a neck pivot (yaw then pitch). */}
          <group ref={neck} position={[0.15, 0.11, 0.08]} rotation={[0, -1.3, -0.2, "YZX"]}>
            <group position={[0.08, 0.02, 0]} scale={1.1}>
              {/* Apple-dome skull. */}
              <mesh geometry={sphere(0.1, 22, 16)} material={mats.coat} scale={[0.95, 0.9, 1]} castShadow />
              <mesh geometry={sphere(0.083, 18, 14)} material={mats.coat} position={[-0.012, 0.036, 0]} castShadow />
              {/* Cheeks and jaw. */}
              <mesh geometry={sphere(0.068, 14, 10)} material={mats.coat} position={[0.035, -0.04, 0]} scale={[1, 0.75, 1.2]} castShadow />
              {/* Short snout, lighter muzzle, little nose. */}
              <mesh geometry={sphere(0.034, 14, 10)} material={mats.coat} position={[0.088, -0.012, 0]} scale={[1.3, 0.7, 0.9]} castShadow />
              <mesh geometry={sphere(0.038, 16, 12)} material={mats.muzzle} position={[0.098, -0.034, 0]} scale={[1.15, 0.7, 0.85]} castShadow />
              <mesh geometry={sphere(0.016, 10, 8)} material={mats.nose} position={[0.14, -0.02, 0]} scale={[0.9, 0.8, 1.15]} />
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
          <group ref={tailWag} position={[-0.215, 0.1, 0.03]}>
            <mesh ref={tail} geometry={tailGeo} material={mats.coat} morphTargetInfluences={[0]} castShadow />
          </group>
        </group>
      </group>

      {/* Sleepy z's. */}
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

      {/* Soft cool rim light from behind, so a black dog never becomes a black blob. */}
      <pointLight ref={rim} color="#b3c2ff" intensity={0.4} distance={1.5} decay={2} position={[-0.42, 0.62, -0.42]} />
    </group>
  );
}
