import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Someday Support",
  description:
    "Get help with Someday, the private family baby book. Sign-in, invites, roles, and how to reach us.",
  path: "/someday/support",
  images: [
    {
      url: "/someday/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Someday: a private family baby book for iPhone",
    },
  ],
});

const faqs: { question: string; answer: string }[] = [
  {
    question: "How do I sign in?",
    answer:
      "Enter your email. Someday sends a one-time code. There is no password.",
  },
  {
    question: "How many children can I make a book for?",
    answer:
      "This version is one book for one child. You can invite family into that book.",
  },
  {
    question: "What do Admin, Contributor, and Viewer mean?",
    answer:
      "Admin can invite people, change roles, and remove posts. Contributor can add photos, videos, milestones, and voice memos. Viewer can browse and cannot post.",
  },
  {
    question: "How do I invite grandparents?",
    answer:
      "Open the book, go to Invites, pick a role, and create a link. Copy, share, or let them scan the QR code. They sign in with their email and join.",
  },
  {
    question: "Why does Someday ask for camera, photos, or the microphone?",
    answer:
      "Camera and the photo library add pictures and videos to the book. The microphone records voice memos. Speech recognition transcribes those memos on your iPhone so family can read along. Audio is not sent to a third-party transcription service.",
  },
  {
    question: "Are there ads or in-app purchases?",
    answer: "No. Someday is free in this version. No ads, likes, or public profiles.",
  },
  {
    question: "I did not get the sign-in code.",
    answer:
      "Check spam for mail from someday@gowtam.ai. Request a new code. If it still does not arrive, email us with the address you used.",
  },
];

export default function SomedaySupportPage() {
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
          How to use Someday, the private book your family writes together.
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
            href="mailto:someday@gowtam.ai?subject=Someday%20support"
            className="font-medium text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            someday@gowtam.ai
          </a>
          . Include the app version if you can find it, and what you expected vs
          what happened.
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
            href="/someday/privacy"
            className="text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </article>
  );
}
