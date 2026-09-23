"use client";

import { Suspense, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { CameraRig } from "./CameraRig";
import { HoverLabel } from "./HoverLabel";
import { Interaction } from "./Interaction";
import { Lighting } from "./Lighting";
import { Markers } from "./Markers";
import { Corkboard } from "./objects/Corkboard";
import { Decor } from "./objects/Decor";
import { DeskSet } from "./objects/DeskSet";
import { GamesCorner } from "./objects/GamesCorner";
import { PlacesFrames } from "./objects/PlacesFrames";
import { RoomShell } from "./objects/RoomShell";
import { Teeko } from "./objects/Teeko";
import { WindowStreet } from "./objects/WindowStreet";

/** Dev-only free camera for inspecting geometry: add `?orbit=1` to the URL. */
function useOrbitDebug(): boolean {
  // Scene only ever renders on the client (the canvas is loaded with ssr: false).
  const [on] = useState(
    () => process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).get("orbit") === "1",
  );
  return on;
}

export function Scene() {
  const orbit = useOrbitDebug();
  return (
    <>
      <Lighting />
      {orbit ? <OrbitControls makeDefault target={[0, 1.8, 0]} /> : <CameraRig />}
      <Interaction />
      <Markers />
      <HoverLabel />

      <Suspense fallback={null}>
        <RoomShell />
      </Suspense>
      <Suspense fallback={null}>
        <WindowStreet />
      </Suspense>
      <Suspense fallback={null}>
        <DeskSet />
      </Suspense>
      <Suspense fallback={null}>
        <GamesCorner />
      </Suspense>
      <Suspense fallback={null}>
        <Corkboard />
      </Suspense>
      <Suspense fallback={null}>
        <PlacesFrames />
      </Suspense>
      <Suspense fallback={null}>
        <Decor />
      </Suspense>
      <Suspense fallback={null}>
        <Teeko />
      </Suspense>
    </>
  );
}
