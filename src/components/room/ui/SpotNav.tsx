"use client";

import { LIGHTS_LABEL, PANEL_SPOT_ORDER, ROOM_SECTIONS } from "@/lib/room-content";
import type { SpotId } from "../hotspots";
import { useRoom, useRoomActions, useRoomStore } from "../store";
import { useRoomUi } from "./context";

/**
 * Bottom nav: the keyboard path into the room. Focus or hover highlights the
 * matching object (via `navFocus`). Hidden and inert while a panel is open.
 */
export function SpotNav() {
  const store = useRoomStore();
  const actions = useRoomActions();
  const { openerRef } = useRoomUi();
  const openSpot = useRoom((s) => s.openSpot);
  const lightsOn = useRoom((s) => s.lightsOn);
  const open = openSpot !== null;

  const focusOn = (id: SpotId) => actions.setNavFocus(id);
  const focusOff = (id: SpotId) => {
    if (store.getState().navFocus === id) actions.setNavFocus(null);
  };
  const hoverOff = (id: SpotId, el: HTMLElement) => {
    if (document.activeElement !== el) focusOff(id);
  };

  return (
    <nav
      className={open ? "room-nav is-hidden" : "room-nav"}
      aria-label="Things in the room"
      inert={open}
    >
      <ul className="room-nav-list">
        {PANEL_SPOT_ORDER.map((id) => (
          <li key={id}>
            <a
              href={ROOM_SECTIONS[id].route}
              data-room-nav={id}
              aria-current={openSpot === id ? "true" : undefined}
              onClick={(e) => {
                if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                  return;
                }
                e.preventDefault();
                openerRef.current = e.currentTarget;
                if (id === "teeko") actions.pokeTeeko();
                actions.openSpot(id);
              }}
              onFocus={() => focusOn(id)}
              onBlur={() => focusOff(id)}
              onMouseEnter={() => focusOn(id)}
              onMouseLeave={(e) => hoverOff(id, e.currentTarget)}
            >
              {ROOM_SECTIONS[id].navLabel}
            </a>
          </li>
        ))}
        <li className="room-nav-sep" aria-hidden="true" />
        <li>
          <button
            type="button"
            className="room-nav-lights"
            aria-pressed={lightsOn}
            onClick={() => actions.toggleLights()}
            onFocus={() => focusOn("switch")}
            onBlur={() => focusOff("switch")}
            onMouseEnter={() => focusOn("switch")}
            onMouseLeave={(e) => hoverOff("switch", e.currentTarget)}
          >
            <span className="room-bulb" aria-hidden="true" />
            {LIGHTS_LABEL}
          </button>
        </li>
      </ul>
    </nav>
  );
}
