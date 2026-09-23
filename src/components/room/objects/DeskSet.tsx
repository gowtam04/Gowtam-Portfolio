"use client";

import { Hotspot } from "../Hotspot";
import { box } from "../geometry";
import { C, std } from "../materials";

/**
 * STUB (Phase 0). Owner: Desk set agent.
 * Replace with the real model; see docs/design/room-architecture.md.
 */
export function DeskSet() {
  return (
    <group>
      <Hotspot id="work">
        <mesh geometry={box(3.7, 0.1, 1.5)} material={std(C.oak)} position={[2.6, 1.5, -4.22]} castShadow receiveShadow />
        <mesh geometry={box(2, 1.16, 0.08)} material={std(C.dark)} position={[2.4, 2.5, -4.62]} castShadow />
      </Hotspot>
      <Hotspot id="contact">
        <mesh geometry={box(0.25, 0.03, 0.47)} material={std(C.dark)} position={[1.28, 1.565, -3.88]} rotation={[0, 0.35, 0]} />
      </Hotspot>
    </group>
  );
}
