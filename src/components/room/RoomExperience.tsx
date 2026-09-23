"use client";

import dynamic from "next/dynamic";
import type { PanelSpotId } from "@/lib/room-content";
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
}

/**
 * STUB shell (Phase 0). Owner: UI and routing agent.
 * Everything except the canvas is plain DOM so it server-renders.
 */
export function RoomExperience({ initialSpot, projects }: RoomExperienceProps) {
  return (
    <RoomProvider initialSpot={initialSpot}>
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
