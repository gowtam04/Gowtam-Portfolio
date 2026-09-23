"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { SpotId } from "./hotspots";
import { HOTSPOTS, HOTSPOT_LIST } from "./hotspots";
import { useRoomStore } from "./store";

/** Delay between poking Teeko and opening his panel, so the reaction plays first. */
export const TEEKO_OPEN_DELAY_MS = 900;

/**
 * Central picking: invisible registry hitboxes, sorted by priority then distance
 * (the prototype's model). Hover is mouse/pen only; a press that moves more than
 * 10px is a drag, not a click. Clicking empty space closes the open panel.
 */
export function Interaction() {
  const store = useRoomStore();
  const { camera, gl } = useThree();
  const boxes = useRef<THREE.Mesh[]>([]);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const hitMaterial = useMemo(() => new THREE.MeshBasicMaterial({ visible: false }), []);
  const pointer = useRef({ x: 2, y: 2, inside: false, down: null as null | [number, number] });
  const teekoTimer = useRef<number | null>(null);
  /** Teeko's hitbox: moved each frame to follow him while he roams. */
  const teekoBox = useRef<THREE.Mesh | null>(null);

  const pick = useMemo(() => {
    const ndc = new THREE.Vector2();
    return (x: number, y: number): SpotId | null => {
      ndc.set(x, y);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(boxes.current, false);
      if (!hits.length) return null;
      hits.sort((a, b) => {
        const pa = HOTSPOTS[a.object.userData.spot as SpotId].priority;
        const pb = HOTSPOTS[b.object.userData.spot as SpotId].priority;
        return pb - pa || a.distance - b.distance;
      });
      return hits[0].object.userData.spot as SpotId;
    };
  }, [camera, raycaster]);

  useEffect(() => {
    const el = gl.domElement;
    const toNdc = (e: PointerEvent): [number, number] => {
      const r = el.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1];
    };
    const onMove = (e: PointerEvent) => {
      const [x, y] = toNdc(e);
      pointer.current.x = x;
      pointer.current.y = y;
      pointer.current.inside = e.pointerType === "mouse" || e.pointerType === "pen";
      store.fx.pointer.x = x;
      store.fx.pointer.y = y;
    };
    const onLeave = () => {
      pointer.current.inside = false;
      store.actions.setHovered(null);
    };
    const onDown = (e: PointerEvent) => {
      pointer.current.down = [e.clientX, e.clientY];
    };
    const onUp = (e: PointerEvent) => {
      const down = pointer.current.down;
      pointer.current.down = null;
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 10) return;
      const [x, y] = toNdc(e);
      const id = pick(x, y);
      const { actions } = store;
      if (!id) {
        actions.closeSpot();
        return;
      }
      if (id === "switch") {
        actions.toggleLights();
        return;
      }
      if (id === "teeko") {
        actions.pokeTeeko();
        if (teekoTimer.current) window.clearTimeout(teekoTimer.current);
        teekoTimer.current = window.setTimeout(() => actions.openSpot("teeko"), TEEKO_OPEN_DELAY_MS);
        return;
      }
      actions.openSpot(id);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      if (teekoTimer.current) window.clearTimeout(teekoTimer.current);
    };
  }, [gl, pick, store]);

  useFrame(() => {
    // Follow Teeko while he is off his bed, else rest on the bed. Updating the
    // matrix here keeps this frame's hover pick and the next pointer-up in sync.
    const box = teekoBox.current;
    if (box) {
      const t = store.fx.teeko;
      const [hx, , hz] = HOTSPOTS.teeko.hit;
      const x = t.awake ? t.x : hx;
      const z = t.awake ? t.z : hz;
      if (box.position.x !== x || box.position.z !== z) {
        box.position.x = x;
        box.position.z = z;
        box.updateMatrixWorld();
      }
    }
    const p = pointer.current;
    const id = p.inside && !p.down ? pick(p.x, p.y) : null;
    if (store.getState().hoveredSpot !== id) store.actions.setHovered(id);
    gl.domElement.style.cursor = id ? "pointer" : "";
  });

  return (
    <group>
      {HOTSPOT_LIST.map((h) => {
        const [cx, cy, cz, sx, sy, sz] = h.hit;
        return (
          <mesh
            key={h.id}
            ref={(m) => {
              if (m && !boxes.current.includes(m)) boxes.current.push(m);
              if (m && h.id === "teeko") teekoBox.current = m;
            }}
            position={[cx, cy, cz]}
            userData={{ spot: h.id }}
            material={hitMaterial}
          >
            <boxGeometry args={[sx, sy, sz]} />
          </mesh>
        );
      })}
    </group>
  );
}
