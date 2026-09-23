"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Hotspot } from "../Hotspot";
import { box, cylinder, roundedBox, seededRange, sphere } from "../geometry";
import type { Vec3 } from "../hotspots";
import { C, TEEKO, std } from "../materials";
import { useRoomActions } from "../store";
import type { DrawFn } from "../textures";
import { canvasFont, createCanvasTexture, redraw, roundRect, useFontsReady } from "../textures";

/* ------------------------------------------------------------ layout */

/** Board center on the back wall (inner face z = -5). */
const BX = -2.2;
const BY = 3.35;
const BZ = -4.93;
/** Front of the cork, where photos and notes sit. */
const Z = BZ + 0.065;

/* ------------------------------------------------------------ photos (drawn in a 128px space) */

type PhotoFn = (c: CanvasRenderingContext2D, w: number, h: number) => void;

const roadTrip: PhotoFn = (c, w, h) => {
  const gr = c.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#ff9e6d");
  gr.addColorStop(0.55, "#ffd29a");
  gr.addColorStop(0.56, "#5b6b7e");
  gr.addColorStop(1, "#394656");
  c.fillStyle = gr;
  c.fillRect(0, 0, w, h);
  c.fillStyle = "#fff2c9";
  c.beginPath();
  c.arc(w * 0.66, h * 0.45, 16, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#4b3f5a";
  c.beginPath();
  c.moveTo(0, h * 0.58);
  c.lineTo(30, h * 0.44);
  c.lineTo(60, h * 0.56);
  c.lineTo(95, h * 0.4);
  c.lineTo(w, h * 0.57);
  c.lineTo(w, h * 0.6);
  c.lineTo(0, h * 0.6);
  c.fill();
  c.fillStyle = "#2a2f38";
  c.beginPath();
  c.moveTo(w * 0.47, h * 0.58);
  c.lineTo(w * 0.53, h * 0.58);
  c.lineTo(w * 0.95, h);
  c.lineTo(w * 0.05, h);
  c.fill();
  c.fillStyle = "#ffd86b";
  for (let i = 0; i < 4; i++) {
    const y = h * 0.62 + i * 12;
    c.fillRect(w / 2 - 1 - i, y, 2 + i * 2, 6 + i * 2);
  }
};

const controller: PhotoFn = (c, w, h) => {
  c.fillStyle = C.teal;
  c.fillRect(0, 0, w, h);
  c.fillStyle = "#1b1f27";
  roundRect(c, 22, 44, 84, 40, 18);
  c.fill();
  c.beginPath();
  c.arc(36, 82, 16, 0, Math.PI * 2);
  c.arc(92, 82, 16, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#e8eef7";
  c.fillRect(34, 58, 14, 4);
  c.fillRect(39, 53, 4, 14);
  const buttons: [string, number, number][] = [
    ["#22d3ee", 88, 56],
    ["#ff6b8a", 96, 64],
    ["#ffd86b", 80, 64],
    ["#7ee081", 88, 72],
  ];
  buttons.forEach(([col, x, y]) => {
    c.fillStyle = col;
    c.beginPath();
    c.arc(x, y, 4, 0, Math.PI * 2);
    c.fill();
  });
};

const me: PhotoFn = (c, w, h) => {
  const gr = c.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, "#16223d");
  gr.addColorStop(1, "#0e7490");
  c.fillStyle = gr;
  c.fillRect(0, 0, w, h);
  c.fillStyle = "#d9a37a";
  c.beginPath();
  c.arc(w / 2, 52, 22, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#1b1410";
  c.beginPath();
  c.arc(w / 2, 44, 23, Math.PI, 0);
  c.fill();
  c.fillStyle = C.cyan;
  c.beginPath();
  c.ellipse(w / 2, h + 8, 44, 46, 0, Math.PI, 0);
  c.fill();
};

/**
 * Teeko: a small black-and-tan chihuahua with big upright ears, sitting on the dog bed, tongue out.
 * Tan points: chest and throat, lower front legs and paws, cheeks, muzzle, and two eyebrow dots.
 */
const teeko: PhotoFn = (c, w, h) => {
  // warm wall with a soft window glow, rug-teal floor
  const bg = c.createRadialGradient(w * 0.3, h * 0.2, 4, w * 0.3, h * 0.2, w);
  bg.addColorStop(0, "#fff4e0");
  bg.addColorStop(1, "#e2cfb2");
  c.fillStyle = bg;
  c.fillRect(0, 0, w, h);
  c.fillStyle = "#7f9d8c";
  c.fillRect(0, h * 0.8, w, h * 0.2);
  // dog bed
  c.fillStyle = TEEKO.bed;
  c.beginPath();
  c.ellipse(w / 2, h * 0.92, 60, 18, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = TEEKO.bedCushion;
  c.beginPath();
  c.ellipse(w / 2, h * 0.93, 48, 11, 0, 0, Math.PI * 2);
  c.fill();

  const coat = "#1f1c24";
  // ears: huge, wide-set, flaring out at 45 degrees with rounded tips
  const ear = (sx: number) => {
    c.fillStyle = coat;
    c.beginPath();
    c.moveTo(64 + sx * 4, 38);
    c.lineTo(64 + sx * 36, 4);
    c.quadraticCurveTo(64 + sx * 46, 2, 64 + sx * 44, 12);
    c.lineTo(64 + sx * 26, 56);
    c.closePath();
    c.fill();
    c.fillStyle = "#9a7275";
    c.beginPath();
    c.moveTo(64 + sx * 13, 38);
    c.lineTo(64 + sx * 37, 10);
    c.quadraticCurveTo(64 + sx * 41, 9, 64 + sx * 40, 14);
    c.lineTo(64 + sx * 25, 48);
    c.closePath();
    c.fill();
  };
  ear(-1);
  ear(1);
  // body (sitting) and the tan chest and throat
  c.fillStyle = coat;
  c.beginPath();
  c.ellipse(64, 100, 20, 20, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = TEEKO.tan;
  c.beginPath();
  c.ellipse(64, 95, 10, 16, 0, 0, Math.PI * 2);
  c.fill();
  // front legs: black at the shoulder, tan from the elbow down to the paws
  c.fillStyle = coat;
  roundRect(c, 53, 98, 8, 20, 4);
  c.fill();
  roundRect(c, 67, 98, 8, 20, 4);
  c.fill();
  c.fillStyle = TEEKO.tan;
  roundRect(c, 53, 106, 8, 12, 4);
  c.fill();
  roundRect(c, 67, 106, 8, 12, 4);
  c.fill();
  c.beginPath();
  c.ellipse(57, 117.5, 5.5, 3, 0, 0, Math.PI * 2);
  c.ellipse(71, 117.5, 5.5, 3, 0, 0, Math.PI * 2);
  c.fill();
  // toe lines
  c.strokeStyle = TEEKO.tanShade;
  c.lineWidth = 0.9;
  c.beginPath();
  [55.2, 58.8, 69.2, 72.8].forEach((x) => {
    c.moveTo(x, 116.2);
    c.lineTo(x, 119.6);
  });
  c.stroke();
  // head: apple dome, a touch wider at the cheeks
  c.fillStyle = coat;
  c.beginPath();
  c.ellipse(64, 56, 23, 21, 0, 0, Math.PI * 2);
  c.fill();
  // collar with a tag
  c.fillStyle = C.red;
  roundRect(c, 49, 77, 30, 6, 3);
  c.fill();
  c.fillStyle = "#f2c14e";
  c.beginPath();
  c.arc(64, 86, 3.4, 0, Math.PI * 2);
  c.fill();
  // tan cheeks, then the short, rounded tan muzzle over them
  c.fillStyle = TEEKO.tan;
  c.beginPath();
  c.ellipse(52.5, 67, 6.5, 5, -0.35, 0, Math.PI * 2);
  c.ellipse(75.5, 67, 6.5, 5, 0.35, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = TEEKO.tanShade;
  c.beginPath();
  c.ellipse(64, 69, 11.6, 8.8, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = TEEKO.muzzle;
  c.beginPath();
  c.ellipse(64, 68, 11, 8.5, 0, 0, Math.PI * 2);
  c.fill();
  // panting tongue
  c.fillStyle = TEEKO.tongue;
  c.beginPath();
  c.ellipse(64, 76.5, 3.6, 4.4, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = TEEKO.nose;
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(57, 71);
  c.quadraticCurveTo(60.5, 74.5, 64, 71.5);
  c.quadraticCurveTo(67.5, 74.5, 71, 71);
  c.stroke();
  // tan eyebrow dots
  c.fillStyle = TEEKO.tan;
  c.beginPath();
  c.ellipse(51, 42.5, 3, 2.3, -0.2, 0, Math.PI * 2);
  c.ellipse(77, 42.5, 3, 2.3, 0.2, 0, Math.PI * 2);
  c.fill();
  // eyes: big, round, shiny
  [53, 75].forEach((x) => {
    c.fillStyle = "#57505f";
    c.beginPath();
    c.arc(x, 53, 7, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = TEEKO.eye;
    c.beginPath();
    c.arc(x, 53, 5.8, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(x - 2, 50.8, 2.1, 0, Math.PI * 2);
    c.fill();
  });
  // nose
  c.fillStyle = TEEKO.nose;
  c.beginPath();
  c.ellipse(64, 65, 4.6, 3.2, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "rgba(255,255,255,.6)";
  c.beginPath();
  c.arc(62.6, 64, 1.1, 0, Math.PI * 2);
  c.fill();
  // a doodled heart
  c.fillStyle = "#e5484d";
  c.beginPath();
  c.moveTo(110, 38);
  c.bezierCurveTo(102, 32, 104, 24, 110, 28);
  c.bezierCurveTo(116, 24, 118, 32, 110, 38);
  c.fill();
};

const mountains: PhotoFn = (c, w, h) => {
  const gr = c.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#8cc4f2");
  gr.addColorStop(1, "#dff1ff");
  c.fillStyle = gr;
  c.fillRect(0, 0, w, h);
  c.fillStyle = "#6d7fa0";
  c.beginPath();
  c.moveTo(0, 80);
  c.lineTo(38, 30);
  c.lineTo(66, 64);
  c.lineTo(92, 24);
  c.lineTo(w, 72);
  c.lineTo(w, 90);
  c.lineTo(0, 90);
  c.fill();
  c.fillStyle = "#f3f6fa";
  c.beginPath();
  c.moveTo(38, 30);
  c.lineTo(46, 40);
  c.lineTo(30, 40);
  c.fill();
  c.beginPath();
  c.moveTo(92, 24);
  c.lineTo(101, 36);
  c.lineTo(84, 36);
  c.fill();
  c.fillStyle = "#4f7d4a";
  c.fillRect(0, 86, w, 10);
  c.fillStyle = "#3d6b8c";
  c.fillRect(0, 96, w, h - 96);
  c.fillStyle = "rgba(255,255,255,.4)";
  c.fillRect(20, 106, 30, 2);
  c.fillRect(70, 114, 26, 2);
};

interface PolaroidDef {
  x: number;
  y: number;
  r: number;
  photo: PhotoFn;
  caption: string;
  pin: string;
}

const POLAROIDS: PolaroidDef[] = [
  { x: -3.3, y: 3.88, r: 0.07, photo: roadTrip, caption: "road trip", pin: "#e5484d" },
  { x: -2.55, y: 3.95, r: -0.05, photo: me, caption: "me", pin: "#22d3ee" },
  { x: -1.1, y: 3.85, r: 0.06, photo: controller, caption: "gg", pin: "#f5c542" },
  { x: -2.55, y: 2.85, r: 0.04, photo: teeko, caption: "teeko", pin: "#e5484d" },
  { x: -1.82, y: 2.8, r: -0.07, photo: mountains, caption: "the long way", pin: "#7ee081" },
];

/** Polaroid 0.56 x 0.66 with a 0.48 square photo; canvas is 256 x 302. */
const POL_W = 0.56;
const POL_H = 0.66;

function polaroidDraw(def: PolaroidDef): DrawFn {
  return (g, w, h) => {
    const s = w / POL_W; // px per unit
    const m = 0.04 * s;
    const p = 0.48 * s;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = "#fbfaf6";
    g.fillRect(0, 0, w, h);
    g.save();
    g.translate(m, m);
    g.scale(p / 128, p / 128);
    g.beginPath();
    g.rect(0, 0, 128, 128);
    g.clip();
    def.photo(g, 128, 128);
    g.restore();
    // faint inner shadow on the photo edge
    g.strokeStyle = "rgba(0,0,0,.12)";
    g.lineWidth = 2;
    g.strokeRect(m, m, p, p);
    g.fillStyle = "#34323a";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = canvasFont("hand", 40, 600);
    g.fillText(def.caption, w / 2, m + p + (h - m - p) / 2);
  };
}

interface NoteDef {
  x: number;
  y: number;
  r: number;
  col: string;
  text: string;
}

const NOTES: NoteDef[] = [
  { x: -1.82, y: 3.9, r: -0.06, col: "#ffe27a", text: "ship it" },
  { x: -3.3, y: 2.85, r: 0.05, col: "#ffb4c2", text: "evals > vibes" },
  { x: -1.05, y: 2.85, r: 0.08, col: "#a5f0fa", text: "call mom" },
];

function noteDraw(n: NoteDef): DrawFn {
  return (g, w, h) => {
    g.fillStyle = n.col;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(0,0,0,.06)";
    g.fillRect(0, 0, w, h * 0.125);
    g.fillStyle = "#2b2622";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = canvasFont("hand", w * 0.26, 600);
    const words = n.text.split(" ");
    if (words.length > 2) {
      g.fillText(words.slice(0, 2).join(" "), w / 2, h * 0.45);
      g.fillText(words.slice(2).join(" "), w / 2, h * 0.7);
    } else {
      g.fillText(n.text, w / 2, h * 0.55);
    }
  };
}

const corkDraw: DrawFn = (g, w, h) => {
  const rand = seededRange(7);
  g.fillStyle = "#c69a6a";
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = rand(0, 1) > 0.5 ? "rgba(120,80,40,.35)" : "rgba(240,210,160,.35)";
    g.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(1, 3));
  }
};

/** Where a polaroid's pin sits in world space. */
function pinPos(o: PolaroidDef): Vec3 {
  return [o.x - Math.sin(o.r) * 0.29, o.y + Math.cos(o.r) * 0.29, Z + 0.02];
}

/* ------------------------------------------------------------ component */

export function Corkboard() {
  const fontsReady = useFontsReady();
  const { invalidateShadows } = useRoomActions();

  const assets = useMemo(() => {
    const cork = createCanvasTexture(256, 256, corkDraw, { repeat: [1.5, 1] });
    const corkMat = new THREE.MeshStandardMaterial({ color: "#ffffff", map: cork, roughness: 1 });
    const paper = std("#fbfaf6", { roughness: 0.6 });
    const polaroids = POLAROIDS.map((def) => {
      const tex = createCanvasTexture(256, 302, polaroidDraw(def));
      const front = new THREE.MeshStandardMaterial({ color: "#ffffff", map: tex, roughness: 0.55 });
      // BoxGeometry face order: +x, -x, +y, -y, +z, -z
      const mats: THREE.Material[] = [paper, paper, paper, paper, front, paper];
      return { def, tex, front, mats };
    });
    const notes = NOTES.map((def) => {
      const tex = createCanvasTexture(256, 256, noteDraw(def));
      const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", map: tex, roughness: 0.8 });
      return { def, tex, mat };
    });
    // red yarn between the road trip and the mountains
    const a = new THREE.Vector3(...pinPos(POLAROIDS[0]));
    const b = new THREE.Vector3(...pinPos(POLAROIDS[4]));
    const mid = a.clone().lerp(b, 0.5);
    mid.y -= 0.25;
    mid.z += 0.01;
    const yarn = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 24, 0.008, 4);
    return { cork, corkMat, polaroids, notes, yarn };
  }, []);

  useEffect(
    () => () => {
      assets.cork.dispose();
      assets.corkMat.dispose();
      assets.polaroids.forEach((p) => {
        p.tex.dispose();
        p.front.dispose();
      });
      assets.notes.forEach((n) => {
        n.tex.dispose();
        n.mat.dispose();
      });
      assets.yarn.dispose();
    },
    [assets],
  );

  // Caveat arrives after first paint: redraw the handwriting.
  useEffect(() => {
    if (!fontsReady) return;
    assets.polaroids.forEach((p) => redraw(p.tex));
    assets.notes.forEach((n) => redraw(n.tex));
  }, [fontsReady, assets]);

  useEffect(() => invalidateShadows(2), [invalidateShadows]);

  return (
    <Hotspot id="about">
      <group>
        <mesh
          geometry={roundedBox(3.3, 2.3, 0.1, 0.03)}
          material={std(C.walnut, { roughness: 0.6 })}
          position={[BX, BY, BZ]}
          castShadow
          receiveShadow
        />
        <mesh geometry={box(3.1, 2.1, 0.02)} material={assets.corkMat} position={[BX, BY, BZ + 0.05]} receiveShadow />

        {assets.polaroids.map(({ def, mats }) => (
          <group key={def.caption} position={[def.x, def.y, Z]} rotation={[0, 0, def.r]}>
            <mesh geometry={box(POL_W, POL_H, 0.012)} material={mats} castShadow receiveShadow />
            <mesh geometry={sphere(0.035, 10, 8)} material={std(def.pin, { roughness: 0.3 })} position={[0, 0.29, 0.02]} castShadow />
          </group>
        ))}

        {assets.notes.map(({ def, mat }) => (
          <group key={def.text}>
            <mesh
              geometry={box(0.46, 0.46, 0.004)}
              material={mat}
              position={[def.x, def.y, Z + 0.004]}
              rotation={[0, 0, def.r]}
              castShadow
              receiveShadow
            />
            <mesh
              geometry={sphere(0.03, 8, 6)}
              material={std("#e5484d", { roughness: 0.3 })}
              position={[def.x, def.y + 0.19, Z + 0.02]}
              castShadow
            />
          </group>
        ))}

        <mesh geometry={assets.yarn} material={std("#d63c3c")} castShadow />
        {/* tiny brass tacks in the frame corners */}
        {[
          [-1.58, 1.08],
          [1.58, 1.08],
          [-1.58, -1.08],
          [1.58, -1.08],
        ].map(([dx, dy]) => (
          <mesh
            key={`${dx}:${dy}`}
            geometry={cylinder(0.022, 0.022, 0.012, 10)}
            material={std(C.brass, { metalness: 0.7, roughness: 0.35 })}
            position={[BX + dx, BY + dy, BZ + 0.055]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        ))}
      </group>
    </Hotspot>
  );
}
