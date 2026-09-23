"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { TessellateModifier } from "three/examples/jsm/modifiers/TessellateModifier.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Hotspot } from "../Hotspot";
import { usePhase } from "../Lighting";
import { box, cachedGeometry, cylinder, mulberry32, plane, roundedBox, sphere } from "../geometry";
import { C, std } from "../materials";
import { useRoomStore } from "../store";
import { createCanvasTexture, redraw, softTexture } from "../textures";
import type { Phase, PhaseConfig } from "../timeOfDay";

/* ================================================================ constants */

const HW = 5;
const T = 0.3;
const WIN = { z0: -3.5, z1: -0.3, y0: 1.4, y1: 4.9 };
const WIN_W = WIN.z1 - WIN.z0;
const WIN_H = WIN.y1 - WIN.y0;
const WIN_ZC = (WIN.z0 + WIN.z1) / 2;
const WIN_YC = (WIN.y0 + WIN.y1) / 2;
/** Center line and outer face of the left wall. */
const LX = -HW - T / 2;
const OUT_X = -HW - T;
/** Top of the outside ground. */
const GY = -0.4;

/**
 * Everything outside is drawn only where the window portal wrote stencil 1
 * (the Canvas is created with `stencil: true`).
 */
const STENCIL = {
  stencilWrite: true,
  stencilRef: 1,
  stencilFunc: THREE.EqualStencilFunc,
  stencilFail: THREE.KeepStencilOp,
  stencilZFail: THREE.KeepStencilOp,
  stencilZPass: THREE.KeepStencilOp,
} as const;

/*
 * Staging. The overview camera sees the window from about 24 degrees above,
 * so its rays through the glass land on the street a few units out. The
 * outside is therefore a floating diorama: the street ends at a cut edge on
 * the -z side (the direction the overview looks), and past it the overview
 * sees open sky below the horizon (indigo at night), a small floating islet
 * with a lit cottage, stars, and the moon. The zoomed cars view looks almost
 * level toward -x, so it sees the full street, houses, horizon, and the moon
 * above the roofs. The island outline keeps its edges outside that view.
 */
const ISLAND: [number, number][] = [
  [-4.9, 16],
  [-4.9, -6.6],
  [-16.4, -6.6],
  [-22.5, -12.8],
  [-40, -16],
  [-60, -18],
  [-128, -33],
  [-128, 40],
  [-40, 36],
];
const ISLAND_DEPTH = 1.4;
/** Street strip (runs along z, ends flush with the island edge at z = -6.6). */
const ST_Z0 = -6.6;
const ST_Z1 = 16;
const ROAD_X = -12.0;
const ROAD_W = 5.8;
const NEAR_WALK_X = -8.3;
const FAR_WALK_X = -15.8;
const WALK_W = 1.2;
/** Main street lamp (with the PointLight): far sidewalk, arm over the road. */
const LAMP = { x: -15.85, z: -4.3, headX: -14.8, headY: 4.28 };
/** Lantern post on the near sidewalk at the cut edge (emissive only, reads from the overview). */
const LANTERN = { x: -8.75, z: -6.4, h: 2.2 };
/** Parked car (BMW M235i Gran Coupe): group origin, uniform scale 0.8, nose toward -z. */
const CAR = { x: -11.4, y: -0.38, z: -2.1, s: 0.8 };
/** Floating islet below the street edge (seen from the overview only). */
const ISLET = { x: -32, top: -11.2, z: -22.4 };

/** Moon and sun ride on the camera ray through a point in the upper -z pane. */
const ORB_D = 90;
/** Preferred height of the orb above the camera's eye line when the window allows it. */
const ORB_ELEVATION = 1.3 * (Math.PI / 180);
const WIN_CENTER = new THREE.Vector3(OUT_X, WIN_YC, WIN_ZC);

/** Below-the-horizon sky per phase (what the overview sees past the edge). */
const LOWER_SKY: Record<Phase, [string, string]> = {
  night: ["#2a3a72", "#16204a"],
  dawn: ["#f2c4b2", "#a497c8"],
  day: ["#d3e8fb", "#94c2ea"],
  dusk: ["#cf7f86", "#4d3c7c"],
};

/* ================================================================ helpers */

type V3 = [number, number, number];

function ico(r: number): THREE.BufferGeometry {
  return cachedGeometry(`ico:${r}`, () => new THREE.IcosahedronGeometry(r, 0));
}

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpP = new THREE.Vector3();
const tmpS = new THREE.Vector3();

/** Collects transformed copies of geometries per material and merges them into one mesh each. */
class Merger {
  private groups = new Map<THREE.Material, THREE.BufferGeometry[]>();

  add(
    material: THREE.Material,
    geometry: THREE.BufferGeometry,
    pos: V3,
    rot: V3 = [0, 0, 0],
    scale: number | V3 = 1,
    parent?: THREE.Matrix4,
  ): void {
    const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    for (const name of Object.keys(g.attributes)) {
      if (name !== "position" && name !== "normal") g.deleteAttribute(name);
    }
    g.clearGroups();
    tmpQ.setFromEuler(tmpE.set(rot[0], rot[1], rot[2]));
    if (typeof scale === "number") tmpS.setScalar(scale);
    else tmpS.set(scale[0], scale[1], scale[2]);
    tmpM.compose(tmpP.set(pos[0], pos[1], pos[2]), tmpQ, tmpS);
    if (parent) tmpM.premultiply(parent);
    g.applyMatrix4(tmpM);
    let list = this.groups.get(material);
    if (!list) {
      list = [];
      this.groups.set(material, list);
    }
    list.push(g);
  }

  build(): THREE.Mesh[] {
    const out: THREE.Mesh[] = [];
    this.groups.forEach((parts, material) => {
      const merged = mergeGeometries(parts, false);
      parts.forEach((p) => p.dispose());
      if (!merged) return;
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, material);
      mesh.receiveShadow = true;
      out.push(mesh);
    });
    this.groups.clear();
    return out;
  }
}

/** Material factory for the outside: every material gets the stencil test. */
function materialKit() {
  const owned: THREE.Material[] = [];
  const cache = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (color: string, opts: THREE.MeshStandardMaterialParameters = {}) => {
    const key = `${color}|${JSON.stringify(opts)}`;
    let m = cache.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...opts, ...STENCIL });
      cache.set(key, m);
      owned.push(m);
    }
    return m;
  };
  const own = <M extends THREE.Material>(m: M): M => {
    Object.assign(m, STENCIL);
    owned.push(m);
    return m;
  };
  return { mat, own, owned };
}
type Kit = ReturnType<typeof materialKit>;

function glowSprite(kit: Kit, color: string, scale: number, pos: V3): THREE.Sprite {
  const s = new THREE.Sprite(
    kit.own(
      new THREE.SpriteMaterial({
        map: softTexture(),
        color,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
        opacity: 0,
      }),
    ),
  );
  s.scale.setScalar(scale);
  s.position.set(...pos);
  return s;
}

