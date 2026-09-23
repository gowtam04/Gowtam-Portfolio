#!/usr/bin/env node
/**
 * Builds the vintage wall map data for India (India point of view borders).
 *
 * Sources (public domain, Natural Earth), cached in scripts/maps/.cache/:
 *   ne_10m_admin_0_countries_ind.geojson  (countries, India point of view)
 *   ne_10m_admin_1_states_provinces.geojson (states, filtered to IND)
 *
 * Output:
 *   src/components/room/objects/maps/indiaMapData.ts (generated, typed)
 *   scripts/maps/.cache/india-preview.svg / india-preview.png (all layers)
 *
 * Run: node scripts/maps/build-india-map.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const CACHE = join(HERE, ".cache");
const OUT = join(ROOT, "src/components/room/objects/maps/indiaMapData.ts");

const RAW = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/";
const CDN = "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/";
const COUNTRIES = "ne_10m_admin_0_countries_ind.geojson";
const STATES = "ne_10m_admin_1_states_provinces.geojson";

// Normalized map space (must match mapStyle.ts).
const MAP_W = 10000;
const MAP_H = 10370;

// Lambert conformal conic on a sphere.
const LON0 = 80;
const LAT0 = 22;
const LAT1 = 12;
const LAT2 = 28;

// Fit: projected bbox of India (POV) plus Sri Lanka, with these margins (map units).
const MARGIN_X = 430;
const MARGIN_TOP = 380;
const MARGIN_BOTTOM = 420;

// Simplification tolerances (map units; 1 px on a 1024 canvas is about 10 units).
const TOL_LAND = 11;
const TOL_NEIGHBOR = 16;
const TOL_STATE = 14;
const TOL_ISLAND = 6;
// Rings smaller than this (map units squared) are dropped (or become islet dots).
const MIN_AREA = 5000;
const MIN_AREA_ISLAND = 700;
// Neighbor polygons are clipped to the frame grown by this pad so their clipped
// edges (and ripples) sit off-canvas under the neatline.
const CLIP_PAD = 260;

// ---------------------------------------------------------------- download

async function cached(name) {
  const path = join(CACHE, name);
  if (existsSync(path) && statSync(path).size > 1000) return JSON.parse(readFileSync(path, "utf8"));
  mkdirSync(CACHE, { recursive: true });
  let lastErr;
  for (const base of [RAW, CDN]) {
    try {
      console.log(`downloading ${base}${name}`);
      const res = await fetch(base + name);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const text = await res.text();
      writeFileSync(path, text);
      return JSON.parse(text);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

// ---------------------------------------------------------------- projection

const RAD = Math.PI / 180;
const f1 = LAT1 * RAD;
const f2 = LAT2 * RAD;
const tq = (f) => Math.tan(Math.PI / 4 + f / 2);
const N = Math.log(Math.cos(f1) / Math.cos(f2)) / Math.log(tq(f2) / tq(f1));
const F = (Math.cos(f1) * Math.pow(tq(f1), N)) / N;
const RHO0 = F / Math.pow(tq(LAT0 * RAD), N);

function lcc(lon, lat) {
  let dl = lon - LON0;
  while (dl > 180) dl -= 360;
  while (dl < -180) dl += 360;
  const rho = F / Math.pow(tq(Math.max(-89, Math.min(89, lat)) * RAD), N);
  const th = N * dl * RAD;
  return [rho * Math.sin(th), RHO0 - rho * Math.cos(th)];
}

// Map-space transform, set once the fit is known.
let S = 1;
let OX = 0;
let OY = 0;
const toMap = ([x, y]) => [OX + x * S, OY - y * S];
const project = (lon, lat) => toMap(lcc(lon, lat));

// ---------------------------------------------------------------- geometry helpers

function polysOf(geom) {
  if (!geom) return [];
  if (geom.type === "Polygon") return [geom.coordinates];
  if (geom.type === "MultiPolygon") return geom.coordinates;
  return [];
}

function lonLatBox(ring) {
  let a = Infinity;
  let b = Infinity;
  let c = -Infinity;
  let d = -Infinity;
  for (const [x, y] of ring) {
    a = Math.min(a, x);
    b = Math.min(b, y);
    c = Math.max(c, x);
    d = Math.max(d, y);
  }
  return [a, b, c, d];
}

/** Signed area of a ring of [x, y] points. */
function area(pts) {
  let s = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) s += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
  return s / 2;
}

