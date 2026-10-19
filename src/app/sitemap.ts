import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/case-studies";
import type { RoutedSpotId } from "@/lib/room-content";
import { ROOM_SECTIONS, ROUTED_SPOTS } from "@/lib/room-content";

/** Launch of the 3D room homepage and its section routes. */
const ROOM_UPDATED = "2026-10-18";

/** Last content pass over the case studies (they carry no dates of their own). */
const CASE_STUDIES_UPDATED = "2026-10-18";

const ROOM_PRIORITY: Record<RoutedSpotId, number> = {
  work: 0.9,
  about: 0.8,
  contact: 0.8,
  games: 0.6,
  cars: 0.6,
  places: 0.6,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://gowtam.ai";

  // Room sections: each panel of the 3D room is its own crawlable route
  const roomPages: MetadataRoute.Sitemap = ROUTED_SPOTS.map((spot) => ({
    url: `${baseUrl}${ROOM_SECTIONS[spot].route}`,
    lastModified: ROOM_UPDATED,
    changeFrequency: "monthly" as const,
    priority: ROOM_PRIORITY[spot],
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: ROOM_UPDATED,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...roomPages,
    {
      url: `${baseUrl}/plain`,
      lastModified: ROOM_UPDATED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: "2026-08-21",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: CASE_STUDIES_UPDATED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/xrplook`,
      lastModified: "2026-08-04",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/xrplook/privacy`,
      lastModified: "2026-08-04",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/xrplook/support`,
      lastModified: "2026-08-04",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/someday/privacy`,
      lastModified: "2026-09-02",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/someday/support`,
      lastModified: "2026-09-02",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/dead-center/privacy`,
      lastModified: "2026-09-04",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/dead-center/support`,
      lastModified: "2026-09-04",
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Dynamic case study pages
  const caseStudyPages: MetadataRoute.Sitemap = caseStudies.map((cs) => ({
    url: `${baseUrl}/case-studies/${cs.slug}`,
    lastModified: CASE_STUDIES_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...caseStudyPages];
}
