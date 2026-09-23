"use client";

import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { Hotspot } from "../Hotspot";
import { box, plane, roundedBox, seededRange } from "../geometry";
import type { Vec3 } from "../hotspots";
import { C, std } from "../materials";
import { useRoom, useRoomActions } from "../store";
import type { DrawFn } from "../textures";
import { canvasFont, createCanvasTexture, redraw, useFontsReady } from "../textures";
import { drawIndiaMap } from "./maps/indiaMap";
import { drawUsaMap } from "./maps/usaMap";

/* ------------------------------------------------------------ dimensions (frame-local units) */

/** Outer frame size: width along the wall, height. */
const FW = 0.76;
const FH = 0.98;
/** Moulding width and how far it stands off the wall. */
const RAIL = 0.055;
const DEPTH = 0.075;
/** Mat (inside the moulding) and the picture opening cut into it. */
const MW = FW - RAIL * 2;
const MH = FH - RAIL * 2;
const OW = 0.54;
const OH = 0.56;
const O_TOP = 0.06;
/** Opening center, relative to the mat center. */
const O_CY = MH / 2 - O_TOP - OH / 2;
/** Mat sits recessed inside the moulding; picture a hair in front of it. */
const MAT_Z = DEPTH - 0.028;

type Place = "usa" | "india";

interface FrameDef {
  place: Place;
  label: string;
  /** World position of the frame's back center on the left wall (x = -5). */
  pos: Vec3;
  /** Small hang tilt, radians. */
  tilt: number;
  frame: string;
  draw: DrawFn;
  flag: (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void;
}

/* ------------------------------------------------------------ flags and mat */

const flagUsa = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  for (let i = 0; i < 7; i++) {
    g.fillStyle = i % 2 ? "#f7f2ea" : "#b8323a";
    g.fillRect(x, y + (h / 7) * i, w, h / 7 + 0.5);
  }
  g.fillStyle = "#2b3f73";
  g.fillRect(x, y, w * 0.42, h * (4 / 7));
  g.fillStyle = "#f7f2ea";
  for (let r = 0; r < 3; r++) {
    for (let cIdx = 0; cIdx < 4; cIdx++) {
      g.beginPath();
      g.arc(x + w * 0.06 + cIdx * w * 0.1, y + h * 0.1 + r * h * 0.16, 1.4, 0, Math.PI * 2);
      g.fill();
    }
  }
};

const flagIndia = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = "#f28c28";
  g.fillRect(x, y, w, h / 3 + 0.5);
  g.fillStyle = "#f7f2ea";
  g.fillRect(x, y + h / 3, w, h / 3 + 0.5);
  g.fillStyle = "#2a8a3e";
  g.fillRect(x, y + (h * 2) / 3, w, h / 3);
  g.strokeStyle = "#1f3a8a";
  g.lineWidth = 1.6;
  g.beginPath();
  g.arc(x + w / 2, y + h / 2, h / 7, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#1f3a8a";
  g.beginPath();
  g.arc(x + w / 2, y + h / 2, 1.2, 0, Math.PI * 2);
  g.fill();
};

function matDraw(def: FrameDef): DrawFn {
  return (g, w, h) => {
    const s = w / MW; // px per unit
    g.fillStyle = "#f4ede0";
    g.fillRect(0, 0, w, h);
    // faint paper tooth
    const rand = seededRange(def.place === "usa" ? 3 : 5);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = rand(0, 1) > 0.5 ? "rgba(120,100,70,.05)" : "rgba(255,255,255,.25)";
      g.fillRect(rand(0, w), rand(0, h), 2, 2);
    }
    // bevel around the opening
    const ox = (MW - OW) / 2;
    const oy = O_TOP;
    const bev = 0.012 * s;
    g.fillStyle = "#fffaf0";
    g.fillRect(ox * s - bev, oy * s - bev, OW * s + bev * 2, OH * s + bev * 2);
    g.fillStyle = "rgba(0,0,0,.08)";
    g.fillRect(ox * s - bev, oy * s - bev, OW * s + bev * 2, bev * 0.5);
    g.fillRect(ox * s - bev, oy * s - bev, bev * 0.5, OH * s + bev * 2);
    g.fillStyle = "#6d6457";
    g.fillRect(ox * s, oy * s, OW * s, OH * s);

    // label: flag + letter-spaced name
    const labelY = (oy + OH) * s + (MH - oy - OH) * s * 0.5;
    const size = 38;
    g.font = canvasFont("body", size, 700);
    g.textBaseline = "middle";
    const spacing = 9;
    const chars = def.label.split("");
    const textW = chars.reduce((acc, ch) => acc + g.measureText(ch).width + spacing, -spacing);
    const fw = 42;
    const fh = 28;
    const gap = 16;
    const total = fw + gap + textW;
    let x = (w - total) / 2;
    g.fillStyle = "rgba(0,0,0,.18)";
    g.fillRect(x + 1.5, labelY - fh / 2 + 1.5, fw, fh);
    def.flag(g, x, labelY - fh / 2, fw, fh);
    x += fw + gap;
    g.fillStyle = "#2b3f63";
    g.textAlign = "left";
    chars.forEach((ch) => {
      g.fillText(ch, x, labelY + 1);
      x += g.measureText(ch).width + spacing;
    });
  };
}

/* ------------------------------------------------------------ frames */

