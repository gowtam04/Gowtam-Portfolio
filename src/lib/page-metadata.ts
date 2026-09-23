import type { Metadata } from "next";
import { SITE_NAME, SITE_ROLE, SITE_URL } from "@/lib/site-content";

/** Open Graph site name shared by every page on the site. */
export const OG_SITE_NAME = `${SITE_NAME} Portfolio`;

export interface PageImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  type?: string;
}

/**
 * The root `src/app/opengraph-image.tsx`. A child `openGraph` object replaces
 * the inherited one (including the file-based image), so every page that
 * wants it lists it explicitly through `pageMetadata`. Keep `alt` in sync
 * with that file's `alt` export.
 */
export const ROOT_OG_IMAGE: PageImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME}, ${SITE_ROLE}: step into the room`,
  type: "image/png",
};

export interface PageMetadataOptions {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/" or "/case-studies". */
  path: string;
  type?: "website" | "article";
  images?: PageImage[];
}

/**
 * One metadata helper for every classic (non-room) page: title, description,
 * a canonical alternate, and a full `openGraph` / `twitter` pair so social
 * previews never fall back to the root layout's homepage values.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  images,
}: PageMetadataOptions): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const ogImages = images ?? [ROOT_OG_IMAGE];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: OG_SITE_NAME,
      locale: "en_US",
      type,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => ({ url: img.url, alt: img.alt })),
    },
  };
}
