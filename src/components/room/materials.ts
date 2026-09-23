import * as THREE from "three";

/** Room palette (from the prototype). Use these before inventing new colors. */
export const C = {
  wall: "#efe4d2",
  wain: "#7f9d8c",
  trim: "#f6efe3",
  cap: "#3e2c23",
  base: "#4a3428",
  oak: "#cfa57a",
  walnut: "#8a5a3c",
  dark: "#1a1f2a",
  navy: "#24324d",
  coral: "#e8704f",
  cream: "#f3ede2",
  mustard: "#d8a25e",
  cyan: "#22d3ee",
  brass: "#c9a15a",
  teal: "#2a8f8a",
  red: "#d93b3b",
  glass: "#9cc3dd",
  warmLight: "#ffc98a",
} as const;

/** Teeko's coat: black and tan, the black lifted just enough to read in low light. */
export const TEEKO = {
  coat: "#1d1b22",
  coatLift: "#2e2a33",
  /** Tan points: chest, belly, legs, under-tail, eyebrow dots, cheeks, muzzle. */
  tan: "#b8834f",
  tanShade: "#8f6238",
  muzzle: "#b8834f",
  chest: "#3d3842",
  innerEar: "#5a4446",
  nose: "#0b0a0d",
  eye: "#07070a",
  eyeHighlight: "#ffffff",
  tongue: "#e98a8a",
  bed: "#b5543f",
  bedCushion: "#e9d8bf",
} as const;

export interface StdOptions {
  roughness?: number;
  metalness?: number;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  flatShading?: boolean;
  side?: THREE.Side;
  transparent?: boolean;
  opacity?: number;
}

const stdCache = new Map<string, THREE.MeshStandardMaterial>();

/**
 * Shared, cached MeshStandardMaterial (roughness 0.82, metalness 0 by default).
 * The same arguments return the same instance: never mutate the result.
 * If you need to animate a material, create your own with `stdUnique`.
 */
export function std(color: THREE.ColorRepresentation, opts: StdOptions = {}): THREE.MeshStandardMaterial {
  const key = `${String(color)}|${JSON.stringify(opts)}`;
  let m = stdCache.get(key);
  if (!m) {
    m = stdUnique(color, opts);
    stdCache.set(key, m);
  }
  return m;
}

/** A fresh MeshStandardMaterial you own (safe to animate). */
export function stdUnique(color: THREE.ColorRepresentation, opts: StdOptions = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...opts });
}

/** Unlit material for screens and glowing canvases (not affected by tone mapping). */
export function screenMaterial(map: THREE.Texture): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ map, toneMapped: false });
}
