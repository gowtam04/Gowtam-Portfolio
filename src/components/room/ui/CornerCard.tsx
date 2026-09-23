import Link from "next/link";
import { ROOM_INTRO } from "@/lib/room-content";

/** Top-left identity pill with a link to the plain (no 3D) version. */
export function CornerCard() {
  return (
    <header className="room-corner">
      <span className="room-avatar" aria-hidden="true">
        {ROOM_INTRO.cornerName.charAt(0)}
      </span>
      <span className="room-corner-id">
        <span className="room-corner-name">{ROOM_INTRO.cornerName}</span>
        <span className="room-corner-role">{ROOM_INTRO.cornerRole}</span>
      </span>
      <Link className="room-corner-plain" href={ROOM_INTRO.plainHref}>
        {ROOM_INTRO.plainLabel}
        <span aria-hidden="true"> &rarr;</span>
      </Link>
    </header>
  );
}
