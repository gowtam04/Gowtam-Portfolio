import { MetadataRoute } from "next";
import { caseStudies } from "@/lib/case-studies";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://gowtam.ai";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: "2026-07-05",
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: "2026-08-21",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: "2026-08-21",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: "2026-08-21",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: "2026-07-05",
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
    lastModified: cs.dateUpdated ?? "2026-07-05",
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...caseStudyPages];
}
