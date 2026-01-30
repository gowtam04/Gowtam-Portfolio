export type ProjectType = 'independent' | 'professional';

export interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  role: string;
  overview: string;
  challenge: string;
  solution: string;
  results: string[];
  technologies: string[];
  projectType: ProjectType;
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
    slug: "nibble-ai",
    title: "Nibble AI",
    description:
      "An AI-powered nutrition tracker that uses Claude AI for instant meal analysis from photos, available on the App Store.",
    category: "AI/ML",
    duration: "2024",
    role: "AI Product Manager",
    overview:
      "Nibble AI is an iOS application that revolutionizes nutrition tracking by leveraging Claude AI to instantly analyze meals from photos. The app eliminates the tedious manual entry that plagues traditional calorie counters, making healthy eating effortless and engaging.",
    challenge:
      "Traditional nutrition tracking apps require users to manually search and log every food item, leading to low adherence rates. Users needed a frictionless way to track their nutrition that could understand complex meals and provide accurate nutritional information without extensive manual input.",
    solution:
      "I designed and built an AI-first nutrition tracking experience powered by Claude AI. The app uses computer vision to analyze meal photos and provide instant nutritional breakdowns. I implemented barcode scanning for packaged foods, personalized AI coaching for dietary guidance, HealthKit integration for holistic health tracking, gamified challenges to boost engagement, and 16 home screen widgets for at-a-glance nutrition data.",
    results: [
      "Successfully shipped to the App Store",
      "16 home screen widgets for personalized tracking",
      "Instant AI-powered meal analysis from photos",
      "Seamless HealthKit integration for comprehensive health data",
    ],
    technologies: ["Claude AI", "Claude Code", "Swift", "SwiftUI", "HealthKit", "Vision API", "iOS"],
    projectType: 'independent',
    appStoreUrl: "https://apps.apple.com/us/app/nibble-ai/id6756195763",
  },
  {
    slug: "dexpert",
    title: "Dexpert",
    description:
      "An offline-first Pokemon companion app with a design systems approach, built using SwiftUI and Claude Code.",
    category: "Mobile App",
    duration: "2025",
    role: "Designer & Developer",
    overview:
      "Dexpert is an offline-first Pokemon reference app that handles the full complexity of the franchise (1,025+ creatures, 15 game versions, 937 moves) while feeling fast, clean, and intuitive. The app uses a design systems approach where neutral UI surfaces let the 18 canonical type colors serve as the sole source of visual hierarchy.",
    challenge:
      "Existing Pokemon reference apps are cluttered and overwhelming, require constant internet connectivity, and handle version-specific data poorly. Players need quick, reliable information during gameplay, whether checking type matchups mid-battle or planning team compositions, but existing solutions create friction at every step.",
    solution:
      "I built an offline-first reference app with all data bundled locally. The design system uses 'clean canvas, colored content' where the UI stays monochromatic and only the 18 type colors provide saturation. A version-aware architecture lets users select their game version once, and the entire app adapts: regional dex numbers, version-specific movesets, and contextual sorting. Reusable components (GlassCard, TypeBadge, StatBar) ensure systematic consistency throughout.",
    results: [
      "1,025+ Pokemon with full stats, abilities, and evolutions",
      "15 game versions supported with contextual data",
      "Zero network requests required for core functionality",
      "Shipped from concept to TestFlight in 4 weeks using Claude Code",
    ],
    technologies: ["SwiftUI", "SwiftData", "Claude Code", "Python", "iOS"],
    projectType: "independent",
  },
  {
    slug: "logoforge",
    title: "LogoForge",
    description:
      "A free AI-powered logo generator that creates App Store-ready icon bundles using Google's Gemini AI.",
    category: "AI/ML",
    duration: "2026",
    role: "AI Product Manager",
    overview:
      "LogoForge is a free AI-powered logo generator that takes users from a simple text description to App Store-ready icon bundles in under five minutes. It leverages Google's Gemini multimodal AI to generate professional logos and includes a complete export pipeline for iOS, Android, and Web platforms.",
    challenge:
      "Indie developers and small teams face a frustrating bottleneck when launching apps: creating professional icons. Existing solutions either require expensive design tools and expertise, charge per-download for AI-generated assets, or produce generic results that don't work well at small sizes. The icon export process itself is tedious, as each platform requires dozens of precisely-sized variants, proper folder structures, and configuration files like Contents.json and manifest.json.",
    solution:
      "LogoForge addresses both logo creation and export in a single streamlined workflow. For AI-powered generation, users describe their desired logo or upload reference images for style guidance. The system uses Gemini's image generation capabilities with style-specific prompt engineering (minimalist, playful, corporate, mascot) to produce four unique variations. A Sharp-based smart export pipeline generates platform-compliant icon bundles: for iOS, it creates AppIcon.appiconset with all required sizes and Contents.json; for Android, it produces standard and round launcher icons, adaptive icon foreground layers, and Play Store assets; for Web, it generates favicons, PWA manifest icons, Apple Touch icons, and Microsoft tile assets. Users download a ZIP file with correctly-structured folders, configuration files, and metadata, ready to drop directly into Xcode, Android Studio, or a web project.",
    results: [
      "Launched as a free, open-source tool with no watermarks or usage limits",
      "Supports 4 logo styles with reference image input for guided generation",
      "Generates 50+ icon variants across 3 platforms in a single export",
      "Produces complete configuration files (Contents.json, manifest.json, browserconfig.xml, adaptive icon XML)",
      "Built with rate limiting and efficient streaming to handle concurrent users",
    ],
    technologies: ["Claude Code", "Next.js", "TypeScript", "Material UI", "Google Gemini", "Sharp", "Archiver"],
    projectType: "independent",
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
    role: "AI Product Manager",
    overview:
      "FamilyCart is a collaborative grocery shopping app designed to make family shopping seamless. The app enables multiple family members to contribute to and check off items from a shared list in real-time, eliminating the chaos of uncoordinated grocery runs.",
    challenge:
      "Families struggled with coordinating grocery shopping: duplicate purchases, forgotten items, and the inability to collaborate in real-time were common pain points. Existing solutions were either too complex or required everyone to create accounts, creating friction for adoption.",
    solution:
      "I architected a serverless multi-tenant solution using Firebase that enables instant collaboration without requiring account creation. The app features zero-friction onboarding where users can start a shared list and invite family members within seconds. Built with React Native and Expo for cross-platform support, with offline capability ensuring the app works even in stores with poor connectivity.",
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
    overview:
      "Yosihealth is a mobile application designed to solve a pervasive problem in India: the reliance on paper-based medical records. The app enables users to digitize, organize, and share their health documents including blood test reports, imaging results, prescriptions, and diagnoses, eliminating the chaos of managing physical paperwork.",
    challenge:
      "In India, patients still carry around paper test reports, prescriptions, and diagnosis documents. These records are easily lost or damaged, and finding the right report when a doctor requests it is cumbersome and time-consuming. Families often manage health records for multiple members, compounding the organizational challenge.",
    solution:
      "I designed and built a mobile app with quick-capture document scanning that makes digitizing records effortless. The app organizes documents by type (blood tests, imaging, prescriptions), date, and family member, with a flexible tagging system for custom organization. Sharing with healthcare providers is frictionless through shareable links or QR codes that doctors can scan during consultations.",
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
    overview:
      "Suit Break is a multiplayer web-based card game that brings the classic trick-taking genre to the browser with modern matchmaking and competitive features. The game features strategic card request mechanics that add depth beyond traditional card games.",
    challenge:
      "Creating an engaging multiplayer card game that works seamlessly in the browser while maintaining competitive integrity. The game needed to handle real-time synchronization between players, prevent cheating, and provide a fair matchmaking experience for players of all skill levels.",
    solution:
      "I designed and implemented a complete multiplayer infrastructure with real-time matchmaking, private rooms for playing with friends, and an ELO-based rating system for competitive play. The strategic card request mechanic adds a unique twist to traditional trick-taking games, requiring players to think several moves ahead.",
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
    overview:
      "A diagnostic testing lab needed a system that could handle their massive scale of operations. I led the product development of a comprehensive LIMS from initial concept through company-wide deployment, managing the full product lifecycle for a system now used by hundreds of employees.",
    challenge:
      "The lab was using Salesforce to manage their operations, but it couldn't handle the scale they were operating at. They needed a custom solution that could support their high-volume testing workflows, from patient intake through result delivery, without bottlenecks.",
    solution:
      "I owned the product vision and roadmap, working closely with lab technicians, operations staff, and leadership to design a system built around their actual workflows. I led cross-functional teams through discovery, design, development, and deployment, ensuring the solution addressed real operational pain points.",
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
  },
  {
    slug: "dmepos-order-management",
    title: "DMEPOS Order Management System",
    description:
      "Led the development of an order management system for a DMEPOS provider, replacing manual paper processes with a streamlined digital workflow.",
    category: "Healthcare Tech",
    duration: "2022-2023",
    role: "Product Manager",
    overview:
      "A DMEPOS (Durable Medical Equipment, Prosthetics, Orthotics, and Supplies) provider needed to modernize their order management operations. I led the product development of a comprehensive system that digitized their entire workflow, from prescription intake through order fulfillment, across their full range of medical equipment categories.",
    challenge:
      "The provider was managing orders through manual, paper-based processes. Prescriptions arrived via fax, insurance verification required phone calls and manual data entry, and order tracking relied on spreadsheets and physical paperwork. This created bottlenecks, increased error rates, and limited their ability to scale operations.",
    solution:
      "I owned the product vision and worked directly with intake coordinators, verification specialists, and fulfillment staff to design a system around their actual workflows. The solution included prescription management for Rx intake and verification, insurance eligibility and prior authorization workflows, end-to-end order tracking from intake to delivery, and document management for CMNs and compliance documentation.",
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
    role: "Product Manager",
    overview:
      "An enterprise-scale AI solution that automates the validation and auditing of Oracle Expense Reports. The system uses Llama 4 Maverick through OCI Generative AI to extract data from receipt attachments, validate expense records against company policies, and generate comprehensive audit reports.",
    challenge:
      "The client's finance team was spending significant time manually reviewing and auditing expense reports. The process was slow, inconsistent, and couldn't scale with the volume of submissions. Validating receipts against expense claims and ensuring policy compliance required tedious manual comparison that was prone to human error.",
    solution:
      "I led the solution design and architecture for an AI-powered automation system. I evaluated multiple AI models through OCI Generative AI and selected Llama 4 Maverick for its superior multi-document processing capabilities. The solution architecture integrates Oracle VBCS for configurable audit rules, Oracle Integration Cloud for event-driven triggers, and a Python backend on OCI Compute that orchestrates the AI workflows. The system automatically extracts data from receipts (handling multiple receipts per attachment), validates expenses against configured rules, and generates audit reports attached directly to expense records.",
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
    role: "AI Product Manager",
    overview:
      "An AI-powered applicant screening system built for high-volume recruitment. The client was receiving 1000+ applicants per job listing, so I built a system where they could enter the job description, bulk upload all resumes, configure their filter criteria (skills, experience, education), and specify how many candidates to shortlist.",
    challenge:
      "The client was receiving 1000+ applicants for each open position. Manually reviewing every resume to identify qualified candidates was tedious, unsustainable, and created major bottlenecks in their hiring process. They needed a way to efficiently filter massive applicant pools while still identifying the best-fit candidates.",
    solution:
      "I led the end-to-end development of an AI-powered screening system. Users enter the job description, bulk upload resumes (supporting 1000+ in mixed formats like PDF and Word), then configure their filter criteria: required skills, years of experience, and education level. They specify how many candidates they want shortlisted. The AI then scores each resume one-by-one against the job requirements and filter criteria, ranks all applicants by match score, and filters down to the top X candidates. For each shortlisted candidate, the system generates a comprehensive profile including a summary, their key strengths, and potential weaknesses.",
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
  },
  {
    slug: "paraverse",
    title: "Paraverse",
    description:
      "Led product development for a blockchain mobile app bridging physical and digital worlds through NFT-based redemption experiences.",
    category: "Web3/Blockchain",
    duration: "2021-2022",
    role: "Product Manager",
    overview:
      "Paraverse is a blockchain-based mobile application built on Polygon that creates a gateway between physical and digital worlds. The platform enables brands and influencers to connect consumers with both digital and physical offerings through NFT ownership, allowing everyday people to access NFTs that can be redeemed for in-store or on-site value.",
    challenge:
      "The NFT and blockchain space had a massive barrier to entry for mainstream users. Most people lacked crypto knowledge, found wallet setup intimidating, and didn't understand how NFTs could provide real-world value. Brands wanted to leverage NFT technology but needed a solution that wouldn't alienate their existing customer base.",
    solution:
      "I led the entire product development from conception to launch, focusing on removing friction at every step. The core innovation was a one-click wallet setup that eliminated the need for any NFT or blockchain knowledge. I designed an external wallet verification process allowing existing NFT projects to attach physical value redemption to their offerings. The product strategy centered on making Web3 technology invisible to users while delivering tangible real-world benefits.",
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
    role: "AI Product Manager",
    overview:
      "Agent RED is an autonomous AI system that plays Pokemon Red by combining Claude AI models with a PyBoy Game Boy emulator. The system features a hierarchical multi-agent architecture where specialized agents handle different gameplay domains (navigation, battles, and menus) coordinated by an orchestrator that routes tasks to the appropriate agent.",
    challenge:
      "Playing Pokemon Red autonomously requires solving multiple complex problems: understanding game state from raw memory, navigating a world with 223 interconnected maps, making strategic battle decisions against 391 different trainer teams, and managing inventory and party composition, all while maintaining context across hours of gameplay.",
    solution:
      "I designed a hierarchical multi-agent system with four specialized agents: an Orchestrator (Sonnet) for task routing, Navigation (Haiku) with A* pathfinding, Battle (Sonnet/Opus) with automatic escalation for boss fights, and Menu (Haiku) for inventory management. The system extracts comprehensive game state from emulator memory and leverages a knowledge base parsed from the Pokemon Red disassembly, including all 223 maps, 151 Pokemon stats, and type effectiveness matrices. A real-time React dashboard provides monitoring and control via WebSocket streaming.",
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
