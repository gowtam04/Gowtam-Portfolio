import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "XRPLook Support",
  description:
    "Get help with XRPLook, the read-only XRP tracker for iPhone. FAQ, contact, and security guidance.",
  path: "/xrplook/support",
  images: [
    {
      url: "/xrplook/opengraph-image",
      width: 1200,
      height: 630,
      alt: "XRPLook: a private, read-only XRP tracker for iPhone",
    },
  ],
});

const faqs: { question: string; answer: string }[] = [
  {
    question: "Is this a wallet? Can I send XRP?",
    answer:
      "No. XRPLook is read-only. It never holds keys and cannot send or sign transactions.",
  },
  {
    question: "What do I need to get started?",
    answer:
      "A mainnet XRP classic address (r…) or a scannable address QR or X-address. Paste or scan it, then optionally add a label.",
  },
  {
    question: "Why won't my address add?",
    answer:
      "Only valid mainnet addresses are accepted. Testnet addresses are rejected. Check for typos. X-addresses are decoded to classic form for tracking.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "On your iPhone only. There is no XRPLook account or cloud backup of your wallet list.",
  },
  {
    question: 'Why does "Available" differ from my total balance?',
    answer:
      "The XRP Ledger locks a base reserve (and extra per owned objects). The app shows available vs reserved and explains reserves in-app.",
  },
  {
    question: "Do widgets update live?",
    answer:
      "Widgets refresh on iOS's schedule from a snapshot the app maintains. Open the app periodically so data stays fresh. Widgets show a last-updated cue.",
  },
  {
    question: "Does the app work offline?",
    answer:
      "Yes, with last-cached balances and history, plus a clear stale or offline indicator. New fetches need a network connection.",
  },
  {
    question: "Do you have analytics?",
    answer:
      "No first-party analytics or crash SDKs in the product as shipped.",
  },
  {
    question: "Is it free?",
    answer: "Yes. No in-app purchases or subscriptions.",
  },
  {
    question: "Something looks wrong with a price or old transaction fiat value?",
    answer:
      "Spot and historical prices come from a public market data provider and are informational only. They are not financial advice.",
  },
];

export default function XrpLookSupportPage() {
  return (
    <article>
      <header>
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
          Help
        </p>
        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-[var(--foreground)] sm:text-5xl">
          Support
        </h1>
        <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-[var(--muted)]">
          How to get help with XRPLook. Check the FAQ below, or email with a clear
          description of what you are seeing.
        </p>
      </header>

      <section
        className="mt-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-raised)] sm:p-8"
        aria-labelledby="contact-heading"
      >
        <h2
          id="contact-heading"
          className="font-display text-xl font-medium tracking-[-0.01em] text-[var(--foreground)]"
        >
          Contact
        </h2>
        <p className="mt-3 text-[0.95rem] leading-[1.65] text-[var(--muted)]">
          Email{" "}
          <a
            href="mailto:gowtam@gowtam.ai?subject=XRPLook%20support"
            className="font-medium text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            gowtam@gowtam.ai
          </a>
          . Include the app version if you can find it, and what you expected vs
          what happened.
        </p>
      </section>

      <section
        className="mt-6 rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-6 sm:p-8"
        aria-labelledby="security-heading"
      >
        <h2
          id="security-heading"
          className="font-display text-xl font-medium tracking-[-0.01em] text-[var(--foreground)]"
        >
          Security warning
        </h2>
        <p className="mt-3 text-[0.95rem] leading-[1.65] text-[var(--muted)]">
          Never email seed phrases, private keys, recovery phrases, or screenshots
          of secrets. XRPLook will never ask for them. The app is read-only and
          has no need for signing material. If someone claiming to be support asks
          for keys, it is not us.
        </p>
      </section>

      <section className="mt-14" aria-labelledby="faq-heading">
        <h2
          id="faq-heading"
          className="font-display text-xl font-medium tracking-[-0.01em] text-[var(--foreground)] sm:text-2xl"
        >
          FAQ
        </h2>
        <dl className="mt-8 space-y-8">
          {faqs.map((item) => (
            <div key={item.question}>
              <dt className="text-[0.95rem] font-semibold text-[var(--foreground)]">
                {item.question}
              </dt>
              <dd className="mt-2 text-[0.95rem] leading-[1.65] text-[var(--muted)]">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="mt-14 border-t border-[var(--border)] pt-8">
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          <Link
            href="/xrplook"
            className="text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            XRPLook
          </Link>
          <Link
            href="/xrplook/privacy"
            className="text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </article>
  );
}
