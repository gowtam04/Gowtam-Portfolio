/** Shared prose for trust-anchor HTML pages and Markdown negotiation. */

export const SITE_NAME = "Gowtam Ramanujam";
export const SITE_URL = "https://gowtam.ai";
export const SITE_EMAIL = "gowtam@gowtam.ai";
export const SITE_ROLE = "AI Architect";
/** Resume headline focus, shown under the role. */
export const SITE_FOCUS = "Multi-Agent & Enterprise AI Systems";
/** Site-wide description: root metadata, Person JSON-LD, Markdown home. */
export const SITE_DESCRIPTION =
  "AI Architect designing multi-agent and enterprise AI systems, from orchestration and governance to integration and deployment. 8+ years shipping production software, with AI tools in use by the State of California.";
export const SITE_LINKEDIN = "https://www.linkedin.com/in/gowtam-ramanujam";

export const privacyContent = {
  title: "Privacy Policy",
  headline: "Privacy for gowtam.ai",
  lastUpdated: "August 21, 2026",
  lede: "This policy covers the personal portfolio site at gowtam.ai. It is separate from product-specific policies such as XRPLook, Someday, and DEAD CENTER.",
  sections: [
    {
      heading: "1. Scope",
      paragraphs: [
        "This Privacy Policy applies to the website gowtam.ai, including pages such as the homepage, about, contact, case studies, and this privacy page. It describes what information is and is not collected when you browse the portfolio.",
        "Apps and products linked from this site may have their own policies. For the XRPLook iOS app, see /xrplook/privacy. For Someday, see /someday/privacy. For DEAD CENTER, see /dead-center/privacy.",
      ],
    },
    {
      heading: "2. Information we do not collect",
      paragraphs: [
        "gowtam.ai does not require accounts or sign-in. The site does not run first-party analytics SDKs, advertising trackers, or marketing pixels in the application code as shipped.",
        "There is no contact form that stores submissions on a backend I operate. Contact happens through email or third-party social profiles you choose to use.",
      ],
    },
    {
      heading: "3. Technical data and hosting",
      paragraphs: [
        "Like most websites, the hosting and CDN provider (for example Vercel) may process standard request metadata such as IP address, user agent, requested URL, and timestamps in server or edge logs. That processing is governed by the host's own practices and is used for delivery, security, and reliability of the site.",
        "Theme preference (light or dark) may be stored locally in your browser via client-side storage so the UI can remember your choice. That preference stays on your device.",
      ],
    },
    {
      heading: "4. Cookies",
      paragraphs: [
        "The portfolio does not use advertising cookies. Any cookies or similar storage used by the hosting platform for security, load balancing, or session continuity are limited to operating the site and are not used by me for cross-site advertising.",
      ],
    },
    {
      heading: "5. Third-party links",
      paragraphs: [
        "Pages may link to LinkedIn, App Store listings, or other external sites. Those destinations have their own privacy practices. Review their policies when you leave gowtam.ai.",
      ],
    },
    {
      heading: "6. Children",
      paragraphs: [
        "This site is a professional portfolio and is not directed at children under 13. I do not knowingly collect personal information from children under 13 through gowtam.ai.",
      ],
    },
    {
      heading: "7. Changes",
      paragraphs: [
        "This policy may be updated from time to time. When it changes, the last-updated date at the top of this page will change. Continued use of the site after an update means you accept the revised policy for future visits.",
      ],
    },
    {
      heading: "8. Contact",
      paragraphs: [
        "Questions about this portfolio privacy policy: gowtam@gowtam.ai.",
        "For XRPLook product privacy, use /xrplook/privacy. For Someday, use /someday/privacy. For DEAD CENTER, use /dead-center/privacy. For general contact, see /contact.",
      ],
    },
  ],
} as const;

export const homeMarkdownSummary = {
  title: "Gowtam Ramanujam | AI Architect",
  paragraphs: [
    "Personal site of Gowtam Ramanujam, an AI Architect designing multi-agent and enterprise AI systems, from orchestration and governance to integration and deployment. 8+ years shipping production software, with AI tools in use by the State of California.",
    "The homepage is an interactive 3D room. Each object opens a panel that is also its own URL, listed below. For everything in one text document, read /plain. Prefer Accept: text/markdown for machine-readable page bodies, and start with /llms.txt and /sitemap.xml for discovery.",
  ],
  links: [
    { href: "/plain", label: "Plain text version (everything on one page)" },
    { href: "/case-studies", label: "Case studies" },
    { href: "/privacy", label: "Privacy" },
    { href: "/llms.txt", label: "llms.txt" },
    { href: "/sitemap.xml", label: "Sitemap" },
  ],
} as const;
