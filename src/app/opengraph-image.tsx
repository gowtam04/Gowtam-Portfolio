import { ImageResponse } from "next/og";

// Keep in sync with ROOT_OG_IMAGE.alt in src/lib/page-metadata.ts.
export const alt = "Gowtam Ramanujam, AI Architect: step into the room";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BACKGROUND = "#0b1218";
const FOREGROUND = "#e8eef3";
const MUTED = "#8b9aab";
const FAINT = "#5c6b7a";
const ACCENT = "#3db8d4";

/* ------------------------------------------------------------ isometric room */

const SVG_W = 660;
const SVG_H = 630;
const SCALE = 30;
const ORIGIN_X = 330;
const ORIGIN_Y = 232;
const COS30 = Math.cos(Math.PI / 6);

type Vec3 = readonly [number, number, number];

/** Room units (x along the back wall, y up, z along the left wall) to SVG pixels. */
function iso(x: number, y: number, z: number): [number, number] {
  return [
    ORIGIN_X + (x - z) * COS30 * SCALE,
    ORIGIN_Y + (x + z) * 0.5 * SCALE - y * SCALE,
  ];
}

function pts(...points: Vec3[]): string {
  return points
    .map(([x, y, z]) => iso(x, y, z).map((n) => n.toFixed(1)).join(","))
    .join(" ");
}

interface BoxColors {
  top: string;
  front: string;
  side: string;
}

/**
 * A box from (x0,y0,z0) to (x1,y1,z1): top, +z face, +x face.
 * Called as a function: Satori does not expand components inside <svg>.
 */
function box(from: Vec3, to: Vec3, colors: BoxColors) {
  const [x0, y0, z0] = from;
  const [x1, y1, z1] = to;
  return (
    <g>
      <polygon points={pts([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1])} fill={colors.front} />
      <polygon points={pts([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0])} fill={colors.side} />
      <polygon points={pts([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1])} fill={colors.top} />
    </g>
  );
}

/** An ellipse lying flat on the floor, as a polygon. */
function floorEllipse(cx: number, cz: number, rx: number, rz: number, y = 0): string {
  const out: Vec3[] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    out.push([cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz]);
  }
  return pts(...out);
}

