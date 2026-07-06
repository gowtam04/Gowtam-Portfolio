"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

const layers = [
  {
    id: "layer-01",
    mapIndex: "01",
    mapName: "MODEL",
    title: "Model",
    description:
      "Which model, at what reasoning effort, for which call. Routing and fallbacks are decided up front, with explicit cost and latency budgets, so capability is bought per call, not per system.",
    artifacts: ["model-matrix", "routing-policy", "latency-budget"],
  },
  {
    id: "layer-02",
    mapIndex: "02",
    mapName: "TOOLS",
    title: "Tools",
    description:
      "The contract surface between the model and the world: small, typed, deterministic tools with schemas that are hard to misuse and errors that tell the model what to do next.",
    artifacts: ["tool-specs", "io-schemas", "error-contracts"],
  },
  {
    id: "layer-03",
    mapIndex: "03",
    mapName: "ORCHESTRATION",
    title: "Orchestration",
    description:
      "The control flow above the model: plain workflow, single agent, or multiple agents with scoped context. Handoffs, retries, and stop conditions are designed, not emergent.",
    artifacts: ["control-flow", "handoffs", "stop-conditions"],
  },
  {
    id: "layer-04",
    mapIndex: "04",
    mapName: "MEMORY",
    title: "Memory and state",
    description:
      "What the system remembers, where it lives, and what it deliberately forgets: context budgets per call, session state, and durable stores with clear ownership.",
    artifacts: ["context-budget", "session-state", "durable-stores"],
  },
  {
    id: "layer-05",
    mapIndex: "05",
    mapName: "EVALS",
    title: "Evals and observability",
    description:
      "The harness that makes the system improvable: regression suites, traces on every run, and eval gates on every change. A demo is not evidence; passing evals is.",
    artifacts: ["eval-suite", "traces", "regression-gates"],
  },
  {
    id: "layer-06",
    mapIndex: "06",
    mapName: "GUARDRAILS",
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
    <section id="system" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            index="02"
            label="System"
            title="Anatomy of an agent system"
            lede="Six layers I design deliberately in every production agent system. The model is the smallest decision; the other five are what make it survive real inputs."
          />
        </Reveal>

        <div className="grid gap-12 md:grid-cols-5">
          {/* Stack map */}
          <div className="hidden md:col-span-2 md:block">
            <div className="sticky top-28">
              <nav
                aria-label="System layers"
                className="rounded-lg border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)]"
              >
                {layers.map((layer) => {
                  const isActive = activeId === layer.id;
                  return (
                    <a
                      key={layer.id}
                      href={`#${layer.id}`}
                      className={`group relative flex items-center gap-3 px-4 py-3.5 transition-colors ${
                        isActive ? "bg-[var(--accent-subtle)] duration-[250ms]" : "duration-150"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute inset-y-0 left-0 w-0.5 bg-[var(--accent)] transition-opacity ${
                          isActive ? "opacity-100 duration-[250ms]" : "opacity-0 duration-150"
                        }`}
                      />
                      <span
                        className={`mono-label transition-colors ${
                          isActive
                            ? "text-[var(--accent)] duration-[250ms]"
                            : "duration-150 group-hover:text-[var(--muted)]"
                        }`}
                      >
                        {layer.mapIndex}
                      </span>
                      <span
                        className={`mono-label transition-colors ${
                          isActive
                            ? "text-[var(--accent)] duration-[250ms]"
                            : "duration-150 group-hover:text-[var(--muted)]"
                        }`}
                      >
                        {layer.mapName}
                      </span>
                    </a>
                  );
                })}
              </nav>
              <p className="mono-meta mt-4 text-xs text-[var(--faint)]">
                CROSS-SECTION / PRODUCTION AGENT SYSTEM
              </p>
            </div>
          </div>

          {/* Layer entries */}
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
                    <p className="mono-label">Layer {layer.mapIndex}</p>
                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">
                      {layer.title}
                    </h3>
                    <p className="mt-3 max-w-[62ch] text-[0.9375rem] leading-relaxed text-[var(--muted)]">
                      {layer.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {layer.artifacts.map((artifact) => (
                        <span
                          key={artifact}
                          className="mono-meta rounded border border-[var(--border)] px-2.5 py-1 text-xs"
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

        {/* How I decide */}
        <Reveal>
          <div className="mt-20 border-t border-[var(--border)] pt-10">
            <p className="mono-label mb-6">How I decide</p>
            <ul className="grid gap-x-12 gap-y-4 md:grid-cols-2">
              {decisions.map((decision) => (
                <li
                  key={decision}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[var(--muted)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.65em] h-px w-3 flex-shrink-0 bg-[var(--accent)]"
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
