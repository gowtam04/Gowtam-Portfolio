"use client";

import { useEffect, useState } from "react";
import { ROOM_INTRO } from "@/lib/room-content";
import { useRoom, useRoomStore } from "../store";

/** Where the bar sits in the server HTML, before any JS runs. */
const START = 8;
/** The bar eases toward these caps until the next boot stage lands. */
const CAP_WAITING = 45;
const CAP_CANVAS = 92;
const TICK_MS = 150;

/**
 * "Loading the room" label and progress bar, shown until the canvas renders
 * its first frame. It server-renders so it is visible while the JS downloads.
 * Progress follows the real boot stages (page hydrated, three.js chunk
 * mounted, first frame) and creeps between them; a CSS shimmer keeps it
 * moving while shader compiles block the main thread. Hidden on failure,
 * where the Fallback card takes over.
 */
export function RoomLoader() {
  const store = useRoomStore();
  const ready = useRoom((s) => s.ready);
  const failed = useRoom((s) => s.failed);
  const [progress, setProgress] = useState(START);
  const done = ready || failed;

  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => {
      const cap = store.getState().canvasLoaded ? CAP_CANVAS : CAP_WAITING;
      setProgress((p) => p + Math.max(0, cap - p) * 0.06);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [done, store]);

  const value = ready ? 100 : Math.round(progress);

  return (
    <div className={done ? "room-loader is-done" : "room-loader"} aria-hidden={done ? true : undefined}>
      <p className="room-loader-label">{ROOM_INTRO.loading}</p>
      <div
        className="room-loader-track"
        role="progressbar"
        aria-label={ROOM_INTRO.loading}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <span className="room-loader-fill" style={{ transform: `scaleX(${value / 100})` }} />
      </div>
      <noscript>
        <style>{".room-loader{display:none}"}</style>
      </noscript>
    </div>
  );
}
