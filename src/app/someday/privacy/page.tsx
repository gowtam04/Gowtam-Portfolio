import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Someday Privacy Policy",
  description:
    "Privacy Policy for Someday, a private family baby book. Invite-only books, email sign-in, on-device voice transcripts.",
  alternates: {
    canonical: "/someday/privacy",
  },
  openGraph: {
    title: "Someday Privacy Policy",
    description:
      "How Someday handles family photos, voice memos, and invite-only books.",
    url: "https://gowtam.ai/someday/privacy",
    siteName: "Gowtam Ramanujam Portfolio",
    locale: "en_US",
    type: "website",
  },
};

const LAST_UPDATED = "September 2, 2026";

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

export default function SomedayPrivacyPage() {
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
          Someday is a private book for one child. Books are invite-only. There
          are no public profiles, followers, likes, or ads.
        </p>
      </header>

      <div className="mt-14 space-y-12">
        <Section id="introduction" title="1. Introduction">
          <p>
            Someday is an iOS app for a private family keepsake book. It is
            developed by Gowtam Ramanujam (gowtam.ai). This policy describes
            what information we process when you use Someday, and why.
          </p>
        </Section>

        <Section id="effective-date" title="2. Effective date">
          <p>
            This policy is effective as of the last-updated date shown at the
            top of this page. When the policy changes, that date will be
            updated.
          </p>
        </Section>

        <Section id="accounts" title="3. Accounts and sign-in">
          <p>
            You sign in with an email address. We send a one-time passcode to
            that address. There is no password. We store your email, the
            display name you choose, and session tokens so you can stay signed
            in on that device.
          </p>
        </Section>

        <Section id="books" title="4. What a book contains">
          <p>
            A book is created for one child. You may provide the child&apos;s
            name, birth date, and an optional photo. Members of that book can
            add:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Photos and short videos of moments and milestones</li>
            <li>Captions and freeform milestone titles</li>
            <li>Voice memos</li>
          </ul>
          <p>
            Every post shows the author&apos;s name. Books are invite-only.
            Only people you invite as Admin, Contributor, or Viewer can see
            that book. There is no public feed.
          </p>
        </Section>

        <Section id="permissions" title="5. Camera, photos, microphone, speech">
          <p>
            Someday uses the camera and your photo library so you can add
            pictures and videos to the book. The microphone records voice
            memos. On-device speech recognition transcribes those memos so
            family can read what was said. We do not send audio to a
            third-party transcription service. Audio stays on the device for
            transcription; the memo file itself is uploaded to the book so
            other members can play it.
          </p>
        </Section>

        <Section id="storage" title="6. Where data lives">
          <p>
            Account data, book membership, captions, and media files are stored
            on servers we operate (application hosting, a database, and object
            storage). Session tokens also live in the iPhone Keychain on your
            device.
          </p>
          <p>
            We do not sell this data. We do not use it for advertising. We do
            not ship first-party analytics, advertising, or crash-reporting
            SDKs in the app as shipped.
          </p>
        </Section>

        <Section id="invites" title="7. Invites">
          <p>
            An Admin can create an invite link or QR code for a role (Admin,
            Contributor, or Viewer). Anyone who opens a valid link and signs in
            can join that book with the chosen role. Admins can change roles,
            revoke invites, and remove posts.
          </p>
        </Section>

        <Section id="third-parties" title="8. Third parties">
          <p>
            We use an email provider to send sign-in codes. Hosting, database,
            and object-storage providers process the data needed to run the
            service (including IP addresses in ordinary server logs). Those
            providers act under their own practices for infrastructure logs.
          </p>
        </Section>

        <Section id="children" title="9. Children">
          <p>
            Someday is for adults (parents, grandparents, and relatives)
            writing a book <em>about</em> a child. It is not directed at
            children under 13 as users, and it is not a Made for Kids app. We
            do not knowingly create accounts for children under 13. Photos and
            stories in a book may depict a child because that is the subject of
            the keepsake. Access is limited to invited family.
          </p>
        </Section>

        <Section id="retention" title="10. Retention and deletion">
          <p>
            We keep book content while the book exists so the family can open
            it later. Admins can remove posts. If you want an account or a book
            deleted, email us using the address below and we will delete the
            data we hold for that request.
          </p>
        </Section>

        <Section id="changes" title="11. Changes">
          <p>
            This policy may be updated from time to time. When it changes, the
            last-updated date at the top of this page will change. Continued
            use of Someday after an update means you accept the revised policy
            for future use.
          </p>
        </Section>

        <Section id="contact" title="12. Contact">
          <p>
            Questions about this policy or Someday privacy practices:{" "}
            <a
              href="mailto:someday@gowtam.ai"
              className="font-medium text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
            >
              someday@gowtam.ai
            </a>
            .
          </p>
          <p>
            For product help, see{" "}
            <Link
              href="/someday/support"
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
            href="/someday/support"
            className="text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            Support
          </Link>
          <Link
            href="/privacy"
            className="text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            Site privacy
          </Link>
        </div>
      </footer>
    </article>
  );
}
