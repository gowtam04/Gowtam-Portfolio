"use client";

import Link from "next/link";
import type { RichText } from "@/lib/room-content";
import { ROOM_SECTIONS, isPlaceholder } from "@/lib/room-content";
import type { RoomProject } from "@/lib/room-projects";
import { useRoom, useRoomActions } from "../store";

function Rich({ text }: { text: RichText }) {
  return (
    <>
      {text.map((part, i) =>
        typeof part === "string" ? (
          part
        ) : isPlaceholder(part) ? (
          <span key={i} className="room-fill" data-placeholder={part.key}>
            [{part.label}]
          </span>
        ) : (
          <a key={i} href={part.href}>
            {part.label}
          </a>
        ),
      )}
    </>
  );
}

/** STUB (Phase 0). Owner: UI and routing agent. */
export function Panel({ projects }: { projects: RoomProject[] }) {
  const openSpot = useRoom((s) => s.openSpot);
  const actions = useRoomActions();
  if (!openSpot) return null;
  const s = ROOM_SECTIONS[openSpot];
  return (
    <aside className="room-panel" role="dialog" aria-labelledby="room-panel-title">
      <button type="button" onClick={() => actions.closeSpot()} aria-label="Close">
        Close
      </button>
      <p>{s.kicker}</p>
      <h1 id="room-panel-title">{s.title}</h1>
      <p>
        <Rich text={s.lead} />
      </p>
      {s.blocks.map((b, i) =>
        b.type === "projects" ? (
          <ul key={i}>
            {projects.map((p) => (
              <li key={p.slug}>
                <Link href={`/case-studies/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        ) : null,
      )}
    </aside>
  );
}
