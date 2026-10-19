import type { ProjectType } from "@/lib/case-studies";
import { caseStudies } from "@/lib/case-studies";

/** Slim case study projection for the work panel (keeps the full corpus off the client). */
export interface RoomProject {
  slug: string;
  title: string;
  description: string;
  category: string;
  projectType: ProjectType;
  featured: boolean;
}

/** Featured studies first (LMA, Insight 360, Oracle Fusion utilities), then the rest in array order. */
export function getRoomProjects(): RoomProject[] {
  const slim = caseStudies.map((cs) => ({
    slug: cs.slug,
    title: cs.title,
    description: cs.description,
    category: cs.category,
    projectType: cs.projectType,
    featured: Boolean(cs.featured),
  }));
  return [...slim.filter((p) => p.featured), ...slim.filter((p) => !p.featured)];
}
