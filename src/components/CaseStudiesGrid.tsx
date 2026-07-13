"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { caseStudies, type CaseStudy, type ProjectType } from "@/lib/case-studies";
import { getDiagram } from "./diagrams";

type FilterOption = "all" | ProjectType;

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "independent", label: "Independent" },
  { value: "professional", label: "Professional" },
];

function TypeDot({ projectType }: { projectType: ProjectType }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${
        projectType === "professional"
          ? "bg-[var(--accent)] shadow-[0_0_0_3px_var(--accent-subtle)]"
          : "bg-[var(--faint)]"
      }`}
    />
  );
}

function FeaturedPanel({ caseStudy }: { caseStudy: CaseStudy }) {
  const diagram = getDiagram(caseStudy.slug);

  return (
    <Link
      href={`/case-studies/${caseStudy.slug}`}
      className="group grid gap-0 overflow-hidden rounded-[calc(var(--radius)+2px)] border border-[var(--border)] bg-[var(--surface-1)] shadow-[var(--shadow-raised)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-overlay)] md:grid-cols-[1.15fr_0.85fr] md:items-stretch"
    >
      <div className="flex flex-col justify-center p-8 md:p-9">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.04em] text-[var(--faint)]">
            <TypeDot projectType={caseStudy.projectType} />
            {caseStudy.projectType === "independent"
              ? "Independent"
              : "Professional"}
          </span>
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.04em] text-[var(--faint)]">
            {caseStudy.category}
            {caseStudy.duration ? ` · ${caseStudy.duration}` : ""}
          </span>
        </div>

        <h3 className="font-display mt-4 text-[clamp(1.6rem,2.5vw,2rem)] font-medium tracking-[-0.025em] text-[var(--foreground)] transition-colors duration-150 group-hover:text-[var(--accent)]">
          {caseStudy.title}
        </h3>

        <p className="mt-3 max-w-[42ch] text-[0.975rem] leading-[1.65] text-[var(--muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
          {caseStudy.description}
        </p>

        {caseStudy.stats && caseStudy.stats.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {caseStudy.stats.slice(0, 2).map((stat) => (
              <div key={stat.label}>
                <p className="mono-stat text-[1.35rem]">{stat.value}</p>
                <p className="mt-0.5 text-[0.75rem] font-medium text-[var(--faint)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        <p className="mt-5 text-xs font-medium text-[var(--faint)]">
          {caseStudy.technologies.slice(0, 6).join(" · ")}
        </p>

        <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 group-hover:text-[var(--accent)]">
          Read case study
          <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </p>
      </div>

      {diagram && (
        <div className="relative hidden min-h-[220px] items-center justify-center border-l border-[var(--border)] bg-[radial-gradient(circle_at_30%_30%,var(--accent-subtle),transparent_50%),linear-gradient(145deg,var(--surface-2),var(--surface-1))] p-6 md:flex">
          <div className="w-full max-w-[280px]">{diagram}</div>
        </div>
      )}
    </Link>
  );
}

function IndexRow({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <Link
      href={`/case-studies/${caseStudy.slug}`}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-[var(--border)] px-4 py-4 transition-colors duration-150 last:border-b-0 hover:bg-[var(--surface-2)] sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto_auto] sm:gap-6"
    >
      <span className="truncate text-[0.975rem] font-semibold text-[var(--foreground)] transition-colors duration-150 group-hover:text-[var(--accent)]">
        {caseStudy.title}
      </span>
      <span className="hidden truncate text-sm text-[var(--muted)] sm:block">
        {caseStudy.description}
      </span>
      <span className="hidden items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.04em] text-[var(--faint)] md:flex">
        <TypeDot projectType={caseStudy.projectType} />
        {caseStudy.category}
      </span>
      <span className="flex items-center gap-4">
        <span className="hidden text-xs font-medium text-[var(--faint)] sm:block">
          {caseStudy.duration}
        </span>
        <ArrowRight className="h-4 w-4 text-[var(--faint)] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
      </span>
    </Link>
  );
}

export function CaseStudiesGrid() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  const filtered = useMemo(() => {
    if (activeFilter === "all") return caseStudies;
    return caseStudies.filter((cs) => cs.projectType === activeFilter);
  }, [activeFilter]);

  const featured = filtered.filter((cs) => cs.featured);
  const rest = filtered.filter((cs) => !cs.featured);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {filterOptions.map((option) => {
          const active = activeFilter === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.82rem] font-semibold transition-all duration-150 ${
                active
                  ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
        <span className="ml-auto text-[0.8rem] font-medium text-[var(--faint)]">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length > 0 ? (
        <>
          {featured.length > 0 && (
            <div className="space-y-5">
              {featured.map((cs) => (
                <FeaturedPanel key={cs.slug} caseStudy={cs} />
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <div className="mt-8 overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)]">
              <p className="border-b border-[var(--border)] px-4 py-3 text-[0.72rem] font-bold uppercase tracking-[0.04em] text-[var(--faint)]">
                More work
              </p>
              {rest.map((cs) => (
                <IndexRow key={cs.slug} caseStudy={cs} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 py-12">
          <span className="text-sm text-[var(--muted)]">No matches</span>
          <button
            onClick={() => setActiveFilter("all")}
            className="cursor-pointer text-sm font-semibold text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
}