/** Flat warm pool of light on the ground (additive decal), `w` along x, `d` along z. */
function lightPool(kit: Kit, w: number, d: number, pos: V3): THREE.Mesh {
  const m = new THREE.Mesh(
    plane(w, d),
    kit.own(
      new THREE.MeshBasicMaterial({
        map: softTexture(),
        color: "#ffc27a",
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
        fog: false,
      }),
    ),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.set(...pos);
  return m;
}

/* ================================================================ outside world */

interface HouseOpts {
  x: number;
  z: number;
  /** Depth along x, width along z, wall height. */
  w: number;
  d: number;
  h: number;
  wall: string;
  roof: string;
  door: string;
  baseY?: number;
  /** Size of doors, windows, and trim (1 = full-size house). */
  scale?: number;
  /** Mirror the facade along z (door on the +z side). */
  flip?: boolean;
  /** Also put windows on the +z gable end (the islet cottage faces the overview). */
  sideWindows?: boolean;
}

interface Outside {
  group: THREE.Group;
  /** Facade materials, given a faint moonlit emissive at night. */
  houseWalls: THREE.MeshStandardMaterial[];
  windowsBright: THREE.MeshStandardMaterial;
  windowsDim: THREE.MeshStandardMaterial;
  lampHeads: THREE.MeshStandardMaterial;
  lampGlows: THREE.Sprite[];
  pools: THREE.Mesh[];
  clouds: THREE.Mesh[];
  cloudBase: Float32Array;
  stars: THREE.Points;
  moon: THREE.Mesh;
  sun: THREE.Mesh;
  orbGlow: THREE.Sprite;
  skyTex: THREE.CanvasTexture;
  kit: Kit;
  geometries: THREE.BufferGeometry[];
  textures: THREE.Texture[];
}

function buildOutside(): Outside {
  const kit = materialKit();
  const { mat, own } = kit;
  const rnd = mulberry32(1107);
  const R = (a: number, b: number) => a + (b - a) * rnd();
  const pick = <V,>(arr: readonly V[]): V => arr[Math.floor(rnd() * arr.length)];
  const mb = new Merger();
  const geometries: THREE.BufferGeometry[] = [];
  const textures: THREE.Texture[] = [];
  const group = new THREE.Group();

  /* ---------- island ground with a cut-away soil edge */
  const shape = new THREE.Shape();
  ISLAND.forEach(([x, z], i) => (i === 0 ? shape.moveTo(x, -z) : shape.lineTo(x, -z)));
  shape.closePath();
  const islandGeo = new THREE.ExtrudeGeometry(shape, { depth: ISLAND_DEPTH, bevelEnabled: false });
  islandGeo.rotateX(-Math.PI / 2);
  islandGeo.translate(0, GY - ISLAND_DEPTH, 0);
  geometries.push(islandGeo);
  const grass = mat("#6f9b56", { roughness: 1 });
  const soil = mat("#5b4232", { roughness: 1, flatShading: true });
  const island = new THREE.Mesh(islandGeo, [grass, soil]);
  island.receiveShadow = true;
  group.add(island);

  /* ---------- street strip: sidewalks, curbs, road with dashes (thick slabs show a section at the cut) */
  const stLen = ST_Z1 - ST_Z0;
  const stZ = (ST_Z0 + ST_Z1) / 2;
  const walkM = mat("#cfc8bb", { roughness: 0.95 });
  const curbM = mat("#b3ac9f", { roughness: 0.95 });
  const roadM = mat("#3d424b", { roughness: 0.95 });
  const dashM = mat("#f1d36b", { roughness: 0.8 });
  mb.add(walkM, box(WALK_W, 0.4, stLen), [NEAR_WALK_X, -0.5, stZ]);
  mb.add(walkM, box(WALK_W, 0.4, stLen), [FAR_WALK_X, -0.5, stZ]);
  mb.add(curbM, box(0.2, 0.46, stLen), [NEAR_WALK_X - WALK_W / 2 - 0.1, -0.48, stZ]);
  mb.add(curbM, box(0.2, 0.46, stLen), [FAR_WALK_X + WALK_W / 2 + 0.1, -0.48, stZ]);
  mb.add(roadM, box(ROAD_W, 0.34, stLen), [ROAD_X, -0.55, stZ]);
  for (let z = ST_Z0 + 1.1; z < ST_Z1 - 0.8; z += 3.2) mb.add(dashM, box(0.14, 0.012, 1.6), [ROAD_X, -0.375, z]);

  /* ---------- hedge with flowers under the window */
  const hedgeM = mat("#4f7f47", { flatShading: true, roughness: 1 });
  for (let z = -6.2; z <= 15; z += 0.7) {
    mb.add(hedgeM, ico(0.42), [-5.95 + R(-0.08, 0.08), -0.15, z], [R(0, 3), R(0, 3), 0], [1, 0.75, 1.1]);
  }
  const flowerCols = ["#ff8fab", "#ffd86b", "#f7f2e8", "#c7a4ff"];
  for (let i = 0; i < 40; i++) {
    mb.add(mat(pick(flowerCols), { roughness: 0.6 }), sphere(0.07, 6, 5), [-6.45 + R(-0.12, 0.12), -0.33, R(-6.2, 15)]);
  }

  /* ---------- houses */
  const winBright = own(
    new THREE.MeshStandardMaterial({ color: "#9cc3dd", emissive: "#ffc066", emissiveIntensity: 0, roughness: 0.3 }),
  );
  const winDim = own(
    new THREE.MeshStandardMaterial({ color: "#9cc3dd", emissive: "#ffc066", emissiveIntensity: 0, roughness: 0.3 }),
  );
  const trimM = mat("#f6f1e7");
  const wallMats = new Set<THREE.MeshStandardMaterial>();
  let winCount = 0;
  const house = (o: HouseOpts) => {
    const by = o.baseY ?? GY;
    const k = o.scale ?? 1;
    const twoStorey = o.h > 3.1;
    const wallM = mat(o.wall, { roughness: 0.9, emissive: o.wall, emissiveIntensity: 0 });
    wallMats.add(wallM);
    mb.add(wallM, roundedBox(o.w, o.h, o.d, 0.06), [o.x, by + o.h / 2, o.z]);
    const f = o.flip ? -1 : 1;
    const roofH = Math.min(o.h * 0.5, 1.45 * k);
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-o.w / 2 - 0.35 * k, 0);
    roofShape.lineTo(o.w / 2 + 0.35 * k, 0);
    roofShape.lineTo(0, roofH);
    roofShape.closePath();
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: o.d + 0.5 * k, bevelEnabled: false });
    roofGeo.translate(0, 0, -(o.d + 0.5 * k) / 2);
    mb.add(mat(o.roof, { flatShading: true, roughness: 0.85 }), roofGeo, [o.x, by + o.h, o.z]);
    roofGeo.dispose();
    mb.add(mat(o.roof, { roughness: 0.9 }), box(0.45 * k, 1.0 * k, 0.45 * k), [o.x - o.w * 0.22, by + o.h + 0.5 * k, o.z + o.d * 0.22]);
    const fx = o.x + o.w / 2 + 0.02;
    const spots: [number, number][] = twoStorey
      ? [
          [-o.d * 0.28, o.h * 0.64],
          [o.d * 0.28, o.h * 0.64],
          [o.d * 0.28, o.h * 0.27],
        ]
      : [
          [o.d * 0.02, 1.35 * k],
          [o.d * 0.3, 1.35 * k],
        ];
    for (const [wz, wy] of spots) {
      mb.add(trimM, box(0.06, 0.95 * k, 0.95 * k), [fx, by + wy, o.z + f * wz]);
      mb.add(winCount++ % 3 === 1 ? winDim : winBright, box(0.07, 0.8 * k, 0.8 * k), [fx + 0.01, by + wy, o.z + f * wz]);
    }
    mb.add(mat(o.door), box(0.07, 1.6 * k, 0.9 * k), [fx, by + 0.8 * k, o.z - f * o.d * 0.28]);
    mb.add(trimM, box(0.5 * k, 0.12, 1.3 * k), [fx + 0.2 * k, by + 0.06, o.z - f * o.d * 0.28]);
    if (o.sideWindows) {
      const fz = o.z + o.d / 2 + 0.02;
      for (const wx of [-o.w * 0.25, o.w * 0.25]) {
        mb.add(trimM, box(0.95 * k, 0.95 * k, 0.06), [o.x + wx, by + 1.35 * k, fz]);
        mb.add(winBright, box(0.8 * k, 0.8 * k, 0.07), [o.x + wx, by + 1.35 * k, fz + 0.01]);
      }
    }
  };
  // Single-storey across the street: roof peaks stay under the cars-view eye line, so the
  // moon and a band of sky clear the rooftops.
  // Lit windows face the gap in the middle so the cars view frames them.
  house({ x: -27, z: -7.4, w: 6, d: 6.6, h: 2.6, wall: "#e8c9a0", roof: "#6b4a3a", door: "#2b3f63" });
  house({ x: -27, z: 3.4, w: 6, d: 6.8, h: 2.8, wall: "#a9c3d4", roof: "#44546a", door: "#d35f4a", flip: true });
  house({ x: -27, z: 13.8, w: 6, d: 7, h: 2.6, wall: "#e2a594", roof: "#5b3a33", door: "#2a8f8a" });

  /* ---------- trees */
  const trunkM = mat("#6b4a35");
  const foliage = ["#4f7d4a", "#5d8c4e", "#3f6b45"].map((c) => mat(c, { flatShading: true, roughness: 0.9 }));
  const tree = (x: number, z: number, s: number, baseY = GY) => {
    const f = pick(foliage);
    mb.add(trunkM, cylinder(0.15, 0.2, 1.6, 8), [x, baseY + 0.8 * s, z], [0, 0, 0], s);
    mb.add(f, ico(1.1), [x, baseY + 2.3 * s, z], [0, R(0, 3), 0], s);
    mb.add(f, ico(0.8), [x + 0.2 * s, baseY + 3.1 * s, z + 0.2 * s], [0, R(0, 3), 0], s);
  };
  tree(-20.8, -2.4, 0.8);
  tree(-20.5, 9.3, 0.8);
  tree(-20.5, 20, 1.0);
  tree(-36, -2.6, 1.0);
  tree(-33, 3, 1.3);
  tree(-34, -8, 1.2);
  tree(-31, 10.5, 1.1);
  // distant tree line softening the horizon in the cars view
  const farM = mat("#3c5e44", { flatShading: true, roughness: 1 });
  for (let z = -22; z <= 26; z += R(3.5, 5.5)) {
    const s = R(1.8, 3.0);
    mb.add(farM, ico(1), [R(-72, -58), GY + s * 0.45, z], [R(0, 3), R(0, 3), 0], [s * 1.3, s, s * 1.2]);
  }

  /* ---------- street lamps (poles merged, heads share one emissive material) */
  const poleM = mat("#2b2f38", { roughness: 0.5, metalness: 0.4 });
  const lampHeads = own(
    new THREE.MeshStandardMaterial({ color: "#fff4dc", emissive: "#ffcf8a", emissiveIntensity: 0, roughness: 0.6 }),
  );
  const lampGlows: THREE.Sprite[] = [];
  const pools: THREE.Mesh[] = [];
  const lamp = (l: { x: number; z: number; headX: number; headY: number }, pool: [number, number, number]) => {
    const topY = l.headY + 0.07;
    mb.add(poleM, cylinder(0.08, 0.1, topY - GY, 8), [l.x, (topY + GY) / 2, l.z]);
    mb.add(poleM, box(Math.abs(l.headX - l.x) + 0.1, 0.08, 0.08), [(l.x + l.headX) / 2, topY, l.z]);
    mb.add(poleM, cylinder(0.14, 0.18, 0.2, 8), [l.x, GY + 0.1, l.z]);
    mb.add(lampHeads, roundedBox(0.44, 0.14, 0.28, 0.04), [l.headX, l.headY, l.z]);
    const glow = glowSprite(kit, "#ffcf8a", 2.4, [l.headX, l.headY - 0.12, l.z]);
    lampGlows.push(glow);
    group.add(glow);
    const decal = lightPool(kit, pool[0], pool[1], [l.headX, -0.36, l.z + pool[2]]);
    pools.push(decal);
    group.add(decal);
  };
  lamp(LAMP, [7, 7, 0]);

  // Lantern post at the near corner of the cut edge: out of the cars view, but its
  // lantern and pool sit right in the overview's line of sight through the window.
  const P = LANTERN;
  mb.add(poleM, cylinder(0.05, 0.07, P.h, 8), [P.x, GY + P.h / 2, P.z]);
  mb.add(poleM, cylinder(0.12, 0.15, 0.16, 8), [P.x, GY + 0.08, P.z]);
  mb.add(lampHeads, roundedBox(0.26, 0.34, 0.26, 0.05), [P.x, GY + P.h + 0.17, P.z]);
  mb.add(poleM, cylinder(0.02, 0.2, 0.14, 4), [P.x, GY + P.h + 0.41, P.z], [0, Math.PI / 4, 0]);
  const lg = glowSprite(kit, "#ffcf8a", 1.8, [P.x, GY + P.h + 0.17, P.z]);
  lampGlows.push(lg);
  group.add(lg);
  // pool kept short of the cut edge so it never glows over the void
  const lp = lightPool(kit, 4.6, 3.2, [P.x - 1.2, -0.36, ST_Z0 + 1.65]);
  pools.push(lp);
  group.add(lp);

  /* ---------- floating islet with a lit cottage (overview backdrop) */
  const rock = new THREE.Mesh(cylinder(3.9, 1.2, 3.4, 7), soil);
  rock.position.set(ISLET.x, ISLET.top - 0.3 - 1.7, ISLET.z);
  const cap = new THREE.Mesh(cylinder(4.0, 3.9, 0.3, 7), grass);
  cap.position.set(ISLET.x, ISLET.top - 0.15, ISLET.z);
  const tip = new THREE.Mesh(cylinder(1.2, 0.1, 1.6, 7), soil);
  tip.position.set(ISLET.x, ISLET.top - 3.4 - 0.3 - 0.8, ISLET.z);
  group.add(rock, cap, tip);
  house({
    x: ISLET.x - 0.3,
    z: ISLET.z - 0.4,
    w: 2.8,
    d: 2.6,
    h: 1.5,
    scale: 0.55,
    wall: "#f0dcc0",
    roof: "#8a4a3a",
    door: "#2b3f63",
    baseY: ISLET.top,
    sideWindows: true,
  });
  tree(ISLET.x - 2.2, ISLET.z + 1.9, 0.6, ISLET.top);
  tree(ISLET.x + 2.3, ISLET.z - 1.8, 0.5, ISLET.top);

  mb.build().forEach((m) => {
    geometries.push(m.geometry);
    group.add(m);
  });

  /* ---------- sky dome with a phase gradient that stays blue below the horizon */
  const skyTex = createCanvasTexture(4, 256);
  textures.push(skyTex);
  const skyGeo = new THREE.SphereGeometry(140, 32, 16);
  geometries.push(skyGeo);
  const sky = new THREE.Mesh(
    skyGeo,
    own(
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false }),
    ),
  );
  sky.renderOrder = -0.5;
  group.add(sky);

  /* ---------- stars: a band above the roofs (cars view), a band below the edge (overview), a sparse dome */
  const starPos: number[] = [];
  const pushStar = (az: number, el: number) => {
    const r = 130;
    starPos.push(Math.cos(az) * Math.cos(el) * r, Math.sin(el) * r, Math.sin(az) * Math.cos(el) * r);
  };
  const deg = Math.PI / 180;
  for (let i = 0; i < 160; i++) pushStar(R(150, 210) * deg, R(2, 10) * deg);
  for (let i = 0; i < 300; i++) pushStar(R(208, 234) * deg, -R(12, 34) * deg);
  for (let i = 0; i < 260; i++) pushStar(R(90, 270) * deg, Math.asin(R(0.08, 1)));
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
  geometries.push(starGeo);
  const stars = new THREE.Points(
    starGeo,
    own(
      new THREE.PointsMaterial({
        color: "#ffffff",
        map: softTexture(),
        size: 4,
        sizeAttenuation: false,
        fog: false,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        toneMapped: false,
      }),
    ),
  );
  group.add(stars);

  /* ---------- moon (cratered), sun, shared glow */
  const moonTex = createCanvasTexture(128, 64, (g, w, h) => {
    g.fillStyle = "#f4f1de";
    g.fillRect(0, 0, w, h);
    const cr = mulberry32(42);
    for (let i = 0; i < 18; i++) {
      g.fillStyle = `rgba(150,145,125,${0.18 + cr() * 0.2})`;
      g.beginPath();
      g.arc(cr() * w, 10 + cr() * (h - 20), 2 + cr() * 7, 0, Math.PI * 2);
      g.fill();
    }
  });
  textures.push(moonTex);
  const orbGeo = new THREE.SphereGeometry(1, 20, 14);
  geometries.push(orbGeo);
  const moon = new THREE.Mesh(
    orbGeo,
    own(new THREE.MeshBasicMaterial({ map: moonTex, color: "#ffffff", fog: false, toneMapped: false })),
  );
  moon.rotation.y = -1.2;
  const sun = new THREE.Mesh(orbGeo, own(new THREE.MeshBasicMaterial({ color: "#fff1c4", fog: false, toneMapped: false })));
  const orbGlow = new THREE.Sprite(
    own(
      new THREE.SpriteMaterial({
        map: softTexture(),
        color: "#c9d6ff",
        transparent: true,
        opacity: 0.4,
        fog: false,
        depthWrite: false,
      }),
    ),
  );
  group.add(moon, sun, orbGlow);

  /* ---------- clouds: a high set above the roofs, a low set drifting past the edge */
  const cloudM = mat("#ffffff", { flatShading: true, roughness: 1, emissive: "#ffffff", emissiveIntensity: 0.25 });
  const clouds: THREE.Mesh[] = [];
  const bases: number[] = [];
  const makeCloud = (x: number, y: number, z: number, s: number, speed: number, span: number) => {
    const cm = new Merger();
    const n = 3 + Math.floor(rnd() * 2);
    for (let k = 0; k < n; k++) {
      cm.add(cloudM, ico(R(1.4, 2.6)), [(k - (n - 1) / 2) * 1.8, R(-0.3, 0.5), R(-0.6, 0.6)], [0, R(0, 3), 0], [1, 0.65, 1]);
    }
    const [mesh] = cm.build();
    mesh.receiveShadow = false;
    geometries.push(mesh.geometry);
    mesh.scale.setScalar(s);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.set(x, y, z);
    clouds.push(mesh);
    group.add(mesh);
    // base z, speed, span, phase offset
    bases.push(z, speed, span, R(0, span));
  };
  for (let i = 0; i < 6; i++) makeCloud(R(-78, -52), R(5.4, 7.4), 0, R(0.8, 1.2), R(0.35, 0.7), 70);
  // along the overview ray past the edge: window + t * (-0.762, -0.435, -0.648)
  for (let i = 0; i < 6; i++) {
    const t = R(34, 72);
    makeCloud(OUT_X - 0.762 * t, WIN_YC - 0.435 * t - R(1, 6), WIN_ZC - 0.648 * t, R(0.9, 1.4), R(0.3, 0.6), 34);
  }

  return {
    group,
    houseWalls: [...wallMats],
    windowsBright: winBright,
    windowsDim: winDim,
    lampHeads,
    lampGlows,
    pools,
    clouds,
    cloudBase: new Float32Array(bases),
    stars,
    moon,
    sun,
    orbGlow,
    skyTex,
    kit,
    geometries,
    textures,
  };
}

