"use client";

import { useState } from "react";
import { caseStudies, type ProjectType } from "@/lib/case-studies";
import { CaseStudyCard } from "./CaseStudyCard";

type FilterOption = "all" | ProjectType;

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "personal", label: "Personal" },
  { value: "client", label: "Client" },
];

export function CaseStudiesGrid() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  const filteredStudies =
    activeFilter === "all"
      ? caseStudies
      : caseStudies.filter((cs) => cs.projectType === activeFilter);

  return (
    <>
      {/* Filter Toggle Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setActiveFilter(option.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
              activeFilter === option.value
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Case Studies Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudies.map((caseStudy) => (
          <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
        ))}
      </div>
    </>
  );
}
