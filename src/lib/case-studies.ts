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
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "ai-recommendation-engine",
    title: "AI-Powered Recommendation Engine",
    description:
      "Led the development of a machine learning recommendation system that increased user engagement by 40%.",
    category: "AI/ML",
    duration: "[Duration]",
    role: "Product Manager",
    overview:
      "[Provide a comprehensive overview of the project. Describe the product, the team, and the overall goal you were trying to achieve. This should give readers context about the scope and importance of the project.]",
    challenge:
      "[Describe the main challenge or problem you were trying to solve. What was the pain point for users? What business problem needed addressing? Include any constraints or limitations you faced.]",
    solution:
      "[Explain your approach and the solution you developed. Discuss the product strategy, key decisions made, and how you worked with engineering and design teams. Include any innovative approaches or methodologies used.]",
    results: [
      "[Key result 1 - e.g., 40% increase in user engagement]",
      "[Key result 2 - e.g., 25% reduction in churn rate]",
      "[Key result 3 - e.g., $2M in additional revenue]",
      "[Key result 4 - e.g., 95% user satisfaction score]",
    ],
    technologies: ["Machine Learning", "Python", "TensorFlow", "AWS"],
  },
  {
    slug: "conversational-ai-platform",
    title: "Conversational AI Platform",
    description:
      "Designed and launched an enterprise chatbot platform that reduced support tickets by 60%.",
    category: "Product Strategy",
    duration: "[Duration]",
    role: "Senior Product Manager",
    overview:
      "[Provide a comprehensive overview of the project. Describe the product, the team, and the overall goal you were trying to achieve.]",
    challenge:
      "[Describe the main challenge or problem you were trying to solve. What was the pain point for users?]",
    solution:
      "[Explain your approach and the solution you developed. Discuss the product strategy and key decisions made.]",
    results: [
      "[Key result 1]",
      "[Key result 2]",
      "[Key result 3]",
      "[Key result 4]",
    ],
    technologies: ["NLP", "GPT", "Node.js", "React"],
  },
  {
    slug: "data-analytics-dashboard",
    title: "Predictive Analytics Dashboard",
    description:
      "Built a real-time analytics platform that empowered data-driven decision making across the organization.",
    category: "Data Products",
    duration: "[Duration]",
    role: "Product Manager",
    overview:
      "[Provide a comprehensive overview of the project. Describe the product, the team, and the overall goal you were trying to achieve.]",
    challenge:
      "[Describe the main challenge or problem you were trying to solve. What was the pain point for users?]",
    solution:
      "[Explain your approach and the solution you developed. Discuss the product strategy and key decisions made.]",
    results: [
      "[Key result 1]",
      "[Key result 2]",
      "[Key result 3]",
      "[Key result 4]",
    ],
    technologies: ["Data Visualization", "SQL", "Python", "Tableau"],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug);
}

export function getAllCaseStudySlugs(): string[] {
  return caseStudies.map((cs) => cs.slug);
}
