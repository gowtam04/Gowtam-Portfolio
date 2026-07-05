export type ProjectType = 'independent' | 'professional';

export interface CaseStudySubsection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface CaseStudySectionContent {
  paragraphs?: string[];
  subsections?: CaseStudySubsection[];
}

export type CaseStudySection = string | CaseStudySectionContent;

export interface CaseStudyStat {
  value: string;
  label: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  role: string;
  /** SEO-optimized title for <title> and og:title; falls back to `title` if omitted */
  seoTitle?: string;
  /** SEO-optimized description for meta description; falls back to `description` if omitted */
  metaDescription?: string;
  /** Static ISO date (YYYY-MM-DD) for Article JSON-LD datePublished */
  datePublished?: string;
  /** Static ISO date (YYYY-MM-DD) for Article JSON-LD dateModified */
  dateUpdated?: string;
  overview: CaseStudySection;
  challenge: CaseStudySection;
  solution: CaseStudySection;
  results: string[];
  technologies: string[];
  projectType: ProjectType;
  /** Featured studies render as large panels at the top of the work grid */
  featured?: boolean;
  /** Quantified outcomes shown as a stat band on the detail page */
  stats?: CaseStudyStat[];
  appStoreUrl?: string;
  externalLink?: {
    url: string;
    label: string;
  };
  // Client project specific fields
  clientName?: string;
  testimonial?: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "oak",
    title: "Oak",
    description:
      "A full-stack AI agent that answers natural-language Pokémon questions by reasoning over raw game data, not just looking facts up, with cited sources and explicit uncertainty in every answer.",
    category: "AI/ML",
    duration: "2026",
    role: "AI Architect",
    seoTitle: "Oak: Agentic AI Reasoning System",
    metaDescription:
      "AI agent that reasons over raw Pokémon game data to answer questions, citing sources and flagging uncertainty in every answer.",
    datePublished: "2026-01-01",
    dateUpdated: "2026-07-05",
    overview: {
      paragraphs: [
        "Oak is a web chat agent that answers natural-language questions about Pokémon: moves, abilities, types, stats, evolutions, items, catch locations, and the game-mechanic interactions competitive players actually care about.",
        "What sets it apart is how it answers. Most Pokémon tools are lookups where you search and get a stat block. Oak instead treats the data as raw material for reasoning, so a set of 14 tools supplies the facts (move priority values, ability effect text, type charts, base stats, learnsets) and the language model deduces how those pieces combine.",
      ],
    },
    challenge: {
      paragraphs: [
        "Existing Pokémon tools are retrieval engines: they recite facts but cannot deduce how moves, abilities, types, and stats interact, which is exactly what competitive players need. Worse, general-purpose chatbots will confidently hallucinate mechanics.",
        "The goal was an agent you can trust for battle math and matchups: one that shows its work, cites its sources, admits what it does not know, and is explicit about which game generation an answer applies to.",
      ],
    },
    solution: {
      subsections: [
        {
          title: "Reasoning tool loop",
          paragraphs: [
            "I designed a provider-agnostic tool loop where the model composes facts into mechanics conclusions instead of reciting them. For example, asking \"Does Fake Out work on Farigiraf?\" yields the chain: Fake Out is a +3 priority move; Armor Tail negates priority moves; if Farigiraf has Armor Tail, Fake Out fails.",
          ],
        },
        {
          title: "Schema-validated responses",
          paragraphs: [
            "Every response is a schema-validated object rendered field by field: the answer, the reasoning behind it, the cited data sources, an explicit inference and uncertainty flag, and the game generation it applies to.",
          ],
        },
        {
          title: "Optional accounts and team builder",
          paragraphs: [
            "Accounts are optional, so Oak is usable instantly as a guest. Signing in with an email one-time code unlocks durable chat history (search, pin, rename) plus a team builder with Showdown import and export, where a team can be set active to scope the agent's answers.",
          ],
        },
        {
          title: "Multimodal turns and artifacts",
          paragraphs: [
            "Oak supports up to four images per turn for prompts like \"what is this?\" or \"rate this team sheet.\" Answers can open rich side-panel artifacts for Pokémon, moves, teams, damage calcs, and type matchups with clickable entity links.",
          ],
        },
        {
          title: "Model-agnostic stack",
          paragraphs: [
            "The whole stack runs on xAI Grok 4.3 by default with Claude and GPT-5.5 as drop-in alternatives, switchable with a single operator setting and no rebuild.",
          ],
        },
      ],
    },
    results: [
      "Reasoning, not retrieval: a provider-agnostic tool loop where the model composes facts into mechanics conclusions, with citations and uncertainty surfaced in every answer",
      "Optional accounts: instant guest use, with email one-time-code sign-in unlocking durable chat history and a team builder with Showdown import and export",
      "Multimodal turns supporting up to four attached images for identification and team-sheet review",
      "Interactive artifacts: answers open rich side-panel views (Pokémon, moves, teams, damage calcs, type matchups) with clickable entity links",
      "Model-agnostic: runs on xAI Grok 4.3 by default, with Claude and GPT-5.5 as drop-in alternatives switchable via a single operator setting",
    ],
    technologies: [
      "TypeScript",
      "Next.js",
      "Postgres",
      "Drizzle",
      "Server-Sent Events",
      "Zod",
      "Vitest",
      "xAI Grok",
      "Claude",
      "GPT-5.5",
      "Fly.io",
    ],
    projectType: "independent",
    featured: true,
    stats: [
      { value: "14", label: "Reasoning tools" },
      { value: "3", label: "Drop-in LLM providers" },
      { value: "100%", label: "Answers cited" },
    ],
    externalLink: {
      url: "https://oak.gowtam.ai",
      label: "Try Oak",
    },
  },
  {
    slug: "annie-acs",
    title: "Annie ACS",
    description:
      "An AI medical consultant for a cosmetic surgery practice that educates patients on procedures, streams cited media from a curated knowledge base, books consultations via Calendly, and gives practice staff a full admin panel, including a second agent that answers natural-language questions over thousands of patient conversations.",
    category: "Healthcare Tech",
    duration: "2026",
    role: "AI Architect",
    seoTitle: "Annie ACS: AI Patient Agent for a Surgery Practice",
    metaDescription:
      "AI medical consultant for a cosmetic surgery practice that educates patients, streams cited procedure media, and books consultations.",
    datePublished: "2026-01-01",
    dateUpdated: "2026-07-05",
    overview: {
      paragraphs: [
        "Annie ACS is a production AI medical consultant for Advanced Cosmetic Surgery (Dr. Jon Mendelsohn). Patients ask about blepharoplasty, rhinoplasty, facelifts, and other procedures; Annie adapts to their expertise level, surfaces procedure-specific videos and images from a curated knowledge base, and books consultations through Calendly, all inside an embeddable chat widget that runs 24/7 on the practice website.",
        "Behind the widget is a three-service platform: a FastAPI backend with a streaming LLM pipeline, a React chat widget with three deployment modes (floating icon, inline iframe, standalone page), and a JWT-authenticated admin panel where practice staff manage branding, knowledge base content, conversation history, and analytics.",
        "A second tool-calling agent, the Conversation Insights Assistant, lets non-technical staff query the entire patient-conversation corpus in plain English, with cited sessions and confirmation-gated actions.",
      ],
    },
    challenge: {
      paragraphs: [
        "Cosmetic surgery patients research procedures online before they ever call the office. They need accurate, procedure-specific answers (recovery timelines, risks, pricing context, before-and-after media) without waiting for staff. A generic chatbot would hallucinate video URLs, give one-size-fits-all answers, and have no way for the practice to update content or review what patients are asking.",
        "The first version of Annie ran on LangGraph with in-memory sessions and SQLite on a Fly Volume. That worked for a prototype, but it could not scale operationally: sessions did not survive restarts cleanly, media URLs sometimes leaked into LLM text instead of structured delivery, there was no admin tooling, and the storage model (local SQLite + mounted volumes) was not viable for a production medical practice that needed durable conversation history, staff-managed knowledge bases, and zero-downtime index updates.",
      ],
    },
    solution: {
      paragraphs: [
        "I architected and shipped a full platform rebuild (requirements through production deployment) in phased releases (admin panel v1.0 to v2.0, Postgres + Tigris migration).",
      ],
      subsections: [
        {
          title: "Patient-facing agent",
          paragraphs: [
            "A three-step async pipeline replaces LangGraph: route (intent + procedure + expertise classification), then retrieve (dual FAISS search with expertise cascade and shown-content dedup), then respond (streaming tokens via SSE). Media URLs are delivered only through structured SSE events from retrieval results, never from LLM text, eliminating URL hallucination entirely.",
            "The responder supports dual providers (Anthropic Haiku default, OpenAI fallback) with hot-reloaded system prompts. Expertise cascade serves BEGINNER, INTERMEDIATE, and ADVANCED content tiers from the same index.",
          ],
        },
        {
          title: "Knowledge infrastructure",
          paragraphs: [
            "Two FAISS indexes (visual procedure media from a managed spreadsheet, and knowledge from PDFs and staff-uploaded documents chunked 1000/200) live in Tigris object storage with atomic hot-swap via Postgres version pointers. Staff upload KB documents through the admin panel; the backend stages, commits, rebuilds, and swaps indexes without taking chat offline.",
          ],
        },
        {
          title: "Admin platform",
          paragraphs: [
            "The admin panel covers branding (colors, three avatar slots, per-mode intro videos and posters), knowledge base management, conversation search (Postgres full-text), analytics, deployment snippet generation, and JWT auth.",
          ],
        },
        {
          title: "Conversation Insights Assistant",
          paragraphs: [
            "v2.0 adds a streaming tool-calling agent (Anthropic Sonnet) over three corpus paths (structured FTS, semantic FAISS conversations index, and pre-computed per-conversation enrichment digests), with clickable session citations and confirmation-gated actions (set review status, export to .docx, apply list filters). The agent has no mutating tools; every action requires explicit staff confirmation.",
          ],
        },
        {
          title: "Production re-platforming",
          paragraphs: [
            "I led the SQLite-on-Volume to Fly Postgres + Tigris cutover (staging rehearsal, then production on 2026-05-21): extract-and-load migration, FTS parity verification, FAISS index relocation, and a break-glass snapshot retention plan. Production runs one warm Fly machine with Alembic migrations on boot, asyncpg connection pooling, and health checks against both Postgres and Tigris.",
          ],
        },
      ],
    },
    results: [
      "Hallucination-free media delivery: structured SSE events from FAISS retrieval, never from LLM text, so procedure videos and images are always from the curated knowledge base",
      "Expertise-adaptive education: BEGINNER / INTERMEDIATE / ADVANCED content cascade from a single index, so Annie meets patients where they are",
      "Staff self-service: admin panel for branding, KB uploads, conversation review, and analytics, with no engineering tickets for content or appearance changes",
      "Conversation Insights Assistant: natural-language corpus queries with cited sessions and confirmation-gated actions, built for non-technical practice staff",
      "Zero-downtime index updates: FAISS rebuild, Tigris upload, atomic Postgres pointer flip, in-process hot-swap, chat stays up throughout",
      "Production-grade persistence: Postgres + Tigris cutover with verified FTS parity, staging rehearsal, and documented break-glass rollback",
      "Three embed modes: floating chat icon, inline iframe, and standalone page, same Annie, same knowledge base, deployable anywhere",
      "Dual-provider LLM architecture: Anthropic and OpenAI interchangeable via env config, with lazy-initialized clients so the test suite runs without API keys",
    ],
    technologies: [
      "Python",
      "FastAPI",
      "React",
      "MUI",
      "Vite",
      "Postgres",
      "asyncpg",
      "Alembic",
      "FAISS",
      "OpenAI Embeddings",
      "Anthropic Claude",
      "Server-Sent Events",
      "Tigris",
      "Fly.io",
      "Docker",
      "Vitest",
      "pytest",
    ],
    projectType: "professional",
    featured: true,
    stats: [
      { value: "0", label: "Hallucinated media URLs" },
      { value: "3", label: "Embed modes" },
      { value: "0", label: "Downtime on index updates" },
      { value: "24/7", label: "Patient availability" },
    ],
    clientName: "Advanced Cosmetic Surgery",
    externalLink: {
      url: "https://annie.351face.com",
      label: "Try Annie",
    },
  },
  {
    slug: "nibble-ai",
    title: "Nibble AI",
    description:
      "An AI-powered nutrition tracker that uses Claude AI for instant meal analysis from photos, available on the App Store.",
    category: "AI/ML",
    duration: "2024",
    role: "AI Architect",
    seoTitle: "Nibble AI: AI Nutrition Tracker iOS App",
    datePublished: "2024-01-01",
    dateUpdated: "2024-12-01",
    overview:
      "Nibble AI is an iOS application that revolutionizes nutrition tracking by leveraging Claude AI to instantly analyze meals from photos. The app eliminates the tedious manual entry that plagues traditional calorie counters, making healthy eating effortless and engaging.",
    challenge:
      "Traditional nutrition tracking apps require users to manually search and log every food item, leading to low adherence rates. Users needed a frictionless way to track their nutrition that could understand complex meals and provide accurate nutritional information without extensive manual input.",
    solution: {
      paragraphs: [
        "I designed and built an AI-first nutrition tracking experience powered by Claude AI. The app uses computer vision to analyze meal photos and provide instant nutritional breakdowns.",
        "I implemented barcode scanning for packaged foods, personalized AI coaching for dietary guidance, HealthKit integration for holistic health tracking, gamified challenges to boost engagement, and 16 home screen widgets for at-a-glance nutrition data.",
      ],
    },
    results: [
      "Successfully shipped to the App Store",
      "16 home screen widgets for personalized tracking",
      "Instant AI-powered meal analysis from photos",
      "Seamless HealthKit integration for comprehensive health data",
    ],
    technologies: ["Claude AI", "Claude Code", "Swift", "SwiftUI", "HealthKit", "Vision API", "iOS"],
    projectType: 'independent',
    stats: [
      { value: "16", label: "Home screen widgets" },
      { value: "Live", label: "On the App Store" },
    ],
    appStoreUrl: "https://apps.apple.com/us/app/nibble-ai/id6756195763",
  },
  {
    slug: "logoforge",
    title: "LogoForge",
    description:
      "A free AI-powered logo generator that creates App Store-ready icon bundles using Google's Gemini AI.",
    category: "AI/ML",
    duration: "2026",
    role: "AI Architect",
    seoTitle: "LogoForge: AI Logo Generator for App Icons",
    datePublished: "2026-01-01",
    dateUpdated: "2026-07-05",
    overview:
      "LogoForge is a free AI-powered logo generator that takes users from a simple text description to App Store-ready icon bundles in under five minutes. It leverages Google's Gemini multimodal AI to generate professional logos and includes a complete export pipeline for iOS, Android, and Web platforms.",
    challenge: {
      paragraphs: [
        "Indie developers and small teams face a frustrating bottleneck when launching apps: creating professional icons. Existing solutions either require expensive design tools and expertise, charge per-download for AI-generated assets, or produce generic results that don't work well at small sizes.",
        "The icon export process itself is tedious, as each platform requires dozens of precisely-sized variants, proper folder structures, and configuration files like Contents.json and manifest.json.",
      ],
    },
    solution: {
      paragraphs: [
        "LogoForge addresses both logo creation and export in a single streamlined workflow.",
      ],
      subsections: [
        {
          title: "AI-powered generation",
          paragraphs: [
            "Users describe their desired logo or upload reference images for style guidance. The system uses Gemini's image generation capabilities with style-specific prompt engineering (minimalist, playful, corporate, mascot) to produce four unique variations.",
          ],
        },
        {
          title: "Smart export pipeline",
          paragraphs: [
            "A Sharp-based image processing system generates platform-compliant icon bundles. For iOS, it creates AppIcon.appiconset with all required sizes and Contents.json. For Android, it produces standard and round launcher icons, adaptive icon foreground layers, and Play Store assets. For Web, it generates favicons, PWA manifest icons, Apple Touch icons, and Microsoft tile assets.",
          ],
        },
        {
          title: "Production-ready output",
          paragraphs: [
            "Users download a ZIP file with correctly-structured folders, configuration files, and metadata, ready to drop directly into Xcode, Android Studio, or a web project.",
          ],
        },
      ],
    },
    results: [
      "Launched as a free, open-source tool with no watermarks or usage limits",
      "Supports 4 logo styles with reference image input for guided generation",
      "Generates 50+ icon variants across 3 platforms in a single export",
      "Produces complete configuration files (Contents.json, manifest.json, browserconfig.xml, adaptive icon XML)",
      "Built with rate limiting and efficient streaming to handle concurrent users",
    ],
    technologies: ["Claude Code", "Next.js", "TypeScript", "Material UI", "Google Gemini", "Sharp", "Archiver"],
    projectType: "independent",
    stats: [
      { value: "50+", label: "Icon variants per export" },
      { value: "3", label: "Platforms covered" },
      { value: "4", label: "Logo styles" },
    ],
    externalLink: {
      url: "https://logoforge.gowtam.ai",
      label: "View LogoForge",
    },
  },
  {
    slug: "familycart",
    title: "FamilyCart",
    description:
      "A collaborative grocery list app with real-time sync and zero-friction onboarding, built for families.",
    category: "Mobile App",
    duration: "2024",
    role: "AI Architect",
    seoTitle: "FamilyCart: Real-Time Family Grocery List App",
    datePublished: "2024-01-01",
    dateUpdated: "2024-12-01",
    overview:
      "FamilyCart is a collaborative grocery shopping app designed to make family shopping seamless. The app enables multiple family members to contribute to and check off items from a shared list in real-time, eliminating the chaos of uncoordinated grocery runs.",
    challenge:
      "Families struggled with coordinating grocery shopping: duplicate purchases, forgotten items, and the inability to collaborate in real-time were common pain points. Existing solutions were either too complex or required everyone to create accounts, creating friction for adoption.",
    solution: {
      paragraphs: [
        "I architected a serverless multi-tenant solution using Firebase that enables instant collaboration without requiring account creation. The app features zero-friction onboarding where users can start a shared list and invite family members within seconds.",
        "Built with React Native and Expo for cross-platform support, with offline capability ensuring the app works even in stores with poor connectivity.",
      ],
    },
    results: [
      "Successfully shipped to the App Store",
      "Zero-friction onboarding with instant family sharing",
      "Real-time sync across all family members' devices",
      "Full offline capability for in-store use",
    ],
    technologies: ["Claude Code", "React Native", "Expo", "TypeScript", "Firebase", "Serverless"],
    projectType: 'independent',
    appStoreUrl: "https://apps.apple.com/us/app/familycart-groceries/id6753196717",
  },
  {
    slug: "yosihealth",
    title: "Yosihealth",
    description:
      "A mobile app for digitizing and organizing health records, built for the Indian market where paper-based medical documents are still the norm.",
    category: "Healthcare Tech",
    duration: "2023",
    role: "Product Manager",
    seoTitle: "Yosihealth: Digital Health Records App for India",
    datePublished: "2023-01-01",
    dateUpdated: "2023-12-01",
    overview: {
      paragraphs: [
        "Yosihealth is a mobile application designed to solve a pervasive problem in India: the reliance on paper-based medical records.",
        "The app enables users to digitize, organize, and share their health documents including blood test reports, imaging results, prescriptions, and diagnoses, eliminating the chaos of managing physical paperwork.",
      ],
    },
    challenge: {
      paragraphs: [
        "In India, patients still carry around paper test reports, prescriptions, and diagnosis documents. These records are easily lost or damaged, and finding the right report when a doctor requests it is cumbersome and time-consuming.",
        "Families often manage health records for multiple members, compounding the organizational challenge.",
      ],
    },
    solution: {
      paragraphs: [
        "I designed and built a mobile app with quick-capture document scanning that makes digitizing records effortless. The app organizes documents by type (blood tests, imaging, prescriptions), date, and family member, with a flexible tagging system for custom organization.",
        "Sharing with healthcare providers is frictionless through shareable links or QR codes that doctors can scan during consultations.",
      ],
    },
    results: [
      "Quick-capture scanning for effortless document digitization",
      "Multi-member family support with separate profiles",
      "Instant sharing via links or QR codes for doctor visits",
      "Validated market need through user testing with Indian families",
    ],
    technologies: ["React Native", "Expo", "Mobile App", "Document Management"],
    projectType: "independent",
  },
  {
    slug: "suit-break",
    title: "Suit Break",
    description:
      "A multiplayer card game with real-time matchmaking, ELO rating system, and strategic gameplay mechanics.",
    category: "Web Game",
    duration: "2024",
    role: "Product Designer & Developer",
    seoTitle: "Suit Break: Multiplayer Card Game with ELO Rating",
    datePublished: "2024-01-01",
    dateUpdated: "2024-12-01",
    overview:
      "Suit Break is a multiplayer web-based card game that brings the classic trick-taking genre to the browser with modern matchmaking and competitive features. The game features strategic card request mechanics that add depth beyond traditional card games.",
    challenge: {
      paragraphs: [
        "Creating an engaging multiplayer card game that works seamlessly in the browser while maintaining competitive integrity.",
        "The game needed to handle real-time synchronization between players, prevent cheating, and provide a fair matchmaking experience for players of all skill levels.",
      ],
    },
    solution: {
      paragraphs: [
        "I designed and implemented a complete multiplayer infrastructure with real-time matchmaking, private rooms for playing with friends, and an ELO-based rating system for competitive play.",
        "The strategic card request mechanic adds a unique twist to traditional trick-taking games, requiring players to think several moves ahead.",
      ],
    },
    results: [
      "Real-time multiplayer with seamless matchmaking",
      "ELO rating system for competitive balance",
      "Private rooms for playing with friends",
      "Unique strategic card request mechanics",
    ],
    technologies: ["Claude Code", "WebSockets", "React", "Node.js", "Real-time Multiplayer", "Game Design"],
    projectType: 'independent',
    externalLink: {
      url: "https://ace-suit-break.fly.dev",
      label: "Play Now",
    },
  },
  {
    slug: "diagnostic-lab-lims",
    title: "Laboratory Information Management System",
    description:
      "Led the development of a custom LIMS that replaced Salesforce, enabling a diagnostic lab to process 10,000+ samples daily.",
    category: "Healthcare Tech",
    duration: "2022-2023",
    role: "Product Manager",
    seoTitle: "Diagnostic Lab LIMS: Replacing Salesforce",
    datePublished: "2022-01-01",
    dateUpdated: "2023-12-01",
    overview: {
      paragraphs: [
        "A diagnostic testing lab needed a system that could handle their massive scale of operations.",
        "I led the product development of a comprehensive LIMS from initial concept through company-wide deployment, managing the full product lifecycle for a system now used by hundreds of employees.",
      ],
    },
    challenge: {
      paragraphs: [
        "The lab was using Salesforce to manage their operations, but it couldn't handle the scale they were operating at.",
        "They needed a custom solution that could support their high-volume testing workflows, from patient intake through result delivery, without bottlenecks.",
      ],
    },
    solution: {
      paragraphs: [
        "I owned the product vision and roadmap, working closely with lab technicians, operations staff, and leadership to design a system built around their actual workflows.",
        "I led cross-functional teams through discovery, design, development, and deployment, ensuring the solution addressed real operational pain points.",
      ],
    },
    results: [
      "Scaled to process 10,000+ samples per day",
      "Deployed company-wide with hundreds of daily active users",
      "Led full product lifecycle from initial concept to production launch",
      "Replaced legacy Salesforce system with purpose-built solution",
    ],
    technologies: [
      "Product Strategy",
      "Stakeholder Management",
      "Requirements Analysis",
      "Cross-functional Leadership",
      "Healthcare Workflows",
      "Enterprise Software",
    ],
    projectType: "professional",
    stats: [
      { value: "10,000+", label: "Samples per day" },
      { value: "100s", label: "Daily active users" },
    ],
  },
  {
    slug: "dmepos-order-management",
    title: "DMEPOS Order Management System",
    description:
      "Led the development of an order management system for a DMEPOS provider, replacing manual paper processes with a streamlined digital workflow.",
    category: "Healthcare Tech",
    duration: "2022-2023",
    role: "Product Manager",
    seoTitle: "DMEPOS Order Management System: Digital Rx Workflow",
    datePublished: "2022-01-01",
    dateUpdated: "2023-12-01",
    overview: {
      paragraphs: [
        "A DMEPOS (Durable Medical Equipment, Prosthetics, Orthotics, and Supplies) provider needed to modernize their order management operations.",
        "I led the product development of a comprehensive system that digitized their entire workflow, from prescription intake through order fulfillment, across their full range of medical equipment categories.",
      ],
    },
    challenge: {
      paragraphs: [
        "The provider was managing orders through manual, paper-based processes. Prescriptions arrived via fax, insurance verification required phone calls and manual data entry, and order tracking relied on spreadsheets and physical paperwork.",
        "This created bottlenecks, increased error rates, and limited their ability to scale operations.",
      ],
    },
    solution: {
      paragraphs: [
        "I owned the product vision and worked directly with intake coordinators, verification specialists, and fulfillment staff to design a system around their actual workflows.",
        "The solution included prescription management for Rx intake and verification, insurance eligibility and prior authorization workflows, end-to-end order tracking from intake to delivery, and document management for CMNs and compliance documentation.",
      ],
    },
    results: [
      "Deployed company-wide with broad adoption across all departments",
      "Significantly increased daily order processing capacity",
      "Replaced manual paper-based processes with digital workflows",
      "Streamlined prescription intake through delivery tracking",
    ],
    technologies: [
      "Product Strategy",
      "Stakeholder Management",
      "Requirements Analysis",
      "User Research",
      "Healthcare Workflows",
      "Cross-functional Leadership",
    ],
    projectType: "professional",
  },
  {
    slug: "expense-ai-auditing",
    title: "AI-Powered Expense Validation & Auditing",
    description:
      "Designed an AI solution using OCI Generative AI to automate expense report validation and auditing for a large enterprise.",
    category: "Enterprise AI",
    duration: "2025",
    role: "AI Architect",
    seoTitle: "AI Expense Validation & Auditing on Oracle Cloud",
    datePublished: "2025-01-01",
    dateUpdated: "2025-12-01",
    overview: {
      paragraphs: [
        "An enterprise-scale AI automation system for Oracle Expense Report validation and auditing.",
        "I architected the full solution: model selection, event-driven integration topology, and the orchestration layer that extracts receipt data, validates against policy rules, and generates audit reports at scale.",
      ],
    },
    challenge: {
      paragraphs: [
        "The client's finance team was spending significant time manually reviewing and auditing expense reports. The process was slow, inconsistent, and couldn't scale with the volume of submissions.",
        "Validating receipts against expense claims and ensuring policy compliance required tedious manual comparison that was prone to human error.",
      ],
    },
    solution: {
      paragraphs: [
        "I architected an event-driven AI system on OCI. I evaluated multiple models through OCI Generative AI and selected Llama 4 Maverick for its multi-document processing capabilities. The architecture integrates Oracle VBCS for configurable audit rules, Oracle Integration Cloud for event-driven triggers, and a Python backend on OCI Compute that orchestrates extraction, validation, and report generation workflows.",
        "The system handles multiple receipts per attachment, validates expenses against configured rules, and attaches audit reports directly to expense records in Oracle Fusion.",
      ],
    },
    results: [
      "Deployed to production, automating expense validation workflow",
      "AI-powered data extraction from receipt images with multi-document support",
      "Configurable audit rules enabling policy customization without code changes",
      "Automated report generation attached directly to expense records in Oracle Fusion",
    ],
    technologies: [
      "OCI Generative AI",
      "Llama 4 Maverick",
      "Oracle Fusion Cloud",
      "Oracle Integration Cloud",
      "Oracle VBCS",
      "Python",
      "REST APIs",
    ],
    projectType: "professional",
    clientName: "Large UAE Conglomerate",
  },
  {
    slug: "ai-resume-parser",
    title: "AI Resume Parser",
    description:
      "Built an AI-powered solution that bulk-filters 1000+ job applicants and returns top candidates with detailed analysis based on configurable criteria.",
    category: "Enterprise AI",
    duration: "2024",
    role: "AI Architect",
    seoTitle: "AI Resume Parser: Bulk Applicant Screening Tool",
    datePublished: "2024-01-01",
    dateUpdated: "2024-12-01",
    overview: {
      paragraphs: [
        "An AI-powered applicant screening system built for high-volume recruitment. The client was receiving 1000+ applicants per job listing.",
        "I built a system where they could enter the job description, bulk upload all resumes, configure their filter criteria (skills, experience, education), and specify how many candidates to shortlist.",
      ],
    },
    challenge: {
      paragraphs: [
        "The client was receiving 1000+ applicants for each open position. Manually reviewing every resume to identify qualified candidates was tedious, unsustainable, and created major bottlenecks in their hiring process.",
        "They needed a way to efficiently filter massive applicant pools while still identifying the best-fit candidates.",
      ],
    },
    solution: {
      paragraphs: [
        "I led the end-to-end development of an AI-powered screening system. Users enter the job description, bulk upload resumes (supporting 1000+ in mixed formats like PDF and Word), then configure their filter criteria: required skills, years of experience, and education level. They specify how many candidates they want shortlisted.",
        "The AI then scores each resume one-by-one against the job requirements and filter criteria, ranks all applicants by match score, and filters down to the top X candidates. For each shortlisted candidate, the system generates a comprehensive profile including a summary, their key strengths, and potential weaknesses.",
      ],
    },
    results: [
      "Saved hundreds of hours of manual resume screening",
      "Processed thousands of candidates across multiple job postings",
      "AI-generated candidate profiles with summary, strengths, and weaknesses",
      "Configurable filtering by skills, experience, and education criteria",
    ],
    technologies: [
      "OpenAI GPT",
      "Resume Parsing",
      "Document Processing",
      "Web Application",
      "AI/ML",
    ],
    projectType: "professional",
    stats: [
      { value: "1,000+", label: "Applicants screened per posting" },
    ],
  },
  {
    slug: "paraverse",
    title: "Paraverse",
    description:
      "Led product development for a blockchain mobile app bridging physical and digital worlds through NFT-based redemption experiences.",
    category: "Web3/Blockchain",
    duration: "2021-2022",
    role: "Product Manager",
    seoTitle: "Paraverse: NFT Redemption App on Polygon",
    datePublished: "2021-01-01",
    dateUpdated: "2022-12-01",
    overview: {
      paragraphs: [
        "Paraverse is a blockchain-based mobile application built on Polygon that creates a gateway between physical and digital worlds.",
        "The platform enables brands and influencers to connect consumers with both digital and physical offerings through NFT ownership, allowing everyday people to access NFTs that can be redeemed for in-store or on-site value.",
      ],
    },
    challenge: {
      paragraphs: [
        "The NFT and blockchain space had a massive barrier to entry for mainstream users. Most people lacked crypto knowledge, found wallet setup intimidating, and didn't understand how NFTs could provide real-world value.",
        "Brands wanted to leverage NFT technology but needed a solution that wouldn't alienate their existing customer base.",
      ],
    },
    solution: {
      paragraphs: [
        "I led the entire product development from conception to launch, focusing on removing friction at every step. The core innovation was a one-click wallet setup that eliminated the need for any NFT or blockchain knowledge.",
        "I designed an external wallet verification process allowing existing NFT projects to attach physical value redemption to their offerings. The product strategy centered on making Web3 technology invisible to users while delivering tangible real-world benefits.",
      ],
    },
    results: [
      "Led full product lifecycle from conception to launch",
      "Designed one-click wallet setup eliminating blockchain complexity",
      "Created external wallet verification for existing NFT projects",
      "Built bridge between digital NFT ownership and physical redemption",
    ],
    technologies: [
      "Product Strategy",
      "Product Management",
      "Product Road Mapping",
      "Product Design",
      "Agile Project Management",
      "Polygon Blockchain",
    ],
    projectType: "professional",
    clientName: "Paraverse LLC",
  },
  {
    slug: "agent-red",
    title: "Agent RED",
    description:
      "An autonomous multi-agent AI system that plays Pokemon Red using Claude AI models and a Game Boy emulator.",
    category: "AI/ML",
    duration: "2024",
    role: "AI Architect",
    seoTitle: "Agent RED: Multi-Agent AI Plays Pokemon Red",
    datePublished: "2024-01-01",
    dateUpdated: "2024-12-01",
    overview:
      "Agent RED is an autonomous AI system that plays Pokemon Red by combining Claude AI models with a PyBoy Game Boy emulator. The system features a hierarchical multi-agent architecture where specialized agents handle different gameplay domains (navigation, battles, and menus) coordinated by an orchestrator that routes tasks to the appropriate agent.",
    challenge:
      "Playing Pokemon Red autonomously requires solving multiple complex problems: understanding game state from raw memory, navigating a world with 223 interconnected maps, making strategic battle decisions against 391 different trainer teams, and managing inventory and party composition, all while maintaining context across hours of gameplay.",
    solution: {
      subsections: [
        {
          title: "Multi-agent architecture",
          paragraphs: [
            "I designed a hierarchical multi-agent system with four specialized agents: an Orchestrator (Sonnet) for task routing, Navigation (Haiku) with A* pathfinding, Battle (Sonnet/Opus) with automatic escalation for boss fights, and Menu (Haiku) for inventory management.",
          ],
        },
        {
          title: "Game knowledge base",
          paragraphs: [
            "The system extracts comprehensive game state from emulator memory and leverages a knowledge base parsed from the Pokemon Red disassembly, including all 223 maps, 151 Pokemon stats, and type effectiveness matrices.",
          ],
        },
        {
          title: "Real-time dashboard",
          paragraphs: [
            "A real-time React dashboard provides monitoring and control via WebSocket streaming.",
          ],
        },
      ],
    },
    results: [
      "38 tools distributed across 4 specialized AI agents",
      "223 maps with collision data and trainer positions parsed",
      "151 Pokemon with stats, types, and learnsets integrated",
      "Real-time monitoring dashboard with WebSocket streaming",
    ],
    technologies: [
      "Claude AI",
      "Claude Code",
      "Python",
      "FastAPI",
      "React",
      "TypeScript",
      "PyBoy",
      "Multi-Agent Systems",
    ],
    projectType: "independent",
    stats: [
      { value: "38", label: "Tools across agents" },
      { value: "4", label: "Specialized agents" },
      { value: "223", label: "Maps navigated" },
    ],
    externalLink: {
      url: "https://github.com/gowtam04/Agent_RED",
      label: "View on GitHub",
    },
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}

export function getAllCaseStudySlugs(): string[] {
  return caseStudies.map((cs) => cs.slug);
}

export function getAllCategories(): string[] {
  const categories = new Set(caseStudies.map((cs) => cs.category));
  return Array.from(categories).sort();
}

export function getAllTechnologies(): string[] {
  const technologies = new Set(caseStudies.flatMap((cs) => cs.technologies));
  return Array.from(technologies).sort();
}
