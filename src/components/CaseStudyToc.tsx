"use client";

import { useEffect, useState } from "react";

const items = [
  { id: "overview", label: "Overview" },
  { id: "challenge", label: "Challenge" },
  { id: "solution", label: "Solution" },
  { id: "results", label: "Results" },
];

/**
 * Slim sticky table of contents for case study pages (xl screens only).
 * Tracks the section in view and marks it with an ember tick.
 */
export function CaseStudyToc() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="absolute -left-56 top-0 hidden h-full w-40 xl:block">
      <nav aria-label="On this page" className="sticky top-32">
        <p className="mono-label mb-4 text-[var(--foreground)]">Contents</p>
        <ul className="space-y-3">
          {items.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`mono-label flex items-center gap-2 transition-colors duration-150 ${
                    isActive
                      ? "text-[var(--foreground)]"
                      : "hover:text-[var(--foreground)]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-px w-3 transition-colors duration-150 ${
                      isActive ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                    }`}
                  />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
