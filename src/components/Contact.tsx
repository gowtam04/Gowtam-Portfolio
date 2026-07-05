import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const channels = [
  {
    label: "Email",
    value: "gowtam@gowtam.ai",
    href: "mailto:gowtam@gowtam.ai",
    external: false,
  },
  {
    label: "X",
    value: "x.com/gowtam",
    href: "https://x.com/gowtam",
    external: true,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/gowtam-ramanujam",
    href: "https://linkedin.com/in/gowtam-ramanujam",
    external: true,
  },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            index="05"
            label="Contact"
            title="Let's Connect"
            lede="Open to AI architecture engagements, full-time roles, or conversations about agentic systems and production AI."
          />
        </Reveal>

        <Reveal delay={60}>
          <p className="mono-label mb-8 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
            />
            Open to engagements and full-time roles
          </p>

          {/* Channels */}
          <div className="border-t border-[var(--border)]">
            {channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                {...(channel.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group grid grid-cols-[96px_1fr_auto] items-center gap-4 border-b border-[var(--border)] px-2 py-5 transition-colors duration-150 hover:bg-[var(--surface-1)] sm:grid-cols-[140px_1fr_auto]"
              >
                <span className="mono-label">{channel.label}</span>
                <span className="truncate text-sm font-medium text-[var(--foreground)]">
                  {channel.value}
                </span>
                <ArrowUpRight className="h-4 w-4 text-[var(--faint)] transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" />
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
