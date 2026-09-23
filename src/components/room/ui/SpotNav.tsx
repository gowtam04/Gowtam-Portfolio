"use client";

import { PANEL_SPOT_ORDER, ROOM_SECTIONS } from "@/lib/room-content";
import { useRoom, useRoomActions } from "../store";

/** STUB (Phase 0). Owner: UI and routing agent. */
export function SpotNav() {
  const actions = useRoomActions();
  const lightsOn = useRoom((s) => s.lightsOn);
  return (
    <nav className="room-nav" aria-label="Room">
      {PANEL_SPOT_ORDER.map((id) => (
        <button key={id} type="button" onClick={() => actions.openSpot(id)}>
          {ROOM_SECTIONS[id].navLabel}
        </button>
      ))}
      <button type="button" aria-pressed={lightsOn} onClick={() => actions.toggleLights()}>
        Lights
      </button>
    </nav>
  );
}
