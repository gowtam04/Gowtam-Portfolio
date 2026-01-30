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
              Last updated: January 2025
            </p>
          </header>

          {/* Content */}
          <div className="space-y-10 text-[var(--foreground)]">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Overview</h2>
              <p className="leading-relaxed">
                Dexpert is an offline-first Pokemon reference application. Your
                privacy is important to us. This policy explains what data we
                collect (which is none) and how the app operates.
              </p>
            </section>

            {/* Data Collection */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Collection</h2>
              <p className="leading-relaxed">
                <strong>We do not collect any personal data.</strong> Dexpert
                does not require account creation, does not track your usage,
                and does not collect any information about you or your device.
                The app operates entirely on your device with no data
                transmitted to external servers.
              </p>
            </section>

            {/* Local Storage */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Local Storage</h2>
              <p className="leading-relaxed">
                Dexpert stores your preferences (such as your selected game
                version and favorite Pokemon) locally on your device using iOS
                standard storage mechanisms. This data never leaves your device
                and is not accessible to us or any third party.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Third-Party Services
              </h2>
              <p className="leading-relaxed">
                Dexpert does not integrate with any third-party analytics,
                advertising, or tracking services. We do not use any SDKs that
                collect user data.
              </p>
            </section>

            {/* Internet Connection */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Internet Connection
              </h2>
              <p className="leading-relaxed">
                Dexpert is designed to work entirely offline. All Pokemon data
                is bundled with the app. No internet connection is required for
                core functionality, and the app does not make network requests
                during normal use.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Children&apos;s Privacy
              </h2>
              <p className="leading-relaxed">
                Since we do not collect any personal information from any users,
                Dexpert is safe for users of all ages, including children under
                13.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Changes to This Policy
              </h2>
              <p className="leading-relaxed">
                If we make changes to this privacy policy, we will update the
                &quot;Last updated&quot; date at the top of this page. We
                encourage you to review this policy periodically.
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
                Dexpert is an independent fan project and is not affiliated
                with, endorsed by, or connected to Nintendo, The Pokemon
                Company, Game Freak, or any of their subsidiaries or affiliates.
                Pokemon and all related marks are trademarks of Nintendo.
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
