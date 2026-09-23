import type { DrawFn } from "../../textures";
import { canvasFont } from "../../textures";
import {
  MAP_COLORS,
  MAP_H,
  type Rings,
  drawCartouche,
  drawCoastRipple,
  drawCompass,
  drawNeatline,
  drawOcean,
  drawPaper,
  drawScaleBar,
  drawWaterLabel,
  fillRings,
  mapScale,
  pathRings,
  strokeLines,
} from "./mapStyle";
import { USA_MAP } from "./usaMapData";

/**
 * Vintage wall map of the United States for the USA places frame: Albers
 * lower 48 with Canada and Mexico, the Great Lakes, state lines, boxed
 * Alaska and Hawaii insets, title cartouche, compass rose, and scale bar.
 * Static and deterministic; all pixel sizes scale with the canvas width.
 */

/** Water fill with the same engraved horizontal lines as the open ocean. */
function fillWater(g: CanvasRenderingContext2D, rings: Rings, sx: number, sy: number, w: number): void {
  g.save();
  g.beginPath();
  pathRings(g, rings, sx, sy, true);
  g.fillStyle = MAP_COLORS.ocean;
  g.fill("evenodd");
  g.clip("evenodd");
  g.fillStyle = MAP_COLORS.waterLine;
  for (let y = 3; y < MAP_H * sy; y += 7) g.fillRect(0, y, w, 0.8);
  g.restore();
}

/** Hand-tinted band just inside the coast, as on colored engraved maps. */
function tintEdge(g: CanvasRenderingContext2D, rings: Rings, sx: number, sy: number, width: number): void {
  g.save();
  g.beginPath();
  pathRings(g, rings, sx, sy, true);
  g.clip("evenodd");
  g.strokeStyle = "rgba(196,128,52,.3)";
  g.lineWidth = width;
  g.lineJoin = "round";
  g.stroke();
  g.restore();
}

/** Upright label for a land area: letter-spaced small caps look in ink. */
function drawLandLabel(g: CanvasRenderingContext2D, x: number, y: number, text: string, size: number, spacing: number): void {
  g.save();
  g.font = canvasFont("display", size, 600);
  g.fillStyle = MAP_COLORS.inkSoft;
  g.textBaseline = "middle";
  g.textAlign = "left";
  const chars = text.split("");
  const total = chars.reduce((acc, ch) => acc + g.measureText(ch).width + spacing, -spacing);
  let cx = x - total / 2;
  for (const ch of chars) {
    g.fillText(ch, cx, y);
    cx += g.measureText(ch).width + spacing;
  }
  g.restore();
}

