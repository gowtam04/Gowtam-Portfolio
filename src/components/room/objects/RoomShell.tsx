"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { box, mulberry32, plane } from "../geometry";
import { C, std } from "../materials";
import { createCanvasTexture, useMaxAnisotropy } from "../textures";

/** Room constants (see docs/design/room-architecture.md). */
const HW = 5;
const WH = 6;
const T = 0.3;
/** Window hole in the left wall. */
const WIN = { z0: -3.5, z1: -0.3, y0: 1.4, y1: 4.9 };
const WIN_W = WIN.z1 - WIN.z0;
const WIN_ZC = (WIN.z0 + WIN.z1) / 2;
/** Center line of the left wall. */
const LX = -HW - T / 2;

const PLANK_TONES = ["#c08a5a", "#b37d4e", "#c99664", "#ab7447", "#bb8556", "#c4905f"];

/** Seeded plank floor, ported from the prototype (16 rows of staggered boards with grain). */
function drawPlanks(g: CanvasRenderingContext2D, w: number, h: number): void {
  const rnd = mulberry32(7);
  const R = (a: number, b: number) => a + (b - a) * rnd();
  const rows = 16;
  const rh = h / rows;
  for (let r = 0; r < rows; r++) {
    let x = -R(0, 300);
    while (x < w) {
      const len = R(240, 520);
      g.fillStyle = PLANK_TONES[Math.floor(rnd() * PLANK_TONES.length)];
      g.fillRect(x, r * rh, len, rh);
      g.globalAlpha = 0.1;
      g.strokeStyle = "#5a3418";
      for (let k = 0; k < 4; k++) {
        const yy = r * rh + R(6, rh - 6);
        g.beginPath();
        g.moveTo(x, yy);
        g.bezierCurveTo(x + len * 0.3, yy + R(-4, 4), x + len * 0.6, yy + R(-4, 4), x + len, yy + R(-3, 3));
        g.lineWidth = R(1, 2.5);
        g.stroke();
      }
      g.globalAlpha = 1;
      g.fillStyle = "rgba(70,40,20,.5)";
      g.fillRect(x, r * rh, 3, rh);
      x += len;
    }
    g.fillStyle = "rgba(70,40,20,.55)";
    g.fillRect(0, r * rh, w, 3);
  }
}

function drawContactShadow(g: CanvasRenderingContext2D, w: number): void {
  const gr = g.createRadialGradient(w / 2, w / 2, w * 0.2, w / 2, w / 2, w / 2);
  gr.addColorStop(0, "rgba(0,0,0,.55)");
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, w);
}

interface Piece {
  size: [number, number, number];
  pos: [number, number, number];
}

/** Walls, with the left wall built around the window opening. */
const WALLS: Piece[] = [
  { size: [10.3, WH, T], pos: [-0.15, WH / 2, -HW - T / 2] },
  { size: [T, WH, WIN.z0 + HW], pos: [LX, WH / 2, (-HW + WIN.z0) / 2] },
  { size: [T, WH, HW - WIN.z1], pos: [LX, WH / 2, (WIN.z1 + HW) / 2] },
  { size: [T, WIN.y0, WIN_W], pos: [LX, WIN.y0 / 2, WIN_ZC] },
  { size: [T, WH - WIN.y1, WIN_W], pos: [LX, (WH + WIN.y1) / 2, WIN_ZC] },
];

const WAINSCOT: Piece[] = [
  { size: [10, 1.3, 0.04], pos: [0, 0.65, -HW + 0.02] },
  { size: [0.04, 1.3, 10], pos: [-HW + 0.02, 0.65, 0] },
];

/** Chair rails and baseboards. */
const TRIM: Piece[] = [
  { size: [10, 0.08, 0.08], pos: [0, 1.33, -HW + 0.04] },
  { size: [0.08, 0.08, 10], pos: [-HW + 0.04, 1.33, 0] },
  { size: [10, 0.18, 0.07], pos: [0, 0.09, -HW + 0.035] },
  { size: [0.07, 0.18, 10], pos: [-HW + 0.035, 0.09, 0] },
];

/** Dark cut-away caps on the wall tops and the exposed wall ends. */
const CAPS: Piece[] = [
  { size: [10.36, 0.1, T + 0.06], pos: [-0.15, WH + 0.05, -HW - T / 2] },
  { size: [T + 0.06, 0.1, 10.36], pos: [LX, WH + 0.05, -0.15] },
  { size: [T + 0.06, WH + 0.1, 0.06], pos: [LX, WH / 2 + 0.05, HW + 0.03] },
  { size: [0.06, WH + 0.1, T + 0.06], pos: [HW + 0.03, WH / 2 + 0.05, -HW - T / 2] },
];

function Pieces({ pieces, material, shadows = true }: { pieces: Piece[]; material: THREE.Material; shadows?: boolean }) {
  return (
    <>
      {pieces.map((p, i) => (
        <mesh
          key={i}
          geometry={box(...p.size)}
          material={material}
          position={p.pos}
          castShadow={shadows}
          receiveShadow
        />
      ))}
    </>
  );
}

/** Floor slab with plank top, contact shadow, walls, wainscot, trim, and cut-away caps. */
export function RoomShell() {
  const aniso = useMaxAnisotropy();

  const { slabMats, shadowMat, planks, shadowTex } = useMemo(() => {
    const planks = createCanvasTexture(1024, 1024, drawPlanks);
    const shadowTex = createCanvasTexture(256, 256, (g, w) => drawContactShadow(g, w), { srgb: false });
    const side = std(C.base, { roughness: 0.9 });
    const top = new THREE.MeshStandardMaterial({ color: "#ffffff", map: planks, roughness: 0.72, metalness: 0 });
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    return { slabMats: [side, side, top, side, side, side], shadowMat, planks, shadowTex };
  }, []);

  useEffect(() => {
    planks.anisotropy = aniso;
    planks.needsUpdate = true;
  }, [planks, aniso]);

  useEffect(
    () => () => {
      planks.dispose();
      shadowTex.dispose();
      slabMats[2].dispose();
      shadowMat.dispose();
    },
    [planks, shadowTex, slabMats, shadowMat],
  );

  const wallMat = std(C.wall, { roughness: 0.95 });
  const wainMat = std(C.wain, { roughness: 0.9 });
  const trimMat = std(C.trim, { roughness: 0.7 });
  const capMat = std(C.cap, { roughness: 0.85 });

  return (
    <group>
      <mesh geometry={box(10.3, 0.7, 10.3)} material={slabMats} position={[-0.15, -0.35, -0.15]} receiveShadow />
      <mesh geometry={plane(19, 19)} material={shadowMat} position={[-0.15, -0.72, -0.15]} rotation-x={-Math.PI / 2} />
      <Pieces pieces={WALLS} material={wallMat} />
      <Pieces pieces={WAINSCOT} material={wainMat} />
      <Pieces pieces={TRIM} material={trimMat} />
      <Pieces pieces={CAPS} material={capMat} />
    </group>
  );
}
