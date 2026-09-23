"use client";

import { box } from "../geometry";
import { C, std } from "../materials";

/**
 * STUB (Phase 0). Owner: Shell and street agent.
 * Replace with the real model; see docs/design/room-architecture.md.
 */
export function RoomShell() {
  return (
    <group>
      <mesh geometry={box(10.3, 0.7, 10.3)} material={std(C.oak)} position={[-0.15, -0.35, -0.15]} receiveShadow />
      <mesh geometry={box(10.3, 6, 0.3)} material={std(C.wall)} position={[-0.15, 3, -5.15]} receiveShadow />
      <mesh geometry={box(0.3, 6, 10.3)} material={std(C.wall)} position={[-5.15, 3, -0.15]} receiveShadow />
    </group>
  );
}
