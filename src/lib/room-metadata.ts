import type { Metadata } from "next";
import type { RoutedSpotId } from "@/lib/room-content";
import { ROOM_INTRO, ROOM_SECTIONS } from "@/lib/room-content";

/**
 * STUB (Phase 0). Owner: SEO agent.
 * Per-route metadata for the room routes (`null` = homepage).
 */
export function roomMetadata(spot: RoutedSpotId | null): Metadata {
  const meta = spot ? ROOM_SECTIONS[spot].meta : ROOM_INTRO.meta;
  const url = spot ? ROOM_SECTIONS[spot].route : "/";
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    openGraph: { title: meta.title, description: meta.description, url, images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
  };
}
