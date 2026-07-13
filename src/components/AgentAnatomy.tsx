"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

type LayerProof = {
  study: "Oak" | "Annie ACS";
  slug: "oak" | "annie-acs";
  line: string;
};

type Layer = {
  id: string;
  mapIndex: string;
  mapName: string;
  title: string;
  description: string;
  artifacts: string[];
  proof: LayerProof;
};

const layers: Layer[] = [
  {
    id: "layer-01",
    mapIndex: "01",
    mapName: "Model",
    title: "Model",
    description:
      "Which model, at what reasoning effort, for which call. Routing and fallbacks are decided up front, with explicit cost and latency budgets, so capability is bought per call, not per system.",
    artifacts: ["Model matrix", "Routing policy", "Latency budget"],
    proof: {
      study: "Oak",
      slug: "oak",
      line: "Provider-agnostic stack: Grok by default, Claude and GPT as drop-in operator switches with no rebuild.",
    },
  },
  {
    id: "layer-02",
    mapIndex: "02",
    mapName: "Tools",
    title: "Tools",
    description:
      "The contract surface between the model and the world: small, typed, deterministic tools with schemas that are hard to misuse and errors that tell the model what to do next.",
    artifacts: ["Tool specs", "IO schemas", "Error contracts"],
    proof: {
      study: "Oak",
      slug: "oak",
      line: "Fourteen small tools supply facts; the model composes mechanics conclusions instead of reciting stat blocks.",
    },
  },
  {
    id: "layer-03",
    mapIndex: "03",
    mapName: "Orchestration",
    title: "Orchestration",
    description:
      "The control flow above the model: plain workflow, single agent, or multiple agents with scoped context. Handoffs, retries, and stop conditions are designed, not emergent.",
    artifacts: ["Control flow", "Handoffs", "Stop conditions"],
    proof: {
      study: "Annie ACS",
      slug: "annie-acs",
      line: "Patient path is route, retrieve, respond, not a free-form free-for-all. Insights is a second, scoped agent for staff.",
    },
  },
  {
    id: "layer-04",
    mapIndex: "04",
    mapName: "Memory",
    title: "Memory and state",
    description:
      "What the system remembers, where it lives, and what it deliberately forgets: context budgets per call, session state, and durable stores with clear ownership.",
    artifacts: ["Context budget", "Session state", "Durable stores"],
    proof: {
      study: "Oak",
      slug: "oak",
      line: "Guest use is instant. Signed-in history and an active team scope what the agent remembers for this session.",
    },
  },
  {
    id: "layer-05",
    mapIndex: "05",
    mapName: "Evals",
    title: "Evals and observability",
    description:
      "The harness that makes the system improvable: regression suites, traces on every run, and eval gates on every change. A demo is not evidence; passing evals is.",
    artifacts: ["Eval suite", "Traces", "Regression gates"],
    proof: {
      study: "Annie ACS",
      slug: "annie-acs",
      line: "Procedure media is delivered only via structured SSE from retrieval, never model text, so URLs cannot be hallucinated.",
    },
  },
  {
    id: "layer-06",
    mapIndex: "06",
    mapName: "Guardrails",
    title: "Guardrails",
    description:
      "Where humans stay in the loop: permissioned actions, uncertainty surfaced instead of smoothed over, and hard stops in front of anything irreversible.",
    artifacts: ["Permissions", "HITL gates", "Hard stops"],
    proof: {
      study: "Annie ACS",
      slug: "annie-acs",
      line: "Insights has no mutating tools. Status, export, and filters require explicit staff confirmation, with cited sessions.",
    },
  },
];

const decisions = [
  "An agent only where a workflow can't. Deterministic code is cheaper, faster, and testable; agents have to earn their place.",
  "Multi-agent only when isolation pays. Splitting context costs coordination, and the split has to buy more than it costs.",
  "The smallest model that passes the evals. Model choice is an eval result, not a brand preference.",
  "The harness before the feature. Evals and traces come first, so every change after is measurable.",
];

