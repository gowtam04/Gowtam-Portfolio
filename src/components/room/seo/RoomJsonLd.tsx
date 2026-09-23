import type { RoutedSpotId } from "@/lib/room-content";
import { ROOM_INTRO, ROOM_SECTIONS } from "@/lib/room-content";
import { getRoomProjects } from "@/lib/room-projects";
import {
  SITE_EMAIL,
  SITE_LINKEDIN,
  SITE_NAME,
  SITE_ROLE,
  SITE_URL,
} from "@/lib/site-content";

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PROFILE_IMAGE = `${SITE_URL}/images/profile.jpg`;

const PERSON_DESCRIPTION =
  "AI Architect designing intelligent systems and autonomous agents. 7+ years shipping enterprise AI tools, agentic applications, and production software.";

const personEntity = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE_NAME,
  jobTitle: SITE_ROLE,
  url: SITE_URL,
  image: PROFILE_IMAGE,
  email: `mailto:${SITE_EMAIL}`,
  description: PERSON_DESCRIPTION,
  sameAs: [SITE_LINKEDIN],
  knowsAbout: [
    "Artificial Intelligence",
    "Agentic AI",
    "AI System Architecture",
    "Multi-Agent Systems",
    "Machine Learning",
    "Mobile App Development",
    "Enterprise Software",
  ],
};

const personJsonLd = { "@context": "https://schema.org", ...personEntity };

/** Compact reference used inside page entities. */
const personRef = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE_NAME,
  jobTitle: SITE_ROLE,
  url: SITE_URL,
};

const websiteRef = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: `${SITE_NAME} Portfolio`,
  url: SITE_URL,
};

type PageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";

const PAGE_TYPES: Record<RoutedSpotId, PageType> = {
  work: "CollectionPage",
  games: "WebPage",
  cars: "WebPage",
  about: "AboutPage",
  places: "WebPage",
  contact: "ContactPage",
};

function sectionPageJsonLd(spot: RoutedSpotId) {
  const section = ROOM_SECTIONS[spot];
  const url = `${SITE_URL}${section.route}`;

  const page: Record<string, unknown> = {
    "@type": PAGE_TYPES[spot],
    "@id": `${url}#webpage`,
    url,
    name: section.meta.title,
    description: section.meta.description,
    inLanguage: "en-US",
    isPartOf: websiteRef,
    about: personRef,
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };

  if (spot === "about") {
    page.mainEntity = personEntity;
  } else if (spot === "contact") {
    page.mainEntity = {
      ...personRef,
      email: `mailto:${SITE_EMAIL}`,
      sameAs: [SITE_LINKEDIN],
    };
  } else if (spot === "work") {
    const projects = getRoomProjects();
    page.mainEntity = {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.title,
        url: `${SITE_URL}/case-studies/${project.slug}`,
      })),
    };
  }

  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: section.navLabel, item: url },
    ],
  };

  return { "@context": "https://schema.org", "@graph": [page, breadcrumb] };
}

const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: SITE_URL,
  name: ROOM_INTRO.meta.title,
  description: ROOM_INTRO.meta.description,
  isPartOf: websiteRef,
  mainEntity: {
    ...personRef,
    image: PROFILE_IMAGE,
  },
};

function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Structured data for a room route. `null` = homepage (Person + ProfilePage);
 * section routes get a typed WebPage plus a Home > Section BreadcrumbList.
 */
export function RoomJsonLd({ spot }: { spot: RoutedSpotId | null }) {
  if (spot === null) {
    return (
      <>
        <JsonLdScript data={personJsonLd} />
        <JsonLdScript data={profilePageJsonLd} />
      </>
    );
  }
  return <JsonLdScript data={sectionPageJsonLd(spot)} />;
}
