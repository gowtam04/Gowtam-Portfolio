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
          className="flex items-start gap-3 text-[var(--foreground)]"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CaseStudyBody({ content }: CaseStudyBodyProps) {
  if (typeof content === "string") {
    return (
      <p className="text-[var(--foreground)] leading-relaxed">{content}</p>
    );
  }

  return (
    <div className="space-y-4">
      {content.paragraphs?.map((paragraph, index) => (
        <p key={index} className="text-[var(--foreground)] leading-relaxed">
          {paragraph}
        </p>
      ))}

      {content.subsections && content.subsections.length > 0 && (
        <div className="space-y-8">
          {content.subsections.map((subsection, index) => (
            <div key={subsection.title}>
              <h3
                className={`text-lg font-medium text-[var(--foreground)] mb-3 ${index === 0 && !content.paragraphs?.length ? "" : "mt-8"}`}
              >
                {subsection.title}
              </h3>
              {subsection.paragraphs && (
                <div className="space-y-4">
                  {subsection.paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-[var(--foreground)] leading-relaxed"
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