/* ================================================================ the car */

/*
 * Gowtam's 2022 BMW M235i xDrive Gran Coupe (F44), a four-door fastback:
 * Storm Bay Metallic, gloss black trim (kidneys, mirrors, roundels), dark
 * tint, 18" bi-color double spokes with blue M Sport calipers. Local units
 * before CAR.s: about 6 long on z (nose toward -z), 2.4 wide, 1.92 tall;
 * y = 0 is the road and +x (the car's right side) faces the window. Side
 * profiles are drawn in (s, y) with s = -z, so the nose is +s.
 */
const STORM_BAY = "#687a8b";
const AXLE_F = -1.79;
const AXLE_R = 1.75;
const TIRE_R = 0.43;
const ARCH_R = 0.52;
const WHEEL_X = 1.02;
/** Body extrusion depth (plus the 0.16 bevel each side = 2.4 wide). */
const BODY_D = 2.08;
/** Greenhouse width at the belt; everything laid on it narrows with the tumblehome. */
const GH_D = 1.94;
const GH_HALF = GH_D / 2;

type P2 = [number, number];

interface Car {
  group: THREE.Group;
  lights: THREE.MeshStandardMaterial[];
  glows: THREE.Sprite[];
  beams: THREE.MeshBasicMaterial[];
  kit: Kit;
  geometries: THREE.BufferGeometry[];
}

