#!/usr/bin/env node
/**
 * Builds the vintage USA wall map data for the places frame.
 *
 *   node scripts/maps/build-usa-map.mjs
 *
 * Downloads (and caches in scripts/maps/.cache/) public domain sources:
 *   - US Census state boundaries via us-atlas (TopoJSON, lon/lat)
 *   - Natural Earth countries via world-atlas (TopoJSON) for Canada, Mexico, and nearby Caribbean and Central American coasts
 *   - Natural Earth lakes (GeoJSON) for the Great Lakes and other large lakes
 *
 * Projects the lower 48 with a spherical Albers equal-area conic, fits it to the
 * normalized MAP_W x MAP_H space of `mapStyle.ts`, builds Alaska and Hawaii insets,
 * a 10 degree graticule, internal state lines (TopoJSON mesh), simplifies with
 * Douglas-Peucker, quantizes to integers, and writes
 * src/components/room/objects/maps/usaMapData.ts plus a preview PNG in the cache.
 */
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CACHE = path.join(HERE, ".cache");
const OUT = path.join(ROOT, "src/components/room/objects/maps/usaMapData.ts");
const PREVIEW_SVG = path.join(CACHE, "usa-preview.svg");
const PREVIEW_PNG = path.join(CACHE, "usa-preview.png");

const SOURCES = {
  states: "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json",
  countries: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json",
  lakes: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_lakes.geojson",
};

/* Must match mapStyle.ts */
const MAP_W = 10000;
const MAP_H = 10370;
const EARTH_KM = 6371;
const KM_PER_MILE = 1.609344;

/* ------------------------------------------------------------------ tuning */

/** Douglas-Peucker tolerances in map units (1 unit ~ 0.1 px on a 1024 canvas). */
const TOL = { usa: 9, stateLines: 11, neighbors: 20, lakes: 10, graticule: 6, alaska: 12, hawaii: 5 };
/** Minimum ring area (map units squared) to keep an island. */
const MIN_AREA = { usa: 2200, keys: 40, neighbors: 9000, lakes: 15000, alaska: 1400, hawaii: 400 };
/** Lower 48 fit: width fraction of the frame, horizontal center, and top edge. */
const FIT = { width: 0.88, centerX: 0.52, top: 0.175 };
/** Inset boxes [x, y, w, h] in map units. */
const ALASKA_BOX = [330, 7330, 3150, 2500];
const HAWAII_BOX = [3620, 8630, 1760, 1200];
/** Clip rectangle for neighbors and lakes: a little outside the canvas so clip edges never show. */
const CLIP = { x0: -120, y0: -120, x1: MAP_W + 120, y1: MAP_H + 120 };
/** Lakes kept below the area threshold. */
const LAKE_KEEP = ["Great Salt Lake", "Lake Okeechobee", "Lake Champlain", "Lake of the Woods"];
const FRAME = { x0: 0, y0: 0, x1: MAP_W, y1: MAP_H };

/* ------------------------------------------------------------------ io */

