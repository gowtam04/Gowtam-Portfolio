import { ImageResponse } from "next/og";

export const alt = "Gowtam Ramanujam - AI Architect";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BACKGROUND = "#12100e";
const FOREGROUND = "#f5efe6";
const MUTED = "#b5aaa0";
const FAINT = "#7d7369";
const ACCENT = "#e08a58";
const BORDER = "rgba(245, 239, 230, 0.12)";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BACKGROUND,
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
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
            Portfolio
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 88,
              fontWeight: 600,
              letterSpacing: -2,
              color: FOREGROUND,
              lineHeight: 1.05,
            }}
          >
            Gowtam Ramanujam
          </span>
          <span
            style={{
              marginTop: 20,
              fontSize: 34,
              fontWeight: 500,
              color: ACCENT,
            }}
          >
            AI Architect
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 24,
          }}
        >
          <span
            style={{
              fontSize: 20,
              letterSpacing: 2,
              color: MUTED,
            }}
          >
            gowtam.ai
          </span>
          <span
            style={{
              fontSize: 20,
              letterSpacing: 1,
              color: FAINT,
            }}
          >
            Intelligent systems · Autonomous agents
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
