import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DEAD CENTER Support",
  description:
    "Get help with DEAD CENTER, the one-thumb iPhone arcade. How to play, mute, haptics, and how to reach us.",
  alternates: {
    canonical: "/dead-center/support",
  },
  openGraph: {
    title: "DEAD CENTER Support",
    description:
      "Help with DEAD CENTER: how to play, mute, haptics, and contact.",
    url: "https://gowtam.ai/dead-center/support",
    siteName: "Gowtam Ramanujam Portfolio",
    locale: "en_US",
    type: "website",
  },
};

const faqs: { question: string; answer: string }[] = [
  {
    question: "How do I play?",
    answer:
      "Tap to start. Drag anywhere to move. There is no fire button: the gun auto-fires through the dead center of the ring. Step off that line or the pin comes home and kills you. Hunt teal beads with the same line for +100 each.",
  },
  {
    question: "Why did I die on the first shot?",
    answer:
      "That is the lesson. Stand still and the returning pin hits you. On the next run, step aside. The hot pin misses, dies on the near wall, and you start hunting beads.",
  },
  {
    question: "How do I mute sound or turn off haptics?",
    answer:
      "On the title or game-over screen, open Settings (gear). Toggle Mute and Haptics. The iPhone Silent switch also mutes sound. Reduce Motion follows the system setting.",
  },
  {
    question: "Where is my best score stored?",
    answer:
      "On this iPhone only. There is no account and no iCloud leaderboard in this version.",
  },
  {
    question: "Is there a pause button?",
    answer:
      "Not during a run. Phone calls and Control Center freeze the room and resume in place; they do not kill you.",
  },
  {
    question: "Are there ads or in-app purchases?",
    answer: "No. DEAD CENTER is free. Nothing to buy.",
  },
  {
    question: "Does it run on iPad?",
    answer:
      "This version is iPhone only, portrait, one thumb.",
  },
  {
    question: "Who made the original idea?",
    answer:
      "Inspired by mors' dead_center for PICO-1K Jam 2026. This is an independent game: same public rule, not a port of the 1024-byte cart.",
  },
];

export default function DeadCenterSupportPage() {
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
          How to get help with DEAD CENTER. Check the FAQ below, or email with
          what you expected vs what happened.
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
            href="mailto:gowtam@gowtam.ai?subject=DEAD%20CENTER%20support"
            className="font-medium text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            gowtam@gowtam.ai
          </a>
          . Include the app version if you can find it.
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
            href="/dead-center/privacy"
            className="text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </article>
  );
}
