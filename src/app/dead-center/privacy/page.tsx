import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DEAD CENTER Privacy Policy",
  description:
    "Privacy Policy for DEAD CENTER, a one-thumb iPhone arcade. Best score and settings stay on the device. No accounts, no analytics.",
  alternates: {
    canonical: "/dead-center/privacy",
  },
  openGraph: {
    title: "DEAD CENTER Privacy Policy",
    description:
      "How DEAD CENTER handles information. Best score and settings stay on your iPhone.",
    url: "https://gowtam.ai/dead-center/privacy",
    siteName: "Gowtam Ramanujam Portfolio",
    locale: "en_US",
    type: "website",
  },
};

const LAST_UPDATED = "September 4, 2026";

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

export default function DeadCenterPrivacyPage() {
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
          DEAD CENTER is a one-thumb iPhone arcade. Short version: your best
          score and mute/haptics settings stay on the phone. There is no
          account.
        </p>
      </header>

      <div className="mt-14 space-y-12">
        <Section id="introduction" title="1. Introduction">
          <p>
            DEAD CENTER is a native iPhone arcade game. It is developed by
            Gowtam Ramanujam (gowtam.ai). This policy describes what the app
            does and does not do with information when you use it.
          </p>
        </Section>

        <Section id="effective-date" title="2. Effective date">
          <p>
            This policy is effective as of the last-updated date shown at the
            top of this page. When the policy changes, that date will be
            updated.
          </p>
        </Section>

        <Section id="not-collect" title="3. Information we do not collect">
          <p>DEAD CENTER does not:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Create or require user accounts, or offer sign-in</li>
            <li>Sync scores to a cloud service we operate</li>
            <li>
              Include first-party analytics, usage tracking, advertising, or
              crash-reporting SDKs in the product as shipped
            </li>
            <li>Sell advertising identifiers or personal data</li>
            <li>Access the camera, microphone, location, contacts, or photos</li>
          </ul>
          <p>
            There is no DEAD CENTER backend that stores your runs or best
            score.
          </p>
        </Section>

        <Section id="on-device" title="4. Information stored on your device">
          <p>
            Data the app keeps lives on your iPhone, using Apple&apos;s
            UserDefaults:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Your local best score</li>
            <li>Mute and haptics on/off</li>
          </ul>
          <p>
            Reduce Motion follows the iPhone system setting. Uninstalling the
            app removes this local data subject to how iOS manages app storage.
          </p>
        </Section>

        <Section id="network" title="5. Network requests">
          <p>
            Play does not require a network connection. The app does not call a
            game server. Ordinary App Store updates and iOS itself may still
            contact Apple.
          </p>
        </Section>

        <Section id="third-parties" title="6. Third parties">
          <p>
            DEAD CENTER does not ship third-party SDKs whose purpose is
            analytics, advertising, or crash reporting.
          </p>
        </Section>

        <Section id="children" title="7. Children">
          <p>
            DEAD CENTER is an abstract arcade (age rating 4+). It is not a Made
            for Kids app. We do not knowingly collect personal information from
            children. There is no account to create.
          </p>
        </Section>

        <Section id="retention" title="8. Data retention and deletion">
          <p>
            Because the best score and settings live on your device, you control
            retention. Uninstall DEAD CENTER to remove the app and its local
            data from that device. There is no cloud account to delete.
          </p>
        </Section>

        <Section id="changes" title="9. Changes to this policy">
          <p>
            This policy may be updated from time to time. When it changes, the
            last-updated date at the top of this page will change. Continued use
            of the app after an update means you accept the revised policy for
            future use.
          </p>
        </Section>

        <Section id="contact" title="10. Contact">
          <p>
            Questions about this policy or DEAD CENTER privacy practices:{" "}
            <a
              href="mailto:gowtam@gowtam.ai?subject=DEAD%20CENTER%20privacy"
              className="font-medium text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
            >
              gowtam@gowtam.ai
            </a>
            .
          </p>
          <p>
            For product help, see{" "}
            <Link
              href="/dead-center/support"
              className="font-medium text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
            >
              Support
            </Link>
            .
          </p>
        </Section>
      </div>
    </article>
  );
}
