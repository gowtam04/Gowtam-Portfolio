import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const skills = [
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
    title: "Production Delivery",
    description:
      "Shipping under real constraints: integrations, observability, cutovers, and systems that stay up after launch.",
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
  {
    title: "AI-assisted Engineering",
    description:
      "Using AI to move faster on implementation without skipping design rigor, reviews, or production standards.",
  },
];

export function Skills() {
  return (
    <section
      id="skills"
      className="scroll-mt-24 border-t border-[var(--border)] px-6 py-24"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            label="Capabilities"
            title="Where depth lives."
            lede="Not a laundry list of tools. The competencies that show up when systems have to work under real constraints."
          />
        </Reveal>

        <Reveal delay={60}>
          <div className="flex flex-wrap gap-2.5">
            {skills.map((skill, index) => (
              <span
                key={skill.title}
                title={skill.description}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2.5 text-[0.9rem] font-medium text-[var(--muted)] transition-colors duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--accent-subtle)] hover:text-[var(--foreground)]"
              >
                <span className="mr-1.5 font-bold text-[var(--accent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {skill.title}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
