import Image from "next/image";
import { ArrowRight } from "lucide-react";

const proof = [
  { value: "7+", label: "Years shipping" },
  { value: "15+", label: "Systems in production" },
  { value: "500K+", label: "Users impacted" },
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-screen items-center px-6 pb-24 pt-28">
      {/* Soft atmospheric glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[10%] -z-10 h-[110%]"
        style={{ background: "var(--hero-glow)" }}
      />

      <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p
            className="hero-enter flex items-center gap-2.5 text-[0.8rem] font-semibold text-[var(--accent)]"
            style={{ animationDelay: "0ms" }}
          >
            <span
              aria-hidden="true"
              className="inline-block h-px w-6 bg-[var(--accent)]"
            />
            AI Architect · Production agent systems
          </p>

          <h1
            className="hero-enter font-display mt-6 text-[clamp(3.1rem,7.5vw,5.25rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[var(--foreground)]"
            style={{ animationDelay: "80ms" }}
          >
            Systems that
            <br />
            <em className="font-medium italic text-[var(--accent)]">
              think carefully
            </em>
            <br />
            and ship cleanly.
          </h1>

          <p
            className="hero-enter mt-6 max-w-[36rem] text-lg leading-[1.65] text-[var(--muted)]"
            style={{ animationDelay: "160ms" }}
          >
            I design and build AI systems and autonomous agents for teams that
            need reliability, not demos. Tool loops, multi-agent orchestration,
            and the integration patterns that turn model capability into
            software you can trust.
          </p>

          <div
            className="hero-enter mt-9 flex flex-wrap items-center gap-5"
            style={{ animationDelay: "240ms" }}
          >
            <a
              href="mailto:gowtam@gowtam.ai"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-foreground)] shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_24px_var(--accent-glow)] transition-colors duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.98]"
            >
              Start a conversation
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#case-studies"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 hover:text-[var(--accent)]"
            >
              See selected work
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </a>
          </div>

          <div
            className="hero-enter mt-11 flex flex-wrap gap-x-10 gap-y-5 border-t border-[var(--border)] pt-7"
            style={{ animationDelay: "320ms" }}
          >
            {proof.map((stat) => (
              <div key={stat.label}>
                <p className="mono-stat text-[1.75rem] leading-none">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[0.8rem] font-medium text-[var(--faint)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Portrait */}
        <div
          className="hero-enter relative mx-auto hidden w-full max-w-[400px] justify-self-center lg:block"
          style={{ animationDelay: "200ms" }}
        >
          <div
            aria-hidden="true"
            className="orbit-ring pointer-events-none absolute inset-[-8%] -z-10 rounded-full border border-dashed border-[color-mix(in_srgb,var(--accent)_35%,transparent)] opacity-55"
          >
            <span className="absolute top-[12%] right-[18%] h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_16px_var(--accent-glow)]" />
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius)+6px)] bg-[var(--surface-2)] shadow-[var(--shadow-overlay)]">
            <Image
              src="/images/profile.jpg"
              alt="Gowtam Ramanujam"
              width={800}
              height={799}
              priority
              className="h-full w-full object-cover object-[center_15%] saturate-[0.92] contrast-[1.02]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