function LayerPicker({
  activeId,
  onSelect,
  variant,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  variant: "stack" | "chips";
}) {
  if (variant === "chips") {
    return (
      <nav
        aria-label="System layers"
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {layers.map((layer) => {
          const isActive = activeId === layer.id;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onSelect(layer.id)}
              aria-pressed={isActive}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors duration-150 ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className="text-[0.72rem] font-bold tabular-nums opacity-80">
                {layer.mapIndex}
              </span>
              {layer.mapName}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="System layers"
      className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)] shadow-[var(--shadow-raised)] divide-y divide-[var(--border)]"
    >
      {layers.map((layer) => {
        const isActive = activeId === layer.id;
        return (
          <button
            key={layer.id}
            type="button"
            onClick={() => onSelect(layer.id)}
            aria-pressed={isActive}
            className={`group relative flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${
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
          </button>
        );
      })}
    </nav>
  );
}

function LayerDetail({ layer }: { layer: Layer }) {
  return (
    <div
      id={layer.id}
      className="scroll-mt-28 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)] p-7 shadow-[var(--shadow-raised)] sm:p-8"
    >
      <p className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
        Layer {layer.mapIndex}
      </p>
      <h3 className="font-display mt-2 text-xl font-medium tracking-[-0.01em] text-[var(--foreground)] sm:text-2xl">
        {layer.title}
      </h3>
      <p className="mt-3 max-w-[62ch] text-[0.9375rem] leading-relaxed text-[var(--muted)]">
        {layer.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {layer.artifacts.map((artifact) => (
          <span
            key={artifact}
            className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
          >
            {artifact}
          </span>
        ))}
      </div>

      <div className="mt-7 border-t border-[var(--border)] pt-6">
        <p className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">
          In practice
        </p>
        <Link
          href={`/case-studies/${layer.proof.slug}`}
          className="group mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 hover:text-[var(--accent)]"
        >
          {layer.proof.study}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
        <p className="mt-2 max-w-[58ch] text-[0.9rem] leading-relaxed text-[var(--muted)]">
          {layer.proof.line}
        </p>
      </div>
    </div>
  );
}

export function AgentAnatomy() {
  const [activeId, setActiveId] = useState("layer-01");
  const activeLayer = layers.find((layer) => layer.id === activeId) ?? layers[0];

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.slice(1);
      if (layers.some((layer) => layer.id === hash)) {
        setActiveId(hash);
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const selectLayer = (id: string) => {
    setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
  };

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
            lede="How I decide, then the six layers I design before a demo. Each layer is grounded in Oak or Annie ACS."
          />
        </Reveal>

        <Reveal>
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)] p-7 shadow-[var(--shadow-raised)] sm:p-8">
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

        <Reveal delay={60}>
          <div className="mt-12 md:hidden">
            <LayerPicker
              activeId={activeId}
              onSelect={selectLayer}
              variant="chips"
            />
            <p className="mt-3 text-xs font-medium text-[var(--faint)]">
              Cross-section of a production agent system
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-5 md:gap-12">
          <div className="hidden md:col-span-2 md:block">
            <div className="sticky top-28">
              <LayerPicker
                activeId={activeId}
                onSelect={selectLayer}
                variant="stack"
              />
              <p className="mt-4 text-xs font-medium text-[var(--faint)]">
                Cross-section of a production agent system
              </p>
            </div>
          </div>

          <div className="md:col-span-3">
            <LayerDetail key={activeLayer.id} layer={activeLayer} />
          </div>
        </div>

        <Reveal delay={80}>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--border)] pt-8">
            <p className="text-sm text-[var(--muted)]">
              See the same layers in shipped systems.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/case-studies/oak"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 hover:text-[var(--accent)]"
              >
                Oak
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/case-studies/annie-acs"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 hover:text-[var(--accent)]"
              >
                Annie ACS
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#case-studies"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] transition-colors duration-150 hover:text-[var(--accent)]"
              >
                All work
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
