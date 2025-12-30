import {
  Target,
  Brain,
  Users,
  Search,
  Map,
  MessageSquare,
  Bot,
} from "lucide-react";

const skills = [
  {
    icon: Target,
    title: "Product Strategy",
    description:
      "Defining product vision and roadmaps that align with business goals and user needs.",
  },
  {
    icon: Brain,
    title: "AI/ML Product Development",
    description:
      "Building intelligent products powered by machine learning and artificial intelligence.",
  },
  {
    icon: Bot,
    title: "Agentic AI Design",
    description:
      "Designing autonomous AI systems that reason, plan, and execute complex tasks with minimal human intervention.",
  },
  {
    icon: Users,
    title: "Cross-functional Leadership",
    description:
      "Leading diverse teams of engineers, designers, and stakeholders to deliver results.",
  },
  {
    icon: Search,
    title: "User Research & Validation",
    description:
      "Conducting discovery research and validating solutions with real users.",
  },
  {
    icon: Map,
    title: "Roadmap Planning",
    description:
      "Prioritizing features and creating actionable roadmaps that drive impact.",
  },
  {
    icon: MessageSquare,
    title: "Stakeholder Management",
    description:
      "Communicating effectively with executives and aligning diverse perspectives.",
  },
];

export function Skills() {
  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 tracking-tight">
            Skills & Expertise
          </h2>
          <p className="text-lg text-[var(--muted)] max-w-2xl">
            Core competencies developed through years of building and shipping AI-powered products.
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <div
              key={skill.title}
              className="group p-6 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--accent)]/20 transition-colors">
                <skill.icon className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                {skill.title}
              </h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed">
                {skill.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