function centroid(pts) {
  let x = 0;
  let y = 0;
  for (const p of pts) {
    x += p[0];
    y += p[1];
  }
  return [x / pts.length, y / pts.length];
}

function openRing(pts) {
  const r = pts.slice();
  if (r.length > 1 && r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1]) r.pop();
  return r;
}

/** Douglas-Peucker on an open polyline (iterative). */
function dp(pts, tol) {
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  const t2 = tol * tol;
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let best = -1;
    let bi = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      let d2;
      if (len2 === 0) d2 = (px - ax) ** 2 + (py - ay) ** 2;
      else {
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
        d2 = (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2;
      }
      if (d2 > best) {
        best = d2;
        bi = i;
      }
    }
    if (best > t2) {
      keep[bi] = 1;
      stack.push([a, bi], [bi, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

/** Simplify a closed ring: split at the point farthest from the first, then DP both halves. */
function dpRing(pts, tol) {
  const r = openRing(pts);
  if (r.length < 4) return r;
  let far = 0;
  let fd = -1;
  for (let i = 1; i < r.length; i++) {
    const d = (r[i][0] - r[0][0]) ** 2 + (r[i][1] - r[0][1]) ** 2;
    if (d > fd) {
      fd = d;
      far = i;
    }
  }
  const a = dp(r.slice(0, far + 1), tol);
  const b = dp(r.slice(far).concat([r[0]]), tol);
  return a.concat(b.slice(1, -1));
}

/**
 * Remove short, needle-like spikes (river mouths and creeks that survive DP as
 * one-vertex slivers) from a closed ring.
 */
function despike(pts, maxLen = 70, minCos = 0.93) {
  const r = pts.slice();
  let changed = true;
  while (changed && r.length > 4) {
    changed = false;
    for (let i = 0; i < r.length && r.length > 4; i++) {
      const p = r[(i + r.length - 1) % r.length];
      const c = r[i];
      const n = r[(i + 1) % r.length];
      const ax = p[0] - c[0];
      const ay = p[1] - c[1];
      const bx = n[0] - c[0];
      const by = n[1] - c[1];
      const la = Math.hypot(ax, ay);
      const lb = Math.hypot(bx, by);
      if (!la || !lb) {
        r.splice(i--, 1);
        changed = true;
        continue;
      }
      const cos = (ax * bx + ay * by) / (la * lb);
      if (cos > minCos && Math.min(la, lb) < maxLen) {
        r.splice(i--, 1);
        changed = true;
      }
    }
  }
  return r;
}

function quantize(pts, closed) {
  const out = [];
  for (const [x, y] of pts) {
    const qx = Math.round(x);
    const qy = Math.round(y);
    const n = out.length;
    if (n && out[n - 2] === qx && out[n - 1] === qy) continue;
    out.push(qx, qy);
  }
  if (closed && out.length >= 4 && out[0] === out[out.length - 2] && out[1] === out[out.length - 1]) out.length -= 2;
  return out;
}

/** Sutherland-Hodgman clip of a polygon against an axis-aligned rectangle. */
function clipPolygon(pts, x0, y0, x1, y1) {
  const edges = [
    (p) => p[0] >= x0,
    (p) => p[0] <= x1,
    (p) => p[1] >= y0,
    (p) => p[1] <= y1,
  ];
  const cut = [
    (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])],
    (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])],
    (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0],
    (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1],
  ];
  let out = pts;
  for (let e = 0; e < 4; e++) {
    const inp = out;
    out = [];
    if (!inp.length) break;
    for (let i = 0; i < inp.length; i++) {
      const cur = inp[i];
      const prev = inp[(i + inp.length - 1) % inp.length];
      const ci = edges[e](cur);
      const pi = edges[e](prev);
      if (ci) {
        if (!pi) out.push(cut[e](prev, cur));
        out.push(cur);
      } else if (pi) out.push(cut[e](prev, cur));
    }
  }
  return out;
}

