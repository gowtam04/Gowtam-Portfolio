"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { PanelSpotId } from "@/lib/room-content";
import type { CameraView } from "./hotspots";
import { HOTSPOTS, OVERVIEW_VIEW } from "./hotspots";
import type { RoomFx } from "./store";
import { useRoomStore } from "./store";

const TWEEN_MS = 900;
const UP = new THREE.Vector3(0, 1, 0);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface CamState {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  /** View offset as a fraction of the viewport (off-axis framing). */
  ox: number;
  oy: number;
}

/**
 * Where the camera sits for a view. With a panel open, the image is shifted
 * (setViewOffset) so the object is centered in the free area: the left 55% on
 * desktop, or the top 42% above the bottom sheet.
 */
export function computeView(
  v: CameraView,
  forPanel: boolean,
  aspect: number,
  sheet: boolean,
  fov: number,
): CamState & { d: number } {
  const tanH = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  let fracW = 1;
  let fracH = 1;
  let nx = 0;
  let ny = 0;
  if (forPanel) {
    if (sheet) {
      fracH = 0.42;
      ny = 1 - fracH;
    } else {
      fracW = 0.55;
      nx = -1 + fracW;
    }
  }
  const radius = sheet && v.radiusSheet ? v.radiusSheet : v.radius;
  const d = radius / (tanH * Math.min(aspect * fracW, fracH));
  const dir = new THREE.Vector3(...v.dir).normalize();
  const look = new THREE.Vector3(...v.target);
  return { pos: look.clone().addScaledVector(dir, d), look, ox: -nx / 2, oy: ny / 2, d };
}

/**
 * The camera view for a spot. Teeko's registry view frames his bed; while he is
 * awake it is re-aimed at his live position (he stops while his panel is open,
 * so reading it when the tween starts is enough).
 */
export function viewForSpot(spot: PanelSpotId | null, fx?: RoomFx): CameraView {
  const view = (spot && HOTSPOTS[spot].view) || OVERVIEW_VIEW;
  if (spot === "teeko" && fx?.teeko.awake) {
    return { ...view, target: [fx.teeko.x, view.target[1], fx.teeko.z] };
  }
  return view;
}

/** Camera tween between the overview and hotspot views, plus overview mouse parallax. */
export function CameraRig() {
  const store = useRoomStore();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const scene = useThree((s) => s.scene);
  const cam = useRef<CamState | null>(null);
  const tween = useRef<null | { from: CamState; to: CamState; t0: number }>(null);
  const parallax = useRef(new THREE.Vector2());
  const tmp = useRef({ f: new THREE.Vector3(), r: new THREE.Vector3(), u: new THREE.Vector3() });
  const aspect = useRef(1);
  useEffect(() => {
    aspect.current = size.width / Math.max(1, size.height);
  }, [size.width, size.height]);

  const target = (): CamState & { d: number } => {
    const s = store.getState();
    return computeView(viewForSpot(s.openSpot, store.fx), s.openSpot !== null, aspect.current, s.sheet, camera.fov);
  };

  // Snap on first mount (deep links start zoomed), then tween on changes.
  useEffect(() => {
    const snap = () => {
      const to = target();
      cam.current = { pos: to.pos.clone(), look: to.look.clone(), ox: to.ox, oy: to.oy };
      tween.current = null;
    };
    if (!cam.current) snap();
    let prevSpot = store.getState().openSpot;
    let prevSheet = store.getState().sheet;
    return store.subscribe(() => {
      const s = store.getState();
      if (s.openSpot === prevSpot && s.sheet === prevSheet) return;
      const spotChanged = s.openSpot !== prevSpot;
      prevSpot = s.openSpot;
      prevSheet = s.sheet;
      if (!spotChanged || s.reducedMotion || !cam.current) {
        snap();
        return;
      }
      const c = cam.current;
      tween.current = {
        from: { pos: c.pos.clone(), look: c.look.clone(), ox: c.ox, oy: c.oy },
        to: target(),
        t0: performance.now(),
      };
    });
    // target() reads refs and the store only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, camera]);

  // Resize: recompute the destination (and fog distance) for the new aspect.
  useEffect(() => {
    aspect.current = size.width / Math.max(1, size.height);
    const to = target();
    if (tween.current) tween.current.to = to;
    else if (cam.current) cam.current = { pos: to.pos.clone(), look: to.look.clone(), ox: to.ox, oy: to.oy };
    const overview = computeView(OVERVIEW_VIEW, false, aspect.current, store.getState().sheet, camera.fov);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = overview.d + 12;
      scene.fog.far = overview.d + 130;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, scene]);

  useFrame((_, dt) => {
    const c = cam.current;
    if (!c) return;
    const tw = tween.current;
    if (tw) {
      const p = Math.min(1, (performance.now() - tw.t0) / TWEEN_MS);
      const e = easeInOut(p);
      c.pos.lerpVectors(tw.from.pos, tw.to.pos, e);
      c.look.lerpVectors(tw.from.look, tw.to.look, e);
      c.ox = tw.from.ox + (tw.to.ox - tw.from.ox) * e;
      c.oy = tw.from.oy + (tw.to.oy - tw.from.oy) * e;
      if (p >= 1) tween.current = null;
    }
    const W = size.width;
    const H = size.height;
    if (Math.abs(c.ox) > 1e-4 || Math.abs(c.oy) > 1e-4) camera.setViewOffset(W, H, c.ox * W, c.oy * H, W, H);
    else if (camera.view?.enabled) camera.clearViewOffset();

    const s = store.getState();
    const on = s.openSpot === null && !s.reducedMotion;
    const k = Math.min(1, dt * 2.5);
    const px = parallax.current;
    px.x += ((on ? store.fx.pointer.x : 0) - px.x) * k;
    px.y += ((on ? store.fx.pointer.y : 0) - px.y) * k;
    const { f, r, u } = tmp.current;
    f.subVectors(c.look, c.pos).normalize();
    r.crossVectors(f, UP).normalize();
    u.crossVectors(r, f);
    camera.position.copy(c.pos).addScaledVector(r, px.x * 0.9).addScaledVector(u, px.y * 0.5);
    camera.lookAt(c.look);
  }, -2);

  return null;
}
