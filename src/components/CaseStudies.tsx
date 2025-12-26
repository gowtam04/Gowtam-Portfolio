import { caseStudies } from "@/lib/case-studies";
import { CaseStudyCard } from "./CaseStudyCard";

export function CaseStudies() {
  return (
    <section id="case-studies" className="py-24 px-6 bg-[var(--background)]">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 tracking-tight">
            Case Studies
          </h2>
          <p className="text-lg text-[var(--muted)] max-w-2xl">
            A selection of projects showcasing my approach to AI product management, from conception to launch.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
          ))}
        </div>
      </div>
    </section>
  );
}
