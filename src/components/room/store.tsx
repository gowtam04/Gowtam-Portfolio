"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { PanelSpotId } from "@/lib/room-content";
import { ROOM_INTRO, ROOM_SECTIONS, spotFromLocation } from "@/lib/room-content";
import type { RoomPhotos } from "@/lib/room-photos";
import type { SpotId } from "./hotspots";
import type { Phase, TimeMode } from "./timeOfDay";
import { TODS, isTimeMode, resolvePhase } from "./timeOfDay";

/* ------------------------------------------------------------ types */

export interface RoomState {
  /** Panel currently open (mirrors the URL). */
  openSpot: PanelSpotId | null;
  /** Spot under the mouse pointer in the 3D scene. */
  hoveredSpot: SpotId | null;
  /** Spot highlighted from the DOM nav (focus or hover). */
  navFocus: SpotId | null;
  lightsOn: boolean;
  timeMode: TimeMode;
  /** Resolved phase: `timeMode`, or the visitor's clock when auto. */
  phase: Phase;
  /** Markers bob until the first spot is opened. */
  firstClickDone: boolean;
  /** `performance.now()` of the last Teeko poke (0 = never). */
  teekoPokedAt: number;
  /** Bottom-sheet layout (narrow or portrait screens). */
  sheet: boolean;
  reducedMotion: boolean;
  /** The canvas code has downloaded and mounted (the first frame is still pending). */
  canvasLoaded: boolean;
  /** The canvas has rendered its first frame. */
  ready: boolean;
  /** WebGL unavailable or the 3D failed to load in time. */
  failed: boolean;
  /** Optional real photos for the places frames (null = drawn wall map). */
  photos: RoomPhotos;
}

/** Mutable per-frame values. Read and write freely inside `useFrame`; never triggers renders. */
export interface RoomFx {
  /** Eased 0..1 lamp level following `lightsOn` (written by Lighting). */
  lampLevel: number;
  /** Frames left during which the shadow map re-renders. */
  shadowFrames: number;
  /** Pointer position in NDC (-1..1), updated by Interaction. */
  pointer: { x: number; y: number };
  /**
   * Teeko's live floor position (world x/z), heading (radians, rotation.y) and
   * whether he is awake and off his bed. Written every frame by Teeko; read by
   * picking, the hover chip, and the camera so his hotspot follows him.
   */
  teeko: { x: number; z: number; heading: number; awake: boolean };
}

type HistoryMode = "push" | "replace" | "none";

export interface RoomActions {
  openSpot: (id: PanelSpotId, opts?: { history?: HistoryMode }) => void;
  closeSpot: (opts?: { history?: HistoryMode }) => void;
  setHovered: (id: SpotId | null) => void;
  setNavFocus: (id: SpotId | null) => void;
  setLights: (on: boolean) => void;
  toggleLights: () => void;
  setTimeMode: (mode: TimeMode) => void;
  /** Wake Teeko (plays the reaction animation). */
  pokeTeeko: () => void;
  /** Re-render the (static) shadow map for the next `frames` frames. */
  invalidateShadows: (frames?: number) => void;
}

export interface RoomStore {
  getState: () => RoomState;
  setState: (patch: Partial<RoomState>) => void;
  subscribe: (fn: () => void) => () => void;
  fx: RoomFx;
  actions: RoomActions;
}

/* ------------------------------------------------------------ store */

