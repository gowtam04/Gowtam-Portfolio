"use client";

import dynamic from "next/dynamic";
import type { PanelSpotId } from "@/lib/room-content";
import type { RoomPhotos } from "@/lib/room-photos";
import type { RoomProject } from "@/lib/room-projects";
import { RoomProvider } from "./store";
import { Panel } from "./ui/Panel";
import { SpotNav } from "./ui/SpotNav";
import "./ui/room.css";

const RoomCanvas = dynamic(() => import("./RoomCanvas"), { ssr: false });

export interface RoomExperienceProps {
  /** Panel open on first render (from the route). `null` is the overview. */
  initialSpot: PanelSpotId | null;
  projects: RoomProject[];
  /** Optional real photos for the places frames (from `getRoomPhotos()`). */
  photos?: RoomPhotos;
}

/**
 * STUB shell (Phase 0). Owner: UI and routing agent.
 * Everything except the canvas is plain DOM so it server-renders.
 */
export function RoomExperience({ initialSpot, projects, photos }: RoomExperienceProps) {
  return (
    <RoomProvider initialSpot={initialSpot} photos={photos}>
      <div className="room-root">
        <div className="room-stage">
          <RoomCanvas />
        </div>
        <SpotNav />
        <Panel projects={projects} />
      </div>
    </RoomProvider>
  );
}
