"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useRoom, useRoomStore } from "./store";
import type { Phase, PhaseConfig } from "./timeOfDay";
import { TODS } from "./timeOfDay";

/** Current phase and its preset. Re-renders only when the phase changes. */
export function usePhase(): { phase: Phase; config: PhaseConfig } {
  const phase = useRoom((s) => s.phase);
  return { phase, config: TODS[phase] };
}

/**
 * Getter for the eased 0..1 room-lamp level (follows the light switch).
 * Call it inside `useFrame`: `light.intensity = 22 * lampLevel()`.
 */
export function useLampLevel(): () => number {
  const store = useRoomStore();
  return () => store.fx.lampLevel;
}

/**
 * Global lights (hemisphere, sun with shadows, fill), fog, and exposure per
 * time of day. Practical lights (desk lamp, TV, street lamp...) live in their
 * object files and read `useLampLevel()` / `usePhase()`.
 */
export function Lighting() {
  const store = useRoomStore();
  const { phase, config } = usePhase();
  const sheet = useRoom((s) => s.sheet);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);

  // Static shadows: re-render the shadow map only when something asks for it.
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
  }, [gl]);

  useEffect(() => {
    const h = hemi.current;
    const s = sun.current;
    const f = fill.current;
    if (!h || !s || !f) return;
    h.color.set(config.hemiSky);
    h.groundColor.set(config.hemiGround);
    h.intensity = config.hemiI;
    s.color.set(config.sun);
    s.intensity = config.sunI;
    s.position.set(-2 + config.sunPos[0], config.sunPos[1], config.sunPos[2]);
    s.target.position.set(-2, 0, 0);
    s.target.updateMatrixWorld();
    f.color.set(config.fill);
    f.intensity = config.fillI;
    gl.toneMappingExposure = config.exposure;
    if (scene.fog instanceof THREE.Fog) scene.fog.color.set(config.fog);
    store.actions.invalidateShadows(2);
  }, [phase, config, gl, scene, store]);

  useEffect(() => {
    const s = sun.current;
    if (!s) return;
    const n = sheet ? 512 : 1024;
    if (s.shadow.mapSize.x !== n) {
      s.shadow.mapSize.set(n, n);
      s.shadow.map?.dispose();
      s.shadow.map = null;
      store.actions.invalidateShadows(2);
    }
  }, [sheet, store]);

  useFrame((_, dt) => {
    const st = store.getState();
    const want = st.lightsOn ? 1 : 0;
    const fx = store.fx;
    fx.lampLevel = st.reducedMotion ? want : fx.lampLevel + (want - fx.lampLevel) * Math.min(1, dt * 8);
    if (Math.abs(fx.lampLevel - want) < 0.001) fx.lampLevel = want;
    if (fx.shadowFrames > 0) {
      gl.shadowMap.needsUpdate = true;
      fx.shadowFrames -= 1;
    }
  }, -1);

  return (
    <>
      <fog attach="fog" args={[TODS.night.fog, 45, 170]} />
      <hemisphereLight ref={hemi} args={["#51659a", "#1b1512", 0.5]} />
      <directionalLight
        ref={sun}
        args={["#9db4ff", 1]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
      />
      <directionalLight ref={fill} args={["#ffffff", 0.5]} position={[12, 14, 10]} />
    </>
  );
}
