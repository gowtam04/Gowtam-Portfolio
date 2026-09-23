"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

/** Draw callback for a canvas texture. `t` is elapsed seconds, `dt` time since the last draw. */
export type DrawFn = (g: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => void;

export interface CanvasTextureOptions {
  /** Pixel-art look: nearest filtering, no mipmaps. */
  nearest?: boolean;
  /** Color texture (true) or data texture such as a mask (false). */
  srgb?: boolean;
  /** Repeat wrapping in both directions. */
  repeat?: [number, number];
}

/**
 * Create a CanvasTexture and draw it once. Call inside `useMemo` in a component
 * (never at module scope: it touches `document`). Dispose on unmount if you
 * created it per-component.
 */
export function createCanvasTexture(
  w: number,
  h: number,
  draw?: DrawFn,
  { nearest = false, srgb = true, repeat }: CanvasTextureOptions = {},
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("2D canvas unavailable");
  if (draw) draw(g, w, h, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  if (nearest) {
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
  } else {
    tex.anisotropy = 8;
  }
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  tex.userData.draw = draw;
  return tex;
}

/** Re-run a texture's draw function (or a new one) and upload it. */
export function redraw(tex: THREE.CanvasTexture, draw?: DrawFn, t = 0, dt = 0): void {
  const canvas = tex.image as HTMLCanvasElement;
  const g = canvas.getContext("2d");
  const fn = (draw ?? tex.userData.draw) as DrawFn | undefined;
  if (!g || !fn) return;
  fn(g, canvas.width, canvas.height, t, dt);
  tex.needsUpdate = true;
}

export function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

let softTex: THREE.CanvasTexture | null = null;
/** Shared 64px white radial falloff: steam, glows, soft shadow blobs. Do not dispose. */
export function softTexture(): THREE.CanvasTexture {
  if (!softTex) {
    softTex = createCanvasTexture(64, 64, (g, w) => {
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, "rgba(255,255,255,1)");
      gr.addColorStop(0.4, "rgba(255,255,255,.45)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, w, w);
    });
  }
  return softTex;
}

/**
 * Redraw an animated canvas texture at a throttled rate inside the render loop.
 * `draw` receives elapsed time and the accumulated delta since its last call.
 */
export function useThrottledRedraw(tex: THREE.CanvasTexture | null, fps: number, draw: DrawFn): void {
  const acc = useRef(Infinity);
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);
  useFrame((state, delta) => {
    if (!tex) return;
    acc.current += delta;
    if (acc.current < 1 / fps) return;
    const dt = acc.current === Infinity ? 0 : acc.current;
    acc.current = 0;
    redraw(tex, drawRef.current, state.clock.elapsedTime, dt);
  });
}

type FontKind = "display" | "body" | "hand";
const FONT_VARS: Record<FontKind, string> = {
  display: "--font-fraunces",
  body: "--font-jakarta",
  hand: "--font-caveat",
};
const FONT_FALLBACK: Record<FontKind, string> = {
  display: "Georgia, serif",
  body: "system-ui, sans-serif",
  hand: "'Comic Sans MS', cursive",
};

/**
 * CSS font shorthand for canvas text using the site's next/font families
 * (their real names are hashed, so they are read from the CSS variables).
 * Example: `g.font = canvasFont("hand", 28, 600)`.
 */
export function canvasFont(kind: FontKind, sizePx: number, weight: number | string = 400, style = ""): string {
  let family = "";
  if (typeof document !== "undefined") {
    family = getComputedStyle(document.body).getPropertyValue(FONT_VARS[kind]).trim();
  }
  return `${style} ${weight} ${sizePx}px ${family ? `${family}, ` : ""}${FONT_FALLBACK[kind]}`.trim();
}

/** Resolves true once web fonts have loaded, so static canvas text can be redrawn. */
export function useFontsReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const fonts = document.fonts;
    Promise.all([
      fonts.load(canvasFont("display", 24, 600)),
      fonts.load(canvasFont("body", 24, 600)),
      fonts.load(canvasFont("hand", 24, 600)),
    ])
      .catch(() => undefined)
      .then(() => fonts.ready)
      .then(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

/** Max anisotropy supported by the renderer (use for detailed textures seen at grazing angles). */
export function useMaxAnisotropy(): number {
  return useThree((s) => s.gl.capabilities.getMaxAnisotropy());
}