function polyShape(pts: P2[]): THREE.Shape {
  return new THREE.Shape(pts.map(([s, y]) => new THREE.Vector2(s, y)));
}

/** Extrudes a side profile across x, centered on x = 0 (s maps to -z). */
function extrudeSide(shape: THREE.Shape, depth: number, bevel = 0, bevelSize = bevel * 0.8): THREE.BufferGeometry {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    curveSegments: 8,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize,
    bevelSegments: 2,
  });
  g.rotateY(Math.PI / 2);
  g.translate(-depth / 2, 0, 0);
  return g;
}

/** Thin panel laid `off` outside the +x (side 1) or -x (side -1) face of the greenhouse. */
function sidePanel(pts: P2[], side: number, off: number): THREE.BufferGeometry {
  const g = extrudeSide(polyShape(pts), 0.012);
  g.translate(side * (GH_HALF + off), 0, 0);
  return g;
}

/** Thin band lying on a sloped profile line (ordered nose to tail): `out` above it, `inn` below. */
function slopeBand(line: P2[], out: number, inn: number): THREE.Shape {
  const n = line.map((_, i) => {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [(b[1] - a[1]) / l, -(b[0] - a[0]) / l] as P2;
  });
  const top = line.map(([s, y], i) => [s + n[i][0] * out, y + n[i][1] * out] as P2);
  const bottom = line.map(([s, y], i) => [s - n[i][0] * inn, y - n[i][1] * inn] as P2).reverse();
  return polyShape([...top, ...bottom]);
}

