import Image from "next/image";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { CountUp } from "./CountUp";

const selectedProof = [
  "Architected and shipped agentic systems: Oak, Annie ACS, Agent RED",
  "Enterprise AI deployed to production for clients across healthcare, finance, and recruiting",
  "3 iOS applications published to the App Store",
  "Co-founded a game studio whose first title passed 500,000 downloads",
];

const stats = [
  { value: "7+", label: "Years experience" },
  { value: "15+", label: "Systems shipped" },
  { value: "500K+", label: "Users impacted" },
];

export function About() {
  return (
    <section id="about" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading index="01" label="About" title="About Me" />
        </Reveal>

        <div className="grid items-start gap-12 md:grid-cols-5">
          {/* Photo */}
          <Reveal className="md:col-span-2">
            <div className="aspect-square overflow-hidden rounded-lg border border-[var(--border)]">
              <Image
                src="/images/profile.jpg"
                alt="Gowtam Ramanujam"
                width={400}
                height={400}
                priority
                className="h-full w-full object-cover saturate-[0.88]"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="mono-label">Gowtam Ramanujam</span>
              <span className="mono-label">AI Architect</span>
            </div>
          </Reveal>

          {/* Bio Content */}
          <Reveal delay={80} className="md:col-span-3">
            <div className="space-y-5">
              <p className="max-w-[68ch] leading-[1.65] text-[var(--foreground)]">
                I&apos;m an AI Architect with 7+ years of experience designing,
                building, and shipping software systems. I specialize in
                architecting AI systems and autonomous agents: tool loops,
                multi-agent orchestration, model selection, and the integration
                patterns that turn LLM capabilities into reliable production
                software.
              </p>

              <p className="max-w-[68ch] leading-[1.65] text-[var(--muted)]">
                For clients, I translate business problems into technical
                blueprints: agent architectures, data flows, API contracts, and
                phased build plans with explicit tradeoffs. For teams hiring an
                architect, I bring the same rigor hands-on: I write the design
                docs, make the model and infrastructure decisions, and ship
                working systems, not just diagrams. Requirements discovery
                comes first, then deliberate architecture, then disciplined
                execution with AI-assisted engineering.
              </p>

              <div className="border-t border-[var(--border)] pt-6">
                <p className="mono-label mb-4">Selected proof</p>
                <ul className="space-y-3">
                  {selectedProof.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-relaxed text-[var(--muted)]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.65em] h-px w-3 flex-shrink-0 bg-[var(--accent)]"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Stat band */}
        <Reveal delay={120}>
          <div className="mt-16 grid grid-cols-1 divide-y divide-[var(--border)] border-y border-[var(--border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((stat) => (
              <div key={stat.label} className="py-8 sm:px-8 sm:first:pl-0">
                <CountUp
                  value={stat.value}
                  className="mono-stat block text-[2.5rem] leading-none"
                />
                <p className="mono-label mt-3">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
