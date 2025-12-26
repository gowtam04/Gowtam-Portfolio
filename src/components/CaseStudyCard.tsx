import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CaseStudy } from "@/lib/case-studies";

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  return (
    <article className="group relative flex flex-col h-full p-6 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)] transition-all duration-300">
      {/* Category Badge */}
      <span className="inline-block self-start px-3 py-1 text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/10 rounded-full mb-4">
        {caseStudy.category}
      </span>

      {/* Title */}
      <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3 group-hover:text-[var(--accent)] transition-colors">
        {caseStudy.title}
      </h3>

      {/* Description */}
      <p className="text-[var(--muted)] leading-relaxed mb-6 flex-grow">
        {caseStudy.description}
      </p>

      {/* Read More Link */}
      <Link
        href={`/case-studies/${caseStudy.slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:gap-3 transition-all duration-200"
      >
        Read Case Study
        <ArrowRight className="w-4 h-4" />
      </Link>
    </article>
  );
}