/** Liang-Barsky clip of a polyline against a rectangle; returns the inside runs. */
function clipPolyline(pts, x0, y0, x1, y1) {
  const runs = [];
  let run = [];
  const flush = () => {
    if (run.length > 1) runs.push(run);
    run = [];
  };
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    let t0 = 0;
    let t1 = 1;
    let ok = true;
    for (const [p, q] of [
      [-dx, ax - x0],
      [dx, x1 - ax],
      [-dy, ay - y0],
      [dy, y1 - ay],
    ]) {
      if (p === 0) {
        if (q < 0) ok = false;
      } else {
        const r = q / p;
        if (p < 0) t0 = Math.max(t0, r);
        else t1 = Math.min(t1, r);
      }
    }
    if (!ok || t0 > t1) {
      flush();
      continue;
    }
    const s = [ax + t0 * dx, ay + t0 * dy];
    const e = [ax + t1 * dx, ay + t1 * dy];
    if (!run.length) run.push(s);
    run.push(e);
    if (t1 < 1) flush();
  }
  flush();
  return runs;
}

// ---------------------------------------------------------------- build

const countries = await cached(COUNTRIES);
const statesAll = await cached(STATES);

const india = countries.features.find((f) => f.properties.ADM0_A3 === "IND");
if (!india) throw new Error("India feature missing");
const lka = countries.features.find((f) => f.properties.ADM0_A3 === "LKA");

// Fit on the projected bbox of India (POV) plus Sri Lanka.
{
  let a = Infinity;
  let b = Infinity;
  let c = -Infinity;
  let d = -Infinity;
  for (const feat of [india, lka]) {
    for (const poly of polysOf(feat.geometry)) {
      for (const [lon, lat] of poly[0]) {
        const [x, y] = lcc(lon, lat);
        a = Math.min(a, x);
        b = Math.min(b, y);
        c = Math.max(c, x);
        d = Math.max(d, y);
      }
    }
  }
  const sx = (MAP_W - 2 * MARGIN_X) / (c - a);
  const sy = (MAP_H - MARGIN_TOP - MARGIN_BOTTOM) / (d - b);
  S = Math.min(sx, sy);
  OX = MAP_W / 2 - ((a + c) / 2) * S;
  OY = MARGIN_TOP + (MAP_H - MARGIN_TOP - MARGIN_BOTTOM) / 2 + ((b + d) / 2) * S;
  console.log(`fit: scale ${S.toFixed(1)} (x-limited ${sx < sy}), ${(1 / (S / 6371)).toFixed(3)} km per unit`);
}

const inFrameLonLat = ([a, b, c, d]) => c > 45 && a < 125 && d > -12 && b < 50;

// Island groups kept at a lower threshold (lon/lat boxes).
const ISLAND_GROUPS = [
  [91.5, 6, 94.5, 14.2], // Andaman and Nicobar
  [71, 7.8, 74.5, 12.5], // Lakshadweep
];
const inGroup = ([lon, lat]) => ISLAND_GROUPS.some(([a, b, c, d]) => lon >= a && lon <= c && lat >= b && lat <= d);

// Land (India POV).
const land = [];
const islets = [];
for (const poly of polysOf(india.geometry)) {
  poly.forEach((ringLL, k) => {
    const pts = ringLL.map(([lon, lat]) => project(lon, lat));
    const A = Math.abs(area(pts));
    const ll = centroid(openRing(ringLL));
    if (A >= MIN_AREA && k >= 0) {
      land.push(quantize(despike(dpRing(pts, TOL_LAND)), true));
    } else if (k === 0 && inGroup(ll)) {
      if (A >= MIN_AREA_ISLAND) land.push(quantize(dpRing(pts, TOL_ISLAND), true));
      else {
        const [x, y] = centroid(openRing(pts));
        if (!islets.some((p, i) => i % 2 === 0 && Math.hypot(p - x, islets[i + 1] - y) < 45)) {
          islets.push(Math.round(x), Math.round(y));
        }
      }
    }
  });
}