/** Tumblehome: pull the greenhouse (and anything laid on it) in toward the roof. */
function tumblehome(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = THREE.MathUtils.clamp((p.getY(i) - 1.2) / 0.72, 0, 1);
    p.setX(i, p.getX(i) * (1 - 0.2 * t));
  }
  g.computeVertexNormals();
  return g;
}

/** Plan-view rounding: the corners of the nose and tail pull in toward the center line. */
function pinch(z: number): number {
  const t = Math.max(0, Math.abs(z) - 2.3) / 0.8;
  return 1 - (z < 0 ? 0.05 : 0.12) * t * t;
}

/**
 * Body cross-section: the sides lean in above the shoulder crease (which
 * runs through the door handles) and tuck under at the rocker, and the nose
 * and tail round off in plan. Applied to the shell and to everything laid on it.
 */
function fitBody(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const shoulder = 1 - 0.07 * THREE.MathUtils.clamp((y - 0.98) / 0.3, 0, 1);
    const rocker = 1 - 0.05 * THREE.MathUtils.clamp((0.42 - y) / 0.25, 0, 1);
    p.setX(i, p.getX(i) * shoulder * rocker * pinch(p.getZ(i)));
  }
  g.computeVertexNormals();
  return g;
}

function bodyShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-2.94, 0.3);
  // rear arch, sill, front arch
  s.lineTo(-AXLE_R - ARCH_R, 0.3);
  s.lineTo(-AXLE_R - ARCH_R, TIRE_R);
  s.absarc(-AXLE_R, TIRE_R, ARCH_R, Math.PI, 0, true);
  s.lineTo(-AXLE_R + ARCH_R, 0.2);
  s.lineTo(-AXLE_F - ARCH_R, 0.2);
  s.lineTo(-AXLE_F - ARCH_R, TIRE_R);
  s.absarc(-AXLE_F, TIRE_R, ARCH_R, Math.PI, 0, true);
  s.lineTo(-AXLE_F + ARCH_R, 0.3);
  // bumper, nose (headlights sit on the upper slope), short hood, rising beltline
  s.lineTo(2.95, 0.28);
  s.lineTo(3.02, 0.42);
  s.lineTo(3.04, 0.62);
  s.lineTo(2.98, 0.8);
  s.lineTo(2.82, 0.92);
  s.lineTo(2.55, 0.98);
  s.lineTo(1.25, 1.1);
  s.lineTo(-1.6, 1.16);
  // short trunk deck with its lip spoiler, then the rear bumper
  s.lineTo(-2.42, 1.21);
  s.lineTo(-2.84, 1.23);
  s.lineTo(-2.92, 1.27);
  s.lineTo(-3.0, 1.02);
  s.lineTo(-3.02, 0.55);
  s.closePath();
  return s;
}

/** Greenhouse profile: raked windshield, arched roof peaking over the B-pillar, fastback rear window. */
const GREENHOUSE: P2[] = [
  [1.25, 1.1],
  [0.35, 1.8],
  [-0.1, 1.9],
  [-0.45, 1.92],
  [-0.95, 1.86],
  [-1.2, 1.8],
  [-1.75, 1.5],
  [-2.42, 1.24],
  [-2.42, 1.1],
];

/** Side window opening (satin black surround), with the Hofmeister kink at the bottom of the C-pillar. */
const DLO: P2[] = [
  [1.14, 1.16],
  [0.32, 1.77],
  [-0.1, 1.85],
  [-0.45, 1.87],
  [-0.95, 1.81],
  [-1.36, 1.56],
  [-1.63, 1.3],
  [-1.52, 1.2],
];

/** Frameless door glass: front door, rear door, and the fixed quarter light, split by black pillars. */
const SIDE_GLASS: P2[][] = [
  [
    [1.08, 1.2],
    [0.33, 1.745],
    [0.03, 1.8],
    [0.03, 1.22],
  ],
  [
    [-0.13, 1.225],
    [-0.13, 1.83],
    [-0.45, 1.845],
    [-0.95, 1.785],
    [-1.08, 1.71],
    [-1.08, 1.245],
  ],
  [
    [-1.13, 1.247],
    [-1.13, 1.68],
    [-1.34, 1.54],
    [-1.58, 1.3],
    [-1.5, 1.26],
    [-1.48, 1.255],
  ],
];

/** Door shut lines on each side: front door leading edge, the B-pillar split, and the rear door edge around the arch. */
const DOOR_SEAMS: P2[][] = [
  [
    [1.22, 0.22],
    [1.22, 0.62],
    [1.3, 0.95],
    [1.26, 1.1],
  ],
  [
    [-0.05, 0.22],
    [-0.05, 1.12],
  ],
  [
    [-1.17, 0.22],
    [-1.17, 0.52],
    [-1.3, 0.86],
    [-1.5, 1.02],
    [-1.52, 1.15],
  ],
];