export function createRoomStore(
  initialSpot: PanelSpotId | null,
  photos: RoomPhotos = { usa: null, india: null },
): RoomStore {
  let state: RoomState = {
    openSpot: initialSpot,
    hoveredSpot: null,
    navFocus: null,
    lightsOn: true,
    timeMode: "auto",
    // Server and first client render agree on "night"; the provider resolves the real phase after mount.
    phase: "night",
    firstClickDone: initialSpot !== null,
    teekoPokedAt: 0,
    sheet: false,
    reducedMotion: false,
    canvasLoaded: false,
    ready: false,
    failed: false,
    photos,
  };
  const listeners = new Set<() => void>();
  const fx: RoomFx = {
    lampLevel: 1,
    shadowFrames: 60,
    pointer: { x: 0, y: 0 },
    teeko: { x: 0.85, z: 1.35, heading: 0.6, awake: false },
  };
  let lightsTouched = false;
  // True when the open panel was pushed on top of the overview entry, so closing can go Back.
  let backToOverview = false;

  const getState = () => state;
  const setState = (patch: Partial<RoomState>) => {
    let changed = false;
    for (const k in patch) {
      const key = k as keyof RoomState;
      if (!Object.is(state[key], patch[key])) {
        changed = true;
        break;
      }
    }
    if (!changed) return;
    state = { ...state, ...patch };
    listeners.forEach((fn) => fn());
  };
  const subscribe = (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };

  const writeHistory = (mode: HistoryMode, url: string) => {
    if (mode === "none" || typeof window === "undefined") return;
    const current = window.location.pathname + window.location.hash;
    if (current === url) return;
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  };

  const actions: RoomActions = {
    openSpot: (id, opts) => {
      const mode = opts?.history ?? "push";
      const prev = state.openSpot;
      if (prev === id) return;
      if (mode === "push") {
        // Switching directly between panels replaces, so Back always returns to the room.
        if (prev === null) {
          writeHistory("push", ROOM_SECTIONS[id].route);
          backToOverview = true;
        } else {
          writeHistory("replace", ROOM_SECTIONS[id].route);
        }
      } else {
        writeHistory(mode, ROOM_SECTIONS[id].route);
      }
      setState({ openSpot: id, firstClickDone: true, hoveredSpot: null });
    },
    closeSpot: (opts) => {
      if (state.openSpot === null) return;
      const mode = opts?.history ?? "push";
      if (mode === "push" && backToOverview && typeof window !== "undefined") {
        backToOverview = false;
        // popstate will also resolve to null; close now so the camera starts moving immediately.
        setState({ openSpot: null });
        window.history.back();
        return;
      }
      writeHistory(mode, "/");
      setState({ openSpot: null });
    },
    setHovered: (id) => setState({ hoveredSpot: id }),
    setNavFocus: (id) => setState({ navFocus: id }),
    setLights: (on) => {
      lightsTouched = true;
      setState({ lightsOn: on });
      fx.shadowFrames = Math.max(fx.shadowFrames, 30);
    },
    toggleLights: () => actions.setLights(!state.lightsOn),
    setTimeMode: (mode) => {
      const phase = resolvePhase(mode);
      lightsTouched = false;
      setState({ timeMode: mode, phase, lightsOn: TODS[phase].lamps });
      fx.shadowFrames = Math.max(fx.shadowFrames, 2);
    },
    pokeTeeko: () => setState({ teekoPokedAt: performance.now() }),
    invalidateShadows: (frames = 1) => {
      fx.shadowFrames = Math.max(fx.shadowFrames, frames);
    },
  };

  /** Internal: auto-mode clock tick. Lamps follow the phase unless the visitor toggled them. */
  const tickPhase = () => {
    if (state.timeMode !== "auto") return;
    const phase = resolvePhase("auto");
    if (phase === state.phase) return;
    setState(lightsTouched ? { phase } : { phase, lightsOn: TODS[phase].lamps });
    fx.shadowFrames = Math.max(fx.shadowFrames, 2);
  };
  /** Internal: Back/Forward. */
  const syncFromLocation = () => {
    backToOverview = false;
    const spot = spotFromLocation(window.location.pathname, window.location.hash);
    setState(spot === null ? { openSpot: null } : { openSpot: spot, firstClickDone: true });
  };

  return Object.assign(
    { getState, setState, subscribe, fx, actions },
    { tickPhase, syncFromLocation },
  );
}

type InternalStore = RoomStore & { tickPhase: () => void; syncFromLocation: () => void };

/* ------------------------------------------------------------ react */

const RoomContext = createContext<RoomStore | null>(null);

const SHEET_QUERY = "(max-width: 760px), (orientation: portrait) and (max-width: 1100px)";

export function RoomProvider({
  initialSpot,
  photos,
  children,
}: {
  initialSpot: PanelSpotId | null;
  photos?: RoomPhotos;
  children: ReactNode;
}) {
  const [store] = useState(() => createRoomStore(initialSpot, photos) as InternalStore);

  useEffect(() => {
    // Time of day: ?time= override, else the visitor's clock.
    const params = new URLSearchParams(window.location.search);
    const t = params.get("time");
    store.actions.setTimeMode(isTimeMode(t) ? t : "auto");
    store.fx.lampLevel = store.getState().lightsOn ? 1 : 0;

    // The URL wins over the server prop: covers /about#teeko and history entries
    // restored by Next with a different page tree than the URL.
    const spot = spotFromLocation(window.location.pathname, window.location.hash);
    if (spot !== store.getState().openSpot) {
      store.setState(spot === null ? { openSpot: null } : { openSpot: spot, firstClickDone: true });
    }

    const sheetMQ = window.matchMedia(SHEET_QUERY);
    const motionMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMedia = () => store.setState({ sheet: sheetMQ.matches, reducedMotion: motionMQ.matches });
    syncMedia();
    sheetMQ.addEventListener("change", syncMedia);
    motionMQ.addEventListener("change", syncMedia);

    // Keep the tab title in step with the open panel (pushState does not update metadata).
    let titledSpot: PanelSpotId | null | undefined;
    const syncTitle = () => {
      const open = store.getState().openSpot;
      if (open === titledSpot) return;
      titledSpot = open;
      document.title = open ? ROOM_SECTIONS[open].meta.title : ROOM_INTRO.meta.title;
    };
    syncTitle();
    const unsubscribeTitle = store.subscribe(syncTitle);

    const onPop = () => store.syncFromLocation();
    window.addEventListener("popstate", onPop);
    const timer = window.setInterval(() => store.tickPhase(), 60_000);

    return () => {
      sheetMQ.removeEventListener("change", syncMedia);
      motionMQ.removeEventListener("change", syncMedia);
      window.removeEventListener("popstate", onPop);
      window.clearInterval(timer);
      unsubscribeTitle();
    };
  }, [store]);

  return <RoomContext.Provider value={store}>{children}</RoomContext.Provider>;
}

/** The room store (stable). Use `getState()` / `fx` inside `useFrame`. */
export function useRoomStore(): RoomStore {
  const store = useContext(RoomContext);
  if (!store) throw new Error("useRoomStore must be used inside <RoomProvider>");
  return store;
}

/** Subscribe to one slice of room state. The selector must return a primitive or stable value. */
export function useRoom<T>(selector: (s: RoomState) => T): T {
  const store = useRoomStore();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}

/** Shorthand for the actions object (stable). */
export function useRoomActions(): RoomActions {
  return useRoomStore().actions;
}
