export type ProjectType = 'personal' | 'client';

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
    technologies: ["Claude AI", "Swift", "SwiftUI", "HealthKit", "Vision API", "iOS"],
    projectType: 'personal',
    appStoreUrl: "https://apps.apple.com/us/app/nibble-ai/id6756195763",
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
      "Families struggled with coordinating grocery shopping—duplicate purchases, forgotten items, and the inability to collaborate in real-time were common pain points. Existing solutions were either too complex or required everyone to create accounts, creating friction for adoption.",
    solution:
      "I architected a serverless multi-tenant solution using Firebase that enables instant collaboration without requiring account creation. The app features zero-friction onboarding where users can start a shared list and invite family members within seconds. Built with React Native and Expo for cross-platform support, with offline capability ensuring the app works even in stores with poor connectivity.",
    results: [
      "Successfully shipped to the App Store",
      "Zero-friction onboarding with instant family sharing",
      "Real-time sync across all family members' devices",
      "Full offline capability for in-store use",
    ],
    technologies: ["React Native", "Expo", "TypeScript", "Firebase", "Serverless"],
    projectType: 'personal',
    appStoreUrl: "https://apps.apple.com/us/app/familycart-groceries/id6753196717",
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
    technologies: ["WebSockets", "React", "Node.js", "Real-time Multiplayer", "Game Design"],
    projectType: 'personal',
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
    projectType: "client",
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
    projectType: "client",
    clientName: "Large UAE Conglomerate",
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
    projectType: "client",
    clientName: "Paraverse LLC",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}

export function getAllCaseStudySlugs(): string[] {
  return caseStudies.map((cs) => cs.slug);
}
