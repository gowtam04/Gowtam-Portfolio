import type { CaseStudySection } from "@/lib/case-studies";

interface CaseStudyBodyProps {
  content: CaseStudySection;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-start gap-3 text-[var(--muted)]"
        >
          <span
            aria-hidden="true"
            className="mt-[0.7em] h-px w-3 flex-shrink-0 bg-[var(--accent)]"
          />
          <span className="leading-[1.65]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CaseStudyBody({ content }: CaseStudyBodyProps) {
  if (typeof content === "string") {
    return (
      <p className="max-w-[68ch] leading-[1.65] text-[var(--muted)]">{content}</p>
    );
  }

  return (
    <div className="space-y-4">
      {content.paragraphs?.map((paragraph, index) => (
        <p
          key={index}
          className="max-w-[68ch] leading-[1.65] text-[var(--muted)]"
        >
          {paragraph}
        </p>
      ))}

      {content.subsections && content.subsections.length > 0 && (
        <div className="space-y-8">
          {content.subsections.map((subsection, index) => (
            <div key={subsection.title}>
              <h3
                className={`mb-3 text-lg font-semibold text-[var(--foreground)] ${index === 0 && !content.paragraphs?.length ? "" : "mt-8"}`}
              >
                {subsection.title}
              </h3>
              {subsection.paragraphs && (
                <div className="space-y-4">
                  {subsection.paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="max-w-[68ch] leading-[1.65] text-[var(--muted)]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
              {subsection.bullets && <BulletList items={subsection.bullets} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