async function load(key) {
  const url = SOURCES[key];
  const file = path.join(CACHE, path.basename(new URL(url).pathname));
  if (!existsSync(file)) {
    await mkdir(CACHE, { recursive: true });
    console.log(`downloading ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(await readFile(file, "utf8"));
}

/* ------------------------------------------------------------------ topojson */

/** Delta-decodes quantized arcs. Returns { q: integer coords (for topology keys), ll: lon/lat }. */
function decodeArcs(topo) {
  const { scale, translate } = topo.transform;
  return topo.arcs.map((arc) => {
    let x = 0;
    let y = 0;
    const q = [];
    const ll = [];
    for (const [dx, dy] of arc) {
      x += dx;
      y += dy;
      q.push([x, y]);
      ll.push([x * scale[0] + translate[0], y * scale[1] + translate[1]]);
    }
    return { q, ll };
  });
}

/** Polygons of a geometry as arrays of rings, each ring an array of signed arc indices. */
function polygonsOf(geom) {
  if (geom.type === "Polygon") return [geom.arcs];
  if (geom.type === "MultiPolygon") return geom.arcs;
  return [];
}

const arcIndex = (i) => (i < 0 ? ~i : i);

/** Stitches a ring of signed arc indices into a lon/lat point list. */
function ringLonLat(ring, arcs) {
  const out = [];
  for (const i of ring) {
    const pts = arcs[arcIndex(i)].ll;
    const seq = i < 0 ? [...pts].reverse() : pts;
    for (let k = out.length ? 1 : 0; k < seq.length; k++) out.push(seq[k]);
  }
  return out;
}

/* ------------------------------------------------------------------ projection */

const RAD = Math.PI / 180;

/** Spherical Albers equal-area conic on the unit sphere, y up. */
function albers(lat1, lat2, lat0, lon0) {
  const p1 = lat1 * RAD;
  const p2 = lat2 * RAD;
  const n = (Math.sin(p1) + Math.sin(p2)) / 2;
  const C = Math.cos(p1) ** 2 + 2 * n * Math.sin(p1);
  const rho0 = Math.sqrt(C - 2 * n * Math.sin(lat0 * RAD)) / n;
  return ([lon, lat]) => {
    let dl = lon - lon0;
    while (dl > 180) dl -= 360;
    while (dl < -180) dl += 360;
    const rho = Math.sqrt(C - 2 * n * Math.sin(lat * RAD)) / n;
    const th = n * dl * RAD;
    return [rho * Math.sin(th), rho0 - rho * Math.cos(th)];
  };
}

/** Wraps a unit-sphere projection with a linear fit into map space (y down). */
function fitted(proj, s, tx, ty) {
  return (p) => {
    const [x, y] = proj(p);
    return [x * s + tx, -y * s + ty];
  };
}

function bboxOf(rings) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const r of rings)
    for (const [x, y] of r) {
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

/* ------------------------------------------------------------------ geometry */

function simplifyOpen(pts, tol) {
  if (pts.length <= 2) return pts.slice();
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
    let bestD = t2;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      let d;
      if (len2 === 0) d = (px - ax) ** 2 + (py - ay) ** 2;
      else {
        const cr = (px - ax) * dy - (py - ay) * dx;
        d = (cr * cr) / len2;
      }
      if (d > bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best > 0) {
      keep[best] = 1;
      stack.push([a, best], [best, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

/** Simplifies a closed ring (first point may or may not repeat at the end). */
function simplifyRing(pts, tol) {
  const ring = samePt(pts[0], pts[pts.length - 1]) ? pts.slice(0, -1) : pts;
  if (ring.length < 4) return ring;
  let far = 0;
  let farD = -1;
  for (let i = 1; i < ring.length; i++) {
    const d = (ring[i][0] - ring[0][0]) ** 2 + (ring[i][1] - ring[0][1]) ** 2;
    if (d > farD) {
      farD = d;
      far = i;
    }
  }
  const a = simplifyOpen(ring.slice(0, far + 1), tol);
  const b = simplifyOpen([...ring.slice(far), ring[0]], tol);
  return [...a, ...b.slice(1, -1)];
}

const samePt = (a, b) => a[0] === b[0] && a[1] === b[1];

function ringArea(r) {
  let s = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return Math.abs(s / 2);
}

/** Sutherland-Hodgman polygon clip against an axis-aligned rectangle. */
function clipRing(ring, box) {
  const edges = [
    [(p) => p[0] >= box.x0, (a, b) => lerpX(a, b, box.x0)],
    [(p) => p[0] <= box.x1, (a, b) => lerpX(a, b, box.x1)],
    [(p) => p[1] >= box.y0, (a, b) => lerpY(a, b, box.y0)],
    [(p) => p[1] <= box.y1, (a, b) => lerpY(a, b, box.y1)],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const src = out;
    out = [];
    if (!src.length) break;
    for (let i = 0; i < src.length; i++) {
      const cur = src[i];
      const prev = src[(i + src.length - 1) % src.length];
      const ci = inside(cur);
      const pi = inside(prev);
      if (ci) {
        if (!pi) out.push(cut(prev, cur));
        out.push(cur);
      } else if (pi) out.push(cut(prev, cur));
    }
  }
  return out;
}

function lerpX(a, b, x) {
  const t = (x - a[0]) / (b[0] - a[0]);
  return [x, a[1] + (b[1] - a[1]) * t];
}
function lerpY(a, b, y) {
  const t = (y - a[1]) / (b[1] - a[1]);
  return [a[0] + (b[0] - a[0]) * t, y];
}

/** Liang-Barsky clip of an open polyline; returns the pieces inside the box. */
function clipLine(pts, box) {
  const pieces = [];
  let cur = [];
  for (let i = 1; i < pts.length; i++) {
    const seg = clipSegment(pts[i - 1], pts[i], box);
    if (!seg) {
      if (cur.length > 1) pieces.push(cur);
      cur = [];
      continue;
    }
    const [a, b, cutEnd] = seg;
    if (!cur.length || !samePt(cur[cur.length - 1], a)) {
      if (cur.length > 1) pieces.push(cur);
      cur = [a];
    }
    cur.push(b);
    if (cutEnd) {
      pieces.push(cur);
      cur = [];
    }
  }
  if (cur.length > 1) pieces.push(cur);
  return pieces;
}

function clipSegment(a, b, box) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  let t0 = 0;
  let t1 = 1;
  const tests = [
    [-dx, a[0] - box.x0],
    [dx, box.x1 - a[0]],
    [-dy, a[1] - box.y0],
    [dy, box.y1 - a[1]],
  ];
  for (const [p, q] of tests) {
    if (p === 0) {
      if (q < 0) return null;
    } else {
      const r = q / p;
      if (p < 0) {
        if (r > t1) return null;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return null;
        if (r < t1) t1 = r;
      }
    }
  }
  const pa = t0 > 0 ? [a[0] + dx * t0, a[1] + dy * t0] : a;
  const pb = t1 < 1 ? [a[0] + dx * t1, a[1] + dy * t1] : b;
  return [pa, pb, t1 < 1];
}

/** Rounds to integers and drops consecutive duplicates. */
function quantize(pts, closed) {
  const out = [];
  for (const [x, y] of pts) {
    const p = [Math.round(x), Math.round(y)];
    if (!out.length || !samePt(out[out.length - 1], p)) out.push(p);
  }
  if (closed && out.length > 1 && samePt(out[0], out[out.length - 1])) out.pop();
  return out;
}

/** Joins open polylines that meet end to end, so shared vertices are stored once. */
function chainLines(lines) {
  const key = (p) => `${p[0]},${p[1]}`;
  const pool = lines.map((l) => l.slice());
  const ends = new Map();
  const add = (i) => {
    for (const p of [pool[i][0], pool[i][pool[i].length - 1]]) {
      const k = key(p);
      if (!ends.has(k)) ends.set(k, new Set());
      ends.get(k).add(i);
    }
  };
  const del = (i) => {
    for (const p of [pool[i][0], pool[i][pool[i].length - 1]]) ends.get(key(p))?.delete(i);
  };
  pool.forEach((_, i) => add(i));
  const alive = new Set(pool.map((_, i) => i));
  let merged = true;
  while (merged) {
    merged = false;
    for (const i of alive) {
      const tail = key(pool[i][pool[i].length - 1]);
      const cands = [...(ends.get(tail) ?? [])].filter((j) => j !== i);
      // only join at simple degree-2 junctions so line work stays tidy
      if (cands.length !== 1 || ends.get(tail).size !== 2) continue;
      const j = cands[0];
      del(i);
      del(j);
      const other = key(pool[j][0]) === tail ? pool[j] : [...pool[j]].reverse();
      pool[i] = [...pool[i], ...other.slice(1)];
      alive.delete(j);
      add(i);
      merged = true;
      break;
    }
  }
  return [...alive].map((i) => pool[i]);
}

const flat = (pts) => pts.flatMap((p) => p);

/* ------------------------------------------------------------------ build */

async function main() {
  const [us, world, lakesGeo] = await Promise.all([load("states"), load("countries"), load("lakes")]);

  const usArcs = decodeArcs(us);
  const states = us.objects.states.geometries;
  const TERRITORIES = new Set(["60", "66", "69", "72", "78"]);
  const lower48 = states.filter((g) => !TERRITORIES.has(g.id) && g.id !== "02" && g.id !== "15");

  /* --- projection and fit for the lower 48 */
  const projMain = albers(29.5, 45.5, 37.5, -96);
  const rawRings = lower48.flatMap((g) => polygonsOf(g).flatMap((poly) => poly.map((r) => ringLonLat(r, usArcs).map(projMain))));
  const ub = bboxOf(rawRings.map((r) => r.map(([x, y]) => [x, -y])));
  const s = (FIT.width * MAP_W) / ub.w;
  const tx = FIT.centerX * MAP_W - (ub.x0 + ub.w / 2) * s;
  const ty = FIT.top * MAP_H - ub.y0 * s;
  const P = fitted(projMain, s, tx, ty);

  /* --- arc usage: DC is folded into Maryland so it does not get its own outline */
  const group = (id) => (id === "11" ? "24" : id);
  const uses = new Map();
  for (const g of lower48)
    for (const poly of polygonsOf(g))
      for (const ring of poly)
        for (const i of ring) {
          const k = arcIndex(i);
          if (!uses.has(k)) uses.set(k, []);
          uses.get(k).push({ grp: group(g.id), sign: i < 0 ? -1 : 1 });
        }

  const projArc = new Map();
  const arcPts = (k, tol) => {
    const id = `${k}:${tol}`;
    if (!projArc.has(id)) {
      const pts = usArcs[k].ll.map(P);
      const closed = pts.length > 3 && samePt(usArcs[k].q[0], usArcs[k].q[usArcs[k].q.length - 1]);
      projArc.set(id, closed ? [...simplifyRing(pts, tol), pts[0]] : simplifyOpen(pts, tol));
    }
    return projArc.get(id);
  };

  /* --- land: stitch exterior arcs (used once) into rings, like topojson.merge */
  const qkey = (p) => `${p[0]},${p[1]}`;
  const outgoing = new Map();
  const exterior = [];
  for (const [k, list] of uses) {
    if (list.length !== 1) continue;
    const q = usArcs[k].q;
    const fwd = list[0].sign > 0;
    const e = { k, fwd, from: qkey(fwd ? q[0] : q[q.length - 1]), to: qkey(fwd ? q[q.length - 1] : q[0]), used: false };
    exterior.push(e);
    if (!outgoing.has(e.from)) outgoing.set(e.from, []);
    outgoing.get(e.from).push(e);
  }
  const landChains = [];
  for (const start of exterior) {
    if (start.used) continue;
    const chain = [];
    let e = start;
    while (e && !e.used) {
      e.used = true;
      chain.push(e);
      e = (outgoing.get(e.to) ?? []).find((x) => !x.used);
    }
    landChains.push(chain);
  }
  const ringOf = (chain, tol) => {
    const ring = [];
    for (const e of chain) {
      const pts = arcPts(e.k, tol);
      const seq = e.fwd ? pts : [...pts].reverse();
      for (let i = ring.length ? 1 : 0; i < seq.length; i++) ring.push(seq[i]);
    }
    return ring;
  };
  // Keys hint: the island chain southwest of the Florida peninsula
  const keysBox = { a: P([-82.2, 24.4]), b: P([-80.1, 25.35]) };
  const isKey = (r) => {
    const b = bboxOf([r]);
    const cx = (b.x0 + b.x1) / 2;
    const cy = (b.y0 + b.y1) / 2;
    return cx > keysBox.a[0] && cx < keysBox.b[0] && cy < keysBox.a[1] && cy > keysBox.b[1];
  };
  // the Keys are kept at a finer tolerance so the island chain still reads as a hint
  const land = landChains
    .map((c) => {
      const r = ringOf(c, TOL.usa);
      return isKey(r) ? { r: quantize(ringOf(c, 2), true), min: MIN_AREA.keys } : { r: quantize(r, true), min: MIN_AREA.usa };
    })
    .filter(({ r, min }) => r.length >= 3 && ringArea(r) >= min)
    .map(({ r }) => r);

  /* --- state lines: arcs shared by two different states */
  const stateLines = chainLines(
    [...uses]
      .filter(([, list]) => list.length === 2 && list[0].grp !== list[1].grp)
      .map(([k]) => quantize(arcPts(k, TOL.stateLines), false))
      .filter((l) => l.length >= 2),
  );

  /* --- neighbors (Natural Earth via world-atlas) */
  const wArcs = decodeArcs(world);
  const countries = world.objects.countries.geometries;
  // Canada, Mexico, and the Caribbean / Central American coasts that fall inside the frame
  const NEIGHBORS = ["124", "484", "192", "044", "320", "084", "340", "222", "388", "332", "214"];
  const neighbors = [];
  for (const id of NEIGHBORS) {
    const g = countries.find((c) => c.id === id);
    for (const poly of polygonsOf(g))
      for (const ring of poly) {
        const pts = simplifyRing(ringLonLat(ring, wArcs).map(P), TOL.neighbors);
        const clipped = quantize(clipRing(pts, CLIP), true);
        if (clipped.length >= 3 && ringArea(clipped) >= MIN_AREA.neighbors) neighbors.push(clipped);
      }
  }

  /* --- US / Canada border (Natural Earth), used to draw the boundary through the Great Lakes */
  const usaW = countries.find((c) => c.id === "840");
  const canW = countries.find((c) => c.id === "124");
  const arcSet = (g) => new Set(polygonsOf(g).flat(2).map(arcIndex));
  const canArcs = arcSet(canW);
  const intlBorder = chainLines(
    [...arcSet(usaW)]
      .filter((k) => canArcs.has(k))
      .flatMap((k) => clipLine(simplifyOpen(wArcs[k].ll.map(P), TOL.stateLines), FRAME))
      .map((l) => quantize(l, false))
      .filter((l) => l.length >= 2),
  );

  /* --- lakes */
  const lakes = [];
  for (const f of lakesGeo.features) {
    const [bx0, by0, bx1, by1] = f.bbox ?? [0, 0, 0, 0];
    if (bx1 < -135 || bx0 > -55 || by1 < 15 || by0 > 62) continue;
    const name = f.properties.name ?? "";
    // natural lakes only (no reservoirs), plus a few classic small ones
    const named = LAKE_KEEP.includes(name);
    if (!named && (f.properties.featurecla !== "Lake" || /R[eé]s|Reservoir/.test(name))) continue;
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) {
      const outer = poly[0];
      const pts = simplifyRing(outer.map(P), TOL.lakes);
      const clipped = quantize(clipRing(pts, CLIP), true);
      if (clipped.length >= 3 && ringArea(clipped) >= (named ? 3000 : MIN_AREA.lakes)) lakes.push(clipped);
    }
  }

  /* --- graticule, every 10 degrees */
  const graticule = [];
  for (let lon = -180; lon <= -40; lon += 10) {
    const pts = [];
    for (let lat = 10; lat <= 80; lat += 0.5) pts.push(P([lon, lat]));
    graticule.push(...clipLine(simplifyOpen(pts, TOL.graticule), FRAME));
  }
  for (let lat = 10; lat <= 70; lat += 10) {
    const pts = [];
    for (let lon = -180; lon <= -30; lon += 0.5) pts.push(P([lon, lat]));
    graticule.push(...clipLine(simplifyOpen(pts, TOL.graticule), FRAME));
  }
  const grat = graticule.map((l) => quantize(l, false)).filter((l) => l.length >= 2);

  /* --- insets */
  const insetOf = ({ id, projFn, box, tol, minArea, keepRing, neighborIds, label }) => {
    const g = states.find((x) => x.id === id);
    const all = polygonsOf(g)
      .flatMap((poly) => poly.map((r) => ringLonLat(r, usArcs)))
      .filter(keepRing)
      .map((r) => r.map(projFn));
    const pad = 0.07;
    const fitK = (rs) => {
      const bb = bboxOf(rs.map((r) => r.map(([x, y]) => [x, -y])));
      return { b: bb, k: Math.min((box[2] * (1 - 2 * pad)) / bb.w, (box[3] * (1 - 2 * pad)) / bb.h) };
    };
    // fit twice: islands too small to survive the first fit do not stretch the box
    const k0 = fitK(all).k;
    const rings = all.filter((r) => ringArea(r) * k0 * k0 >= minArea);
    const { b, k } = fitK(rings);
    const ox = box[0] + box[2] / 2 - (b.x0 + b.w / 2) * k;
    const oy = box[1] + box[3] / 2 - (b.y0 + b.h / 2) * k;
    const f = ([x, y]) => [x * k + ox, -y * k + oy];
    const out = rings
      .map((r) => quantize(simplifyRing(r.map(f), tol), true))
      .filter((r) => r.length >= 3 && ringArea(r) >= minArea);
    const boxRect = { x0: box[0], y0: box[1], x1: box[0] + box[2], y1: box[1] + box[3] };
    const nb = [];
    for (const nid of neighborIds) {
      for (const poly of polygonsOf(countries.find((c) => c.id === nid)))
        for (const ring of poly) {
          const pts = simplifyRing(ringLonLat(ring, wArcs).map((p) => f(projFn(p))), TOL.neighbors);
          const clipped = quantize(clipRing(pts, boxRect), true);
          if (clipped.length >= 3 && ringArea(clipped) >= MIN_AREA.neighbors) nb.push(clipped);
        }
    }
    return { land: out, neighbors: nb, label: f(projFn(label)).map(Math.round), scale: k };
  };
  const alaska = insetOf({
    id: "02",
    projFn: albers(55, 65, 50, -154),
    box: ALASKA_BOX,
    tol: TOL.alaska,
    minArea: MIN_AREA.alaska,
    keepRing: () => true,
    neighborIds: ["124"],
    label: [-151.2, 64.4],
  });
  // Hawaii: the eight main islands only (the northwestern chain is too small to read)
  const hawaii = insetOf({
    id: "15",
    projFn: albers(8, 18, 3, -157),
    box: HAWAII_BOX,
    tol: TOL.hawaii,
    minArea: MIN_AREA.hawaii,
    keepRing: (r) => r.every(([lon]) => lon > -160.6),
    neighborIds: [],
    label: [-158.4, 19.0],
  });

  /* --- label anchors (geographic points projected into map space) */
  const anchor = (lon, lat) => P([lon, lat]).map(Math.round);
  const anchors = {
    pacific: anchor(-120.2, 27.6),
    atlantic: anchor(-75.8, 30.8),
    gulf: anchor(-90.5, 25.9),
    canada: anchor(-108.3, 52.6),
    mexico: anchor(-102.3, 24.0),
  };

  /* --- scale: Albers is true to scale along the standard parallels */
  const milesPerUnit = EARTH_KM / s / KM_PER_MILE;

  /* --- write data module */
  const ringsTs = (name, rings) => `  ${name}: [\n${rings.map((r) => `    [${flat(r).join(",")}],`).join("\n")}\n  ],`;
  const nested = (rings) => (rings.length ? `[\n${rings.map((r) => `        [${flat(r).join(",")}],`).join("\n")}\n      ]` : "[]");
  const insetTs = (name, box, data) =>
    `    {\n      name: "${name}",\n      box: [${box.join(", ")}],\n      label: [${data.label.join(", ")}],\n      land: ${nested(data.land)},\n      neighbors: ${nested(data.neighbors)},\n    },`;
  const ts = `/**
 * USA wall map geometry, pre-projected and quantized to the normalized
 * MAP_W x MAP_H space of ./mapStyle.
 *
 * Sources:
 *   ${SOURCES.states}
 *   ${SOURCES.countries}
 *   ${SOURCES.lakes}
 * Public domain: US Census via us-atlas, Natural Earth.
 *
 * Lower 48: spherical Albers equal-area conic, standard parallels 29.5N / 45.5N,
 * origin 37.5N 96W. Alaska inset: parallels 55N / 65N, origin 50N 154W.
 * Hawaii inset: parallels 8N / 18N, origin 3N 157W.
 *
 * Generated by scripts/maps/build-usa-map.mjs; do not edit.
 */
import type { MapLayers, Rings } from "./mapStyle";

export interface MapInset {
  name: string;
  /** Inset frame [x, y, w, h] in map units. */
  box: [number, number, number, number];
  /** Where the inset's name label is centered [x, y]. */
  label: [number, number];
  land: Rings;
  /** Neighboring land inside the inset box (closed rings). */
  neighbors: Rings;
}

export interface UsaMapData extends MapLayers {
  /** US / Canada boundary (open polylines), shown where it crosses the lakes. */
  intlBorder: Rings;
  insets: MapInset[];
  /** Label anchor points [x, y] in map units. */
  anchors: Record<"pacific" | "atlantic" | "gulf" | "canada" | "mexico", [number, number]>;
  /** Statute miles per map unit on the main map (true along the standard parallels). */
  milesPerUnit: number;
}

export const USA_MAP: UsaMapData = {
${ringsTs("land", land)}
${ringsTs("neighbors", neighbors)}
${ringsTs("lakes", lakes)}
${ringsTs("stateLines", stateLines)}
${ringsTs("graticule", grat)}
${ringsTs("intlBorder", intlBorder)}
  insets: [
${insetTs("ALASKA", ALASKA_BOX, alaska)}
${insetTs("HAWAII", HAWAII_BOX, hawaii)}
  ],
  anchors: {
${Object.entries(anchors)
  .map(([k, v]) => `    ${k}: [${v.join(", ")}],`)
  .join("\n")}
  },
  milesPerUnit: ${milesPerUnit.toFixed(5)},
};
`;
  await writeFile(OUT, ts);
  const size = (await stat(OUT)).size;
  const pts = (rs) => rs.reduce((a, r) => a + r.length, 0);
  console.log(
    `wrote ${path.relative(ROOT, OUT)}: ${(size / 1024).toFixed(1)} KB`,
    `\n  land ${land.length} rings / ${pts(land)} pts, neighbors ${neighbors.length} / ${pts(neighbors)}, lakes ${lakes.length} / ${pts(lakes)}`,
    `\n  stateLines ${stateLines.length} / ${pts(stateLines)}, graticule ${grat.length} / ${pts(grat)}, intl ${intlBorder.length} / ${pts(intlBorder)}`,
    `\n  alaska ${alaska.land.length} / ${pts(alaska.land)} (x${alaska.scale.toFixed(0)}), hawaii ${hawaii.land.length} / ${pts(hawaii.land)} (x${hawaii.scale.toFixed(0)})`,
    `\n  fit: scale ${s.toFixed(1)} units per earth radius, tx ${tx.toFixed(1)}, ty ${ty.toFixed(1)}, lower 48 bbox ${ub.w.toFixed(4)} x ${ub.h.toFixed(4)} rad, ${milesPerUnit.toFixed(4)} mi/unit`,
  );

  /* --- preview */
  const d = (rings, closed = true) => rings.map((r) => `M${flat(r).join(" ")}${closed ? "Z" : ""}`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_W} ${MAP_H}" width="1024" height="${Math.round((1024 * MAP_H) / MAP_W)}">
<rect width="${MAP_W}" height="${MAP_H}" fill="#b9d3cc"/>
<path d="${d(grat, false)}" fill="none" stroke="#46708c" stroke-opacity=".35" stroke-width="10"/>
<path d="${d(neighbors)}" fill="#d7d6b8" fill-rule="evenodd" stroke="#6b4a2b" stroke-opacity=".55" stroke-width="10"/>
<path d="${d(land)}" fill="#f1d9a0" fill-rule="evenodd" stroke="#6b4a2b" stroke-width="18"/>
<path d="${d(lakes)}" fill="#b9d3cc" stroke="#6b4a2b" stroke-width="10"/>
<path d="${d(intlBorder, false)}" fill="none" stroke="#9c3b2a" stroke-width="10" stroke-dasharray="40 30"/>
<path d="${d(stateLines, false)}" fill="none" stroke="#6e4628" stroke-opacity=".7" stroke-width="9"/>
${[
  [ALASKA_BOX, alaska],
  [HAWAII_BOX, hawaii],
]
  .map(
    ([b, data]) =>
      `<rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" fill="#b9d3cc" stroke="#3b2a1c" stroke-width="20"/><path d="${d(data.neighbors)}" fill="#d7d6b8" stroke="#6b4a2b" stroke-opacity=".55" stroke-width="10"/><path d="${d(data.land)}" fill="#f1d9a0" stroke="#6b4a2b" stroke-width="12"/><circle cx="${data.label[0]}" cy="${data.label[1]}" r="45" fill="#9c3b2a"/>`,
  )
  .join("\n")}
${Object.values(anchors)
  .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="45" fill="#9c3b2a"/>`)
  .join("")}
</svg>`;
  await writeFile(PREVIEW_SVG, svg);
  try {
    const { default: sharp } = await import("sharp");
    await sharp(Buffer.from(svg)).png().toFile(PREVIEW_PNG);
    console.log(`preview: ${path.relative(ROOT, PREVIEW_PNG)}`);
  } catch (err) {
    console.warn(`preview PNG skipped (${err.message}); SVG at ${path.relative(ROOT, PREVIEW_SVG)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
