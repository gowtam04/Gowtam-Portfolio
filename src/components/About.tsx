import Image from "next/image";

export function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-16 tracking-tight">
          About Me
        </h2>

        <div className="grid md:grid-cols-5 gap-12 items-start">
          {/* Photo */}
          <div className="md:col-span-2">
            <div className="aspect-square rounded-2xl bg-[var(--border)] flex items-center justify-center overflow-hidden">
              <Image
                src="/images/profile.jpg"
                alt="Gowtam Ramanujam"
                width={400}
                height={400}
                priority
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Bio Content */}
          <div className="md:col-span-3 space-y-6">
            <p className="text-lg text-[var(--foreground)] leading-relaxed">
              I&apos;m an AI Architect with 7+ years of experience designing, building, and shipping software systems. I specialize in architecting AI systems and autonomous agents: tool loops, multi-agent orchestration, model selection, and the integration patterns that turn LLM capabilities into reliable production software. My work spans enterprise AI automation, agentic web applications, mobile apps, healthcare systems, and game development.
            </p>

            <p className="text-lg text-[var(--muted)] leading-relaxed">
              For clients, I translate business problems into technical blueprints: agent architectures, data flows, API contracts, and phased build plans with explicit tradeoffs. For teams hiring an architect, I bring the same rigor hands-on: I write the design docs, make the model and infrastructure decisions, and ship working systems, not just diagrams. Requirements discovery comes first, then deliberate architecture, then disciplined execution with AI-assisted engineering.
            </p>

            <p className="text-lg text-[var(--muted)] leading-relaxed">
              I&apos;ve architected and shipped agentic systems like Oak and Agent RED, deployed enterprise AI tools for multiple clients, published 3 iOS applications to the App Store, and co-founded a game studio that released a title with 500,000+ downloads. I&apos;m focused on building AI systems that are trustworthy, observable, and production-ready.
            </p>

            {/* Optional: Quick Facts */}
            <div className="pt-6 border-t border-[var(--border)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-2xl font-bold text-[var(--accent)]">7+</p>
                  <p className="text-sm text-[var(--muted)]">Years Experience</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--accent)]">15+</p>
                  <p className="text-sm text-[var(--muted)]">Systems Shipped</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--accent)]">500K+</p>
                  <p className="text-sm text-[var(--muted)]">Users Impacted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
