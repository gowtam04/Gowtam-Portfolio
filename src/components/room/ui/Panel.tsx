"use client";

import { useEffect, useRef, useState } from "react";
import type { PanelSpotId } from "@/lib/room-content";
import { ROOM_SECTIONS } from "@/lib/room-content";
import type { RoomProject } from "@/lib/room-projects";
import { useRoom, useRoomActions } from "../store";
import { useRoomUi } from "./context";
import { PanelBlock } from "./PanelBlocks";
import { PlaceholderLegend } from "./Placeholder";
import { Rich, sectionHasPlaceholders } from "./Rich";

/**
 * The detail panel: slides in from the right on desktop, up as a bottom sheet
 * on narrow or portrait screens (pure CSS, same query as the store's `sheet`).
 *
 * The open panel's full content is server-rendered for its route. The last
 * shown section stays mounted (inert) while the panel slides out.
 */
export function Panel({ projects }: { projects: RoomProject[] }) {
  const openSpot = useRoom((s) => s.openSpot);
  const actions = useRoomActions();
  const { openerRef } = useRoomUi();
  const panelRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Keep the last section while sliding out (derived during render, no effect).
  const [shown, setShown] = useState<PanelSpotId | null>(openSpot);
  if (openSpot !== null && openSpot !== shown) setShown(openSpot);

  const open = openSpot !== null;

  // Esc closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      e.preventDefault();
      actions.closeSpot();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, actions]);

  // Focus: title on open or switch, back to the opener on close. Skips the
  // first render and the provider's mount-time URL correction (no focus theft on load).
  const prevSpot = useRef<PanelSpotId | null>(openSpot);
  const armed = useRef(false);
  useEffect(() => {
    const id = window.setTimeout(() => {
      armed.current = true;
    }, 0);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    const prev = prevSpot.current;
    prevSpot.current = openSpot;
    if (!armed.current || prev === openSpot) return;
    if (openSpot !== null) {
      titleRef.current?.focus({ preventScroll: true });
      return;
    }
    const opener = openerRef.current;
    openerRef.current = null;
    const active = document.activeElement;
    const focusWasInPanel = !active || active === document.body || panelRef.current?.contains(active);
    if (!focusWasInPanel) return;
    if (opener && opener.isConnected) {
      opener.focus({ preventScroll: true });
      return;
    }
    // Opened from the 3D scene: land on the matching nav button so keyboard users keep their place.
    if (prev) document.querySelector<HTMLElement>(`[data-room-nav="${prev}"]`)?.focus({ preventScroll: true });
  }, [openSpot, openerRef]);

  const section = shown ? ROOM_SECTIONS[shown] : null;

  return (
    <aside
      ref={panelRef}
      className={open ? "room-panel is-open" : "room-panel"}
      role="dialog"
      aria-modal="false"
      aria-labelledby="room-panel-title"
      aria-hidden={open ? undefined : true}
      inert={!open}
    >
      <div className="room-sheet-handle" aria-hidden="true" />
      <button
        type="button"
        className="room-panel-close"
        aria-label="Close and return to the room"
        onClick={() => actions.closeSpot()}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      {section ? (
        <div key={section.id} className="room-panel-scroll">
          <p className="room-kicker">{section.kicker}</p>
          {open ? (
            <h1 id="room-panel-title" ref={titleRef} className="room-panel-title" tabIndex={-1}>
              {section.title}
            </h1>
          ) : (
            <p id="room-panel-title" className="room-panel-title">
              {section.title}
            </p>
          )}
          <p className="room-lead">
            <Rich text={section.lead} />
          </p>
          {section.blocks.map((block, i) => (
            <PanelBlock key={`${block.type}-${i}`} block={block} projects={projects} />
          ))}
          {sectionHasPlaceholders(section) ? <PlaceholderLegend /> : null}
        </div>
      ) : null}
    </aside>
  );
}
