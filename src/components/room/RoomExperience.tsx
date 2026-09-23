"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { PanelSpotId } from "@/lib/room-content";
import type { RoomPhotos } from "@/lib/room-photos";
import type { RoomProject } from "@/lib/room-projects";
import { RoomProvider, useRoom } from "./store";
import { RoomUiProvider } from "./ui/context";
import { CornerCard } from "./ui/CornerCard";
import { CanvasBoundary, Fallback, useRoomBoot, useWebGLSupport } from "./ui/Fallback";
import { LiveRegion } from "./ui/LiveRegion";
import { Panel } from "./ui/Panel";
import { RoomLoader } from "./ui/RoomLoader";
import { SpotNav } from "./ui/SpotNav";
import { TimeControl } from "./ui/TimeControl";
import { TitleCard } from "./ui/TitleCard";
import "./ui/room.css";

const RoomCanvas = dynamic(() => import("./RoomCanvas"), { ssr: false });

export interface RoomExperienceProps {
  /** Panel open on first render (from the route). `null` is the overview. */
  initialSpot: PanelSpotId | null;
  projects: RoomProject[];
  /** Optional real photos for the places frames (from `getRoomPhotos()`). */
  photos?: RoomPhotos;
}

function RoomLayout({ projects }: { projects: RoomProject[] }) {
  const phase = useRoom((s) => s.phase);
  const lightsOn = useRoom((s) => s.lightsOn);
  const open = useRoom((s) => s.openSpot !== null);
  const ready = useRoom((s) => s.ready);
  const failed = useRoom((s) => s.failed);
  const webgl = useWebGLSupport();
  const [crashed, setCrashed] = useState(false);
  useRoomBoot(webgl, crashed);

  return (
    <main
      className="room-root"
      data-phase={phase}
      data-lights={lightsOn ? "on" : "off"}
      data-open={open ? "true" : "false"}
      data-ready={ready ? "true" : "false"}
      data-failed={failed ? "true" : "false"}
    >
      <div className="room-sky" aria-hidden="true">
        <span className="room-sky-layer room-sky-night" />
        <span className="room-sky-layer room-sky-dawn" />
        <span className="room-sky-layer room-sky-day" />
        <span className="room-sky-layer room-sky-dusk" />
        <span className="room-sky-stars" />
      </div>
      <div className="room-stage" aria-hidden="true">
        {webgl === true && !crashed ? (
          <CanvasBoundary onError={() => setCrashed(true)}>
            <RoomCanvas />
          </CanvasBoundary>
        ) : null}
      </div>
      <TitleCard />
      <RoomLoader />
      <CornerCard />
      <TimeControl />
      <Fallback />
      <SpotNav />
      <Panel projects={projects} />
      <LiveRegion />
    </main>
  );
}

/**
 * The homepage room: a transparent WebGL canvas over a time-of-day backdrop,
 * with DOM chrome (panel, nav, cards) that server-renders for every route.
 */
export function RoomExperience({ initialSpot, projects, photos }: RoomExperienceProps) {
  return (
    <RoomProvider initialSpot={initialSpot} photos={photos}>
      <RoomUiProvider>
        <RoomLayout projects={projects} />
      </RoomUiProvider>
    </RoomProvider>
  );
}
