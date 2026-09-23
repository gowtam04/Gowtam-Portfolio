"use client";

import { useEffect, useRef } from "react";
import { ROOM_SECTIONS } from "@/lib/room-content";
import { useRoomStore } from "../store";
import { skyLabel } from "./TimeControl";

/**
 * Polite screen reader announcements for panel opens/closes, lights, and sky
 * changes. Writes the DOM directly (no re-renders). Changes made while the
 * room boots (URL sync, clock-resolved phase) are not announced.
 */
export function LiveRegion() {
  const store = useRoomStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let prev = store.getState();
    let armed = false;
    // Timers, not rAF: rAF does not run in background tabs.
    const armTimer = window.setTimeout(() => {
      armed = true;
      prev = store.getState();
    }, 0);
    let sayTimer = 0;
    const say = (text: string) => {
      const el = ref.current;
      if (!el) return;
      // Clear first so a repeated message is announced again.
      el.textContent = "";
      window.clearTimeout(sayTimer);
      sayTimer = window.setTimeout(() => {
        el.textContent = text;
      }, 60);
    };
    const unsubscribe = store.subscribe(() => {
      const s = store.getState();
      const p = prev;
      prev = s;
      if (!armed) return;
      if (s.openSpot !== p.openSpot) {
        say(s.openSpot ? `Opened ${ROOM_SECTIONS[s.openSpot].title}` : "Back to the room");
      } else if (s.timeMode !== p.timeMode) {
        say(`Sky set to ${skyLabel(s.timeMode, s.phase)}. Lights ${s.lightsOn ? "on" : "off"}.`);
      } else if (s.lightsOn !== p.lightsOn && s.phase === p.phase) {
        say(s.lightsOn ? "Lights on" : "Lights off");
      }
    });
    return () => {
      unsubscribe();
      window.clearTimeout(armTimer);
      window.clearTimeout(sayTimer);
    };
  }, [store]);

  return <div ref={ref} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />;
}
