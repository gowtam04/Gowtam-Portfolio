"use client";

import { useEffect, useState } from "react";
import { ROOM_INTRO } from "@/lib/room-content";
import { useRoom } from "../store";

const DISMISS_MS = 3400;

/** Splits "Gowtam's room" so the last word gets the italic accent. */
function splitTitle(title: string): [string, string] {
  const i = title.lastIndexOf(" ");
  return i < 0 ? ["", title] : [title.slice(0, i + 1), title.slice(i + 1)];
}

/**
 * "Gowtam's room / click anything". Shown on a fresh load of "/" only (deep
 * links start with `firstClickDone`), dismissed ~3.4s after the room is ready, on the first
 * pointerdown, or when a spot opens. Its title is never the page's h1
 * (that's `CornerCard` or the open panel's title); it stays in the DOM,
 * faded out, after dismissal.
 */
export function TitleCard() {
  const openSpot = useRoom((s) => s.openSpot);
  const firstClickDone = useRoom((s) => s.firstClickDone);
  // Hold the card until the room is on screen, so it is not gone before the scene appears.
  const settled = useRoom((s) => s.ready || s.failed);
  const [dismissed, setDismissed] = useState(false);
  const visible = !dismissed && !firstClickDone;

  useEffect(() => {
    if (dismissed || firstClickDone) return;
    const timer = settled ? window.setTimeout(() => setDismissed(true), DISMISS_MS) : 0;
    const onDown = () => setDismissed(true);
    window.addEventListener("pointerdown", onDown, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [dismissed, firstClickDone, settled]);

  const [lead, accent] = splitTitle(ROOM_INTRO.title);
  const title = (
    <>
      {lead}
      <em>{accent}</em>
    </>
  );

  return (
    <div className={visible ? "room-title" : "room-title is-gone"}>
      <div className="room-title-inner">
        <p className="room-title-h" aria-hidden={openSpot === null ? undefined : "true"}>
          {title}
        </p>
        <p className="room-title-sub" aria-hidden={visible ? undefined : true}>
          {ROOM_INTRO.subtitle}
        </p>
      </div>
    </div>
  );
}
