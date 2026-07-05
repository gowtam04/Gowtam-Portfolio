interface SectionHeadingProps {
  index: string;
  label: string;
  title: string;
  lede?: string;
}

export function SectionHeading({ index, label, title, lede }: SectionHeadingProps) {
  return (
    <div className="mb-14">
      <div className="mb-6 flex items-center gap-4">
        <span className="mono-label">
          {index} / {label}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-[var(--border)]" />
      </div>
      <h2 className="text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--foreground)] sm:text-[2rem]">
        {title}
      </h2>
      {lede && (
        <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-[var(--muted)]">
          {lede}
        </p>
      )}
    </div>
  );
}
