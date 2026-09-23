/**
 * Single source of truth for the 3D room: every panel, the /plain page,
 * Markdown negotiation, and llms.txt read from here.
 *
 * Unknown personal details are placeholders built with `ph()`. They render as
 * a dashed "fill me in" chip showing `[Label]`, and every key is listed in
 * `ROOM_PLACEHOLDERS` so they can all be filled in one pass.
 *
 * This module is client-safe: it must not import case study data (see
 * `room-projects.ts` for the work panel's project list).
 */

import {
  SITE_EMAIL,
  SITE_LINKEDIN,
  SITE_NAME,
  SITE_ROLE,
  aboutContent,
  contactContent,
} from "@/lib/site-content";

/* ------------------------------------------------------------ placeholders */

export interface Placeholder {
  kind: "placeholder";
  /** Stable, searchable key, e.g. "cars.daily-driver". */
  key: string;
  /** What the visitor sees inside the chip: `[label]`. */
  label: string;
}

export interface InlineLink {
  kind: "link";
  label: string;
  href: string;
  external?: boolean;
}

/** A run of inline content: plain text, placeholders, and links. */
export type Inline = string | Placeholder | InlineLink;
export type RichText = Inline[];

const placeholderRegistry = new Map<string, Placeholder>();

/** Declare an unknown personal detail. `key` defaults to a slug of the label. */
export function ph(label: string, key?: string): Placeholder {
  const k =
    key ??
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const existing = placeholderRegistry.get(k);
  if (existing) return existing;
  const p: Placeholder = { kind: "placeholder", key: k, label };
  placeholderRegistry.set(k, p);
  return p;
}

export function isPlaceholder(v: unknown): v is Placeholder {
  return typeof v === "object" && v !== null && (v as Placeholder).kind === "placeholder";
}

export function isInlineLink(v: unknown): v is InlineLink {
  return typeof v === "object" && v !== null && (v as InlineLink).kind === "link";
}

/** Flatten rich text to plain text; placeholders become `[Label]`. */
export function richTextToPlain(text: RichText): string {
  return text
    .map((part) => {
      if (typeof part === "string") return part;
      if (isPlaceholder(part)) return `[${part.label}]`;
      return part.label;
    })
    .join("");
}

/* ------------------------------------------------------------ spots */

/** Spots that open a panel. `switch` is a hotspot too, but not a panel. */
export type PanelSpotId =
  | "work"
  | "games"
  | "cars"
  | "about"
  | "places"
  | "contact"
  | "teeko";

/** Order of the bottom nav, /plain, and Markdown. */
export const PANEL_SPOT_ORDER: readonly PanelSpotId[] = [
  "work",
  "games",
  "cars",
  "about",
  "places",
  "contact",
  "teeko",
];

/** Spots that own a dedicated route. Teeko lives at /about#teeko. */
export type RoutedSpotId = Exclude<PanelSpotId, "teeko">;
export const ROUTED_SPOTS: readonly RoutedSpotId[] = [
  "work",
  "games",
  "cars",
  "about",
  "places",
  "contact",
];

/* ------------------------------------------------------------ blocks */

export interface SpecRow {
  label: string;
  value: RichText;
}

export type RoomBlock =
  /** Project cards from `getRoomProjects()`, passed in as a prop. */
  | { type: "projects"; heading: string; allHref: string; allLabel: string }
  /** A bullet list of short facts. */
  | { type: "facts"; heading?: string; items: RichText[] }
  /** Label/value rows. */
  | { type: "spec"; heading?: string; rows: SpecRow[] }
  /** A row of chips, typically placeholders. */
  | { type: "chips"; heading: string; items: RichText[] }
  /** A big number with a caption. */
  | { type: "stat"; value: string; label: string }
  /** Call-to-action buttons. */
  | {
      type: "links";
      items: { label: string; detail?: string; href: string; external?: boolean; primary?: boolean }[];
    }
  /** Collapsible long-form trust content, kept in HTML for crawlers. */
  | { type: "longer"; summary: string; source: "about" | "contact" }
  /** Teaser that opens the Teeko panel. */
  | { type: "teeko-teaser"; heading: string; text: string; cta: string };

