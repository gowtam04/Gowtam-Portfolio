import type { Metadata } from "next";
import type { RoutedSpotId } from "@/lib/room-content";
import { ROOM_INTRO, ROOM_SECTIONS } from "@/lib/room-content";
import { SITE_NAME, SITE_ROLE, SITE_URL } from "@/lib/site-content";

/** Open Graph site name shared by every page on the site. */
export const OG_SITE_NAME = `${SITE_NAME} Portfolio`;

/**
 * The root `src/app/opengraph-image.tsx`. A child `openGraph` object replaces
 * the inherited one (including the file-based image), so room routes list it
 * explicitly. Keep `alt` in sync with that file's `alt` export.
 */
export const ROOT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME}, ${SITE_ROLE}: step into the room`,
  type: "image/png",
} as const;

/**
 * Per-route metadata for the room routes (`null` = homepage).
 * Titles in `room-content.ts` already include the site name, and the root
 * layout's title is a plain string (no template), so they are used as is.
 */
export function roomMetadata(spot: RoutedSpotId | null): Metadata {
  const meta = spot ? ROOM_SECTIONS[spot].meta : ROOM_INTRO.meta;
  const path = spot ? ROOM_SECTIONS[spot].route : "/";
  const url = spot ? `${SITE_URL}${path}` : SITE_URL;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: path },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      type: "website",
      siteName: OG_SITE_NAME,
      locale: "en_US",
      images: [ROOT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [{ url: ROOT_OG_IMAGE.url, alt: ROOT_OG_IMAGE.alt }],
    },
  };
}
