import { ImageResponse } from "next/og";
import { getCaseStudy, getAllCaseStudySlugs } from "@/lib/case-studies";

export const alt = "Case Study - Gowtam Ramanujam";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BACKGROUND = "#12100e";
const FOREGROUND = "#f5efe6";
const MUTED = "#b5aaa0";
const ACCENT = "#e08a58";
const BORDER = "rgba(245, 239, 230, 0.12)";

export async function generateStaticParams() {
  const slugs = getAllCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

function titleFontSize(title: string) {
  if (title.length <= 18) return 76;
  if (title.length <= 30) return 62;
  if (title.length <= 45) return 50;
  return 42;
}

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);

  const category = caseStudy?.category ?? "Portfolio";
  const title = caseStudy?.title ?? "Gowtam Ramanujam";

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
            {category}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            fontSize: titleFontSize(title),
            fontWeight: 600,
            letterSpacing: -1,
            color: FOREGROUND,
            lineHeight: 1.15,
          }}
        >
          {title}
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
            Gowtam Ramanujam
          </span>
          <span
            style={{
              fontSize: 20,
              letterSpacing: 2,
              color: MUTED,
            }}
          >
            gowtam.ai
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
