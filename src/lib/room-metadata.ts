import type { Metadata } from "next";
import type { RoutedSpotId } from "@/lib/room-content";
import { ROOM_INTRO, ROOM_SECTIONS } from "@/lib/room-content";
import { OG_SITE_NAME, ROOT_OG_IMAGE, pageMetadata } from "@/lib/page-metadata";

export { OG_SITE_NAME, ROOT_OG_IMAGE };

/**
 * Per-route metadata for the room routes (`null` = homepage).
 * Titles in `room-content.ts` already include the site name, and the root
 * layout's title is a plain string (no template), so they are used as is.
 */
export function roomMetadata(spot: RoutedSpotId | null): Metadata {
  const meta = spot ? ROOM_SECTIONS[spot].meta : ROOM_INTRO.meta;
  const path = spot ? ROOM_SECTIONS[spot].route : "/";

  return pageMetadata({
    title: meta.title,
    description: meta.description,
    path,
  });
}
