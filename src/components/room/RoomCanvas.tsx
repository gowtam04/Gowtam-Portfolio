"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Scene } from "./Scene";
import { useRoomStore } from "./store";

/**
 * Flags the store `ready` once a frame has actually been drawn. The first
 * render compiles every shader, which can take seconds, so flipping `ready`
 * on context creation would fade in a blank canvas and end the loader early.
 */
function FirstFrame() {
  const store = useRoomStore();
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    // useFrame runs before the render, so on the second tick the first frame is on screen.
    if (frames.current === 2) store.setState({ ready: true });
  });
  return null;
}

/**
 * The WebGL canvas. Loaded with next/dynamic (ssr: false) from RoomExperience,
 * so nothing here runs on the server.
 */
export default function RoomCanvas() {
  const store = useRoomStore();
  const [hidden, setHidden] = useState(false);

  // Lets the loader know the three.js chunk has arrived.
  useEffect(() => store.setState({ canvasLoaded: true }), [store]);

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
      }}
    >
      <Scene />
      <FirstFrame />
    </Canvas>
  );
}
