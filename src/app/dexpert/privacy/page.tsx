import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Dexpert",
  description:
    "Privacy policy for Dexpert, the offline-first Pokemon reference app. We collect zero user data.",
  alternates: {
    canonical: "/dexpert/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Dexpert",
    description:
      "Privacy policy for Dexpert, the offline-first Pokemon reference app. We collect zero user data.",
    url: "https://gowtam.ai/dexpert/privacy",
    siteName: "Gowtam Ramanujam Portfolio",
    locale: "en_US",
    type: "website",
  },
};

export default function DexpertPrivacyPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-6">
        <article className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href="/case-studies/dexpert"
            className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dexpert</span>
          </Link>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6 tracking-tight leading-tight">
              Dexpert Privacy Policy
            </h1>
            <p className="text-lg text-[var(--muted)] leading-relaxed">
              Last updated: January 29, 2025
            </p>
          </header>

          {/* Content */}
          <div className="space-y-10 text-[var(--foreground)]">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Overview</h2>
              <p className="leading-relaxed">
                Dexpert is a creature reference application that operates
                entirely offline. Your privacy is important to us, and
                we&apos;ve designed the app to respect it completely.
              </p>
            </section>

            {/* Data Collection */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Collection</h2>
              <p className="leading-relaxed mb-4">
                <strong>
                  Dexpert does not collect, store, or transmit any personal
                  data.
                </strong>
              </p>
              <p className="leading-relaxed mb-2">
                Specifically, we do not collect:
              </p>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>Personal information</li>
                <li>Location data</li>
                <li>Device identifiers</li>
                <li>Usage analytics</li>
                <li>Crash reports</li>
                <li>Any other user data</li>
              </ul>
            </section>

            {/* Local Storage */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Local Storage</h2>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>Saved teams stored only on device</li>
                <li>App preferences stored only on device</li>
                <li>No data synced to external servers</li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Third-Party Services
              </h2>
              <p className="leading-relaxed mb-2">
                Dexpert does not integrate with any:
              </p>
              <ul className="list-disc list-inside space-y-1 leading-relaxed">
                <li>Analytics platforms</li>
                <li>Advertising networks</li>
                <li>Crash reporting services</li>
                <li>Social media integrations</li>
              </ul>
            </section>

            {/* Internet Connection */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Internet Connection
              </h2>
              <p className="leading-relaxed">
                Dexpert does not require an internet connection to function.
                The app includes all necessary data bundled within the
                application.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Children&apos;s Privacy
              </h2>
              <p className="leading-relaxed">
                Dexpert does not collect personal information from anyone,
                including children under the age of 13. The app is safe for
                users of all ages.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Changes to This Policy
              </h2>
              <p className="leading-relaxed">
                If we update this privacy policy, we will post the new policy
                on this page and update the &quot;Last updated&quot; date
                above.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact</h2>
              <p className="leading-relaxed">
                If you have any questions about this privacy policy, please
                contact us at{" "}
                <a
                  href="mailto:gowtam@gowtam.ai"
                  className="text-[var(--accent)] hover:underline"
                >
                  gowtam@gowtam.ai
                </a>
                .
              </p>
            </section>

            {/* Disclaimer */}
            <section className="pt-8 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Dexpert is an independent application. All creature data is
                sourced from publicly available APIs.
              </p>
            </section>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-[var(--border)]">
            <Link
              href="/case-studies/dexpert"
              className="inline-flex items-center gap-2 text-[var(--accent)] hover:gap-3 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dexpert Case Study</span>
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
