"use client";

import Link from "next/link";
import { ROOM_INTRO } from "@/lib/room-content";
import { useRoom } from "../store";

/**
 * Top-left identity pill with a link to the plain (no 3D) version. While no
 * panel is open, the name/role is the page's h1; once a panel opens, the
 * panel title takes over as h1 and this reverts to a plain span.
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
      <Link className="room-corner-plain" href={ROOM_INTRO.plainHref}>
        {ROOM_INTRO.plainLabel}
        <span aria-hidden="true"> &rarr;</span>
      </Link>
    </header>
  );
}
