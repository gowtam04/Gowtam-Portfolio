import { canvasFont, type DrawFn } from "../../textures";
import { INDIA_MAP } from "./indiaMapData";
import {
  MAP_COLORS,
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

type AnchorKey = keyof typeof INDIA_MAP.anchors;

/** Flat [x, y, ...] dots, e.g. islets too small to draw as outlines. */
function drawDots(
  g: CanvasRenderingContext2D,
  pts: number[],
  sx: number,
  sy: number,
  r: number,
  fill: string,
  stroke: string,
  lw: number,
): void {
  g.beginPath();
  for (let i = 0; i < pts.length; i += 2) {
    const x = pts[i] * sx;
    const y = pts[i + 1] * sy;
    g.moveTo(x + r, y);
    g.arc(x, y, r, 0, Math.PI * 2);
  }
  g.fillStyle = fill;
  g.fill();
  g.strokeStyle = stroke;
  g.lineWidth = lw;
  g.stroke();
}

/** Stacked water labels (one call per line), centered on (x, y). */
function stackedLabel(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  lines: string[],
  size: number,
  spacing: number,
  color: string = MAP_COLORS.inkSoft,
  rotation = 0,
): void {
  const lead = size * 1.25;
  const top = y - ((lines.length - 1) * lead) / 2;
  lines.forEach((line, i) => {
    const dy = top + i * lead - y;
    drawWaterLabel(g, x - Math.sin(rotation) * dy, y + Math.cos(rotation) * dy, line, size, color, spacing, rotation);
  });
}

/** City marker with a small serif label; the capital gets a ringed dot. */
function drawCity(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  name: string,
  u: number,
  align: "left" | "right",
  capital = false,
): void {
  const r = (capital ? 4.2 : 3.2) * u;
  if (capital) {
    g.beginPath();
    g.arc(x, y, r * 1.9, 0, Math.PI * 2);
    g.fillStyle = "#f5ead0";
    g.fill();
    g.strokeStyle = MAP_COLORS.ink;
    g.lineWidth = 1.4 * u;
    g.stroke();
  }
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fillStyle = capital ? MAP_COLORS.accent : MAP_COLORS.ink;
  g.fill();
  const size = (capital ? 17 : 15) * u;
  g.font = canvasFont("display", size, capital ? 700 : 600);
  g.textBaseline = "middle";
  g.textAlign = align === "right" ? "left" : "right";
  const tx = x + (align === "right" ? 1 : -1) * (capital ? r * 2.6 : r * 2.2);
  // paper halo keeps labels legible over state lines
  g.lineWidth = 3.2 * u;
  g.strokeStyle = "rgba(245,234,208,.85)";
  g.lineJoin = "round";
  g.strokeText(name, tx, y);
  g.fillStyle = MAP_COLORS.ink;
  g.fillText(name, tx, y);
}

/**
 * Vintage wall map of India using India's official depiction of its borders
 * (Natural Earth, India point of view): all of Jammu and Kashmir and Ladakh,
 * and Arunachal Pradesh, drawn as India.
 */
export const drawIndiaMap: DrawFn = (g, w, h) => {
  const { sx, sy } = mapScale(w, h);
  const u = w / 1024;
  const m = INDIA_MAP;
  const at = (k: AnchorKey): [number, number] => [m.anchors[k][0] * sx, m.anchors[k][1] * sy];

  g.save();
  g.textAlign = "left";
  g.textBaseline = "alphabetic";

  // sea and graticule
  drawOcean(g, w, h);
  strokeLines(g, m.graticule, sx, sy, MAP_COLORS.graticule, 1.3 * u);

  // coastline ripples, then land masses
  drawCoastRipple(g, [...m.land, ...m.neighbors], sx, sy);
  fillRings(g, m.neighbors, sx, sy, MAP_COLORS.neighbor, MAP_COLORS.neighborBorder, 1.3 * u);
  drawDots(g, m.neighborIslets, sx, sy, 2 * u, MAP_COLORS.neighbor, MAP_COLORS.neighborBorder, 1 * u);

  fillRings(g, m.land, sx, sy, MAP_COLORS.landIndia);
  // hand-tinted wash just inside the national border
  g.save();
  g.beginPath();
  pathRings(g, m.land, sx, sy, true);
  g.clip("evenodd");
  g.strokeStyle = "rgba(196,112,52,.32)";
  g.lineWidth = 14 * u;
  g.lineJoin = "round";
  g.stroke();
  g.strokeStyle = "rgba(196,112,52,.22)";
  g.lineWidth = 6 * u;
  g.stroke();
  g.restore();

  strokeLines(g, m.stateLines, sx, sy, MAP_COLORS.stateLine, 1.3 * u, [5 * u, 3.5 * u]);

  g.beginPath();
  pathRings(g, m.land, sx, sy, true);
  g.strokeStyle = MAP_COLORS.border;
  g.lineWidth = 2.6 * u;
  g.lineJoin = "round";
  g.stroke();
  drawDots(g, m.islets, sx, sy, 2.4 * u, MAP_COLORS.landIndia, MAP_COLORS.border, 1.2 * u);

  // Tropic of Cancer, dashed across land and sea, labeled over Myanmar
  strokeLines(g, m.tropic, sx, sy, "rgba(156,59,42,.6)", 1.5 * u, [11 * u, 7 * u]);
  {
    const [ax, ay] = at("tropicA");
    const [bx, by] = at("tropicB");
    const rot = Math.atan2(by - ay, bx - ax);
    const off = 11 * u;
    drawWaterLabel(
      g,
      (ax + bx) / 2 + Math.sin(rot) * off,
      (ay + by) / 2 - Math.cos(rot) * off,
      "Tropic of Cancer",
      13 * u,
      MAP_COLORS.accent,
      0.6 * u,
      rot,
    );
  }

  // seas
  stackedLabel(g, ...at("arabianSea"), ["ARABIAN", "SEA"], 21 * u, 5 * u);
  stackedLabel(g, ...at("bayOfBengal"), ["BAY OF", "BENGAL"], 22 * u, 6 * u);
  drawWaterLabel(g, ...at("indianOcean"), "INDIAN OCEAN", 22 * u, MAP_COLORS.inkSoft, 6 * u);

  // neighbors
  const nb = "rgba(59,42,28,.55)";
  drawWaterLabel(g, ...at("pakistan"), "PAKISTAN", 15 * u, nb, 3.5 * u);
  drawWaterLabel(g, ...at("afghanistan"), "AFGHANISTAN", 12 * u, nb, 2.5 * u);
  drawWaterLabel(g, ...at("china"), "CHINA", 17 * u, nb, 6 * u);
  drawWaterLabel(g, ...at("nepal"), "NEPAL", 12 * u, nb, 3 * u, 0.3);
  drawWaterLabel(g, ...at("bhutan"), "BHUTAN", 9 * u, nb, 1.5 * u);
  drawWaterLabel(g, ...at("bangladesh"), "BANGLADESH", 9 * u, nb, 0.6 * u);
  drawWaterLabel(g, ...at("myanmar"), "MYANMAR", 14 * u, nb, 3 * u);
  stackedLabel(g, ...at("sriLanka"), ["SRI", "LANKA"], 11 * u, 2 * u, nb);

  // island groups
  stackedLabel(g, ...at("andaman"), ["Andaman and", "Nicobar Islands"], 13 * u, 0.5 * u, MAP_COLORS.ink);
  drawWaterLabel(g, ...at("lakshadweep"), "Lakshadweep", 13 * u, MAP_COLORS.ink, 0.5 * u);

  // cities
  drawCity(g, ...at("newDelhi"), "New Delhi", u, "right", true);
  drawCity(g, ...at("mumbai"), "Mumbai", u, "right");
  drawCity(g, ...at("kolkata"), "Kolkata", u, "left");
  drawCity(g, ...at("chennai"), "Chennai", u, "right");
  drawCity(g, ...at("bengaluru"), "Bengaluru", u, "left");
  drawCity(g, ...at("hyderabad"), "Hyderabad", u, "right");

  // aged paper, degree ticks, frame
  drawPaper(g, w, h, 1947);
  g.fillStyle = MAP_COLORS.inkSoft;
  g.font = canvasFont("display", 11 * u, 400, "italic");
  g.textBaseline = "bottom";
  for (const l of m.graticuleLabels) {
    g.textAlign = l.side === "b" ? "center" : "left";
    g.fillText(l.text, l.x * sx + (l.side === "l" ? 2 * u : 0), l.y * sy - 2 * u);
  }
  drawNeatline(g, w, h);

  drawCartouche(g, w * 0.745, h * 0.12, "INDIA", "Bharat", 58 * u);
  drawCompass(g, w * 0.6, h * 0.8, 52 * u);
  drawScaleBar(g, w * 0.065, h * 0.9, m.unitsPer500Km * sx, "500 km");

  g.restore();
};
