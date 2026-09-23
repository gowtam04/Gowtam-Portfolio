import {
  caseStudies,
  getCaseStudy,
  type CaseStudy,
  type CaseStudySection,
} from "@/lib/case-studies";
import {
  isInlineLink,
  LONGER_CONTENT,
  PANEL_SPOT_ORDER,
  richTextToPlain,
  ROOM_INTRO,
  ROOM_PLACEHOLDERS,
  ROOM_SECTIONS,
  ROUTED_SPOTS,
  type PanelSpotId,
  type RichText,
  type RoomBlock,
  type RoutedSpotId,
} from "@/lib/room-content";
import { getRoomProjects } from "@/lib/room-projects";
import {
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

/* ------------------------------------------------------------ room */

/** Absolute URL for a site-relative href; leaves mailto: and external links alone. */
function absoluteUrl(href: string): string {
  return href.startsWith("/") ? `${SITE_URL}${href}` : href;
}

/** Rich text to Markdown: links become Markdown links, placeholders `[Label]`. */
function richTextToMarkdown(text: RichText): string {
  return text
    .map((part) =>
      isInlineLink(part)
        ? `[${part.label}](${absoluteUrl(part.href)})`
        : richTextToPlain([part]),
    )
    .join("");
}

function hashes(level: number): string {
  return "#".repeat(Math.min(level, 6));
}

type TrustContent = (typeof LONGER_CONTENT)[keyof typeof LONGER_CONTENT];

/** The long-form About / Contact content, nested under a heading at `level`. */
function longerToMarkdown(content: TrustContent, summary: string, level: number): string[] {
  const lines: string[] = [
    `${hashes(level)} ${summary}`,
    "",
    `**${content.headline}**`,
    "",
    content.lede,
    "",
  ];
  for (const section of content.sections) {
    lines.push(`${hashes(level + 1)} ${section.heading}`, "");
    for (const p of section.paragraphs) {
      lines.push(p, "");
    }
    if ("bullets" in section && section.bullets) {
      for (const b of section.bullets) {
        lines.push(`- ${b}`);
      }
      lines.push("");
    }
  }
  return lines;
}

interface RenderOptions {
  /** True inside /plain, where Teeko has his own section. */
  combined: boolean;
}

/** The Teeko panel folded into /about under `heading` at `level`. */
function teekoToMarkdown(heading: string, level: number, opts: RenderOptions): string[] {
  const teeko = ROOM_SECTIONS.teeko;
  const lines: string[] = [`${hashes(level)} ${heading}`, "", richTextToMarkdown(teeko.lead), ""];
  for (const block of teeko.blocks) {
    lines.push(...blockToMarkdown(block, level + 1, opts));
  }
  lines.push(`Teeko's spot in the room: ${SITE_URL}${teeko.route}`, "");
  return lines;
}

/** One panel block. Block headings sit at `level`. */
function blockToMarkdown(block: RoomBlock, level: number, opts: RenderOptions): string[] {
  const lines: string[] = [];
  switch (block.type) {
    case "projects": {
      lines.push(`${hashes(level)} ${block.heading}`, "");
      for (const project of getRoomProjects()) {
        const tag = project.projectType === "professional" ? "Professional" : "Independent";
        lines.push(
          `- [${project.title}](${SITE_URL}/case-studies/${project.slug}) (${project.category}, ${tag}): ${project.description}`,
        );
      }
      lines.push("", `[${block.allLabel}](${absoluteUrl(block.allHref)})`, "");
      break;
    }
    case "facts": {
      if (block.heading) lines.push(`${hashes(level)} ${block.heading}`, "");
      for (const item of block.items) {
        lines.push(`- ${richTextToMarkdown(item)}`);
      }
      lines.push("");
      break;
    }
    case "spec": {
      if (block.heading) lines.push(`${hashes(level)} ${block.heading}`, "");
      for (const row of block.rows) {
        lines.push(`- ${row.label}: ${richTextToMarkdown(row.value)}`);
      }
      lines.push("");
      break;
    }
    case "chips": {
      lines.push(`${hashes(level)} ${block.heading}`, "");
      for (const item of block.items) {
        lines.push(`- ${richTextToMarkdown(item)}`);
      }
      lines.push("");
      break;
    }
    case "stat": {
      lines.push(`**${block.value}** ${block.label}`, "");
      break;
    }
    case "links": {
      for (const item of block.items) {
        const detail = item.detail ? `: ${item.detail}` : "";
        lines.push(`- [${item.label}](${absoluteUrl(item.href)})${detail}`);
      }
      lines.push("");
      break;
    }
    case "longer": {
      lines.push(...longerToMarkdown(LONGER_CONTENT[block.source], block.summary, level));
      break;
    }
    case "teeko-teaser": {
      if (opts.combined) {
        lines.push(`${hashes(level)} ${block.heading}`, "", `${block.text} More in the Teeko section below.`, "");
      } else {
        lines.push(...teekoToMarkdown(block.heading, level, opts));
      }
      break;
    }
  }
  return lines;
}

/** A room panel as Markdown with its title at `level`. */
function roomSectionToMarkdown(id: PanelSpotId, level: number, opts: RenderOptions): string {
  const section = ROOM_SECTIONS[id];
  const kicker = opts.combined
    ? `*${section.kicker}* (in the room: ${SITE_URL}${section.route})`
    : `*${section.kicker}*`;
  const lines: string[] = [
    `${hashes(level)} ${section.title}`,
    "",
    kicker,
    "",
    richTextToMarkdown(section.lead),
    "",
  ];
  for (const block of section.blocks) {
    lines.push(...blockToMarkdown(block, level + 1, opts));
  }
  return lines.join("\n").trimEnd() + "\n";
}

function roomNavToMarkdown(current: RoutedSpotId): string {
  const links = [
    `[Room overview](${SITE_URL}/)`,
    ...ROUTED_SPOTS.filter((id) => id !== current).map(
      (id) => `[${ROOM_SECTIONS[id].navLabel}](${SITE_URL}${ROOM_SECTIONS[id].route})`,
    ),
    `[Plain version](${SITE_URL}${ROOM_INTRO.plainHref})`,
  ];
  return `---\n\nMore of the room: ${links.join(", ")}\n`;
}

function roomPageToMarkdown(id: RoutedSpotId): string {
  return `${roomSectionToMarkdown(id, 1, { combined: false })}\n${roomNavToMarkdown(id)}`;
}

function sectionIndexLines(): string[] {
  return PANEL_SPOT_ORDER.map((id) => {
    const section = ROOM_SECTIONS[id];
    return `- [${section.navLabel}](${SITE_URL}${section.route}) (${section.hint}): ${section.meta.description}`;
  });
}

function homeToMarkdown(): string {
  const lines: string[] = [
    `# ${homeMarkdownSummary.title}`,
    "",
    `${SITE_NAME}, ${SITE_ROLE}`,
    "",
    ROOM_INTRO.summary,
    "",
  ];
  for (const p of homeMarkdownSummary.paragraphs) {
    lines.push(p, "");
  }
  lines.push("## Room sections", "", ...sectionIndexLines(), "");
  lines.push("## Classic pages", "");
  for (const link of homeMarkdownSummary.links) {
    lines.push(`- [${link.label}](${SITE_URL}${link.href})`);
  }
  lines.push("", `Email: ${SITE_EMAIL}`, "");
  return lines.join("\n");
}

/** Everything in one document, in bottom-nav order. */
function plainToMarkdown(): string {
  const lines: string[] = [
    `# ${SITE_NAME}, ${SITE_ROLE}: plain version`,
    "",
    `Everything from the interactive 3D room at ${SITE_URL}/, in one text document.`,
    "",
    ROOM_INTRO.summary,
    "",
    ...(ROOM_PLACEHOLDERS.length > 0
      ? ["Bracketed items such as [City] are details not filled in yet.", ""]
      : []),
    "## Contents",
    "",
    ...sectionIndexLines(),
    "",
  ];
  const body = PANEL_SPOT_ORDER.map((id) => roomSectionToMarkdown(id, 2, { combined: true }).trimEnd());
  lines.push(body.join("\n\n"), "");
  lines.push("## More", "");
  lines.push(
    `- [All case studies](${SITE_URL}/case-studies)`,
    `- [Privacy](${SITE_URL}/privacy)`,
    `- [llms.txt](${SITE_URL}/llms.txt)`,
    "",
    `Email: ${SITE_EMAIL}`,
    "",
  );
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
  if (path === "/plain") return plainToMarkdown();

  const spot = ROUTED_SPOTS.find((id) => ROOM_SECTIONS[id].route === path);
  if (spot) return roomPageToMarkdown(spot);

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
