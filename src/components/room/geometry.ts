import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Vec3 } from "./hotspots";

const geoCache = new Map<string, THREE.BufferGeometry>();

/** Cache any geometry by key. Shared: never mutate the result. */
export function cachedGeometry<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key);
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g as T;
}

/** Rounded box (the prototype's `rbox`). Radius defaults to 20% of the smallest side. */
export function roundedBox(w: number, h: number, d: number, r?: number, segments = 2): THREE.BufferGeometry {
  const rad = Math.max(0.0015, r ?? Math.min(w, h, d) * 0.2);
  return cachedGeometry(`rbox:${w}:${h}:${d}:${rad}:${segments}`, () => new RoundedBoxGeometry(w, h, d, segments, rad));
}

export function box(w: number, h: number, d: number): THREE.BufferGeometry {
  return cachedGeometry(`box:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d));
}

export function cylinder(rt: number, rb: number, h: number, seg = 20, open = false): THREE.BufferGeometry {
  return cachedGeometry(`cyl:${rt}:${rb}:${h}:${seg}:${open}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open));
}

export function sphere(r: number, ws = 16, hs = 12): THREE.BufferGeometry {
  return cachedGeometry(`sph:${r}:${ws}:${hs}`, () => new THREE.SphereGeometry(r, ws, hs));
}

export function plane(w: number, h: number): THREE.BufferGeometry {
  return cachedGeometry(`plane:${w}:${h}`, () => new THREE.PlaneGeometry(w, h));
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Transform for a cylinder of height 1 stretched between two points (the prototype's `rod`).
 * Usage: `<mesh {...rodTransform(a, b)} geometry={cylinder(r, r, 1, 10)} />`.
 */
export function rodTransform(a: Vec3, b: Vec3): {
  position: Vec3;
  quaternion: THREE.Quaternion;
  scale: Vec3;
} {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const len = dir.length();
  const mid = va.addScaledVector(dir, 0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
  return { position: [mid.x, mid.y, mid.z], quaternion, scale: [1, len, 1] };
}

/** Seeded PRNG so procedural layouts (planks, books, stars) are stable between loads. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** `rand(min, max)` from a seeded PRNG. */
export function seededRange(seed: number): (min: number, max: number) => number {
  const r = mulberry32(seed);
  return (min, max) => min + (max - min) * r();
}
