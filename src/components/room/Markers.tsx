"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { HotspotDef } from "./hotspots";
import { HOTSPOT_LIST } from "./hotspots";
import { useRoomStore } from "./store";
import { createCanvasTexture } from "./textures";

/** Bobbing cyan markers over the panel hotspots until the first spot is opened. */
export function Markers() {
  const store = useRoomStore();
  const spots = useMemo(() => HOTSPOT_LIST.filter((h) => h.marker), []);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const fade = useRef(1);

  const material = useMemo(() => {
    const tex = createCanvasTexture(128, 128, (g, w) => {
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, "rgba(34,211,238,.55)");
      gr.addColorStop(0.5, "rgba(34,211,238,.18)");
      gr.addColorStop(1, "rgba(34,211,238,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, w, w);
      g.strokeStyle = "#a5f3fc";
      g.lineWidth = 6;
      g.beginPath();
      g.arc(w / 2, w / 2, 26, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.arc(w / 2, w / 2, 11, 0, Math.PI * 2);
      g.fill();
    });
    return new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, transparent: true });
  }, []);

  useEffect(() => () => {
    material.map?.dispose();
    material.dispose();
  }, [material]);

  useFrame((state, dt) => {
    const s = store.getState();
    const target = s.firstClickDone ? 0 : 1;
    fade.current += Math.sign(target - fade.current) * Math.min(Math.abs(target - fade.current), dt * 1.6);
    const t = state.clock.elapsedTime;
    const still = s.reducedMotion;
    spots.forEach((h: HotspotDef, i) => {
      const sp = sprites.current[i];
      if (!sp) return;
      sp.visible = fade.current > 0.001;
      const [x, y, z] = h.anchor;
      const bob = still ? 0 : Math.sin(t * 2.2 + x) * 0.08;
      sp.position.set(x, y + 0.25 + bob, z);
      const pulse = still ? 1 : 1 + Math.sin(t * 3 + z) * 0.08;
      sp.scale.setScalar(0.46 * pulse);
    });
    material.opacity = fade.current * 0.95;
  });

  return (
    <group>
      {spots.map((h, i) => (
        <sprite
          key={h.id}
          ref={(el) => {
            sprites.current[i] = el;
          }}
          material={material}
          renderOrder={20}
          position={h.anchor}
          scale={0.46}
        />
      ))}
    </group>
  );
}
