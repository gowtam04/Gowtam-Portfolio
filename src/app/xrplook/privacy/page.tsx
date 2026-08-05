import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "XRPLook Privacy Policy",
  description:
    "Privacy Policy for XRPLook, a read-only XRP tracker for iPhone by Gowtam Ramanujam. On-device storage, no accounts, no analytics.",
  alternates: {
    canonical: "/xrplook/privacy",
  },
  openGraph: {
    title: "XRPLook Privacy Policy",
    description:
      "Privacy Policy for XRPLook. On-device storage, no accounts, no analytics.",
    url: "https://gowtam.ai/xrplook/privacy",
    siteName: "Gowtam Ramanujam Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XRPLook Privacy Policy",
    description:
      "Privacy Policy for XRPLook. On-device storage, no accounts, no analytics.",
  },
};

const LAST_UPDATED = "August 4, 2026";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="font-display text-xl font-medium tracking-[-0.01em] text-[var(--foreground)] sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-[0.95rem] leading-[1.65] text-[var(--muted)]">
        {children}
      </div>
    </section>
  );
}

export default function XrpLookPrivacyPage() {
  return (
    <article>
      <header>
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
          Legal
        </p>
        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-[var(--foreground)] sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm font-medium text-[var(--faint)]">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-[var(--muted)]">
          How XRPLook handles information. Short version: almost everything stays
          on your iPhone, and we do not run accounts or analytics.
        </p>
      </header>

      <div className="mt-14 space-y-12">
        <Section id="introduction" title="1. Introduction">
          <p>
            XRPLook is a read-only iOS app for tracking XRP ledger addresses. It
            is developed by Gowtam Ramanujam (gowtam.ai). This policy describes
            what the app does and does not do with information when you use it.
          </p>
        </Section>

        <Section id="effective-date" title="2. Effective date">
          <p>
            This policy is effective as of the last-updated date shown at the top
            of this page. When the policy changes, that date will be updated.
          </p>
        </Section>

        <Section id="not-collect" title="3. Information we do not collect">
          <p>XRPLook does not:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Create or require user accounts, or offer sign-in</li>
            <li>Sync your wallet list to a cloud service we operate</li>
            <li>
              Include first-party analytics, usage tracking, advertising, or
              crash-reporting SDKs in the product as shipped
            </li>
            <li>Sell advertising identifiers or personal data</li>
          </ul>
          <p>
            There is no XRPLook backend that stores your list of tracked wallets.
          </p>
        </Section>

        <Section id="on-device" title="4. Information stored on your device">
          <p>
            Data you choose to keep for the app lives on your iPhone, including:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Public wallet addresses you add for tracking</li>
            <li>Optional labels you assign to those addresses</li>
            <li>
              Preferences such as theme (light/dark) and fiat currency settings
            </li>
            <li>
              Cached balances, transaction history, and price data used for
              offline-friendly viewing
            </li>
          </ul>
          <p>
            This data stays on your device unless you copy or share it yourself
            (for example, sharing an address or a transaction link). Uninstalling
            the app removes the app&apos;s local data subject to how iOS manages
            app storage.
          </p>
        </Section>

        <Section id="network" title="5. Network requests">
          <p>
            When your device is online, XRPLook queries public XRP Ledger
            infrastructure (for example, public rippled JSON-RPC endpoints) and a
            public price feed (CoinGecko) to load balances, transactions, and
            prices. Those requests necessarily include the public addresses you
            chose to track, along with normal technical request metadata that any
            server may see (such as your IP address as observed by that provider).
          </p>
          <p>
            We do not operate an app backend that stores your wallet list. We do
            not authenticate you with those public services beyond ordinary public
            API use.
          </p>
        </Section>

        <Section id="camera" title="6. Camera">
          <p>
            The camera is used only to scan wallet-address QR codes when you add
            an address. It is not used to photograph or store photos for other
            purposes, and it is not used for profiling.
          </p>
        </Section>

        <Section id="third-parties" title="7. Third parties">
          <p>
            When the app contacts public XRPL infrastructure and a public price
            API (CoinGecko), those providers process the requests they receive
            under their own privacy practices. Review their policies if you want
            details on how they handle server logs and related data.
          </p>
          <p>
            XRPLook does not ship third-party SDKs whose purpose is analytics,
            advertising, or crash reporting.
          </p>
        </Section>

        <Section id="children" title="8. Children">
          <p>
            XRPLook is not directed at children under 13. We do not knowingly
            collect personal information from children under 13. If you believe a
            child has provided information through the app in a way that concerns
            you, contact us using the address below.
          </p>
        </Section>

        <Section id="retention" title="9. Data retention and deletion">
          <p>
            Because tracked wallets and labels live on your device, you control
            retention:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Remove individual wallets in the app to drop them from storage</li>
            <li>
              Uninstall XRPLook to remove the app and its local data from that
              device
            </li>
          </ul>
          <p>
            There is no cloud account to delete. If you switch devices, you add
            wallets again on the new device.
          </p>
        </Section>

        <Section id="changes" title="10. Changes to this policy">
          <p>
            This policy may be updated from time to time. When it changes, the
            last-updated date at the top of this page will change. Continued use
            of the app after an update means you accept the revised policy for
            future use.
          </p>
        </Section>

        <Section id="contact" title="11. Contact">
          <p>
            Questions about this policy or XRPLook privacy practices:{" "}
            <a
              href="mailto:gowtam@gowtam.ai"
              className="font-medium text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
            >
              gowtam@gowtam.ai
            </a>
            .
          </p>
          <p>
            For product help, see{" "}
            <Link
              href="/xrplook/support"
              className="font-medium text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
            >
              Support
            </Link>
            .
          </p>
        </Section>
      </div>

      <footer className="mt-14 border-t border-[var(--border)] pt-8">
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          <Link
            href="/xrplook"
            className="text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            XRPLook
          </Link>
          <Link
            href="/xrplook/support"
            className="text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            Support
          </Link>
        </div>
      </footer>
    </article>
  );
}
