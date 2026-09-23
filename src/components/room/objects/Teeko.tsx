"use client";

import { Hotspot } from "../Hotspot";
import { box } from "../geometry";
import { std } from "../materials";

/**
 * STUB (Phase 0). Owner: Teeko agent.
 * Replace with the real model; see docs/design/room-architecture.md.
 */
export function Teeko() {
  return (
    <Hotspot id="teeko">
      <mesh geometry={box(0.5, 0.3, 0.35)} material={std("#1d1b22")} position={[0.85, 0.2, 1.35]} castShadow />
    </Hotspot>
  );
}
