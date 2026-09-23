"use client";

import { Hotspot } from "../Hotspot";
import { box } from "../geometry";
import { C, std } from "../materials";

/**
 * STUB (Phase 0). Owner: Wall pieces agent.
 * Replace with the real model; see docs/design/room-architecture.md.
 */
export function Decor() {
  return (
    <group>
      <Hotspot id="switch">
        <mesh geometry={box(0.2, 0.32, 0.03)} material={std(C.cream)} position={[0.3, 2.55, -4.975]} />
      </Hotspot>
      <mesh geometry={box(5.2, 0.04, 3.9)} material={std(C.teal)} position={[-0.4, 0.02, 1.15]} receiveShadow />
    </group>
  );
}