function buildCar(): Car {
  const kit = materialKit();
  const { mat, own } = kit;
  const mb = new Merger();
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const temp: THREE.BufferGeometry[] = [];
  const tmp = (g: THREE.BufferGeometry) => (temp.push(g), g);
  const parent = new THREE.Matrix4().compose(
    new THREE.Vector3(CAR.x, CAR.y, CAR.z),
    new THREE.Quaternion(),
    new THREE.Vector3(CAR.s, CAR.s, CAR.s),
  );
  const add = (m: THREE.Material, g: THREE.BufferGeometry, pos: V3 = [0, 0, 0], rot?: V3) => mb.add(m, g, pos, rot, 1, parent);
  /** A transformed, disposable copy of a shared geometry (so it can be bent with fitBody). */
  const at = (g: THREE.BufferGeometry, pos: V3, rot: V3 = [0, 0, 0]) => {
    const c = tmp(g.index ? g.toNonIndexed() : g.clone());
    tmpQ.setFromEuler(tmpE.set(rot[0], rot[1], rot[2]));
    c.applyMatrix4(tmpM.compose(tmpP.set(pos[0], pos[1], pos[2]), tmpQ, tmpS.setScalar(1)));
    return c;
  };

  const paint = mat(STORM_BAY, { metalness: 0.25, roughness: 0.35 });
  const gloss = mat("#0e1014", { metalness: 0.3, roughness: 0.2 });
  const satin = mat("#050607", { roughness: 0.6 });
  const matte = mat("#1a1e24", { roughness: 0.85 });
  const glassM = mat("#3a4b5e", { metalness: 0.3, roughness: 0.06, flatShading: true });
  const tireM = mat("#15181f", { roughness: 0.9 });
  const rimM = mat("#2c3036", { metalness: 0.5, roughness: 0.45 });
  const spokeM = mat("#c9ced4", { metalness: 0.7, roughness: 0.3 });
  const caliperM = mat("#2a62d6", { metalness: 0.2, roughness: 0.45 });
  const exhaustM = mat("#70757c", { metalness: 0.8, roughness: 0.3 });
  const whiteM = mat("#e8edf2", { roughness: 0.5 });

  /* ---------- body shell and greenhouse */
  // Subdivide first so the flat sides have vertices to bend at the crease and rocker.
  const shell = tmp(extrudeSide(bodyShape(), BODY_D, 0.16, 0.07));
  add(paint, tmp(fitBody(new TessellateModifier(0.22, 8).modify(shell))));
  // dark wheel wells behind the arches
  for (const z of [AXLE_F, AXLE_R]) add(matte, box(2.3, 0.45, 1.05), [0, 0.72, z]);

  add(paint, tmp(tumblehome(extrudeSide(polyShape(GREENHOUSE), GH_D))));
  // windshield and rear window lying on the greenhouse slopes
  add(glassM, tmp(tumblehome(extrudeSide(slopeBand([[1.2, 1.139], [0.4, 1.761]], 0.012, 0.01), GH_D - 0.14))));
  add(glassM, tmp(tumblehome(extrudeSide(slopeBand([[-1.22, 1.79], [-1.75, 1.5], [-2.39, 1.252]], 0.012, 0.01), GH_D - 0.2))));
  // roof shark fin
  add(paint, tmp(tumblehome(extrudeSide(polyShape([[-0.9, 1.85], [-1.2, 1.79], [-1.12, 1.95]]), 0.09))));
  for (const side of [1, -1]) {
    add(satin, tmp(tumblehome(sidePanel(DLO, side, 0.006))));
    for (const pane of SIDE_GLASS) add(glassM, tmp(tumblehome(sidePanel(pane, side, 0.014))));
  }

  /* ---------- sides: door shut lines, handles on the shoulder crease, sill, mirrors */
  for (const sx of [1, -1]) {
    const x = sx * 1.205;
    for (const seam of DOOR_SEAMS) {
      for (let i = 0; i + 1 < seam.length; i++) {
        const [s0, y0] = seam[i];
        const [s1, y1] = seam[i + 1];
        const dz = s0 - s1;
        const dy = y1 - y0;
        const len = Math.hypot(dz, dy) + 0.014;
        add(satin, fitBody(at(box(0.012, len, 0.02), [x, (y0 + y1) / 2, -(s0 + s1) / 2], [Math.atan2(dz, dy), 0, 0])));
      }
    }
    for (const z of [-0.22, 0.98]) {
      add(paint, fitBody(at(box(0.05, 0.045, 0.22), [sx * 1.22, 0.93, z])));
      add(satin, fitBody(at(box(0.012, 0.012, 0.2), [sx * 1.209, 0.9, z])));
    }
    add(gloss, fitBody(at(box(0.03, 0.09, 2.3), [sx * 1.205, 0.26, -0.02])));
    add(gloss, box(0.22, 0.05, 0.1), [sx * 1.16, 1.21, -1.1]);
    add(gloss, roundedBox(0.28, 0.15, 0.2, 0.05), [sx * 1.33, 1.26, -1.08]);
  }

  /* ---------- front: tall connected kidneys, angled headlights, intakes, hood roundel */
  for (const sx of [1, -1]) {
    add(gloss, roundedBox(0.42, 0.38, 0.06, 0.07), [sx * 0.232, 0.62, -3.12], [0.12, 0, 0]);
    add(matte, box(0.34, 0.3, 0.02), [sx * 0.232, 0.62, -3.155], [0.12, 0, 0]);
    add(gloss, box(0.5, 0.15, 0.03), [sx * 0.72, 0.734, -3.08], [0.32, 0, sx * 0.1]);
    // the headlight wraps around the corner onto the fender
    add(gloss, fitBody(at(box(0.012, 0.11, 0.3), [sx * 1.205, 0.78, -2.8])));
    add(matte, box(0.3, 0.2, 0.05), [sx * 0.7, 0.42, -3.09], [0, 0, sx * 0.12]);
    add(gloss, box(0.05, 0.22, 0.06), [sx * 0.86, 0.42, -3.09], [0, 0, sx * 0.12]);
  }
  add(matte, box(0.9, 0.12, 0.05), [0, 0.34, -3.06]);
  add(gloss, cylinder(0.065, 0.065, 0.015, 16), [0, 0.916, -2.942], [-0.64, 0, 0]);
  add(whiteM, cylinder(0.042, 0.042, 0.015, 16), [0, 0.922, -2.946], [-0.64, 0, 0]);

  /* ---------- rear: taillight housings, bumper slits, diffuser, trapezoid exhausts, plate, roundel */
  for (const sx of [1, -1]) {
    add(gloss, box(0.66, 0.12, 0.04), [sx * 0.58, 0.96, 3.085]);
    add(gloss, box(0.035, 0.16, 0.04), [sx * 0.82, 0.56, 3.085]);
    add(exhaustM, box(0.22, 0.09, 0.12), [sx * 0.68, 0.34, 3.08]);
    add(gloss, box(0.18, 0.06, 0.02), [sx * 0.68, 0.34, 3.142]);
  }
  add(gloss, box(1.9, 0.16, 0.08), [0, 0.35, 3.04]);
  add(whiteM, box(0.5, 0.24, 0.02), [0, 0.72, 3.095]);
  add(gloss, cylinder(0.06, 0.06, 0.015, 16), [0, 0.975, 3.1], [Math.PI / 2, 0, 0]);
  add(whiteM, cylinder(0.038, 0.038, 0.015, 16), [0, 0.975, 3.107], [Math.PI / 2, 0, 0]);

  /* ---------- wheels: open tires, dark barrels, machined double spokes, blue calipers */
  const tread = cylinder(TIRE_R, TIRE_R, 0.3, 24, true);
  const sidewall = tmp(new THREE.RingGeometry(0.3, TIRE_R, 24));
  const lip = tmp(new THREE.TorusGeometry(0.3, 0.016, 4, 28));
  for (const z of [AXLE_F, AXLE_R]) {
    for (const sx of [1, -1]) {
      const cx = sx * WHEEL_X;
      const y = TIRE_R;
      add(tireM, tread, [cx, y, z], [0, 0, Math.PI / 2]);
      add(tireM, sidewall, [cx + sx * 0.15, y, z], [0, (sx * Math.PI) / 2, 0]);
      add(tireM, sidewall, [cx - sx * 0.15, y, z], [0, (-sx * Math.PI) / 2, 0]);
      add(rimM, cylinder(0.3, 0.3, 0.26, 20, true), [cx, y, z], [0, 0, Math.PI / 2]);
      add(rimM, cylinder(0.3, 0.3, 0.02, 20), [cx + sx * 0.05, y, z], [0, 0, Math.PI / 2]);
      add(caliperM, box(0.05, 0.17, 0.12), [cx + sx * 0.1, y + 0.13, z + 0.13], [0.8, 0, 0]);
      add(spokeM, lip, [cx + sx * 0.15, y, z], [0, Math.PI / 2, 0]);
      for (let i = 0; i < 5; i++) {
        for (const d of [-0.15, 0.15]) {
          const ang = (i / 5) * Math.PI * 2 + d;
          add(spokeM, box(0.03, 0.24, 0.034), [cx + sx * 0.155, y + Math.cos(ang) * 0.16, z + Math.sin(ang) * 0.16], [ang, 0, 0]);
        }
      }
      add(gloss, cylinder(0.055, 0.055, 0.04, 12), [cx + sx * 0.165, y, z], [0, 0, Math.PI / 2]);
    }
  }

  mb.build().forEach((m) => {
    m.castShadow = true;
    geometries.push(m.geometry);
    group.add(m);
  });

  // Lights animate per phase: own materials, excluded from the hover clone.
  const head = own(new THREE.MeshStandardMaterial({ color: "#eef5ff", emissive: "#e4eeff", emissiveIntensity: 0.3 }));
  const tail = own(new THREE.MeshStandardMaterial({ color: "#ff4455", emissive: "#ff2233", emissiveIntensity: 0.5 }));
  const lm = new Merger();
  const lamp = (m: THREE.Material, g: THREE.BufferGeometry, pos: V3 = [0, 0, 0], rot?: V3) => lm.add(m, g, pos, rot, 1, parent);
  for (const sx of [1, -1]) {
    // slim LED bar on the nose slope, just proud of its housing
    lamp(head, box(0.42, 0.035, 0.02), [sx * 0.73, 0.75, -3.098], [0.32, 0, sx * 0.1]);
    lamp(head, fitBody(at(box(0.012, 0.03, 0.24), [sx * 1.211, 0.8, -2.8])));
    // L-shaped taillight wrapping around onto the rear fender
    lamp(tail, box(0.58, 0.05, 0.02), [sx * 0.6, 0.975, 3.11]);
    lamp(tail, box(0.045, 0.1, 0.02), [sx * 0.875, 0.93, 3.11]);
    lamp(tail, fitBody(at(box(0.02, 0.055, 0.3), [sx * 1.207, 0.975, 2.82])));
  }
  const glows: THREE.Sprite[] = [];
  const world = new THREE.Vector3();
  for (const x of [-0.72, 0.72]) {
    world.set(x, 0.75, -3.22).applyMatrix4(parent);
    glows.push(glowSprite(kit, "#eef4ff", 0.9, [world.x, world.y, world.z]));
    world.set(x * 0.9, 0.97, 3.25).applyMatrix4(parent);
    glows.push(glowSprite(kit, "#ff3344", 0.7, [world.x, world.y, world.z]));
  }
  lm.build().forEach((m) => {
    m.userData.noHighlight = true;
    geometries.push(m.geometry);
    group.add(m);
  });
  glows.forEach((g) => group.add(g));
  temp.forEach((g) => g.dispose());

  // headlight wash on the road ahead (reaches the part of the street the overview sees)
  const beams: THREE.MeshBasicMaterial[] = [];
  const front = CAR.z - 3.05 * CAR.s;
  for (const x of [-0.72, 0.72]) {
    const bm = own(
      new THREE.MeshBasicMaterial({
        map: softTexture(),
        color: "#f2f6ff",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    beams.push(bm);
    const beam = new THREE.Mesh(plane(1.5, front - ST_Z0), bm);
    beam.rotation.x = -Math.PI / 2;
    beam.position.set(CAR.x + x * CAR.s, -0.365, (front + ST_Z0) / 2 - 0.1);
    beam.userData.noHighlight = true;
    group.add(beam);
  }

  // soft shadow blob under the car
  const blob = new THREE.Mesh(
    plane(3.0 * CAR.s, 7 * CAR.s),
    own(
      new THREE.MeshBasicMaterial({ map: softTexture(), color: "#000000", transparent: true, opacity: 0.4, depthWrite: false }),
    ),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.set(CAR.x, CAR.y + 0.012, CAR.z);
  blob.userData.noHighlight = true;
  group.add(blob);

  return { group, lights: [head, tail], glows, beams, kit, geometries };
}

/* ================================================================ sky gradient */

function drawSky(config: PhaseConfig, phase: Phase) {
  const [low1, low2] = LOWER_SKY[phase];
  return (g: CanvasRenderingContext2D, w: number, h: number) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, config.sky[0]);
    gr.addColorStop(0.3, config.sky[1]);
    gr.addColorStop(0.5, config.sky[2]);
    gr.addColorStop(0.555, config.sky[2]);
    gr.addColorStop(0.64, low1);
    gr.addColorStop(1, low2);
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  };
}

/* ================================================================ window (in the room) */

function useCurtainGeometry(): THREE.BufferGeometry {
  const geo = useMemo(() => {
    const ch = WIN.y1 + 0.28 - 1.0;
    const g = new THREE.PlaneGeometry(0.72, ch, 16, 6);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      // 0 at the rod, 1 at the hem: folds deepen and the panel flares a little toward the floor
      const down = 0.5 - y / ch;
      const flare = 1 + down * 0.18;
      p.setX(i, x * flare);
      p.setZ(i, Math.sin((x / 0.72) * Math.PI * 5) * (0.04 + down * 0.035));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
}

function WindowFrame() {
  const curtainGeo = useCurtainGeometry();
  const frameM = std("#f6f1e7", { roughness: 0.6 });
  const rodM = std(C.brass, { metalness: 0.7, roughness: 0.35 });
  const curtainM = std(C.mustard, { roughness: 0.95, side: THREE.DoubleSide, flatShading: true });
  const potM = std("#d98a6a");
  const cactusM = std("#6a9a52", { flatShading: true });
  const glassM = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#cfe8ff",
        transparent: true,
        opacity: 0.1,
        roughness: 0.05,
        metalness: 0.1,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => glassM.dispose(), [glassM]);

  const rodY = WIN.y1 + 0.28;
  const ch = rodY - 1.0;
  const sillTop = WIN.y0 + 0.08;
  const cx = -4.86;
  const cz = -0.8;

  return (
    <group>
      {/* frame */}
      <mesh geometry={box(T + 0.04, 0.1, WIN_W + 0.04)} material={frameM} position={[LX, WIN.y1 - 0.05, WIN_ZC]} castShadow receiveShadow />
      <mesh
        geometry={roundedBox(0.55, 0.1, WIN_W + 0.4, 0.03)}
        material={frameM}
        position={[-HW + 0.06, WIN.y0 + 0.03, WIN_ZC]}
        castShadow
        receiveShadow
      />
      <mesh geometry={box(T + 0.04, WIN_H, 0.08)} material={frameM} position={[LX, WIN_YC, WIN.z0 + 0.04]} castShadow receiveShadow />
      <mesh geometry={box(T + 0.04, WIN_H, 0.08)} material={frameM} position={[LX, WIN_YC, WIN.z1 - 0.04]} castShadow receiveShadow />
      <mesh geometry={box(0.06, WIN_H, 0.07)} material={frameM} position={[LX, WIN_YC, WIN_ZC]} castShadow />
      <mesh geometry={box(0.06, 0.07, WIN_W)} material={frameM} position={[LX, WIN_YC + 0.25, WIN_ZC]} castShadow />
      <mesh geometry={plane(WIN_W, WIN_H)} material={glassM} position={[LX, WIN_YC, WIN_ZC]} rotation-y={Math.PI / 2} />

      {/* sill cactus */}
      <mesh geometry={cylinder(0.1, 0.075, 0.17, 14)} material={potM} position={[cx, sillTop + 0.085, cz]} castShadow receiveShadow />
      <mesh geometry={cylinder(0.105, 0.105, 0.035, 14)} material={potM} position={[cx, sillTop + 0.17, cz]} castShadow />
      <mesh geometry={sphere(0.085, 8, 6)} material={cactusM} position={[cx, sillTop + 0.32, cz]} scale={[1, 1.8, 1]} castShadow />
      <mesh geometry={sphere(0.045, 6, 5)} material={cactusM} position={[cx, sillTop + 0.35, cz + 0.1]} scale={[1, 1.5, 1]} castShadow />
      <mesh geometry={sphere(0.04, 6, 5)} material={cactusM} position={[cx, sillTop + 0.29, cz - 0.09]} scale={[1, 1.4, 1]} castShadow />

      {/* curtain rod with brackets and finials */}
      <mesh geometry={cylinder(0.03, 0.03, WIN_W + 1.4, 10)} material={rodM} position={[-4.78, rodY, WIN_ZC]} rotation-x={Math.PI / 2} castShadow />
      <mesh geometry={sphere(0.065, 10, 8)} material={rodM} position={[-4.78, rodY, WIN.z0 - 0.7]} castShadow />
      <mesh geometry={sphere(0.065, 10, 8)} material={rodM} position={[-4.78, rodY, WIN.z1 + 0.7]} castShadow />
      <mesh geometry={box(0.24, 0.04, 0.04)} material={rodM} position={[-4.88, rodY, WIN.z0 - 0.45]} />
      <mesh geometry={box(0.24, 0.04, 0.04)} material={rodM} position={[-4.88, rodY, WIN.z1 + 0.45]} />

      {/* curtains */}
      {[WIN.z0 - 0.3, WIN.z1 + 0.3].map((z) => (
        <mesh
          key={z}
          geometry={curtainGeo}
          material={curtainM}
          position={[-4.8, rodY - ch / 2, z]}
          rotation-y={Math.PI / 2}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}

/* ================================================================ component */

const orbDir = new THREE.Vector3();
const orbAnchor = new THREE.Vector3();

/** Window, curtains, cactus, and the street outside (stencil portal), driven by the time of day. */
export function WindowStreet() {
  const store = useRoomStore();
  const { phase, config } = usePhase();
  const light = useRef<THREE.PointLight>(null);

  const outside = useMemo(() => buildOutside(), []);
  const car = useMemo(() => buildCar(), []);

  useEffect(
    () => () => {
      for (const o of [outside, car]) {
        o.geometries.forEach((g) => g.dispose());
        o.kit.owned.forEach((m) => m.dispose());
      }
      outside.textures.forEach((t) => t.dispose());
    },
    [outside, car],
  );

  // Time of day: sky, orbs, stars, clouds, windows, lamps, car lights.
  useEffect(() => {
    const night = phase === "night";
    const dim = phase === "dusk" || phase === "dawn";
    redraw(outside.skyTex, drawSky(config, phase));
    outside.stars.visible = config.stars;
    outside.moon.visible = config.moon;
    outside.sun.visible = !config.moon;
    (outside.sun.material as THREE.MeshBasicMaterial).color.set(phase === "day" ? "#fff6d8" : "#ffc08a");
    const glowM = outside.orbGlow.material;
    glowM.color.set(config.moon ? "#c9d6ff" : phase === "day" ? "#fff6d8" : "#ffb07a");
    glowM.opacity = config.moon ? 0.42 : 0.7;
    outside.clouds.forEach((c) => {
      c.visible = !night;
    });
    outside.houseWalls.forEach((m) => {
      m.emissiveIntensity = night ? 0.1 : dim ? 0.04 : 0;
    });
    outside.windowsBright.emissiveIntensity = night ? 1.5 : dim ? 0.55 : 0;
    outside.windowsDim.emissiveIntensity = night ? 0.35 : dim ? 0.4 : 0;
    outside.lampHeads.emissiveIntensity = night ? 3 : dim ? 1.2 : 0;
    outside.lampGlows.forEach((s) => {
      s.material.opacity = night ? 0.85 : dim ? 0.35 : 0;
    });
    outside.pools.forEach((p) => {
      (p.material as THREE.MeshBasicMaterial).opacity = night ? 0.5 : dim ? 0.18 : 0;
      p.visible = night || dim;
    });
    car.lights.forEach((m) => {
      m.emissiveIntensity = night ? 1.1 : 0.3;
    });
    car.glows.forEach((s) => {
      s.material.opacity = night ? 0.8 : dim ? 0.3 : 0;
    });
    car.beams.forEach((m) => {
      m.opacity = night ? 0.3 : dim ? 0.1 : 0;
    });
    if (light.current) light.current.intensity = night ? 30 : dim ? 8 : 0;
  }, [phase, config, outside, car]);

  useFrame((state) => {
    // Moon and sun sit on the camera ray through a spot in the window, pushed ORB_D
    // beyond it. Zoomed in (cars view, nearly level) the spot is just above the eye
    // line, so the moon rises over the rooftops; from the overview (far, looking down
    // about 24 degrees) it clamps to the top of the -z pane, where the ray continues
    // past the cut street edge into the open sky. Apparent size shrinks with distance
    // a little slower than the window does, so it stays readable from afar.
    const cam = state.camera.position;
    const dist = cam.distanceTo(WIN_CENTER);
    const k = THREE.MathUtils.clamp((dist - 12) / 12, 0, 1);
    const angular = 0.0175 * Math.pow(THREE.MathUtils.clamp(11 / dist, 0.1, 1.3), 0.72);
    const hd = Math.max(1, cam.x - OUT_X);
    const rWin = angular * dist * 1.25;
    // Looking down, the wall thickness hides a strip under the top of the frame.
    const hidden = (T * Math.max(0, cam.y - WIN.y1)) / hd;
    const yWant = cam.y + Math.tan(ORB_ELEVATION) * hd;
    const y = THREE.MathUtils.clamp(yWant, WIN_YC + 0.5, WIN.y1 - 0.1 - hidden - rWin);
    orbAnchor.set(OUT_X, y, THREE.MathUtils.lerp(-1.15, -2.42, k));
    orbDir.copy(orbAnchor).sub(cam);
    const camToAnchor = orbDir.length();
    orbDir.multiplyScalar(1 / camToAnchor);
    const radius = angular * (camToAnchor + ORB_D);
    const orb = config.moon ? outside.moon : outside.sun;
    orb.position.copy(orbAnchor).addScaledVector(orbDir, ORB_D);
    orb.scale.setScalar(config.moon ? radius : radius * 1.15);
    outside.orbGlow.position.copy(orbAnchor).addScaledVector(orbDir, ORB_D + 4);
    outside.orbGlow.scale.setScalar(radius * (config.moon ? 7 : 9));

    if (!outside.clouds[0].visible || store.getState().reducedMotion) return;
    const b = outside.cloudBase;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < outside.clouds.length; i++) {
      const baseZ = b[i * 4];
      const speed = b[i * 4 + 1];
      const span = b[i * 4 + 2];
      const off = b[i * 4 + 3];
      outside.clouds[i].position.z = baseZ + (((off + t * speed) % span) + span) % span - span / 2;
    }
  });

  return (
    <group>
      {/* stencil portal: the window opening writes 1, the outside draws only there */}
      <mesh geometry={plane(WIN_W, WIN_H)} position={[OUT_X + 0.005, WIN_YC, WIN_ZC]} rotation-y={Math.PI / 2} renderOrder={-1}>
        <meshBasicMaterial
          colorWrite={false}
          depthWrite={false}
          stencilWrite
          stencilRef={1}
          stencilFunc={THREE.AlwaysStencilFunc}
          stencilZPass={THREE.ReplaceStencilOp}
        />
      </mesh>

      <Hotspot id="cars">
        <WindowFrame />
      </Hotspot>

      <primitive object={outside.group} />
      <Hotspot id="cars">
        <primitive object={car.group} />
      </Hotspot>

      <pointLight ref={light} color="#ffcf8a" intensity={0} distance={9} decay={1.4} position={[LAMP.headX, 3.9, LAMP.z]} />
    </group>
  );
}
