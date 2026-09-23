"use client";

import type { Phase, TimeMode } from "../timeOfDay";
import { TIME_MODE_ORDER } from "../timeOfDay";
import { useRoom, useRoomActions } from "../store";

/** Human label for the sky button and the live region. */
export function skyLabel(mode: TimeMode, phase: Phase): string {
  return mode === "auto" ? `auto (${phase})` : mode;
}

/** Top-right button cycling the sky: auto, night, dawn, day, dusk. */
export function TimeControl() {
  const timeMode = useRoom((s) => s.timeMode);
  const phase = useRoom((s) => s.phase);
  const actions = useRoomActions();
  const label = skyLabel(timeMode, phase);

  return (
    <div className="room-hud-right">
      <button
        type="button"
        className="room-pill-btn"
        aria-label={`Sky: ${label}. Change the time of day`}
        onClick={() => {
          const i = TIME_MODE_ORDER.indexOf(timeMode);
          actions.setTimeMode(TIME_MODE_ORDER[(i + 1) % TIME_MODE_ORDER.length]);
        }}
      >
        <span className="room-sky-dot" aria-hidden="true" />
        <span className="room-sky-label">Sky: {label}</span>
      </button>
    </div>
  );
}
