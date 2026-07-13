import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { CountUp } from "./CountUp";

const selectedProof = [
  "Architected and shipped agentic systems: Oak and Annie ACS",
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
    <section
      id="about"
      className="scroll-mt-24 border-t border-[var(--border)] px-6 py-24"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            label="About"
            title="An architect who still writes the hard parts."
            lede="Blueprints that survive contact with production. Hands-on when it matters. Clear about tradeoffs either way."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          <Reveal>
            <div className="h-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)] p-7 shadow-[var(--shadow-raised)]">
              <h3 className="font-display text-[1.35rem] font-medium tracking-[-0.02em] text-[var(--foreground)]">
                How I work with clients
              </h3>
              <p className="mt-4 text-[0.975rem] leading-[1.7] text-[var(--muted)]">
                I translate business problems into technical blueprints: agent
                architectures, data flows, API contracts, and phased build plans
                with explicit tradeoffs.
              </p>
              <p className="mt-4 text-[0.975rem] leading-[1.7] text-[var(--muted)]">
                Requirements discovery comes first, then deliberate architecture,
                then disciplined execution with AI-assisted engineering. Working
                systems, not just diagrams.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="h-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)] p-7 shadow-[var(--shadow-raised)]">
              <h3 className="font-display text-[1.35rem] font-medium tracking-[-0.02em] text-[var(--foreground)]">
                What I bring into a team
              </h3>
              <p className="mt-4 text-[0.975rem] leading-[1.7] text-[var(--muted)]">
                The same rigor, hands-on: design docs, model and infrastructure
                decisions, and shipping. I specialize in tool loops, multi-agent
                orchestration, model selection, and the integration patterns that
                make LLMs reliable software.
              </p>
              <ul className="mt-6 space-y-3.5 border-t border-[var(--border)] pt-6">
                {selectedProof.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[0.925rem] leading-relaxed text-[var(--muted)]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_var(--accent-subtle)]"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--border)] pt-10 sm:gap-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <CountUp
                  value={stat.value}
                  className="mono-stat block text-[2.25rem] leading-none sm:text-[2.5rem]"
                />
                <p className="mt-2.5 text-[0.8rem] font-medium text-[var(--faint)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
