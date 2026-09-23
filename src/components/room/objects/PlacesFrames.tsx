"use client";

import { Hotspot } from "../Hotspot";
import { box } from "../geometry";
import { C, std } from "../materials";

/**
 * STUB (Phase 0). Owner: Wall pieces agent.
 * Replace with the real model; see docs/design/room-architecture.md.
 */
export function PlacesFrames() {
  return (
    <Hotspot id="places">
      <mesh geometry={box(0.06, 0.7, 0.8)} material={std(C.navy)} position={[-4.96, 3.45, 0.85]} />
      <mesh geometry={box(0.06, 0.7, 0.8)} material={std(C.coral)} position={[-4.96, 3.45, 1.8]} />
    </Hotspot>
  );
}
