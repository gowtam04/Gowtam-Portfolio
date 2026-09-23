"use client";

import { Hotspot } from "../Hotspot";
import { box } from "../geometry";
import { C, std } from "../materials";

/**
 * STUB (Phase 0). Owner: Games corner agent.
 * Replace with the real model; see docs/design/room-architecture.md.
 */
export function GamesCorner() {
  return (
    <Hotspot id="games">
      <mesh geometry={box(0.95, 0.62, 3.0)} material={std(C.walnut)} position={[-4.5, 0.41, 3.1]} castShadow receiveShadow />
      <mesh geometry={box(0.1, 1.35, 2.35)} material={std(C.dark)} position={[-4.78, 1.62, 3.1]} castShadow />
    </Hotspot>
  );
}
