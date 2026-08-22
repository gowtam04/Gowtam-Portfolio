import {
  caseStudies,
  getCaseStudy,
  type CaseStudy,
  type CaseStudySection,
} from "@/lib/case-studies";
import {
  aboutContent,
  contactContent,
  homeMarkdownSummary,
  privacyContent,
  SITE_EMAIL,
  SITE_NAME,
  SITE_ROLE,
  SITE_URL,
} from "@/lib/site-content";

export const MARKDOWN_VARY = "Accept, Accept-Encoding";

const NOT_FOUND_MARKDOWN = `# Not found

The requested path does not exist on ${SITE_URL}.

Useful next steps for agents:

- [Home](${SITE_URL}/)
- [llms.txt](${SITE_URL}/llms.txt)
- [Sitemap](${SITE_URL}/sitemap.xml)
- [Case studies](${SITE_URL}/case-studies)
`;

function sectionToMarkdown(title: string, section: CaseStudySection): string {
  const lines: string[] = [`## ${title}`, ""];
  if (typeof section === "string") {
    lines.push(section, "");
    return lines.join("\n");
  }
  if (section.paragraphs) {
    for (const p of section.paragraphs) {
      lines.push(p, "");
    }
  }
  if (section.subsections) {
    for (const sub of section.subsections) {
      lines.push(`### ${sub.title}`, "");
      if (sub.paragraphs) {
        for (const p of sub.paragraphs) {
          lines.push(p, "");
        }
      }
      if (sub.bullets) {
        for (const b of sub.bullets) {
          lines.push(`- ${b}`);
        }
        lines.push("");
      }
    }
  }
  return lines.join("\n");
}

function trustPageToMarkdown(content: {
  title: string;
  headline: string;
  lede: string;
  lastUpdated?: string;
  sections: readonly {
    heading: string;
    paragraphs: readonly string[];
    bullets?: readonly string[];
  }[];
}): string {
  const lines: string[] = [
    `# ${content.headline}`,
    "",
    content.lede,
    "",
  ];
  if (content.lastUpdated) {
    lines.push(`Last updated: ${content.lastUpdated}`, "");
  }
  for (const section of content.sections) {
    lines.push(`## ${section.heading}`, "");
    for (const p of section.paragraphs) {
      lines.push(p, "");
    }
    if (section.bullets) {
      for (const b of section.bullets) {
        lines.push(`- ${b}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n").trimEnd() + "\n";
}

function caseStudyToMarkdown(cs: CaseStudy): string {
  const lines: string[] = [
    `# ${cs.title}`,
    "",
    cs.description,
    "",
    `- Category: ${cs.category}`,
    `- Duration: ${cs.duration}`,
    `- Role: ${cs.role}`,
    `- Project type: ${cs.projectType}`,
    "",
  ];
  if (cs.clientName) {
    lines.push(`- Client: ${cs.clientName}`, "");
  }
  lines.push(sectionToMarkdown("Overview", cs.overview));
  lines.push(sectionToMarkdown("Challenge", cs.challenge));
  lines.push(sectionToMarkdown("Solution", cs.solution));
  lines.push("## Results", "");
  for (const r of cs.results) {
    lines.push(`- ${r}`);
  }
  lines.push("", "## Technologies", "");
  for (const t of cs.technologies) {
    lines.push(`- ${t}`);
  }
  lines.push("");
  if (cs.testimonial) {
    lines.push("## Testimonial", "", cs.testimonial, "");
  }
  if (cs.externalLink) {
    lines.push(`External: [${cs.externalLink.label}](${cs.externalLink.url})`, "");
  }
  if (cs.appStoreUrl) {
    lines.push(`App Store: ${cs.appStoreUrl}`, "");
  }
  return lines.join("\n");
}

function homeToMarkdown(): string {
  const lines: string[] = [
    `# ${homeMarkdownSummary.title}`,
    "",
    `${SITE_NAME}, ${SITE_ROLE}`,
    "",
  ];
  for (const p of homeMarkdownSummary.paragraphs) {
    lines.push(p, "");
  }
  lines.push("## Links", "");
  for (const link of homeMarkdownSummary.links) {
    lines.push(`- [${link.label}](${SITE_URL}${link.href})`);
  }
  lines.push("", `Email: ${SITE_EMAIL}`, "");
  return lines.join("\n");
}

function caseStudyIndexToMarkdown(): string {
  const lines: string[] = [
    "# Case studies",
    "",
    "Selected projects showing how I architect AI systems and agents, from requirements through production deployment.",
    "",
  ];
  for (const cs of caseStudies) {
    lines.push(
      `- [${cs.title}](${SITE_URL}/case-studies/${cs.slug}): ${cs.description}`,
    );
  }
  lines.push("");
  return lines.join("\n");
}

/** Normalize pathname (no trailing slash except root). */
export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/**
 * Returns Markdown for negotiated pages, or null if the path is outside
 * the Markdown negotiation set (caller should 404 for agents).
 */
export function getMarkdownForPath(pathname: string): string | null {
  const path = normalizePathname(pathname);

  if (path === "/") return homeToMarkdown();
  if (path === "/about") return trustPageToMarkdown(aboutContent);
  if (path === "/contact") return trustPageToMarkdown(contactContent);
  if (path === "/privacy") return trustPageToMarkdown(privacyContent);
  if (path === "/case-studies") return caseStudyIndexToMarkdown();

  const caseMatch = path.match(/^\/case-studies\/([^/]+)$/);
  if (caseMatch) {
    const cs = getCaseStudy(caseMatch[1]);
    if (!cs) return null;
    return caseStudyToMarkdown(cs);
  }

  return null;
}

export function getNotFoundMarkdown(): string {
  return NOT_FOUND_MARKDOWN;
}

/** Paths that participate in Markdown negotiation (for middleware 404). */
export function isMarkdownNegotiablePath(pathname: string): boolean {
  return getMarkdownForPath(pathname) !== null;
}
