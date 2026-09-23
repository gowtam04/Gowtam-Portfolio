import { ImageResponse } from "next/og";

/**
 * Shared `next/og` rendering for the app share images (XRPLook, Someday,
 * DEAD CENTER). Style matches `src/app/opengraph-image.tsx` and
 * `src/app/case-studies/[slug]/opengraph-image.tsx`: a dark card, a cyan
 * kicker, a large title, and a footer byline. Each app's route file is a
 * thin wrapper that supplies its own kicker/title/description.
 */

export const appOgImageSize = { width: 1200, height: 630 };
export const appOgImageContentType = "image/png";

const BACKGROUND = "#0b1218";
const FOREGROUND = "#e8eef3";
const MUTED = "#8b9aab";
const ACCENT = "#3db8d4";
const BORDER = "rgba(232, 238, 243, 0.12)";

function descriptionFontSize(description: string): number {
  if (description.length <= 60) return 32;
  if (description.length <= 100) return 28;
  return 24;
}

interface AppOgImageProps {
  kicker: string;
  title: string;
  description: string;
  byline?: string;
}

export function renderAppOgImage({
  kicker,
  title,
  description,
  byline = "Gowtam Ramanujam",
}: AppOgImageProps) {
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
              color: ACCENT,
            }}
          >
            {kicker}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: -2,
              color: FOREGROUND,
              lineHeight: 1.05,
            }}
          >
            {title}
          </span>
          <span
            style={{
              marginTop: 22,
              fontSize: descriptionFontSize(description),
              lineHeight: 1.5,
              color: MUTED,
              maxWidth: 920,
            }}
          >
            {description}
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
              fontWeight: 500,
              letterSpacing: 1,
              color: FOREGROUND,
            }}
          >
            {byline}
          </span>
          <span style={{ fontSize: 20, letterSpacing: 2, color: MUTED }}>
            gowtam.ai
          </span>
        </div>
      </div>
    ),
    appOgImageSize,
  );
}
