import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { TimelineSpine } from "./TimelineSpine";

const phases = [
  {
    index: "01",
    title: "Discover",
    description:
      "A requirements discovery agent runs a structured interview, probing users, workflows, business rules, and edge cases. The output is clear written requirements that reflect what you actually need, not what I guessed.",
    artifacts: ["requirements.md", "business-rules", "edge-cases"],
    gate: "Gate / Requirements approved",
  },
  {
    index: "02",
    title: "Design",
    description:
      "A solution architect agent turns requirements into a technical blueprint: data model, component interfaces, file-level ownership map, and a phased build plan. Consequential tradeoffs surface as explicit choices, not silent defaults.",
    artifacts: ["architecture.md", "ownership-map", "build-plan"],
    gate: "Gate / Blueprint approved",
  },
  {
    index: "03",
    title: "Develop",
    description:
      "A coordinated team of AI agents executes the blueprint with test-driven development. Test authors never see implementation, reviewers check tests before any code is written, and a fresh test runner verifies every phase before the next begins.",
    artifacts: ["tests-first", "review-gates", "verified-mvp"],
    gate: null,
  },
];

const principles = [
  "Architecture discipline first. Requirements before code, every time.",
  "Engineering rigor, not vibes. Tests before code. Reviews at every gate.",
  "Humans decide, agents execute. Tradeoffs surface as choices.",
  "Shipped in days, not months. The best of an engineering team, scaled to one operator.",
];

export function Process() {
  return (
    <section id="process" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            index="02"
            label="Process"
            title="Discover. Design. Develop."
            lede="A repeatable process for shipping AI systems, combining requirements discovery, deliberate architecture, and disciplined AI-driven engineering."
          />
        </Reveal>

        {/* Phase timeline */}
        <div className="relative">
          <TimelineSpine />

          {phases.map((phase, index) => (
            <Reveal key={phase.title} delay={index * 60}>
              <div className="relative pb-14 pl-12 sm:pl-16">
                {/* Phase node */}
                <span
                  aria-hidden="true"
                  className="absolute left-[7px] top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border border-[var(--border-strong)] bg-[var(--background)]"
                />

                <p className="mono-label">Phase {phase.index}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">
                  {phase.title}
                </h3>
                <p className="mt-3 max-w-[62ch] text-[0.9375rem] leading-relaxed text-[var(--muted)]">
                  {phase.description}
                </p>

                {/* Artifacts produced */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {phase.artifacts.map((artifact) => (
                    <span
                      key={artifact}
                      className="mono-meta rounded border border-[var(--border)] px-2.5 py-1 text-xs"
                    >
                      {artifact}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quality gate on the spine */}
              {phase.gate && (
                <div className="relative pb-14 pl-12 sm:pl-16">
                  <span
                    aria-hidden="true"
                    className="absolute left-[7px] top-1 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border border-[var(--accent)] bg-[var(--background)]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  </span>
                  <p className="mono-label text-[var(--accent)]">{phase.gate}</p>
                </div>
              )}
            </Reveal>
          ))}

          {/* Terminal node */}
          <Reveal>
            <div className="relative pl-12 sm:pl-16">
              <span
                aria-hidden="true"
                className="absolute left-[7px] top-1 h-4 w-4 -translate-x-1/2 rounded-full bg-[var(--accent)]"
              />
              <p className="mono-label text-[var(--foreground)]">
                Shipped / Verified MVP
              </p>
            </div>
          </Reveal>
        </div>

        {/* Why This Works */}
        <Reveal>
          <div className="mt-20 border-t border-[var(--border)] pt-10">
            <p className="mono-label mb-6">Why this works</p>
            <ul className="grid gap-x-12 gap-y-4 md:grid-cols-2">
              {principles.map((principle) => (
                <li
                  key={principle}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[var(--muted)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.65em] h-px w-3 flex-shrink-0 bg-[var(--accent)]"
                  />
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