export const drawUsaMap: DrawFn = (g, w, h) => {
  const { sx, sy } = mapScale(w, h);
  const u = w / 1024;
  const m = USA_MAP;
  const px = ([x, y]: [number, number]): [number, number] => [x * sx, y * sy];

  g.save();
  drawOcean(g, w, h);
  strokeLines(g, m.graticule, sx, sy, MAP_COLORS.graticule, 1.1 * u);

  // coasts: ripple on the water, then neighbors and the country itself
  drawCoastRipple(g, [...m.land, ...m.neighbors], sx, sy);
  fillRings(g, m.neighbors, sx, sy, MAP_COLORS.neighbor, MAP_COLORS.neighborBorder, 1.2 * u);
  fillRings(g, m.land, sx, sy, MAP_COLORS.landUsa);
  tintEdge(g, m.land, sx, sy, 12 * u);
  strokeLines(g, m.stateLines, sx, sy, MAP_COLORS.stateLine, 1.15 * u);
  g.beginPath();
  pathRings(g, m.land, sx, sy, true);
  g.strokeStyle = MAP_COLORS.border;
  g.lineWidth = 2.4 * u;
  g.lineJoin = "round";
  g.stroke();

  // lakes cut into both countries; the boundary shows only where it crosses water
  fillWater(g, m.lakes, sx, sy, w);
  g.save();
  g.beginPath();
  pathRings(g, m.lakes, sx, sy, true);
  g.clip("evenodd");
  strokeLines(g, m.intlBorder, sx, sy, MAP_COLORS.accent, 1.3 * u, [5 * u, 3.5 * u]);
  g.restore();
  g.beginPath();
  pathRings(g, m.lakes, sx, sy, true);
  g.strokeStyle = MAP_COLORS.border;
  g.lineWidth = 1.3 * u;
  g.stroke();

  // insets
  for (const inset of m.insets) {
    const [bx, by, bw, bh] = inset.box;
    const x = bx * sx;
    const y = by * sy;
    const iw = bw * sx;
    const ih = bh * sy;
    g.fillStyle = "rgba(60,40,20,.2)";
    g.fillRect(x + 3 * u, y + 4 * u, iw, ih);
    g.save();
    g.beginPath();
    g.rect(x, y, iw, ih);
    g.clip();
    drawOcean(g, w, h);
    drawCoastRipple(g, [...inset.land, ...inset.neighbors], sx, sy);
    fillRings(g, inset.neighbors, sx, sy, MAP_COLORS.neighbor, MAP_COLORS.neighborBorder, 1.2 * u);
    fillRings(g, inset.land, sx, sy, MAP_COLORS.landUsa);
    tintEdge(g, inset.land, sx, sy, 9 * u);
    fillRings(g, inset.land, sx, sy, "rgba(0,0,0,0)", MAP_COLORS.border, 2 * u);
    g.restore();
    g.strokeStyle = MAP_COLORS.ink;
    g.lineWidth = 2.4 * u;
    g.strokeRect(x, y, iw, ih);
    g.lineWidth = 0.9 * u;
    g.strokeRect(x + 4 * u, y + 4 * u, iw - 8 * u, ih - 8 * u);
    const [lx, ly] = px(inset.label);
    drawLandLabel(g, lx, ly, inset.name, 17 * u, 3.5 * u);
  }

  // water and neighbor labels
  const [pcx, pcy] = px(m.anchors.pacific);
  drawWaterLabel(g, pcx, pcy - 12 * u, "PACIFIC", 18 * u, MAP_COLORS.inkSoft, 3.5 * u);
  drawWaterLabel(g, pcx, pcy + 12 * u, "OCEAN", 18 * u, MAP_COLORS.inkSoft, 3.5 * u);
  const [acx, acy] = px(m.anchors.atlantic);
  drawWaterLabel(g, acx, acy - 13 * u, "ATLANTIC", 19 * u, MAP_COLORS.inkSoft, 4 * u);
  drawWaterLabel(g, acx, acy + 13 * u, "OCEAN", 19 * u, MAP_COLORS.inkSoft, 4 * u);
  const [gcx, gcy] = px(m.anchors.gulf);
  drawWaterLabel(g, gcx, gcy - 12 * u, "GULF OF", 17 * u, MAP_COLORS.inkSoft, 3.5 * u);
  drawWaterLabel(g, gcx, gcy + 12 * u, "MEXICO", 17 * u, MAP_COLORS.inkSoft, 3.5 * u);
  const [ccx, ccy] = px(m.anchors.canada);
  drawLandLabel(g, ccx, ccy, "CANADA", 26 * u, 11 * u);
  const [mcx, mcy] = px(m.anchors.mexico);
  drawLandLabel(g, mcx, mcy, "MEXICO", 21 * u, 8 * u);

  drawPaper(g, w, h, 1776);
  drawNeatline(g, w, h);

  drawCartouche(g, w / 2, h * 0.082, "UNITED STATES OF AMERICA", "Fifty States", 34 * u);

  // compass over the Caribbean, scale bar in the Atlantic below its label
  drawCompass(g, w * 0.862, h * 0.885, 50 * u);
  const miles = 300;
  const bar = (miles / m.milesPerUnit) * sx;
  drawScaleBar(g, acx - bar / 2, acy + 48 * u, bar, `${miles} Miles`);
  g.restore();
};