/** Left wall, between the window's right curtain (z ~0.36) and the family photo (z ~2.35). */
const FRAMES: FrameDef[] = [
  {
    place: "usa",
    label: "USA",
    pos: [-5, 3.47, 1.8],
    tilt: 0.012,
    frame: "#262a33",
    draw: drawUsaMap,
    flag: flagUsa,
  },
  {
    place: "india",
    label: "INDIA",
    pos: [-5, 3.43, 0.9],
    tilt: -0.01,
    frame: C.walnut,
    draw: drawIndiaMap,
    flag: flagIndia,
  },
];

/** A real photo, cover-fit (center crop) into the mat opening. */
function PhotoPicture({ url }: { url: string }) {
  const tex = useTexture(url);
  const mat = useMemo(() => {
    const img = tex.image as { width?: number; height?: number } | undefined;
    const imgAspect = (img?.width ?? 1) / (img?.height ?? 1);
    const openAspect = OW / OH;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    if (imgAspect > openAspect) tex.repeat.set(openAspect / imgAspect, 1);
    else tex.repeat.set(1, imgAspect / openAspect);
    tex.offset.set((1 - tex.repeat.x) / 2, (1 - tex.repeat.y) / 2);
    tex.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color: "#ffffff", map: tex, roughness: 0.6 });
  }, [tex]);
  useEffect(() => () => mat.dispose(), [mat]);
  return <mesh geometry={plane(OW, OH)} material={mat} position={[0, O_CY, MAT_Z + 0.002]} receiveShadow />;
}

function Frame({ def, photo }: { def: FrameDef; photo: string | null }) {
  const fontsReady = useFontsReady();

  const assets = useMemo(() => {
    const matTex = createCanvasTexture(512, Math.round((512 * MH) / MW), matDraw(def));
    const matMat = new THREE.MeshStandardMaterial({ color: "#ffffff", map: matTex, roughness: 0.9 });
    const picTex = createCanvasTexture(1024, Math.round((1024 * OH) / OW), def.draw);
    const picMat = new THREE.MeshStandardMaterial({ color: "#ffffff", map: picTex, roughness: 0.6 });
    return { matTex, matMat, picTex, picMat };
  }, [def]);

  useEffect(
    () => () => {
      assets.matTex.dispose();
      assets.matMat.dispose();
      assets.picTex.dispose();
      assets.picMat.dispose();
    },
    [assets],
  );

  useEffect(() => {
    if (!fontsReady) return;
    redraw(assets.matTex);
    redraw(assets.picTex);
  }, [fontsReady, assets]);

  const frameMat = std(def.frame, { roughness: 0.55 });
  const lip = std("#d9c29a", { roughness: 0.5, metalness: 0.3 });
  const railZ = DEPTH / 2;
  const illustrated = (
    <mesh geometry={plane(OW, OH)} material={assets.picMat} position={[0, O_CY, MAT_Z + 0.002]} receiveShadow />
  );

  return (
    // local +z faces the room (+x world); local +x runs toward -z world
    <group position={def.pos} rotation={[0, Math.PI / 2, 0]}>
      <group rotation={[0, 0, def.tilt]}>
        {/* backing board */}
        <mesh geometry={box(FW - 0.02, FH - 0.02, 0.02)} material={std("#3b2a20")} position={[0, 0, 0.012]} />
        {/* moulding */}
        <mesh
          geometry={roundedBox(FW, RAIL, DEPTH, 0.012)}
          material={frameMat}
          position={[0, FH / 2 - RAIL / 2, railZ]}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={roundedBox(FW, RAIL, DEPTH, 0.012)}
          material={frameMat}
          position={[0, -FH / 2 + RAIL / 2, railZ]}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={roundedBox(RAIL, FH - RAIL * 2 + 0.01, DEPTH, 0.012)}
          material={frameMat}
          position={[-FW / 2 + RAIL / 2, 0, railZ]}
          castShadow
          receiveShadow
        />
        <mesh
          geometry={roundedBox(RAIL, FH - RAIL * 2 + 0.01, DEPTH, 0.012)}
          material={frameMat}
          position={[FW / 2 - RAIL / 2, 0, railZ]}
          castShadow
          receiveShadow
        />
        {/* thin gilt lip inside the moulding */}
        <mesh geometry={box(MW + 0.012, 0.008, 0.01)} material={lip} position={[0, MH / 2, MAT_Z + 0.004]} />
        <mesh geometry={box(MW + 0.012, 0.008, 0.01)} material={lip} position={[0, -MH / 2, MAT_Z + 0.004]} />
        <mesh geometry={box(0.008, MH, 0.01)} material={lip} position={[-MW / 2, 0, MAT_Z + 0.004]} />
        <mesh geometry={box(0.008, MH, 0.01)} material={lip} position={[MW / 2, 0, MAT_Z + 0.004]} />
        {/* mat and picture */}
        <mesh geometry={plane(MW, MH)} material={assets.matMat} position={[0, 0, MAT_Z]} receiveShadow />
        {photo ? (
          <Suspense fallback={illustrated}>
            <PhotoPicture url={photo} />
          </Suspense>
        ) : (
          illustrated
        )}
      </group>
    </group>
  );
}

export function PlacesFrames() {
  const photos = useRoom((s) => s.photos);
  const { invalidateShadows } = useRoomActions();
  useEffect(() => invalidateShadows(2), [invalidateShadows]);

  return (
    <Hotspot id="places">
      {FRAMES.map((def) => (
        <Frame key={def.place} def={def} photo={photos[def.place]} />
      ))}
    </Hotspot>
  );
}
