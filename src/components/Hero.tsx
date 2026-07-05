import { ArrowRight } from "lucide-react";
import { HeroSchematic } from "./HeroSchematic";

const proof = [
  { value: "7+", label: "Years" },
  { value: "15+", label: "Systems shipped" },
  { value: "500K+", label: "Users" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center px-6 pb-24 pt-24">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-16 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p
            className="hero-enter mono-label flex items-center gap-3"
            style={{ animationDelay: "0ms" }}
          >
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
            />
            AI Architect / Production Agent Systems
          </p>

          <h1
            className="hero-enter mt-8 text-[clamp(3rem,8vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--foreground)]"
            style={{ animationDelay: "80ms" }}
          >
            Gowtam
            <br />
            Ramanujam
          </h1>

          <p
            className="hero-enter mt-8 max-w-[52ch] text-lg leading-relaxed text-[var(--muted)]"
            style={{ animationDelay: "160ms" }}
          >
            I design and ship AI systems and autonomous agents: tool loops,
            multi-agent orchestration, and the integration patterns that turn
            LLM capabilities into reliable production software.
          </p>

          <div
            className="hero-enter mt-10 flex divide-x divide-[var(--border)]"
            style={{ animationDelay: "240ms" }}
          >
            {proof.map((stat) => (
              <div key={stat.label} className="pr-8 pl-8 first:pl-0">
                <p className="mono-stat text-2xl">{stat.value}</p>
                <p className="mono-label mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div
            className="hero-enter mt-10 flex flex-wrap items-center gap-6"
            style={{ animationDelay: "320ms" }}
          >
            <a
              href="mailto:gowtam@gowtam.ai"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-medium text-[var(--accent-foreground)] transition-colors duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.98]"
            >
              Email me
            </a>
            <a
              href="#case-studies"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)] transition-colors duration-150 hover:text-[var(--accent)]"
            >
              View case studies
              <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <div
          className="hero-enter hidden lg:block"
          style={{ animationDelay: "400ms" }}
        >
          <HeroSchematic />
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#about"
        aria-label="Scroll to About section"
        className="hero-enter absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        style={{ animationDelay: "600ms" }}
      >
        <span className="mono-label text-[10px]">Scroll</span>
        <span aria-hidden="true" className="h-10 w-px bg-[var(--border-strong)]" />
      </a>
    </section>
  );
}