// Neighbors: every other country touching the frame, clipped to the padded frame.
const neighbors = [];
const neighborIslets = [];
const X0 = -CLIP_PAD;
const Y0 = -CLIP_PAD;
const X1 = MAP_W + CLIP_PAD;
const Y1 = MAP_H + CLIP_PAD;
const neighborNames = [];
const islandCandidates = [];
for (const feat of countries.features) {
  const code = feat.properties.ADM0_A3;
  if (code === "IND") continue;
  let used = false;
  for (const poly of polysOf(feat.geometry)) {
    poly.forEach((ringLL, k) => {
      if (!inFrameLonLat(lonLatBox(ringLL))) return;
      const pts = openRing(ringLL).map(([lon, lat]) => project(lon, lat));
      const clipped = clipPolygon(pts, X0, Y0, X1, Y1);
      if (clipped.length < 3) return;
      const A = Math.abs(area(clipped));
      if (A >= MIN_AREA) {
        const q = quantize(despike(dpRing(clipped, TOL_NEIGHBOR)), true);
        if (q.length >= 6) {
          neighbors.push(q);
          used = true;
        }
      } else if (k === 0) {
        const [x, y] = centroid(clipped);
        if (x < 0 || y < 0 || x > MAP_W || y > MAP_H) return;
        islandCandidates.push([x, y]);
      }
    });
  }
  if (used) neighborNames.push(code);
}
// Keep only isolated neighbor islets (Maldives, Coco Islands); coastal ones are clutter.
function distToRings(x, y, rings) {
  let best = Infinity;
  for (const r of rings) {
    for (let i = 0; i < r.length; i += 2) {
      const j = (i + 2) % r.length;
      const ax = r[i];
      const ay = r[i + 1];
      const dx = r[j] - ax;
      const dy = r[j + 1] - ay;
      const l2 = dx * dx + dy * dy;
      const t = l2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)) : 0;
      best = Math.min(best, Math.hypot(x - ax - t * dx, y - ay - t * dy));
    }
  }
  return best;
}
for (const [x, y] of islandCandidates) {
  if (distToRings(x, y, neighbors) < 160 || distToRings(x, y, land) < 160) continue;
  if (neighborIslets.some((p, i) => i % 2 === 0 && Math.hypot(p - x, neighborIslets[i + 1] - y) < 110)) continue;
  neighborIslets.push(Math.round(x), Math.round(y));
}
console.log(`neighbors: ${neighborNames.join(" ")}`);

// State lines: admin_1 edges shared by two different Indian states.
const stateLines = [];
{
  const states = statesAll.features.filter((f) => f.properties.adm0_a3 === "IND");
  const key = (p) => `${p[0]},${p[1]}`;
  const edgeOwners = new Map();
  const nodePos = new Map();
  states.forEach((f, si) => {
    for (const poly of polysOf(f.geometry)) {
      for (const ring of poly) {
        for (let i = 0; i < ring.length - 1; i++) {
          const ka = key(ring[i]);
          const kb = key(ring[i + 1]);
          if (ka === kb) continue;
          nodePos.set(ka, ring[i]);
          nodePos.set(kb, ring[i + 1]);
          const ek = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
          let owners = edgeOwners.get(ek);
          if (!owners) edgeOwners.set(ek, (owners = new Set()));
          owners.add(si);
        }
      }
    }
  });
  const adj = new Map();
  const edges = [];
  for (const [ek, owners] of edgeOwners) {
    if (owners.size < 2) continue;
    const [a, b] = ek.split("|");
    const id = edges.length;
    edges.push([a, b]);
    for (const n of [a, b]) {
      if (!adj.has(n)) adj.set(n, []);
      adj.get(n).push(id);
    }
  }
  const used = new Uint8Array(edges.length);
  const walk = (start, eid) => {
    const chain = [start];
    let cur = start;
    let e = eid;
    for (;;) {
      used[e] = 1;
      const [a, b] = edges[e];
      const nxt = a === cur ? b : a;
      chain.push(nxt);
      cur = nxt;
      const nexts = adj.get(cur);
      if (nexts.length !== 2) break;
      const ne = nexts[0] === e ? nexts[1] : nexts[0];
      if (used[ne]) break;
      e = ne;
    }
    return chain;
  };
  const chains = [];
  for (const [n, list] of adj) {
    if (list.length === 2) continue;
    for (const e of list) if (!used[e]) chains.push(walk(n, e));
  }
  for (let e = 0; e < edges.length; e++) if (!used[e]) chains.push(walk(edges[e][0], e));
  for (const ch of chains) {
    const pts = ch.map((k) => project(...nodePos.get(k)));
    const q = quantize(dp(pts, TOL_STATE), false);
    let len = 0;
    for (let i = 2; i < q.length; i += 2) len += Math.hypot(q[i] - q[i - 2], q[i + 1] - q[i - 1]);
    if (q.length >= 4 && len > 60) stateLines.push(q);
  }
}

