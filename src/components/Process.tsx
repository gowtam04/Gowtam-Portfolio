import Image from "next/image";
import {
  MessageCircleQuestion,
  Compass,
  Code2,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageCircleQuestion,
    title: "Discover",
    description:
      "A product analyst agent runs a structured requirements interview, probing users, workflows, business rules, and edge cases. The output is clear written requirements that reflect what you actually need, not what I guessed.",
  },
  {
    number: "02",
    icon: Compass,
    title: "Design",
    description:
      "A solution architect agent turns requirements into a technical blueprint: data model, component interfaces, file-level ownership map, and a phased build plan. Consequential tradeoffs surface as explicit choices, not silent defaults.",
  },
  {
    number: "03",
    icon: Code2,
    title: "Develop",
    description:
      "A coordinated team of AI agents executes the blueprint with test-driven development. Test authors never see implementation, reviewers check tests before any code is written, and a fresh test runner verifies every phase before the next begins.",
  },
];

const principles = [
  "Product discipline first. Requirements before code, every time.",
  "Engineering rigor, not vibes. Tests before code. Reviews at every gate.",
  "Humans decide, agents execute. Tradeoffs surface as choices.",
  "Shipped in days, not months. The best of an engineering team, scaled to one operator.",
];

export function Process() {
  return (
    <section id="process" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 tracking-tight">
            Discover. Design. Develop.
          </h2>
          <p className="text-lg text-[var(--muted)] max-w-2xl">
            A repeatable process for shipping products with AI, combining product discovery, deliberate technical design, and disciplined AI-driven engineering.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.title}
              className="group p-6 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--accent)]/20 transition-colors">
                <step.icon className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div className="text-xs font-medium text-[var(--accent)] tracking-wider uppercase mb-2">
                Step {step.number}
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                {step.title}
              </h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Process Flow Diagram (theme-aware) */}
        <div className="mt-16 flex justify-center">
          <Image
            src="/images/process-flow-4.png"
            alt="Discover, Design, Develop process flow"
            width={2240}
            height={1260}
            className="w-full h-auto rounded-xl border border-[var(--border)] block dark:hidden"
          />
          <Image
            src="/images/process-flow.png"
            alt="Discover, Design, Develop process flow"
            width={2240}
            height={1260}
            className="w-full h-auto rounded-xl border border-[var(--border)] hidden dark:block"
          />
        </div>

        {/* Why This Works */}
        <div className="mt-16">
          <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-6">
            Why this works
          </h3>
          <ul className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
            {principles.map((principle) => (
              <li
                key={principle}
                className="flex items-start gap-3 text-sm text-[var(--muted)] leading-relaxed"
              >
                <CheckCircle2 className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                <span>{principle}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
