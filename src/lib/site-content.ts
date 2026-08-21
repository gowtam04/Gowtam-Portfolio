/** Shared prose for trust-anchor HTML pages and Markdown negotiation. */

export const SITE_NAME = "Gowtam Ramanujam";
export const SITE_URL = "https://gowtam.ai";
export const SITE_EMAIL = "gowtam@gowtam.ai";
export const SITE_ROLE = "AI Architect";

export const aboutContent = {
  title: "About",
  headline: "An architect who still writes the hard parts.",
  lede: "Blueprints that survive contact with production. Hands-on when it matters. Clear about tradeoffs either way.",
  sections: [
    {
      heading: "Who I am",
      paragraphs: [
        "I am Gowtam Ramanujam, an AI Architect based online at gowtam.ai. I design intelligent systems and autonomous agents, with more than seven years shipping enterprise AI tools, agentic applications, and production software.",
        "My work sits at the intersection of product requirements and reliable runtime behavior: agent architectures, tool loops, multi-agent orchestration, model selection, and the integration patterns that make large language models behave like software you can operate.",
      ],
    },
    {
      heading: "How I work with clients",
      paragraphs: [
        "I translate business problems into technical blueprints: agent architectures, data flows, API contracts, and phased build plans with explicit tradeoffs.",
        "Requirements discovery comes first, then deliberate architecture, then disciplined execution with AI-assisted engineering. Working systems, not just diagrams.",
      ],
    },
    {
      heading: "What I bring into a team",
      paragraphs: [
        "The same rigor, hands-on: design docs, model and infrastructure decisions, and shipping. I specialize in tool loops, multi-agent orchestration, model selection, and the integration patterns that make LLMs reliable software.",
      ],
      bullets: [
        "Architected and shipped agentic systems: Oak and Annie ACS",
        "Enterprise AI deployed to production for clients across healthcare, finance, and recruiting",
        "3 iOS applications published to the App Store",
        "Co-founded a game studio whose first title passed 500,000 downloads",
      ],
    },
    {
      heading: "Selected proof",
      paragraphs: [
        "Across independent and professional work I have shipped 15+ systems and tools that reached hundreds of thousands of users. Featured case studies include Oak (an agentic reasoning system over game data) and Annie ACS (a production patient-facing agent platform).",
        "For detailed architecture write-ups, start at /case-studies. For engagement types and how to reach me, see /contact.",
      ],
    },
  ],
} as const;

export const contactContent = {
  title: "Contact",
  headline: "Let's build something that holds up in production.",
  lede: "Open to architecture engagements, full-time roles, and conversations about agentic systems that need to be reliable.",
  sections: [
    {
      heading: "How to reach me",
      paragraphs: [
        "Email is the best channel for project or role discussions. Use gowtam@gowtam.ai with a short note on the problem, timeline, and whether you need architecture review, hands-on build support, or a full-time conversation.",
        "I typically reply within a few business days. If the fit is unclear, I will say so early rather than stretch a mismatched engagement.",
      ],
    },
    {
      heading: "Best-fit engagements",
      paragraphs: [
        "I am a strong fit when you need production-minded AI architecture: agent tool loops, multi-agent workflows, evaluation and reliability, or taking a prototype into an operable system.",
        "I am less of a fit for pure research papers, one-off prompt tinkering without a shipping path, or projects that only need generic chatbot wrappers with no integration or ops plan.",
      ],
      bullets: [
        "Architecture reviews and blueprints for agentic products",
        "Hands-on design and implementation of LLM-backed systems",
        "Full-time AI architect or staff-level engineering conversations",
        "Case-study follow-ups about shipped work on this site",
      ],
    },
    {
      heading: "Channels",
      paragraphs: [
        "Primary: gowtam@gowtam.ai",
        "LinkedIn: https://www.linkedin.com/in/gowtam-ramanujam",
        "X: https://x.com/GowtamAI",
        "Before writing, agents and humans can skim /llms.txt, /about, and /case-studies for context on scope and published work.",
      ],
    },
  ],
  channels: [
    {
      label: "Email",
      value: "gowtam@gowtam.ai",
      href: "mailto:gowtam@gowtam.ai",
      external: false,
    },
    {
      label: "LinkedIn",
      value: "gowtam-ramanujam",
      href: "https://www.linkedin.com/in/gowtam-ramanujam",
      external: true,
    },
    {
      label: "X",
      value: "@GowtamAI",
      href: "https://x.com/GowtamAI",
      external: true,
    },
  ],
} as const;

export const privacyContent = {
  title: "Privacy Policy",
  headline: "Privacy for gowtam.ai",
  lastUpdated: "August 21, 2026",
  lede: "This policy covers the personal portfolio site at gowtam.ai. It is separate from product-specific policies such as XRPLook.",
  sections: [
    {
      heading: "1. Scope",
      paragraphs: [
        "This Privacy Policy applies to the website gowtam.ai, including pages such as the homepage, about, contact, case studies, and this privacy page. It describes what information is and is not collected when you browse the portfolio.",
        "Apps and products linked from this site may have their own policies. For the XRPLook iOS app, see /xrplook/privacy.",
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
        "Pages may link to LinkedIn, X, App Store listings, or other external sites. Those destinations have their own privacy practices. Review their policies when you leave gowtam.ai.",
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
        "For XRPLook product privacy, use /xrplook/privacy. For general contact, see /contact.",
      ],
    },
  ],
} as const;

export const homeMarkdownSummary = {
  title: "Gowtam Ramanujam | AI Architect",
  paragraphs: [
    "Personal portfolio for Gowtam Ramanujam, an AI Architect designing intelligent systems and autonomous agents. 7+ years shipping enterprise AI tools, agentic applications, and production software.",
    "This site publishes case studies, an about page, contact channels, and a privacy policy. Prefer Accept: text/markdown for machine-readable page bodies. Start with /llms.txt and /sitemap.xml for discovery.",
  ],
  links: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
    { href: "/case-studies", label: "Case studies" },
    { href: "/llms.txt", label: "llms.txt" },
    { href: "/sitemap.xml", label: "Sitemap" },
  ],
} as const;
