"use client";

import { useId, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { SpotId } from "./hotspots";
import { useRoomStore } from "./store";

/** Emissive boost added at full highlight (from the prototype). */
const HL = new THREE.Color(0.06, 0.1, 0.12);
const tmp = new THREE.Color();

type Highlightable = THREE.Material & {
  emissive: THREE.Color;
  emissiveIntensity: number;
  userData: { hotspotBase?: THREE.Color; hotspotOwner?: string };
};

function hasEmissive(m: THREE.Material): m is Highlightable {
  return (m as Partial<Highlightable>).emissive instanceof THREE.Color;
}

/**
 * Wrap the meshes of a hotspot object. On hover (or nav focus) the meshes get
 * an eased emissive glow. Several <Hotspot> wrappers may share one id.
 *
 * Rules for children:
 * - Materials are cloned per wrapper on mount (shared `std()` materials stay untouched).
 * - If you animate a material (bulbs, LEDs), set `userData={{ noHighlight: true }}`
 *   on that mesh so it is not cloned, and keep animating your own instance.
 * - Pointer handling is central (see Interaction); do not add onClick handlers.
 */
export function Hotspot({ id, children }: { id: SpotId; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const store = useRoomStore();
  const mats = useRef<Highlightable[]>([]);
  const level = useRef(0);
  const owner = useRef(`${id}:${useId()}`);

  const adopt = () => {
    const root = group.current;
    if (!root) return;
    const clones = new Map<THREE.Material, THREE.Material>();
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || mesh.userData.noHighlight) return;
      const swap = (m: THREE.Material): THREE.Material => {
        if (!hasEmissive(m) || m.userData.hotspotOwner === owner.current) return m;
        let c = clones.get(m);
        if (!c) {
          c = m.clone();
          const hc = c as Highlightable;
          hc.userData = { ...hc.userData, hotspotOwner: owner.current, hotspotBase: hc.emissive.clone() };
          clones.set(m, c);
          mats.current.push(hc);
        }
        return c;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
    });
  };

  useLayoutEffect(() => {
    adopt();
    const owned = mats.current;
    return () => {
      owned.forEach((m) => m.dispose());
      mats.current = [];
    };
  }, []);

  useFrame((_, dt) => {
    const s = store.getState();
    const want = (s.hoveredSpot === id || s.navFocus === id) && s.openSpot !== id ? 1 : 0;
    const prev = level.current;
    if (prev === want && want === 0) return;
    let next = prev + (want - prev) * Math.min(1, dt * 10);
    if (Math.abs(next - want) < 0.002) next = want;
    level.current = next;
    // Pick up meshes mounted after the first pass (lazy children, Suspense).
    if (want === 1 && prev === 0) adopt();
    for (const m of mats.current) {
      const base = m.userData.hotspotBase;
      if (!base) continue;
      tmp.copy(HL).multiplyScalar(next / Math.max(0.5, m.emissiveIntensity));
      m.emissive.copy(base).add(tmp);
    }
  });

  return <group ref={group}>{children}</group>;
}
