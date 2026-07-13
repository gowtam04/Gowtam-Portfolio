import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";

const channels = [
  {
    label: "Email",
    value: "gowtam@gowtam.ai",
    href: "mailto:gowtam@gowtam.ai",
    external: false,
  },
  {
    label: "LinkedIn",
    value: "gowtam-ramanujam",
    href: "https://linkedin.com/in/gowtam-ramanujam",
    external: true,
  },
  {
    label: "X",
    value: "@gowtam",
    href: "https://x.com/gowtam",
    external: true,
  },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 px-6 pb-28 pt-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[calc(var(--radius)+6px)] border border-[var(--border)] bg-[var(--surface-1)] p-8 shadow-[var(--shadow-raised)] sm:p-10 md:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_90%_at_100%_0%,var(--accent-subtle),transparent_55%)]"
            />

            <div className="relative grid gap-10 md:grid-cols-[1.3fr_0.9fr] md:items-center">
              <div>
                <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                  Contact
                </p>
                <h2 className="font-display text-[clamp(2rem,3.5vw,2.75rem)] font-medium leading-[1.12] tracking-[-0.03em] text-[var(--foreground)]">
                  Let&apos;s build something that holds up in production.
                </h2>
                <p className="mt-4 max-w-[38ch] leading-[1.65] text-[var(--muted)]">
                  Open to architecture engagements, full-time roles, and
                  conversations about agentic systems that need to be reliable.
                </p>
                <a
                  href="mailto:gowtam@gowtam.ai"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-foreground)] shadow-[0_8px_24px_var(--accent-glow)] transition-colors duration-150 hover:bg-[var(--accent-hover)] active:scale-[0.98]"
                >
                  Email me
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="grid gap-2.5">
                {channels.map((channel) => (
                  <a
                    key={channel.label}
                    href={channel.href}
                    {...(channel.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group flex items-center justify-between gap-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-4 transition-all duration-150 hover:translate-x-0.5 hover:border-[var(--border-strong)]"
                  >
                    <div>
                      <p className="text-[0.72rem] font-bold uppercase tracking-[0.05em] text-[var(--faint)]">
                        {channel.label}
                      </p>
                      <p className="mt-0.5 text-[0.95rem] font-medium text-[var(--foreground)]">
                        {channel.value}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-[var(--faint)] transition-colors duration-150 group-hover:text-[var(--accent)]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
