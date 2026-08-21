import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { privacyContent, SITE_EMAIL, SITE_NAME } from "@/lib/site-content";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description:
    "Privacy policy for the gowtam.ai portfolio site. Separate from product-specific policies such as XRPLook.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="px-6 pb-24 pt-28">
        <article className="mx-auto max-w-3xl">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
            Legal
          </p>
          <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-[var(--foreground)] sm:text-5xl">
            {privacyContent.headline}
          </h1>
          <p className="mt-4 text-sm font-medium text-[var(--faint)]">
            Last updated: {privacyContent.lastUpdated}
          </p>
          <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
            {privacyContent.lede}
          </p>

          <div className="mt-14 space-y-12">
            {privacyContent.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-xl font-medium tracking-[-0.01em] text-[var(--foreground)] sm:text-2xl">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-3 text-[0.95rem] leading-[1.65] text-[var(--muted)]">
                  {section.paragraphs.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-14 border-t border-[var(--border)] pt-8">
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="text-[var(--accent)] hover:text-[var(--accent-hover)]"
              >
                {SITE_EMAIL}
              </a>
              <Link
                href="/xrplook/privacy"
                className="text-[var(--accent)] hover:text-[var(--accent-hover)]"
              >
                XRPLook privacy
              </Link>
              <Link
                href="/contact"
                className="text-[var(--accent)] hover:text-[var(--accent-hover)]"
              >
                Contact
              </Link>
            </div>
          </footer>
        </article>
      </main>
      <Footer />
    </>
  );
}
