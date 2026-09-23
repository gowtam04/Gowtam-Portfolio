"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { useRoomStore } from "./store";

/**
 * The WebGL canvas. Loaded with next/dynamic (ssr: false) from RoomExperience,
 * so nothing here runs on the server.
 */
export default function RoomCanvas() {
  const store = useRoomStore();
  const [hidden, setHidden] = useState(false);

  // Pause the render loop while the tab is hidden.
  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return (
    <Canvas
      className="room-canvas"
      frameloop={hidden ? "never" : "always"}
      dpr={[1, 2]}
      shadows="percentage"
      gl={{ antialias: true, alpha: true, stencil: true, powerPreference: "high-performance" }}
      camera={{ fov: 30, near: 0.3, far: 400, position: [17.4, 16, 17.4] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.shadowMap.autoUpdate = false;
        requestAnimationFrame(() => store.setState({ ready: true }));
      }}
    >
      <Scene />
    </Canvas>
  );
}