/** The room illustration (called as a function, see `box`). */
function room() {
  const [moonX, moonY] = iso(0, 4.35, 4.1);
  const [dogX, dogY] = iso(6.9, 0, 6.9);
  const [lampX, lampY] = iso(8.7, 3.6, 0.7);
  const [screenX, screenY] = iso(7.35, 3.3, 0.5);
  const [tvX, tvY] = iso(0.45, 2.8, 7.75);

  const lightsBack = Array.from({ length: 12 }, (_, i) => iso(0.6 + i * 0.8, 5.55, 0.05));
  const lightsLeft = Array.from({ length: 12 }, (_, i) => iso(0.05, 5.55, 0.6 + i * 0.8));
  const stars: [number, number, number][] = [
    [5.4, 4.7, 1.2],
    [4.9, 3.8, 0.9],
    [3.4, 4.8, 1.1],
    [5.7, 3.4, 0.8],
    [3.2, 3.6, 0.9],
  ];

  return (
    <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
      <defs>
        <radialGradient id="cyanGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3db8d4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3db8d4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="warmGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffc98a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffc98a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tvGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8fb0ff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#8fb0ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bulb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe2b0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffcf8a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e1a33" />
          <stop offset="100%" stopColor="#26395e" />
        </linearGradient>
      </defs>

      {/* Floor slab edges */}
      <polygon points={pts([0, -0.45, 10], [10, -0.45, 10], [10, 0, 10], [0, 0, 10])} fill="#4a3428" />
      <polygon points={pts([10, -0.45, 0], [10, -0.45, 10], [10, 0, 10], [10, 0, 0])} fill="#3a281f" />

      {/* Walls */}
      <polygon points={pts([0, 0, 0], [10, 0, 0], [10, 6, 0], [0, 6, 0])} fill="#e6d7bf" />
      <polygon points={pts([0, 0, 0], [0, 0, 10], [0, 6, 10], [0, 6, 0])} fill="#c9b99f" />
      {/* Wainscot */}
      <polygon points={pts([0, 0, 0], [10, 0, 0], [10, 2, 0], [0, 2, 0])} fill="#7f9d8c" />
      <polygon points={pts([0, 0, 0], [0, 0, 10], [0, 2, 10], [0, 2, 0])} fill="#6a8676" />
      <polygon points={pts([0, 2, 0], [10, 2, 0], [10, 2.15, 0], [0, 2.15, 0])} fill="#f6efe3" />
      <polygon points={pts([0, 2, 0], [0, 2, 10], [0, 2.15, 10], [0, 2.15, 0])} fill="#ddd3c3" />
      {/* Wall caps and cut edges */}
      <polygon points={pts([-0.3, 6, -0.3], [10, 6, -0.3], [10, 6, 0], [0, 6, 0], [0, 6, 10], [-0.3, 6, 10])} fill="#3e2c23" />
      <polygon points={pts([10, 0, -0.3], [10, 0, 0], [10, 6, 0], [10, 6, -0.3])} fill="#2e211a" />
      <polygon points={pts([-0.3, 0, 10], [0, 0, 10], [0, 6, 10], [-0.3, 6, 10])} fill="#3e2c23" />

      {/* Window with night sky and moon (left wall) */}
      <polygon points={pts([0, 2.45, 2.85], [0, 2.45, 6.15], [0, 5.15, 6.15], [0, 5.15, 2.85])} fill="#f6efe3" />
      <polygon points={pts([0, 2.6, 3], [0, 2.6, 6], [0, 5, 6], [0, 5, 3])} fill="url(#sky)" />
      {stars.map(([z, y, r]) => {
        const [sx, sy] = iso(0, y, z);
        return <circle key={`${z}-${y}`} cx={sx} cy={sy} r={r} fill="#f3ede2" />;
      })}
      <circle cx={moonX} cy={moonY} r={15} fill="#f3ede2" />
      <circle cx={moonX + 6} cy={moonY - 4} r={13} fill="#1a2a4a" />
      <polygon points={pts([0, 2.6, 3], [0, 3.3, 3], [0, 3.5, 3.8], [0, 3.1, 4.4], [0, 3.4, 5.2], [0, 3.0, 6], [0, 2.6, 6])} fill="#0b1426" />
      <polygon points={pts([0, 3.8, 3], [0, 3.8, 6], [0, 3.88, 6], [0, 3.88, 3])} fill="#f6efe3" />
      <polygon points={pts([0, 2.6, 4.46], [0, 5, 4.46], [0, 5, 4.54], [0, 2.6, 4.54])} fill="#f6efe3" />

      {/* Corkboard (back wall) */}
      <polygon points={pts([1, 3, 0], [4.2, 3, 0], [4.2, 4.9, 0], [1, 4.9, 0])} fill="#7a5236" />
      <polygon points={pts([1.12, 3.12, 0], [4.08, 3.12, 0], [4.08, 4.78, 0], [1.12, 4.78, 0])} fill="#c0935f" />
      <polygon points={pts([1.4, 3.9, 0], [2.2, 3.9, 0], [2.2, 4.55, 0], [1.4, 4.55, 0])} fill="#f3ede2" />
      <polygon points={pts([2.5, 3.3, 0], [3.2, 3.3, 0], [3.2, 3.95, 0], [2.5, 3.95, 0])} fill="#d8a25e" />
      <polygon points={pts([3.35, 3.95, 0], [3.9, 3.95, 0], [3.9, 4.55, 0], [3.35, 4.55, 0])} fill="#e8704f" />
      <polygon points={pts([1.5, 3.3, 0], [2.1, 3.3, 0], [2.1, 3.7, 0], [1.5, 3.7, 0])} fill="#3db8d4" />

      {/* Clock */}
      <polygon points={pts([4.8, 4.35, 0], [5.4, 4.35, 0], [5.4, 4.95, 0], [4.8, 4.95, 0])} fill="#f3ede2" />

      {/* Shelf over the desk */}
      {box([5.8, 4.5, 0], [9, 4.62, 0.7], { top: "#a87650", front: "#6f4630", side: "#5e3b28" })}
      {box([6.1, 4.62, 0.1], [6.35, 5.2, 0.55], { top: "#e8704f", front: "#c4583b", side: "#a64a31" })}
      {box([6.4, 4.62, 0.1], [6.62, 5.1, 0.55], { top: "#24324d", front: "#1c2840", side: "#162033" })}
      {box([6.67, 4.62, 0.1], [6.9, 5.25, 0.55], { top: "#d8a25e", front: "#b8864a", side: "#9b703d" })}
      {box([8.2, 4.62, 0.2], [8.5, 4.95, 0.5], { top: "#c9a15a", front: "#a8843f", side: "#8f7035" })}

      {/* String lights */}
      {[...lightsBack, ...lightsLeft].map(([lx, ly], i) => (
        <g key={i}>
          <circle cx={lx} cy={ly} r={9} fill="url(#bulb)" />
          <circle cx={lx} cy={ly} r={2.4} fill="#ffe7bf" />
        </g>
      ))}

      {/* Floor */}
      <polygon points={pts([0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10])} fill="#b48558" />
      {[1.25, 2.5, 3.75, 5, 6.25, 7.5, 8.75].map((z) => (
        <polygon key={z} points={pts([0, 0.001, z], [10, 0.001, z], [10, 0.001, z + 0.04], [0, 0.001, z + 0.04])} fill="#9c7049" />
      ))}

      {/* Light pools */}
      <polygon points={floorEllipse(7.4, 2.8, 3.4, 2.6)} fill="url(#warmGlow)" />
      <polygon points={floorEllipse(2.2, 7.8, 2.6, 2.4)} fill="url(#tvGlow)" />

      {/* Rug */}
      <polygon points={floorEllipse(5.6, 6.2, 3, 2.3, 0.02)} fill="#e8704f" />
      <polygon points={floorEllipse(5.6, 6.2, 2.75, 2.08, 0.03)} fill="#24324d" />
      <polygon points={floorEllipse(5.6, 6.2, 1.9, 1.4, 0.04)} fill="#2d3e5e" />

      {/* Snake plant, back-left corner */}
      {box([0.5, 0, 0.5], [1.3, 0.9, 1.3], { top: "#2b1f18", front: "#e8704f", side: "#c4583b" })}
      {(() => {
        const [px, py] = iso(0.9, 0.9, 0.9);
        return (
          <g>
            <polygon points={`${px - 10},${py} ${px - 14},${py - 62} ${px - 4},${py}`} fill="#3f7a52" />
            <polygon points={`${px - 3},${py} ${px + 1},${py - 80} ${px + 6},${py}`} fill="#4d8f60" />
            <polygon points={`${px + 5},${py} ${px + 14},${py - 56} ${px + 11},${py}`} fill="#3f7a52" />
          </g>
        );
      })()}

      {/* Desk set (back wall) */}
      <polygon points={floorEllipse(7.5, 1.2, 2.1, 1.1, 0.01)} fill="#000000" fillOpacity={0.18} />
      {box([5.6, 0, 0.2], [5.85, 2.3, 0.45], { top: "#5e3b28", front: "#5e3b28", side: "#4a2f20" })}
      {box([9.05, 0, 0.2], [9.3, 2.3, 0.45], { top: "#5e3b28", front: "#5e3b28", side: "#4a2f20" })}
      {box([5.6, 0, 1.9], [5.85, 2.3, 2.15], { top: "#5e3b28", front: "#6f4630", side: "#4a2f20" })}
      {box([9.05, 0, 1.9], [9.3, 2.3, 2.15], { top: "#5e3b28", front: "#6f4630", side: "#4a2f20" })}
      {box([5.5, 2.3, 0], [9.4, 2.55, 2.3], { top: "#a87650", front: "#7a4d33", side: "#6a4330" })}
      <circle cx={screenX} cy={screenY} r={90} fill="url(#cyanGlow)" />
      {box([7.2, 2.55, 0.35], [7.5, 2.95, 0.6], { top: "#2a303d", front: "#1a1f2a", side: "#141821" })}
      {box([6.3, 2.95, 0.3], [8.4, 4.1, 0.48], { top: "#2a303d", front: "#1a1f2a", side: "#141821" })}
      <polygon points={pts([6.4, 3.03, 0.49], [8.3, 3.03, 0.49], [8.3, 4.02, 0.49], [6.4, 4.02, 0.49])} fill="#3db8d4" />
      {[3.85, 3.7, 3.55, 3.4, 3.25].map((y, i) => (
        <polygon
          key={y}
          points={pts([6.55 + (i % 2) * 0.2, y, 0.5], [7.4 + ((i * 3) % 4) * 0.2, y, 0.5], [7.4 + ((i * 3) % 4) * 0.2, y + 0.06, 0.5], [6.55 + (i % 2) * 0.2, y + 0.06, 0.5])}
          fill="#d9f7ff"
          fillOpacity={0.75}
        />
      ))}
      {box([6.6, 2.55, 1.1], [8, 2.62, 1.55], { top: "#2a303d", front: "#1a1f2a", side: "#141821" })}
      {/* Desk lamp */}
      <circle cx={lampX} cy={lampY + 20} r={70} fill="url(#warmGlow)" />
      {box([8.6, 2.55, 0.5], [8.95, 2.62, 0.85], { top: "#2a303d", front: "#1a1f2a", side: "#141821" })}
      {box([8.74, 2.62, 0.64], [8.8, 3.45, 0.7], { top: "#2a303d", front: "#2a303d", side: "#1a1f2a" })}
      {box([8.5, 3.35, 0.45], [9.05, 3.7, 0.95], { top: "#e8704f", front: "#c4583b", side: "#a64a31" })}
      <circle cx={lampX} cy={lampY + 18} r={5} fill="#fff1d6" />
      {/* Mug */}
      {box([9, 2.55, 1.5], [9.25, 2.85, 1.75], { top: "#3e2c23", front: "#f3ede2", side: "#ddd3c3" })}

      {/* Games corner (left wall): stand, console, TV */}
      <circle cx={tvX + 30} cy={tvY + 10} r={100} fill="url(#tvGlow)" />
      {box([0, 0, 6.2], [1.3, 1.3, 9.3], { top: "#a87650", front: "#6f4630", side: "#7a4d33" })}
      {box([0.3, 1.3, 7.1], [1.05, 1.5, 8.2], { top: "#f3ede2", front: "#ddd3c3", side: "#cfc5b5" })}
      {box([0.05, 1.8, 6.4], [0.4, 3.75, 9.1], { top: "#2a303d", front: "#1a1f2a", side: "#1a1f2a" })}
      <polygon points={pts([0.41, 1.92, 6.52], [0.41, 1.92, 8.98], [0.41, 3.63, 8.98], [0.41, 3.63, 6.52])} fill="#6f8fe0" />
      <polygon points={pts([0.42, 2.2, 6.8], [0.42, 2.2, 7.9], [0.42, 2.5, 7.9], [0.42, 2.5, 6.8])} fill="#d8a25e" />
      <polygon points={pts([0.42, 2.9, 7.5], [0.42, 2.9, 8.1], [0.42, 3.4, 8.1], [0.42, 3.4, 7.5])} fill="#e8704f" />
      {/* Bean bag */}
      <polygon points={floorEllipse(2.6, 7.6, 1.05, 0.95, 0.02)} fill="#000000" fillOpacity={0.2} />
      {(() => {
        const [bx, by] = iso(2.6, 0.55, 7.6);
        return <ellipse cx={bx} cy={by} rx={34} ry={22} fill="#d8a25e" />;
      })()}

      {/* Teeko asleep in his bed */}
      <g transform={`translate(${dogX} ${dogY}) scale(1.4) translate(${-dogX} ${-dogY})`}>
      <ellipse cx={dogX} cy={dogY} rx={36} ry={17} fill="#b5543f" />
      <ellipse cx={dogX} cy={dogY - 3} rx={28} ry={11} fill="#e9d8bf" />
      <path d={`M ${dogX - 18} ${dogY - 8} Q ${dogX - 30} ${dogY - 22} ${dogX - 16} ${dogY - 20}`} stroke="#1d1b22" strokeWidth={4} fill="none" strokeLinecap="round" />
      <ellipse cx={dogX - 2} cy={dogY - 10} rx={19} ry={10} fill="#1d1b22" />
      <ellipse cx={dogX - 6} cy={dogY - 14} rx={10} ry={4} fill="#2e2a33" />
      <polygon points={`${dogX + 8},${dogY - 18} ${dogX + 5},${dogY - 36} ${dogX + 15},${dogY - 21}`} fill="#1d1b22" />
      <polygon points={`${dogX + 17},${dogY - 21} ${dogX + 25},${dogY - 37} ${dogX + 25},${dogY - 17}`} fill="#1d1b22" />
      <polygon points={`${dogX + 8.5},${dogY - 21} ${dogX + 7},${dogY - 31} ${dogX + 12.5},${dogY - 22}`} fill="#5a4446" />
      <circle cx={dogX + 15} cy={dogY - 13} r={9} fill="#1d1b22" />
      <ellipse cx={dogX + 23} cy={dogY - 10} rx={6} ry={4} fill="#4a3f3b" />
      <circle cx={dogX + 28} cy={dogY - 10.5} r={1.8} fill="#0b0a0d" />
      <path d={`M ${dogX + 12} ${dogY - 14} Q ${dogX + 15} ${dogY - 12} ${dogX + 18} ${dogY - 14}`} stroke="#6a6070" strokeWidth={1.4} fill="none" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------ image */

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: BACKGROUND,
          backgroundImage:
            "radial-gradient(circle at 78% 52%, rgba(61, 184, 212, 0.16) 0%, rgba(11, 18, 24, 0) 55%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 560,
            height: "100%",
            padding: "72px 0 72px 80px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 28,
                height: 4,
                backgroundColor: ACCENT,
                marginRight: 16,
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: FAINT,
              }}
            >
              Gowtam&apos;s room
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 80,
                fontWeight: 700,
                letterSpacing: -2,
                color: FOREGROUND,
                lineHeight: 1.02,
              }}
            >
              Gowtam
            </span>
            <span
              style={{
                fontSize: 80,
                fontWeight: 700,
                letterSpacing: -2,
                color: FOREGROUND,
                lineHeight: 1.02,
              }}
            >
              Ramanujam
            </span>
            <span
              style={{
                marginTop: 18,
                fontSize: 36,
                fontWeight: 600,
                color: ACCENT,
              }}
            >
              AI Architect
            </span>
            <span
              style={{
                marginTop: 18,
                fontSize: 24,
                lineHeight: 1.4,
                color: MUTED,
                maxWidth: 440,
              }}
            >
              A cozy 3D room: the desk, the console, the window, and Teeko.
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: ACCENT,
                color: BACKGROUND,
                fontSize: 24,
                fontWeight: 700,
                padding: "12px 26px",
                borderRadius: 999,
              }}
            >
              Step into the room
            </div>
            <span
              style={{
                marginLeft: 22,
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: 1,
                color: MUTED,
              }}
            >
              gowtam.ai
            </span>
          </div>
        </div>

        <div style={{ display: "flex", position: "absolute", left: 540, top: 0 }}>
          {room()}
        </div>
      </div>
    ),
    { ...size },
  );
}
