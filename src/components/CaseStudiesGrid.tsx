"use client";

import { useState, useMemo } from "react";
import { caseStudies, type ProjectType } from "@/lib/case-studies";
import { CaseStudyCard } from "./CaseStudyCard";
import { Search, X } from "lucide-react";

type FilterOption = "all" | ProjectType;

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "independent", label: "Independent" },
  { value: "professional", label: "Professional" },
];

export function CaseStudiesGrid() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudies = useMemo(() => {
    return caseStudies.filter((cs) => {
      // Project type filter
      if (activeFilter !== "all" && cs.projectType !== activeFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableText =
          `${cs.title} ${cs.description} ${cs.overview}`.toLowerCase();
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [activeFilter, searchQuery]);

  const hasActiveFilters =
    activeFilter !== "all" || searchQuery.trim() !== "";

  const clearAllFilters = () => {
    setActiveFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-0 bg-[var(--accent)]/5 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors duration-200" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search case studies..."
            className="w-full pl-12 pr-12 py-3.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 p-1 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/50 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Project Type Toggle + Results Count */}
      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setActiveFilter(option.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
              activeFilter === option.value
                ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md shadow-[var(--accent)]/25"
                : "border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] hover:shadow-sm"
            }`}
          >
            {option.label}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}

        <span className="ml-auto text-sm text-[var(--muted)]">
          {filteredStudies.length} project
          {filteredStudies.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Case Studies Grid */}
      {filteredStudies.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredStudies.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 mb-4 rounded-full bg-[var(--border)]/50 flex items-center justify-center">
            <Search className="w-7 h-7 text-[var(--muted)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
            No case studies found
          </h3>
          <p className="text-sm text-[var(--muted)] text-center mb-4 max-w-sm">
            Try adjusting your filters or search query to find what you&apos;re
            looking for.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-foreground)] hover:bg-[var(--accent)] border border-[var(--accent)] rounded-lg transition-all duration-200 cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
