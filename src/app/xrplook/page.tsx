import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "XRPLook - Read-only XRP tracker for iPhone",
  description:
    "A private, read-only XRP tracker for iPhone. Watch balances and history without ever entering a key. No accounts, free, on-device only.",
  alternates: {
    canonical: "/xrplook",
  },
  openGraph: {
    title: "XRPLook - Read-only XRP tracker for iPhone",
    description:
      "A private, read-only XRP tracker for iPhone. Watch balances and history without ever entering a key.",
    url: "https://gowtam.ai/xrplook",
    siteName: "Gowtam Ramanujam Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XRPLook - Read-only XRP tracker for iPhone",
    description:
      "A private, read-only XRP tracker for iPhone. Watch balances and history without ever entering a key.",
  },
};

const benefits = [
  "Track multiple XRP addresses with optional labels",
  "See portfolio total across wallets, with 24h change cues",
  "Balance, local fiat value, and available vs reserved (ledger reserves)",
  "XRP price chart for 24h, 7d, 30d, and 1y",
  "Full lifetime transaction history with filters and fiat value at time of tx",
  "Home Screen and Lock Screen widgets for portfolio, wallet, and price",
];

export default function XrpLookPage() {
  return (
    <article>
      <header>
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
          iPhone app
        </p>
        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-[var(--foreground)] sm:text-5xl">
          XRPLook
        </h1>
        <p className="mt-4 max-w-[42ch] text-lg leading-relaxed text-[var(--muted)]">
          A private, read-only XRP tracker. Watch balances and history without
          ever entering a key.
        </p>
        <p className="mt-3 text-sm font-medium text-[var(--faint)]">
          Watch without private keys.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-sm font-medium text-[var(--muted)] shadow-[var(--shadow-raised)]">
            Coming to the App Store
          </span>
          <span className="text-sm font-medium text-[var(--faint)]">
            Free. No in-app purchases.
          </span>
        </div>
      </header>

      <section className="mt-12" aria-labelledby="benefits-heading">
        <h2
          id="benefits-heading"
          className="font-display text-xl font-medium tracking-[-0.01em] text-[var(--foreground)] sm:text-2xl"
        >
          What you get
        </h2>
        <ul className="mt-6 space-y-3">
          {benefits.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-[var(--muted)]"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_var(--accent-subtle)]"
              />
              <span className="leading-[1.65]">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm leading-relaxed text-[var(--faint)]">
          Also: QR scan and X-address support when adding wallets, copy and share
          for addresses and transaction links, offline-friendly cached data with
          freshness cues, light and dark themes, and fiat that can follow your
          device locale or be overridden.
        </p>
      </section>

      <section
        className="mt-12 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-raised)] sm:p-8"
        aria-labelledby="trust-heading"
      >
        <h2
          id="trust-heading"
          className="font-display text-xl font-medium tracking-[-0.01em] text-[var(--foreground)]"
        >
          Read-only by design
        </h2>
        <div className="mt-4 space-y-3 text-[0.95rem] leading-[1.65] text-[var(--muted)]">
          <p>
            XRPLook is a watcher, not a signing wallet. Paste or scan public XRPL
            addresses you already hold elsewhere (exchange, hardware wallet, cold
            storage).
          </p>
          <p>
            It never asks for private keys, seed phrases, or signing material. It
            cannot send, receive, or sign transactions.
          </p>
          <p>
            No sign-in. No cloud sync. No user accounts. Tracked addresses and
            optional labels stay on your iPhone. Uninstall or switch devices, and
            you re-add wallets.
          </p>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="for-heading">
        <h2
          id="for-heading"
          className="font-display text-xl font-medium tracking-[-0.01em] text-[var(--foreground)] sm:text-2xl"
        >
          Who it&apos;s for
        </h2>
        <p className="mt-4 max-w-[58ch] leading-[1.65] text-[var(--muted)]">
          XRP holders who custody elsewhere and want a calm, native iPhone glance
          at balances, history, and price. XRP only. No other chains, issued
          tokens, NFTs, DEX, tax export, or push notifications in the current
          product.
        </p>
      </section>

      <section className="mt-12 border-t border-[var(--border)] pt-8">
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          <Link
            href="/xrplook/privacy"
            className="text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            Privacy Policy
          </Link>
          <Link
            href="/xrplook/support"
            className="text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            Support
          </Link>
        </div>
        <p className="mt-6 max-w-[58ch] text-sm leading-relaxed text-[var(--faint)]">
          Fiat values are informational only. They are not financial, tax, or
          investment advice. iPhone, iOS 17+.
        </p>
      </section>
    </article>
  );
}