export interface RoomSection {
  id: PanelSpotId;
  /** Canonical URL for this panel. */
  route: string;
  /** Bottom nav label. */
  navLabel: string;
  /** Short object hint ("the desk"), used in llms.txt. */
  hint: string;
  kicker: string;
  title: string;
  lead: RichText;
  blocks: RoomBlock[];
  meta: { title: string; description: string };
}

/* ------------------------------------------------------------ content */

export const ROOM_SECTIONS: Record<PanelSpotId, RoomSection> = {
  work: {
    id: "work",
    route: "/work",
    navLabel: "Work",
    hint: "the desk",
    kicker: "AI Architect",
    title: "The desk: work",
    lead: [
      "By day (and plenty of nights) I design and build AI systems: agents that reason, call tools, and hold up in production. I like the hard middle part, where a clever demo becomes software people can trust.",
    ],
    blocks: [
      {
        type: "projects",
        heading: "Selected projects",
        allHref: "/case-studies",
        allLabel: "All projects",
      },
    ],
    meta: {
      title: `Work | ${SITE_NAME}, ${SITE_ROLE}`,
      description:
        "The desk in Gowtam's room: AI agents and systems that reason, call tools, and hold up in production. Case studies include Oak and Annie ACS.",
    },
  },
  games: {
    id: "games",
    route: "/games",
    navLabel: "Games",
    hint: "the console",
    kicker: "Player 1",
    title: "The console: games",
    lead: [
      "Games are how I unwind, and a big reason I build things at all. I co-founded a game studio whose first title passed 500,000 downloads, and my agent Oak exists because I wanted better answers to Pokemon questions.",
    ],
    blocks: [
      {
        type: "chips",
        heading: "Now playing",
        items: [["Pokemon Champions"], ["Cyberpunk 2077"], ["on Nintendo Switch 2"]],
      },
      {
        type: "chips",
        heading: "All-time favorites",
        items: [["The Elder Scrolls V: Skyrim"], ["Pokemon"], ["Mario Party"]],
      },
      {
        type: "chips",
        heading: "Genres I keep coming back to",
        items: [["RPGs"]],
      },
      {
        type: "stat",
        value: "500K+",
        label: "downloads on the first title from the studio I co-founded",
      },
    ],
    meta: {
      title: `Games | ${SITE_NAME}`,
      description:
        "The console in Gowtam's room: the games he plays, and the game studio he co-founded whose first title passed 500,000 downloads.",
    },
  },
  cars: {
    id: "cars",
    route: "/cars",
    navLabel: "Cars",
    hint: "the window",
    kicker: "Behind the wheel",
    title: "The window: cars",
    lead: [
      "Driving is my reset button. Give me an open road, good weather, and no destination in particular.",
    ],
    blocks: [
      {
        type: "spec",
        rows: [
          { label: "Daily driver", value: ["2022 BMW M235i"] },
        ],
      },
    ],
    meta: {
      title: `Cars | ${SITE_NAME}`,
      description:
        "The window in Gowtam's room: driving, open roads, and the cars he loves.",
    },
  },
  about: {
    id: "about",
    route: "/about",
    navLabel: "About",
    hint: "the wall",
    kicker: "Hi, I'm Gowtam",
    title: "The wall: about me",
    lead: [
      "I'm an AI architect who builds agents for a living and games, apps, and side projects for fun. This room is a little map of what I care about. Click around.",
    ],
    blocks: [
      {
        type: "facts",
        heading: "Quick facts",
        items: [
          ["Based in the Sacramento area"],
          ["Builds AI agents and iOS apps"],
          ["Co-founded a game studio"],
          ["Lived in India and the United States"],
          ["Happiest on an open road or with a controller in hand"],
        ],
      },
      {
        type: "teeko-teaser",
        heading: "Meet Teeko",
        text: "The real owner of this room is a black chihuahua. He is usually asleep on the rug.",
        cta: "Say hi to Teeko",
      },
      { type: "longer", summary: "The longer version", source: "about" },
    ],
    meta: {
      title: `About | ${SITE_NAME}, ${SITE_ROLE}`,
      description:
        "About Gowtam Ramanujam: an AI architect who builds agents for a living and games, apps, and side projects for fun.",
    },
  },
  places: {
    id: "places",
    route: "/places",
    navLabel: "Places",
    hint: "the frames",
    kicker: "Where I've lived",
    title: "The frames: two homes",
    lead: [
      "I grew up in Idaho, moved to India for high school and college, then came back to the US for work. These days I live near Sacramento. Both countries show up in how I think, what I build, and what I care about.",
    ],
    blocks: [
      {
        type: "spec",
        heading: "The route so far",
        rows: [
          { label: "Grew up", value: ["Idaho"] },
          { label: "High school and college", value: ["India"] },
          { label: "Work", value: ["Back to the United States"] },
          { label: "Now", value: ["Near Sacramento, California"] },
        ],
      },
    ],
    meta: {
      title: `Places | ${SITE_NAME}`,
      description:
        "The frames in Gowtam's room: growing up in Idaho, high school and college in India, and back to the United States for work, now near Sacramento.",
    },
  },
  contact: {
    id: "contact",
    route: "/contact",
    navLabel: "Contact",
    hint: "the phone",
    kicker: "Get in touch",
    title: "The phone: say hi",
    lead: ["Want to talk about AI, games, cars, or a project? I read everything."],
    blocks: [
      {
        type: "links",
        items: [
          {
            label: "Email",
            detail: SITE_EMAIL,
            href: `mailto:${SITE_EMAIL}`,
            primary: true,
          },
          {
            label: "LinkedIn",
            detail: "/in/gowtam-ramanujam",
            href: SITE_LINKEDIN,
            external: true,
          },
        ],
      },
      { type: "longer", summary: "How I work with people", source: "contact" },
    ],
    meta: {
      title: `Contact | ${SITE_NAME}`,
      description:
        "Get in touch with Gowtam Ramanujam about AI architecture, agents, games, cars, or a project. Email gowtam@gowtam.ai or connect on LinkedIn.",
    },
  },
  teeko: {
    id: "teeko",
    route: "/about#teeko",
    navLabel: "Teeko",
    hint: "asleep",
    kicker: "Head of security",
    title: "Teeko",
    lead: [
      "This is Teeko, our family's black chihuahua and the real owner of this room. I just pay rent.",
    ],
    blocks: [
      {
        type: "spec",
        rows: [
          { label: "Age", value: ["13 years"] },
          { label: "Favorite snack", value: ["Green dental sticks"] },
          { label: "Signature move", value: ["Shvonks"] },
        ],
      },
    ],
    meta: {
      title: `Teeko | ${SITE_NAME}`,
      description: "Teeko, the family's black chihuahua and the real owner of Gowtam's room.",
    },
  },
};

