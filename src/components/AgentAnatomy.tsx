"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const layers = [
  {
    id: "layer-01",
    mapIndex: "01",
    mapName: "Model",
    title: "Model",
    description:
      "Which model, at what reasoning effort, for which call. Routing and fallbacks are decided up front, with explicit cost and latency budgets, so capability is bought per call, not per system.",
    artifacts: ["model-matrix", "routing-policy", "latency-budget"],
  },
  {
    id: "layer-02",
    mapIndex: "02",
    mapName: "Tools",
    title: "Tools",
    description:
      "The contract surface between the model and the world: small, typed, deterministic tools with schemas that are hard to misuse and errors that tell the model what to do next.",
    artifacts: ["tool-specs", "io-schemas", "error-contracts"],
  },
  {
    id: "layer-03",
    mapIndex: "03",
    mapName: "Orchestration",
    title: "Orchestration",
    description:
      "The control flow above the model: plain workflow, single agent, or multiple agents with scoped context. Handoffs, retries, and stop conditions are designed, not emergent.",
    artifacts: ["control-flow", "handoffs", "stop-conditions"],
  },
  {
    id: "layer-04",
    mapIndex: "04",
    mapName: "Memory",
    title: "Memory and state",
    description:
      "What the system remembers, where it lives, and what it deliberately forgets: context budgets per call, session state, and durable stores with clear ownership.",
    artifacts: ["context-budget", "session-state", "durable-stores"],
  },
  {
    id: "layer-05",
    mapIndex: "05",
    mapName: "Evals",
    title: "Evals and observability",
    description:
      "The harness that makes the system improvable: regression suites, traces on every run, and eval gates on every change. A demo is not evidence; passing evals is.",
    artifacts: ["eval-suite", "traces", "regression-gates"],
  },
  {
    id: "layer-06",
    mapIndex: "06",
    mapName: "Guardrails",
    title: "Guardrails",
    description:
      "Where humans stay in the loop: permissioned actions, uncertainty surfaced instead of smoothed over, and hard stops in front of anything irreversible.",
    artifacts: ["permissions", "hitl-gates", "hard-stops"],
  },
];

const decisions = [
  "An agent only where a workflow can't. Deterministic code is cheaper, faster, and testable; agents have to earn their place.",
  "Multi-agent only when isolation pays. Splitting context costs coordination, and the split has to buy more than it costs.",
  "The smallest model that passes the evals. Model choice is an eval result, not a brand preference.",
  "The harness before the feature. Evals and traces come first, so every change after is measurable.",
];

export function AgentAnatomy() {
  const [activeId, setActiveId] = useState("layer-01");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    for (const layer of layers) {
      const el = document.getElementById(layer.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="system"
      className="scroll-mt-24 border-y border-[var(--border)] bg-[var(--surface-2)] px-6 py-24"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            label="System"
            title="Anatomy of an agent system"
            lede="Six layers I design deliberately in every production agent system. The model is the smallest decision; the other five are what make it survive real inputs."
          />
        </Reveal>

        <div className="grid gap-12 md:grid-cols-5">
          <div className="hidden md:col-span-2 md:block">
            <div className="sticky top-28">
              <nav
                aria-label="System layers"
                className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)] shadow-[var(--shadow-raised)] divide-y divide-[var(--border)]"
              >
                {layers.map((layer) => {
                  const isActive = activeId === layer.id;
                  return (
                    <a
                      key={layer.id}
                      href={`#${layer.id}`}
                      className={`group relative flex items-center gap-3 px-4 py-3.5 transition-colors ${
                        isActive
                          ? "bg-[var(--accent-subtle)] duration-[250ms]"
                          : "duration-150 hover:bg-[var(--background)]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute inset-y-0 left-0 w-0.5 rounded-full bg-[var(--accent)] transition-opacity ${
                          isActive
                            ? "opacity-100 duration-[250ms]"
                            : "opacity-0 duration-150"
                        }`}
                      />
                      <span
                        className={`text-[0.78rem] font-bold tabular-nums transition-colors ${
                          isActive
                            ? "text-[var(--accent)] duration-[250ms]"
                            : "text-[var(--faint)] duration-150 group-hover:text-[var(--muted)]"
                        }`}
                      >
                        {layer.mapIndex}
                      </span>
                      <span
                        className={`text-[0.875rem] font-semibold transition-colors ${
                          isActive
                            ? "text-[var(--accent)] duration-[250ms]"
                            : "text-[var(--muted)] duration-150 group-hover:text-[var(--foreground)]"
                        }`}
                      >
                        {layer.mapName}
                      </span>
                    </a>
                  );
                })}
              </nav>
              <p className="mt-4 text-xs font-medium text-[var(--faint)]">
                Cross-section of a production agent system
              </p>
            </div>
          </div>

          <div className="md:col-span-3">
            {layers.map((layer, index) => {
              const isFirst = index === 0;
              const isLast = index === layers.length - 1;
              return (
                <Reveal key={layer.id} delay={index * 60}>
                  <div
                    id={layer.id}
                    className={`scroll-mt-28 border-[var(--border)] ${
                      isFirst ? "pt-0 pb-10" : "py-10"
                    } ${isLast ? "" : "border-b"}`}
                  >
                    <p className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                      Layer {layer.mapIndex}
                    </p>
                    <h3 className="font-display mt-2 text-xl font-medium tracking-[-0.01em] text-[var(--foreground)]">
                      {layer.title}
                    </h3>
                    <p className="mt-3 max-w-[62ch] text-[0.9375rem] leading-relaxed text-[var(--muted)]">
                      {layer.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {layer.artifacts.map((artifact) => (
                        <span
                          key={artifact}
                          className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
                        >
                          {artifact}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal>
          <div className="mt-16 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)] p-7 shadow-[var(--shadow-raised)] sm:p-8">
            <p className="mb-5 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
              How I decide
            </p>
            <ul className="grid gap-x-12 gap-y-4 md:grid-cols-2">
              {decisions.map((decision) => (
                <li
                  key={decision}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[var(--muted)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_var(--accent-subtle)]"
                  />
                  <span>{decision}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
