"use client";

import { Html } from "@react-three/drei";
import { HOTSPOTS } from "./hotspots";
import { useRoom } from "./store";

/**
 * Floating label chip over the hovered (or nav-focused) hotspot.
 * Markup classes are styled in `ui/room.css` (`.room-chip*`).
 */
export function HoverLabel() {
  const hovered = useRoom((s) => s.hoveredSpot);
  const navFocus = useRoom((s) => s.navFocus);
  const openSpot = useRoom((s) => s.openSpot);
  const lightsOn = useRoom((s) => s.lightsOn);
  const id = hovered ?? navFocus;
  if (!id || id === openSpot) return null;
  const h = HOTSPOTS[id];
  const label = id === "switch" ? (lightsOn ? "Lights: on" : "Lights: off") : h.label;
  return (
    <Html position={h.anchor} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
      <div className="room-chip" role="presentation">
        <span className="room-chip-text">{label}</span>
        {h.hint ? <span className="room-chip-hint">{h.hint}</span> : null}
      </div>
    </Html>
  );
}