/** Long-form trust content embedded in the About and Contact panels. */
export const LONGER_CONTENT = {
  about: aboutContent,
  contact: contactContent,
} as const;

/** Homepage copy: title card, corner card, and the overview summary. */
export const ROOM_INTRO = {
  title: "Gowtam's room",
  subtitle: "click anything",
  cornerName: SITE_NAME,
  cornerRole: SITE_ROLE,
  plainLabel: "plain version",
  plainHref: "/plain",
  summary:
    "An interactive 3D room that maps what Gowtam Ramanujam cares about: a desk for his AI architecture work, a console for games, a window onto a street with a red sports car, a wall of photos, two framed homes (India and the United States), a phone for saying hi, and Teeko, a sleeping black chihuahua.",
  meta: {
    title: `${SITE_NAME} | ${SITE_ROLE}`,
    description:
      "Step into Gowtam's room: an AI architect's interactive 3D space. Click the desk for AI work, the console for games, the window for cars, and meet Teeko the chihuahua.",
  },
} as const;

export const LIGHTS_LABEL = "Lights";

/**
 * Every placeholder declared above. Declared last so the registry is full.
 * Search for `ph(` or a key such as "cars.daily-driver" to fill one in.
 */
export const ROOM_PLACEHOLDERS: readonly Placeholder[] = Array.from(placeholderRegistry.values());

/** Look up a panel spot from a pathname + hash. Returns null for the overview. */
export function spotFromLocation(pathname: string, hash: string): PanelSpotId | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/about" && hash === "#teeko") return "teeko";
  for (const id of ROUTED_SPOTS) {
    if (ROOM_SECTIONS[id].route === path) return id;
  }
  return null;
}
