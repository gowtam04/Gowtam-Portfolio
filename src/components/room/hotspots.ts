/**
 * Hotspot registry: one entry per clickable thing in the room.
 * Coordinates are world units (see docs/design/room-architecture.md).
 *
 * `view` frames the object when its panel is open:
 *   camera = target + normalize(dir) * d, where d is chosen so a sphere of
 *   `radius` fits the free area (left 55% on desktop, top 42% above the sheet).
 */

import type { PanelSpotId } from "@/lib/room-content";
import { ROOM_SECTIONS } from "@/lib/room-content";

export type SpotId = PanelSpotId | "switch";
export type Vec3 = [number, number, number];

export interface CameraView {
  target: Vec3;
  dir: Vec3;
  radius: number;
  /** Optional radius override in bottom-sheet mode. */
  radiusSheet?: number;
}

export interface HotspotDef {
  id: SpotId;
  label: string;
  /** Where the hover chip and bobbing marker sit. */
  anchor: Vec3;
  /** Invisible hitbox: [cx, cy, cz, sx, sy, sz]. */
  hit: [number, number, number, number, number, number];
  /** Higher wins when hitboxes overlap (the phone sits inside the desk's box). */
  priority: number;
  marker: boolean;
  /** Absent for spots that do not open a panel. */
  view?: CameraView;
}

export const OVERVIEW_VIEW: CameraView = {
  target: [0, 1.5, 0],
  dir: [1, 0.82, 1],
  radius: 7.6,
  // Portrait screens are width-bound: leave a side margin around the walls.
  radiusSheet: 8.3,
};

const section = (id: PanelSpotId) => ({ label: ROOM_SECTIONS[id].navLabel });

export const HOTSPOTS: Record<SpotId, HotspotDef> = {
  work: {
    id: "work",
    ...section("work"),
    anchor: [2.4, 3.45, -4.4],
    hit: [2.55, 1.65, -3.7, 4.1, 3.3, 3.0],
    priority: 0,
    marker: true,
    view: { target: [2.5, 2.25, -4.1], dir: [0.12, 0.38, 1], radius: 2.1 },
  },
  contact: {
    id: "contact",
    ...section("contact"),
    anchor: [1.28, 2.0, -3.88],
    hit: [1.28, 1.72, -3.88, 0.85, 0.5, 0.85],
    priority: 2,
    marker: true,
    view: { target: [1.35, 1.6, -3.85], dir: [0.2, 1.1, 0.75], radius: 0.62 },
  },
  games: {
    id: "games",
    ...section("games"),
    anchor: [-4.45, 2.7, 3.1],
    // Tall enough to include the PLAYER 1 poster (y 2.8..4.7); z stops short of the frames.
    hit: [-3.4, 2.35, 3.05, 3.3, 4.7, 3.1],
    priority: 0,
    marker: true,
    view: { target: [-4.3, 1.95, 3.0], dir: [1, 0.22, -0.28], radius: 1.9 },
  },
  cars: {
    id: "cars",
    ...section("cars"),
    anchor: [-4.8, 5.45, -1.9],
    hit: [-4.95, 3.1, -2.33, 0.8, 4.1, 5.45],
    priority: 0,
    marker: true,
    view: { target: [-5.2, 2.95, -1.9], dir: [1, 0.13, 0.02], radius: 2.25 },
  },
  about: {
    id: "about",
    ...section("about"),
    anchor: [-2.2, 4.85, -4.8],
    hit: [-2.2, 3.35, -4.8, 3.5, 2.5, 0.5],
    priority: 0,
    marker: true,
    view: { target: [-2.2, 3.35, -4.85], dir: [0.1, 0.05, 1], radius: 1.75 },
  },
  places: {
    id: "places",
    ...section("places"),
    anchor: [-4.8, 4.25, 1.35],
    hit: [-4.85, 3.45, 1.35, 0.4, 1.2, 1.8],
    priority: 1,
    marker: true,
    view: { target: [-4.9, 3.45, 1.35], dir: [1, 0.08, 0.12], radius: 1.1 },
  },
  teeko: {
    id: "teeko",
    ...section("teeko"),
    label: "Teeko",
    anchor: [0.85, 0.95, 1.35],
    hit: [0.85, 0.35, 1.35, 1.3, 0.8, 1.2],
    priority: 1,
    marker: false,
    view: { target: [0.85, 0.32, 1.35], dir: [0.6, 0.75, 1], radius: 0.85 },
  },
  switch: {
    id: "switch",
    label: "Lights",
    anchor: [0.3, 2.85, -4.9],
    hit: [0.3, 2.55, -4.85, 0.5, 0.6, 0.4],
    priority: 3,
    marker: false,
  },
};

export const HOTSPOT_LIST: readonly HotspotDef[] = Object.values(HOTSPOTS);
