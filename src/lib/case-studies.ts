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
  role: string;
  /** SEO-optimized title for <title> and og:title; falls back to `title` if omitted */
  seoTitle?: string;
  /** SEO-optimized description for meta description; falls back to `description` if omitted */
  metaDescription?: string;
  overview: CaseStudySection;
  challenge: CaseStudySection;
  solution: CaseStudySection;
  results: string[];
  /** Shown as the Stack row; omit to hide it */
  technologies?: string[];
  projectType: ProjectType;
  /** Featured studies render as large panels at the top of the work grid */
  featured?: boolean;
  /** Pre-AI product work, listed in its own group after the rest */
  earlier?: boolean;
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
    slug: "legacy-modernization-assistant",
    title: "Legacy Modernization Assistant",
    description:
      "A multi-agent system on Claude that reads legacy code such as COBOL and DYL-280, designs a modern replacement with human input, and generates a first cut in the stack of the customer's choosing. In use by the State of California.",
    category: "Enterprise AI",
    role: "AI Architect",
    seoTitle: "Legacy Modernization Assistant: Multi-Agent AI for Legacy Systems",
    metaDescription:
      "A multi-agent system on Claude that analyzes legacy code like COBOL, designs a modern replacement with human review, and generates it in any stack. In use by the State of California.",
    overview: {
      paragraphs: [
        "The Legacy Modernization Assistant (LMA) is a multi-agent system on Claude that takes a legacy system and modernizes it into a modern stack of the customer's choosing. It accepts any legacy stack as input and any modern stack as output.",
        "I architected it end to end: the agent roles, the human review points, the security model that keeps source code inside the customer's cloud, and the validation that checks the new system against the old one. It is in use by the State of California.",
      ],
    },
    challenge: {
      paragraphs: [
        "Critical business systems built on legacy technologies such as COBOL and DYL-280 are difficult to maintain and extend, because the architects who built them have retired. The knowledge of how the system works lives mostly in the code itself.",
        "Any tool that helps has to meet enterprise constraints: the legacy code cannot leave the customer's cloud, people have to stay in control of design decisions, and the new system has to be proven to behave like the old one.",
      ],
    },
    solution: {
      paragraphs: [
        "I designed LMA as a pipeline of specialized agents with a person in the loop at the points where judgment matters.",
      ],
      subsections: [
        {
          title: "Analysis agents",
          paragraphs: [
            "Agents read the legacy code, extract its structure and business logic, and analyze how the system behaves, turning code nobody fully understands anymore into insight a team can act on.",
          ],
        },
        {
          title: "Design with human input",
          paragraphs: [
            "Agents design the new system and surface their findings for review. People make the design calls; the agents do the reading, the cross-referencing, and the first draft.",
          ],
        },
        {
          title: "Generation in any stack",
          paragraphs: [
            "Once the design is agreed, LMA generates a first cut of the new system in the selected stack. The input and output stacks are both open: any legacy stack in, any modern stack out.",
          ],
        },
        {
          title: "Change management",
          paragraphs: [
            "After the first cut, LMA supports day-to-day work on the system: bug fixes, test code generation, and diff analysis.",
          ],
        },
        {
          title: "Governance and security",
          bullets: [
            "Human in the loop by design",
            "Single sign-on enterprise authentication",
            "Claude models run in AWS Bedrock or Azure AI Foundry, so the legacy code never leaves the enterprise cloud",
          ],
        },
        {
          title: "Validation",
          paragraphs: [
            "Generated tests and output comparison check the new system against the original's behavior, so modernization is measured rather than assumed.",
          ],
        },
      ],
    },
    results: [
      "In use by the State of California",
      "Accepts any legacy stack as input and any modern stack as output",
      "Legacy code never leaves the customer's enterprise cloud",
      "Generated tests and output comparison validate the new system against the original",
    ],
    projectType: "professional",
    featured: true,
    clientName: "State of California",
  },
  {
    slug: "insight-360",
    title: "Insight 360",
    description:
      "An agentic AI command center for small and medium businesses. An onboarding agent interviews each company and writes a \"soul file\" that every agent is bound to, so AI output follows company standards by design.",
    category: "Enterprise AI",
    role: "AI Architect",
    seoTitle: "Insight 360: Agentic AI Command Center for SMBs",
    metaDescription:
      "An agentic AI command center for small and medium businesses, where a per-company soul file governs the output of every agent. Live with 3 companies.",
    overview: {
      paragraphs: [
        "Insight 360 is an agentic AI command center for small and medium businesses. Every company gets its own set of agents, and every one of those agents is bound to a per-company \"soul file\" that captures who the company is.",
        "I architected the platform: the onboarding interview agent, the soul file that governs agent output, the custom orchestration layer, and the per-company isolation model. It is live with 3 companies.",
      ],
    },
    challenge: {
      paragraphs: [
        "A small business that puts AI agents to work needs every one of them to reflect the company: its identity, its values, and its mission. Configuring each agent by hand does not scale, and nothing guarantees the agents stay consistent with each other.",
        "Each company's data also has to stay completely separate from every other company on the platform.",
      ],
    },
    solution: {
      subsections: [
        {
          title: "Onboarding interview agent",
          paragraphs: [
            "An onboarding agent interviews each company to capture its identity, values, and mission, then synthesizes them into that company's soul file.",
          ],
        },
        {
          title: "The soul file",
          paragraphs: [
            "Every agent in the company is bound to its soul file, so AI output follows company standards by design instead of by per-agent configuration.",
          ],
        },
        {
          title: "Custom orchestration",
          paragraphs: [
            "A custom orchestration layer in which an orchestrator agent delegates work to specialized worker agents, running on Claude and OpenAI models.",
          ],
        },
        {
          title: "Isolation per company",
          paragraphs: [
            "Hosted on AWS, with each company running in a separate account and data isolated through row-level security.",
          ],
        },
      ],
    },
    results: [
      "Live with 3 companies",
      "Every agent bound to its company's soul file, so output follows company standards by design",
      "Orchestrator and worker agents on Claude and OpenAI models",
      "Each company runs in a separate account with row-level security",
    ],
    projectType: "professional",
    featured: true,
    stats: [{ value: "3", label: "Companies live" }],
  },
  {
    slug: "oracle-fusion-ai-utilities",
    title: "AI Utilities for Oracle Fusion",
    description:
      "Three AI utilities inside Oracle Fusion (a resume shortlister, an expense auditor, and a contract compliance validator), all live with a multinational corporation based in Dubai.",
    category: "Enterprise AI",
    role: "AI Architect",
    seoTitle: "AI Utilities for Oracle Fusion: Resumes, Expenses, Contracts",
    metaDescription:
      "Three production AI utilities for Oracle Fusion: explainable resume shortlisting, expense auditing with duplicate detection, and contract compliance validation.",
    overview: {
      paragraphs: [
        "Three AI utilities built into Oracle Fusion for a multinational corporation based in Dubai: resume shortlisting, expense analysis and auditing, and contract compliance validation. All three are live.",
        "Each utility does the high-volume reading and checking, explains what it found, and leaves the decision with a person.",
      ],
    },
    challenge: {
      paragraphs: [
        "Each job requisition can draw hundreds or thousands of candidates, far more than a recruiter can read closely.",
        "Finance was reviewing expense reports by hand, which was slow and inconsistent, and made it easy to miss problems such as two employees submitting the same report and causing a double payment.",
        "Vendor contracts have to comply with the laws of the country where they are executed, but not every vendor carries the same risk, and reviewing every contract with the same depth wastes time.",
      ],
    },
    solution: {
      subsections: [
        {
          title: "Resume shortlister",
          paragraphs: [
            "Employers set the criteria (skills, experience, and education) and can add keywords that earn extra weight. The utility scores every candidate against the requisition, ranks them, and shortlists the top candidates.",
            "Every ranking comes with an explanation of why the candidate ranked where they did, plus a profile with a summary, key strengths, and potential weaknesses.",
          ],
        },
        {
          title: "Expense analysis and auditing",
          paragraphs: [
            "Every submitted expense report is analyzed and checked for policy violations, unusual amounts, and duplicates, including the same report submitted by two employees. Flagged reports go to the manager and to the employee in charge of paying out expenses for human review.",
            "The utility runs on OCI: OCI Generative AI (Llama 4 Maverick, chosen for multi-document processing) extracts receipt data, Oracle VBCS holds configurable audit rules, Oracle Integration Cloud triggers processing on events, and audit reports attach directly to the expense record in Oracle Fusion.",
          ],
        },
        {
          title: "Contract compliance validator",
          paragraphs: [
            "Vendors are tiered by risk. Vendors that do not handle customer or employee data, such as a coffee vendor, are treated as low risk. For high-risk vendors such as IT services, the utility analyzes the contract for compliance with the laws of the country where it is executed.",
          ],
        },
      ],
    },
    results: [
      "All three utilities live with a multinational corporation based in Dubai",
      "Thousands of resumes processed, each ranking explained",
      "Expense duplicates and policy violations routed to people for review",
      "Contract review depth matched to vendor risk",
    ],
    technologies: [
      "Oracle Fusion Cloud",
      "OCI Generative AI",
      "Llama 4 Maverick",
      "Oracle Integration Cloud",
      "Oracle VBCS",
      "Python",
    ],
    projectType: "professional",
    featured: true,
    clientName: "Multinational corporation, Dubai",
    stats: [
      { value: "3", label: "Utilities in production" },
      { value: "1,000s", label: "Resumes processed" },
    ],
  },
  {
    slug: "annie-acs",
    title: "Annie ACS",
    description:
      "An AI medical consultant for a cosmetic surgery practice that educates patients on procedures, streams cited media from a curated knowledge base, books consultations via Calendly, and gives practice staff a full admin panel, including a second agent that answers natural-language questions over thousands of patient conversations.",
    category: "Healthcare Tech",
    role: "AI Architect",
    seoTitle: "Annie ACS: AI Patient Agent for a Surgery Practice",
    metaDescription:
      "AI medical consultant for a cosmetic surgery practice that educates patients, streams cited procedure media, and books consultations.",
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
    slug: "oak",
    title: "Oak",
    description:
      "A full-stack AI agent that answers natural-language Pokémon questions by reasoning over raw game data, not just looking facts up, with cited sources and explicit uncertainty in every answer.",
    category: "AI/ML",
    role: "AI Architect",
    seoTitle: "Oak: Agentic AI Reasoning System",
    metaDescription:
      "AI agent that reasons over raw Pokémon game data to answer questions, citing sources and flagging uncertainty in every answer.",
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
    slug: "diagnostic-lab-lims",
    title: "Laboratory Information Management System",
    description:
      "A custom, HIPAA-compliant LIMS on AWS that replaced Salesforce for a diagnostic lab, with automated instrument ingestion and EHR delivery, enabling 10,000+ samples a day.",
    category: "Healthcare Tech",
    role: "Product Manager",
    seoTitle: "Diagnostic Lab LIMS: Replacing Salesforce",
    overview: {
      paragraphs: [
        "A custom laboratory information management system for a diagnostic lab that had outgrown Salesforce. It covers the lab's full workflow: sample accessioning and intake, test ordering and result entry, automated instrument integration, and reporting and billing, including EHR delivery.",
        "I led the product from concept through company-wide deployment, shaping the system design with lab technicians, operations staff, and leadership. It replaced Salesforce and is used by hundreds of employees.",
      ],
    },
    challenge: {
      paragraphs: [
        "The lab had outgrown Salesforce, which could not scale to its sample volume or support its lab-specific workflows.",
        "A replacement had to handle high-volume testing from intake through result delivery without bottlenecks, take results straight from lab instruments, and meet HIPAA requirements.",
      ],
    },
    solution: {
      subsections: [
        {
          title: "Custom platform on AWS",
          paragraphs: [
            "A purpose-built platform hosted on AWS and built with React, Node.js, and PostgreSQL, designed around the lab's actual workflows instead of a general-purpose CRM.",
          ],
        },
        {
          title: "End-to-end lab workflow",
          bullets: [
            "Sample accessioning and intake",
            "Test ordering and result entry",
            "Reporting and billing, including EHR delivery",
          ],
        },
        {
          title: "Automated instrument integration",
          paragraphs: [
            "Lab instruments export CSV files, which the system ingests automatically over a USB connection, removing manual result transcription.",
          ],
        },
        {
          title: "Compliance",
          paragraphs: [
            "Fully HIPAA compliant and audited by a third party.",
          ],
        },
      ],
    },
    results: [
      "Replaced Salesforce with a purpose-built system",
      "Scaled to process 10,000+ samples per day with lower error rates",
      "Fully HIPAA compliant, audited by a third party",
      "Deployed company-wide with hundreds of daily active users",
    ],
    technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
    projectType: "professional",
    stats: [
      { value: "10,000+", label: "Samples per day" },
      { value: "100s", label: "Daily active users" },
    ],
  },
  {
    slug: "nibble-ai",
    title: "Nibble AI",
    description:
      "An AI nutrition tracker on the App Store: Claude identifies the foods in each photo, and a USDA lookup supplies the verified nutrition values.",
    category: "AI/ML",
    role: "AI Architect",
    seoTitle: "Nibble AI: AI Nutrition Tracker iOS App",
    overview:
      "Nibble AI is an iOS application that revolutionizes nutrition tracking by leveraging Claude AI to instantly analyze meals from photos. The app eliminates the tedious manual entry that plagues traditional calorie counters, making healthy eating effortless and engaging.",
    challenge:
      "Traditional nutrition tracking apps require users to manually search and log every food item, leading to low adherence rates. Users needed a frictionless way to track their nutrition that could understand complex meals and provide accurate nutritional information without extensive manual input.",
    solution: {
      paragraphs: [
        "I designed and built an AI-first nutrition tracker around a photo-to-nutrition pipeline. Claude identifies the foods in each photo, and a USDA lookup supplies the verified nutrition values, so the model does the recognition and the numbers come from a trusted source.",
        "I implemented barcode scanning for packaged foods, personalized AI coaching for dietary guidance, HealthKit integration for holistic health tracking, gamified challenges to boost engagement, and 16 home screen widgets for at-a-glance nutrition data.",
      ],
    },
    results: [
      "Successfully shipped to the App Store",
      "16 home screen widgets for personalized tracking",
      "Photo-to-nutrition pipeline: Claude identifies foods, USDA data supplies the values",
      "Seamless HealthKit integration for comprehensive health data",
    ],
    technologies: ["Claude AI", "USDA nutrition data", "Claude Code", "Swift", "SwiftUI", "HealthKit", "Vision API", "iOS"],
    projectType: 'independent',
    stats: [
      { value: "16", label: "Home screen widgets" },
      { value: "Live", label: "On the App Store" },
    ],
    appStoreUrl: "https://apps.apple.com/us/app/nibble-ai/id6756195763",
  },
  {
    slug: "agent-red",
    title: "Agent RED",
    description:
      "An autonomous multi-agent AI system that plays Pokemon Red using Claude AI models and a Game Boy emulator.",
    category: "AI/ML",
    role: "AI Architect",
    seoTitle: "Agent RED: Multi-Agent AI Plays Pokemon Red",
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
  {
    slug: "logoforge",
    title: "LogoForge",
    description:
      "A free AI-powered logo generator that creates App Store-ready icon bundles using Google's Gemini AI.",
    category: "AI/ML",
    role: "AI Architect",
    seoTitle: "LogoForge: AI Logo Generator for App Icons",
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
    role: "AI Architect",
    seoTitle: "FamilyCart: Real-Time Family Grocery List App",
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
    role: "Product Manager",
    seoTitle: "Yosihealth: Digital Health Records App for India",
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
    projectType: "professional",
    earlier: true,
  },
  {
    slug: "dmepos-order-management",
    title: "DMEPOS Order Management System",
    description:
      "Led the development of an order management system for a DMEPOS provider, replacing manual paper processes with a streamlined digital workflow.",
    category: "Healthcare Tech",
    role: "Product Manager",
    seoTitle: "DMEPOS Order Management System: Digital Rx Workflow",
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
    earlier: true,
  },
  {
    slug: "paraverse",
    title: "Paraverse",
    description:
      "Led product development for a blockchain mobile app bridging physical and digital worlds through NFT-based redemption experiences.",
    category: "Web3/Blockchain",
    role: "Product Manager",
    seoTitle: "Paraverse: NFT Redemption App on Polygon",
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
    earlier: true,
    clientName: "Paraverse LLC",
  },
  {
    slug: "suit-break",
    title: "Suit Break",
    description:
      "A multiplayer card game with real-time matchmaking, ELO rating system, and strategic gameplay mechanics.",
    category: "Web Game",
    role: "Product Designer & Developer",
    seoTitle: "Suit Break: Multiplayer Card Game with ELO Rating",
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
    earlier: true,
    externalLink: {
      url: "https://ace-suit-break.fly.dev",
      label: "Play Now",
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
  const technologies = new Set(caseStudies.flatMap((cs) => cs.technologies ?? []));
  return Array.from(technologies).sort();
}
