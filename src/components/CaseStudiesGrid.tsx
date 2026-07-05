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
          ? "bg-[var(--accent)]"
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
      className="group grid gap-8 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-8 transition-colors duration-150 hover:border-[var(--border-strong)] md:grid-cols-[minmax(0,1fr)_300px] md:items-center"
    >
      <div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="mono-label flex items-center gap-2">
            <TypeDot projectType={caseStudy.projectType} />
            {caseStudy.projectType === "independent"
              ? "Independent"
              : "Professional"}
          </span>
          <span className="mono-label">{caseStudy.category}</span>
        </div>

        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.01em] text-[var(--foreground)] transition-colors duration-150 group-hover:text-[var(--accent)]">
          {caseStudy.title}
        </h3>

        <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-[var(--muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
          {caseStudy.description}
        </p>

        {caseStudy.stats && caseStudy.stats.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
            {caseStudy.stats.slice(0, 2).map((stat) => (
              <div key={stat.label}>
                <p className="mono-stat text-xl">{stat.value}</p>
                <p className="mono-label mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <p className="mono-meta mt-6 text-xs">
          {caseStudy.technologies.slice(0, 6).join(" · ")}
        </p>

        <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)] transition-colors duration-150 group-hover:text-[var(--accent)]">
          Read case study
          <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        </p>
      </div>

      {diagram && (
        <div className="hidden rounded-md border border-[var(--border)] bg-[var(--background)] p-4 md:block">
          {diagram}
        </div>
      )}
    </Link>
  );
}

function IndexRow({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <Link
      href={`/case-studies/${caseStudy.slug}`}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-[var(--border)] px-2 py-5 transition-colors duration-150 hover:bg-[var(--surface-1)] sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto_auto] sm:gap-6"
    >
      <span className="truncate text-[0.9375rem] font-semibold text-[var(--foreground)] transition-colors duration-150 group-hover:text-[var(--accent)]">
        {caseStudy.title}
      </span>
      <span className="hidden truncate text-sm text-[var(--muted)] sm:block">
        {caseStudy.description}
      </span>
      <span className="mono-label hidden items-center gap-2 md:flex">
        <TypeDot projectType={caseStudy.projectType} />
        {caseStudy.category}
      </span>
      <span className="flex items-center gap-4">
        <span className="mono-meta hidden text-xs sm:block">
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
      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-6 border-b border-[var(--border)] pb-4">
        {filterOptions.map((option) => {
          const active = activeFilter === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              className={`mono-label flex cursor-pointer items-center gap-2 transition-colors duration-150 ${
                active
                  ? "text-[var(--foreground)]"
                  : "hover:text-[var(--foreground)]"
              }`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                />
              )}
              {option.label}
            </button>
          );
        })}
        <span className="mono-label ml-auto">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length > 0 ? (
        <>
          {/* Featured panels */}
          {featured.length > 0 && (
            <div className="mt-8 space-y-6">
              {featured.map((cs) => (
                <FeaturedPanel key={cs.slug} caseStudy={cs} />
              ))}
            </div>
          )}

          {/* Compact index */}
          {rest.length > 0 && (
            <div className="mt-10">
              <p className="mono-label mb-2 px-2">More work</p>
              <div className="border-t border-[var(--border)]">
                {rest.map((cs) => (
                  <IndexRow key={cs.slug} caseStudy={cs} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="flex items-center gap-3 py-12">
          <span className="mono-label">No matches</span>
          <span aria-hidden="true" className="mono-label">/</span>
          <button
            onClick={() => setActiveFilter("all")}
            className="mono-label cursor-pointer text-[var(--accent)] transition-colors duration-150 hover:text-[var(--accent-hover)]"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
}
