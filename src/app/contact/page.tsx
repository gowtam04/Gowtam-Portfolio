import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { contactContent, SITE_NAME } from "@/lib/site-content";

export const metadata: Metadata = {
  title: `Contact | ${SITE_NAME}`,
  description:
    "Contact Gowtam Ramanujam for AI architecture engagements, agentic systems work, and full-time conversations.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="px-6 pb-24 pt-28">
        <article className="mx-auto max-w-3xl">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
            {contactContent.title}
          </p>
          <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-[var(--foreground)] sm:text-5xl">
            {contactContent.headline}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
            {contactContent.lede}
          </p>

          <div className="mt-10 grid gap-2.5">
            {contactContent.channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                {...(channel.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group flex items-center justify-between gap-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-4 transition-all duration-150 hover:border-[var(--border-strong)]"
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

          <div className="mt-14 space-y-12">
            {contactContent.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-xl font-medium tracking-[-0.01em] text-[var(--foreground)] sm:text-2xl">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-3 text-[0.95rem] leading-[1.65] text-[var(--muted)]">
                  {section.paragraphs.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                  {"bullets" in section && section.bullets ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
