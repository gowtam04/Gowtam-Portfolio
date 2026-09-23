"use client";

import { Hotspot } from "../Hotspot";
import { box } from "../geometry";
import { C, std } from "../materials";

/**
 * STUB (Phase 0). Owner: Shell and street agent.
 * Replace with the real model; see docs/design/room-architecture.md.
 */
export function WindowStreet() {
  return (
    <Hotspot id="cars">
      <mesh geometry={box(0.2, 3.5, 3.2)} material={std(C.glass)} position={[-4.95, 3.15, -1.9]} />
    </Hotspot>
  );
}
