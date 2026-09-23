"use client";

import { ROOM_INTRO } from "@/lib/room-content";
import { useRoom } from "../store";

/**
 * Top-left identity pill. The plain (no 3D) version is linked only from the
 * fallback card when the room fails to load. While no panel is open, the
 * name/role is the page's h1; once a panel opens, the panel title takes over
 * as h1 and this reverts to a plain span.
 */
export function CornerCard() {
  const openSpot = useRoom((s) => s.openSpot);
  return (
    <header className="room-corner">
      <span className="room-avatar" aria-hidden="true">
        {ROOM_INTRO.cornerName.charAt(0)}
      </span>
      {openSpot === null ? (
        <h1 className="room-corner-id">
          <span className="room-corner-name">{ROOM_INTRO.cornerName}</span>{" "}
          <span className="room-corner-role">{ROOM_INTRO.cornerRole}</span>
        </h1>
      ) : (
        <span className="room-corner-id">
          <span className="room-corner-name">{ROOM_INTRO.cornerName}</span>
          <span className="room-corner-role">{ROOM_INTRO.cornerRole}</span>
        </span>
      )}
    </header>
  );
}
