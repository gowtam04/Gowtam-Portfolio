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
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}

export function getAllCaseStudySlugs(): string[] {
  return caseStudies.map((cs) => cs.slug);
}