// Graticule every 5 degrees, plus the Tropic of Cancer.
const graticule = [];
const gratLabels = [];
const lineLL = (fn, n) => Array.from({ length: n + 1 }, (_, i) => fn(i / n));
function addLine(ll, out) {
  const pts = ll.map(([lon, lat]) => project(lon, lat));
  for (const run of clipPolyline(pts, 0, 0, MAP_W, MAP_H)) {
    const q = quantize(dp(run, 4), false);
    if (q.length >= 4) out.push(q);
  }
}
for (let lon = 40; lon <= 120; lon += 5) addLine(lineLL((t) => [lon, -15 + t * 70], 140), graticule);
for (let lat = -10; lat <= 50; lat += 5) addLine(lineLL((t) => [40 + t * 80, lat], 160), graticule);
const tropic = [];
addLine(lineLL((t) => [40 + t * 80, 23.4368], 160), tropic);

// Degree labels where lines meet the bottom (meridians) and left (parallels) edges of the frame.
{
  const EDGE_IN = 330; // label anchors sit just inside the neatline
  for (let lon = 40; lon <= 120; lon += 5) {
    // find the latitude where this meridian hits y = MAP_H - EDGE_IN
    let lo = -30;
    let hi = 50;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (project(lon, mid)[1] > MAP_H - EDGE_IN) lo = mid;
      else hi = mid;
    }
    const [x, y] = project(lon, lo);
    if (x > 600 && x < MAP_W - 600) gratLabels.push({ x: Math.round(x), y: Math.round(y), text: `${lon}°E`, side: "b" });
  }
  for (let lat = -10; lat <= 50; lat += 5) {
    let lo = 40;
    let hi = 120;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (project(mid, lat)[0] < EDGE_IN) lo = mid;
      else hi = mid;
    }
    const [x, y] = project(hi, lat);
    if (y > 600 && y < MAP_H - 600) gratLabels.push({ x: Math.round(x), y: Math.round(y), text: `${lat}°N`, side: "l" });
  }
}

// Named anchors (projected once here so the drawer needs no projection).
const ANCHORS = {
  arabianSea: [68.8, 14.0],
  bayOfBengal: [88.4, 16.4],
  indianOcean: [86.5, 6.4],
  pakistan: [68.6, 28.2],
  china: [85.3, 31.6],
  nepal: [83.6, 28.45],
  bangladesh: [90.2, 24.35],
  myanmar: [96.2, 20.6],
  sriLanka: [80.7, 7.7],
  afghanistan: [67.1, 34.0],
  bhutan: [90.4, 27.45],
  andaman: [90.4, 11.0],
  lakshadweep: [70.6, 10.9],
  tropicA: [95.2, 23.44],
  tropicB: [98.2, 23.44],
  newDelhi: [77.21, 28.61],
  mumbai: [72.88, 19.08],
  kolkata: [88.36, 22.57],
  chennai: [80.27, 13.08],
  bengaluru: [77.59, 12.97],
  hyderabad: [78.49, 17.39],
};
const anchors = {};
for (const [k, [lon, lat]] of Object.entries(ANCHORS)) anchors[k] = project(lon, lat).map(Math.round);

// Scale bar: map units per 500 km along the central parallel (LCC scale factor at LAT0).
const kmPerUnit = (() => {
  const a = project(LON0, LAT0 - 0.5);
  const b = project(LON0, LAT0 + 0.5);
  return 111.195 / Math.hypot(b[0] - a[0], b[1] - a[1]);
})();
const unitsPer500Km = Math.round(500 / kmPerUnit);

// ---------------------------------------------------------------- write TS

