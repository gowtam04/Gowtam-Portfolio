interface SectionHeadingProps {
  /** Kept for call-site back-compat; not rendered in Midnight Current */
  index?: string;
  label: string;
  title: string;
  lede?: string;
  /** Heading level: h2 inside a page, h1 when it is the page title. */
  as?: "h1" | "h2";
}

export function SectionHeading({ label, title, lede, as: Heading = "h2" }: SectionHeadingProps) {
  return (
    <div className="mb-12 max-w-[36rem]">
      <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
        {label}
      </p>
      <Heading className="font-display text-[clamp(2rem,3.5vw,2.65rem)] font-medium leading-[1.15] tracking-[-0.025em] text-[var(--foreground)]">
        {title}
      </Heading>
      {lede && (
        <p className="mt-3.5 text-[1.05rem] leading-[1.65] text-[var(--muted)]">
          {lede}
        </p>
      )}
    </div>
  );
}
