import { ImageResponse } from "next/og";

export const alt = "Gowtam Ramanujam - AI Architect";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BACKGROUND = "#0b0b0c";
const FOREGROUND = "#f4f4f5";
const MUTED = "#a3a3ab";
const FAINT = "#77777f";
const ACCENT = "#e8703a";
const BORDER = "#232326";

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
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: 4,
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
              fontWeight: 400,
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
              letterSpacing: 3,
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            gowtam.ai
          </span>
          <span
            style={{
              fontSize: 20,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: FAINT,
            }}
          >
            Intelligent Systems / Autonomous Agents
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
