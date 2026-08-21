import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { aboutContent, SITE_NAME, SITE_ROLE } from "@/lib/site-content";

export const metadata: Metadata = {
  title: `About | ${SITE_NAME}`,
  description:
    "About Gowtam Ramanujam, AI Architect designing intelligent systems and autonomous agents for production.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="px-6 pb-24 pt-28">
        <article className="mx-auto max-w-3xl">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
            {aboutContent.title}
          </p>
          <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-[var(--foreground)] sm:text-5xl">
            {aboutContent.headline}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
            {aboutContent.lede}
          </p>
          <p className="mt-3 text-sm font-medium text-[var(--faint)]">
            {SITE_NAME} · {SITE_ROLE}
          </p>

          <div className="mt-14 space-y-12">
            {aboutContent.sections.map((section) => (
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

          <p className="mt-14 border-t border-[var(--border)] pt-8 text-[0.95rem] leading-relaxed text-[var(--muted)]">
            Read the{" "}
            <Link
              href="/case-studies"
              className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              case studies
            </Link>{" "}
            or{" "}
            <Link
              href="/contact"
              className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              get in touch
            </Link>
            .
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
