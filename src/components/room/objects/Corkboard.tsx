"use client";

import { Hotspot } from "../Hotspot";
import { box } from "../geometry";
import { C, std } from "../materials";

/**
 * STUB (Phase 0). Owner: Wall pieces agent.
 * Replace with the real model; see docs/design/room-architecture.md.
 */
export function Corkboard() {
  return (
    <Hotspot id="about">
      <mesh geometry={box(3.3, 2.3, 0.08)} material={std(C.mustard)} position={[-2.2, 3.35, -4.95]} />
    </Hotspot>
  );
}
