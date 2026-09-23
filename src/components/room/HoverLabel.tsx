"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { SpotId } from "./hotspots";
import { HOTSPOTS } from "./hotspots";
import { useRoomStore } from "./store";

/**
 * Floating label chip over the hovered (or nav-focused) hotspot.
 * A plain DOM element positioned each frame (drei <Html> mounts a React root
 * per label, which logs unmount warnings when it toggles quickly).
 * Classes are styled in `ui/room.css` (`.room-chip*`).
 */
export function HoverLabel() {
  const store = useRoomStore();
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const shown = useRef<{ id: SpotId | null; label: string }>({ id: null, label: "" });
  const v = useMemo(() => new THREE.Vector3(), []);

  // Outer element is positioned here; the inner .room-chip owns its CSS entrance animation.
  const { el, chip, text, hint } = useMemo(() => {
    const wrap = document.createElement("div");
    wrap.setAttribute("aria-hidden", "true");
    Object.assign(wrap.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "0",
      height: "0",
      pointerEvents: "none",
      zIndex: "30",
      display: "none",
    });
    const c = document.createElement("div");
    c.className = "room-chip";
    Object.assign(c.style, { position: "absolute", left: "0", top: "0", translate: "-50% 0" });
    const t = document.createElement("span");
    t.className = "room-chip-text";
    const h = document.createElement("span");
    h.className = "room-chip-hint";
    c.append(t, h);
    wrap.append(c);
    return { el: wrap, chip: c, text: t, hint: h };
  }, []);

  useEffect(() => {
    const parent = gl.domElement.parentElement;
    parent?.appendChild(el);
    return () => el.remove();
  }, [gl, el]);

  useFrame(() => {
    const s = store.getState();
    const id = s.hoveredSpot ?? s.navFocus;
    if (!id || id === s.openSpot) {
      if (shown.current.id !== null) {
        el.style.display = "none";
        shown.current.id = null;
      }
      return;
    }
    const h = HOTSPOTS[id];
    const label = id === "switch" ? (s.lightsOn ? "Lights: on" : "Lights: off") : h.label;
    if (shown.current.id !== id || shown.current.label !== label) {
      text.textContent = label;
      hint.textContent = h.hint;
      hint.style.display = h.hint ? "" : "none";
      if (shown.current.id !== id) {
        // Restart the entrance animation for a new spot.
        chip.style.animation = "none";
        void chip.offsetWidth;
        chip.style.animation = "";
      }
      shown.current = { id, label };
    }
    v.set(h.anchor[0], h.anchor[1], h.anchor[2]).project(camera);
    if (v.z > 1) {
      el.style.display = "none";
      return;
    }
    const x = ((v.x + 1) / 2) * size.width;
    const y = ((1 - v.y) / 2) * size.height;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    el.style.display = "";
  });

  return null;
}
