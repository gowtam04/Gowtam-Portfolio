"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  caseStudies,
  type ProjectType,
  getAllCategories,
  getAllTechnologies,
} from "@/lib/case-studies";
import { CaseStudyCard } from "./CaseStudyCard";
import { Search, X, ChevronDown, Check, SlidersHorizontal } from "lucide-react";

type FilterOption = "all" | ProjectType;

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "personal", label: "Personal" },
  { value: "client", label: "Client" },
];

export function CaseStudiesGrid() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    []
  );
  const [techDropdownOpen, setTechDropdownOpen] = useState(false);
  const [techSearch, setTechSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allCategories = getAllCategories();
  const allTechnologies = getAllTechnologies();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setTechDropdownOpen(false);
        setTechSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter technologies based on search
  const filteredTechnologies = allTechnologies.filter((tech) =>
    tech.toLowerCase().includes(techSearch.toLowerCase())
  );

  // Combined filtering logic
  const filteredStudies = useMemo(() => {
    return caseStudies.filter((cs) => {
      // Project type filter
      if (activeFilter !== "all" && cs.projectType !== activeFilter) {
        return false;
      }

      // Category filter (OR match)
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(cs.category)
      ) {
        return false;
      }

      // Technology filter (OR match)
      if (
        selectedTechnologies.length > 0 &&
        !cs.technologies.some((tech) => selectedTechnologies.includes(tech))
      ) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableText = `${cs.title} ${cs.description} ${cs.overview}`.toLowerCase();
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [activeFilter, selectedCategories, selectedTechnologies, searchQuery]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleTechnology = (tech: string) => {
    setSelectedTechnologies((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const hasActiveFilters =
    activeFilter !== "all" ||
    selectedCategories.length > 0 ||
    selectedTechnologies.length > 0 ||
    searchQuery.trim() !== "";

  const clearAllFilters = () => {
    setActiveFilter("all");
    setSelectedCategories([]);
    setSelectedTechnologies([]);
    setSearchQuery("");
    setTechSearch("");
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

      {/* Project Type Toggle */}
      <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Category Chips */}
      <div className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          Categories
        </span>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-md"
                    : "bg-[var(--border)]/50 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Technology Dropdown + Clear All Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Technology Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setTechDropdownOpen(!techDropdownOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
              selectedTechnologies.length > 0
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>
              {selectedTechnologies.length > 0
                ? `${selectedTechnologies.length} tech${selectedTechnologies.length > 1 ? "s" : ""} selected`
                : "Technologies"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${techDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Panel */}
          {techDropdownOpen && (
            <div className="absolute z-50 mt-2 w-72 max-h-80 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-xl shadow-black/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Search within dropdown */}
              <div className="p-3 border-b border-[var(--border)]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="text"
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    placeholder="Filter technologies..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--border)]/30 border-none rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Technology List */}
              <div className="max-h-52 overflow-y-auto p-2">
                {filteredTechnologies.length > 0 ? (
                  filteredTechnologies.map((tech) => {
                    const isSelected = selectedTechnologies.includes(tech);
                    return (
                      <button
                        key={tech}
                        onClick={() => toggleTechnology(tech)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "text-[var(--foreground)] hover:bg-[var(--border)]/50"
                        }`}
                      >
                        <span>{tech}</span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-4 text-sm text-[var(--muted)] text-center">
                    No technologies found
                  </p>
                )}
              </div>

              {/* Clear Selection */}
              {selectedTechnologies.length > 0 && (
                <div className="p-2 border-t border-[var(--border)]">
                  <button
                    onClick={() => setSelectedTechnologies([])}
                    className="w-full px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)]/50 rounded-lg transition-all duration-150 cursor-pointer"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear all filters
          </button>
        )}

        {/* Results Count */}
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
