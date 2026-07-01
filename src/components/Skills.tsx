import {
  Brain,
  Users,
  Search,
  Map,
  MessageSquare,
  Bot,
  Network,
} from "lucide-react";

const skills = [
  {
    icon: Brain,
    title: "AI System Architecture",
    description:
      "End-to-end system design: data flows, integrations, infrastructure, and model selection for production AI.",
  },
  {
    icon: Bot,
    title: "Agentic AI Design",
    description:
      "Designing autonomous agents that reason, plan, and execute complex tasks with tool use and structured outputs.",
  },
  {
    icon: Network,
    title: "Multi-Agent Orchestration",
    description:
      "Coordinating specialized agents with routing, task delegation, and shared context across complex workflows.",
  },
  {
    icon: Users,
    title: "Cross-functional Leadership",
    description:
      "Leading diverse teams of engineers, designers, and stakeholders to deliver results.",
  },
  {
    icon: Search,
    title: "Requirements Discovery",
    description:
      "Stakeholder interviews, workflow mapping, and edge-case analysis to define what systems actually need to do.",
  },
  {
    icon: Map,
    title: "Technical Solution Design",
    description:
      "Technical blueprints, architecture tradeoffs, and phased build plans that turn requirements into shippable systems.",
  },
  {
    icon: MessageSquare,
    title: "Stakeholder Communication",
    description:
      "Translating technical decisions for executives, engineering teams, and clients with clarity and alignment.",
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
            Core competencies for designing and shipping AI systems and agents.
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