const ringsTs = (rings) => (rings.length ? `[\n${rings.map((r) => `    [${r.join(",")}],`).join("\n")}\n  ]` : "[]");
const ts = `/**
 * India wall map geometry, pre-projected and quantized to the MAP_W x MAP_H space.
 *
 * Sources:
 *   ${RAW}${COUNTRIES}
 *   ${RAW}${STATES} (adm0_a3 IND)
 * Public domain: Natural Earth (India point of view).
 *
 * Projection: Lambert conformal conic on a sphere, central meridian ${LON0}E,
 * origin ${LAT0}N, standard parallels ${LAT1}N and ${LAT2}N.
 *
 * Generated by scripts/maps/build-india-map.mjs; do not edit.
 */
import type { MapLayers, Rings } from "./mapStyle";

export interface GraticuleLabel {
  x: number;
  y: number;
  text: string;
  /** "b": meridian label on the bottom edge, "l": parallel label on the left edge. */
  side: "b" | "l";
}

export interface IndiaMapData extends MapLayers {
  /** Tiny Indian islands (Lakshadweep, small Andaman and Nicobar islets) as flat [x, y, ...] dots. */
  islets: number[];
  /** Tiny neighbor islands (for example the Maldives) as flat [x, y, ...] dots. */
  neighborIslets: number[];
  /** Tropic of Cancer (23.44N) polyline(s). */
  tropic: Rings;
  graticuleLabels: GraticuleLabel[];
  /** Label, city and ornament anchors in map space. */
  anchors: Record<${Object.keys(anchors)
    .map((k) => JSON.stringify(k))
    .join(" | ")}, [number, number]>;
  /** Map units spanning 500 km (at ${LAT0}N). */
  unitsPer500Km: number;
}

export const INDIA_MAP: IndiaMapData = {
  land: ${ringsTs(land)},
  neighbors: ${ringsTs(neighbors)},
  lakes: [],
  stateLines: ${ringsTs(stateLines)},
  graticule: ${ringsTs(graticule)},
  tropic: ${ringsTs(tropic)},
  islets: [${islets.join(",")}],
  neighborIslets: [${neighborIslets.join(",")}],
  graticuleLabels: [
${gratLabels.map((l) => `    { x: ${l.x}, y: ${l.y}, text: "${l.text}", side: "${l.side}" },`).join("\n")}
  ],
  anchors: {
${Object.entries(anchors)
  .map(([k, [x, y]]) => `    ${k}: [${x}, ${y}],`)
  .join("\n")}
  },
  unitsPer500Km: ${unitsPer500Km},
};
`;
writeFileSync(OUT, ts);
const pts = (rs) => rs.reduce((s, r) => s + r.length / 2, 0);
console.log(
  `wrote ${OUT} (${(Buffer.byteLength(ts) / 1024).toFixed(1)} KB): land ${land.length} rings/${pts(land)} pts, ` +
    `neighbors ${neighbors.length}/${pts(neighbors)}, states ${stateLines.length}/${pts(stateLines)}, ` +
    `graticule ${graticule.length}/${pts(graticule)}, islets ${islets.length / 2}, neighbor islets ${neighborIslets.length / 2}`,
);

// ---------------------------------------------------------------- preview

const d = (rings, close) =>
  rings
    .map((r) => {
      let s = `M${r[0]} ${r[1]}`;
      for (let i = 2; i < r.length; i += 2) s += `L${r[i]} ${r[i + 1]}`;
      return close ? s + "Z" : s;
    })
    .join("");
const dots = (arr, r, fill) =>
  Array.from({ length: arr.length / 2 }, (_, i) => `<circle cx="${arr[i * 2]}" cy="${arr[i * 2 + 1]}" r="${r}" fill="${fill}"/>`).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_W} ${MAP_H}" width="1024" height="${Math.round((1024 * MAP_H) / MAP_W)}">
<rect width="${MAP_W}" height="${MAP_H}" fill="#b9d3cc"/>
<path d="${d(graticule, false)}" fill="none" stroke="rgba(70,110,140,.4)" stroke-width="10"/>
<path d="${d(tropic, false)}" fill="none" stroke="#9c3b2a" stroke-width="12" stroke-dasharray="60 40"/>
<path d="${d(neighbors, true)}" fill="#d7d6b8" fill-rule="evenodd" stroke="rgba(107,74,43,.7)" stroke-width="12"/>
${dots(neighborIslets, 22, "#8a8a6a")}
<path d="${d(land, true)}" fill="#f0c79a" fill-rule="evenodd" stroke="#6b4a2b" stroke-width="24" stroke-linejoin="round"/>
${dots(islets, 26, "#6b4a2b")}
<path d="${d(stateLines, false)}" fill="none" stroke="rgba(110,70,40,.75)" stroke-width="10" stroke-dasharray="40 24"/>
${Object.entries(anchors)
  .map(([k, [x, y]]) => `<circle cx="${x}" cy="${y}" r="30" fill="#9c3b2a"/><text x="${x + 50}" y="${y + 30}" font-size="110" fill="#3b2a1c">${k}</text>`)
  .join("")}
</svg>`;
const svgPath = join(CACHE, "india-preview.svg");
writeFileSync(svgPath, svg);
try {
  const { default: sharp } = await import("sharp");
  await sharp(Buffer.from(svg)).png().toFile(join(CACHE, "india-preview.png"));
  console.log(`preview: ${join(CACHE, "india-preview.png")}`);
} catch (err) {
  console.warn(`preview PNG skipped (${err.message}); SVG at ${svgPath}`);
}
