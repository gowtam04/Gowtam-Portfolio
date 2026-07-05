import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const skills = [
  {
    title: "AI System Architecture",
    description:
      "End-to-end system design: data flows, integrations, infrastructure, and model selection for production AI.",
  },
  {
    title: "Agentic AI Design",
    description:
      "Designing autonomous agents that reason, plan, and execute complex tasks with tool use and structured outputs.",
  },
  {
    title: "Multi-Agent Orchestration",
    description:
      "Coordinating specialized agents with routing, task delegation, and shared context across complex workflows.",
  },
  {
    title: "Requirements Discovery",
    description:
      "Stakeholder interviews, workflow mapping, and edge-case analysis to define what systems actually need to do.",
  },
  {
    title: "Technical Solution Design",
    description:
      "Technical blueprints, architecture tradeoffs, and phased build plans that turn requirements into shippable systems.",
  },
  {
    title: "Cross-functional Leadership",
    description:
      "Leading diverse teams of engineers, designers, and stakeholders to deliver results.",
  },
  {
    title: "Stakeholder Communication",
    description:
      "Translating technical decisions for executives, engineering teams, and clients with clarity and alignment.",
  },
];

export function Skills() {
  return (
    <section id="skills" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            index="04"
            label="Capabilities"
            title="Skills & Expertise"
            lede="Core competencies for designing and shipping AI systems and agents."
          />
        </Reveal>

        {/* Capabilities matrix */}
        <div className="grid border-t border-[var(--border)] md:grid-cols-2 md:gap-x-16">
          {skills.map((skill, index) => (
            <Reveal key={skill.title} delay={(index % 2) * 60}>
              <div className="group flex gap-5 border-b border-[var(--border)] py-6">
                <span className="mono-label w-7 flex-shrink-0 pt-1 transition-colors duration-150 group-hover:text-[var(--accent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[var(--foreground)]">
                    {skill.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                    {skill.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
