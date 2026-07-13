"use client";

import { useEffect, useState } from "react";

const LABEL_FONT = "var(--font-jakarta), system-ui, sans-serif";

/* Production tool names; do not invent others (docs/design/hero-tool-orbit-spec.md) */
const TOOLS = [
  "resolve_entity",
  "get_pokemon",
  "get_move",
  "estimate_damage",
  "run_sql",
  "search_wiki",
  "get_learnset",
  "compute_stat",
  "get_usage_stats",
  "get_encounters",
];

/* Fixed visit order: resolve_entity, run_sql, estimate_damage, compute_stat, search_wiki */
const VISIT_ORDER = [0, 4, 3, 7, 5];

const CX = 226;
const CY = 180;
const RX = 118;
const RY = 112;

const NODES = TOOLS.map((name, i) => {
  const angle = ((i * 36 - 90) * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = Math.round(CX + RX * cos);
  const y = Math.round(CY + RY * sin);
  let anchor: "start" | "middle" | "end";
  let lx = x;
  let ly = y;
  if (Math.abs(cos) < 0.35) {
    anchor = "middle";
    ly = sin < 0 ? y - 12 : y + 20;
  } else if (cos > 0) {
    anchor = "start";
    lx = x + 9;
    ly = y + 3.5;
  } else {
    anchor = "end";
    lx = x - 9;
    ly = y + 3.5;
  }
  return { name, x, y, anchor, lx, ly };
});

interface OakToolOrbitProps {
  /** Slightly tighter footprint for featured-card panels */
  compact?: boolean;
  className?: string;
}

/**
 * Animated Oak reasoning tool orbit: agent core with real tools around it,
 * one spoke hot per iteration, then cited-answer light-up. Decorative only;
 * reduced motion renders the final state statically.
 */
export function OakToolOrbit({ compact = false, className }: OakToolOrbitProps) {
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(
      () => {
        if (reduced) {
          setStep(5);
          return;
        }
        setStep(0);
        interval = setInterval(
          () => setStep((s) => (s === null ? 0 : (s + 1) % 6)),
          1400
        );
      },
      reduced ? 0 : 900
    );
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  const looping = step !== null;
  const hotIndex = step !== null && step < 5 ? VISIT_ORDER[step] : null;
  const submitted = step === 5;
  const status =
    step === null || step < 5 ? `Iteration ${(step ?? 0) + 1}` : "Submit answer";

  return (
    <svg
      viewBox="-10 0 472 400"
      role="img"
      aria-label="Oak agent architecture: a reasoning tool loop orchestrating tools such as run_sql and search_wiki, producing a cited answer with uncertainty surfaced"
      className={
        className ??
        (compact
          ? "h-auto w-full max-w-[300px]"
          : "h-auto w-full max-w-[440px]")
      }
    >
      <defs>
        <radialGradient id="oakOrbitStage">
          <stop offset="0" stopColor="var(--accent)" stopOpacity={0.08} />
          <stop offset="1" stopColor="var(--accent)" stopOpacity={0} />
        </radialGradient>
      </defs>

      <ellipse
        cx={226}
        cy={180}
        rx={190}
        ry={170}
        fill="url(#oakOrbitStage)"
        className="draw-fade"
      />

      {NODES.map((node, i) => {
        const hot = hotIndex === i;
        return (
          <line
            key={node.name}
            x1={node.x}
            y1={node.y}
            x2={CX}
            y2={CY}
            stroke={hot ? "var(--accent)" : "var(--faint)"}
            strokeWidth={1}
            strokeOpacity={hot ? 1 : 0.55}
            {...(looping
              ? hot
                ? { strokeDasharray: "4 4", className: "dashflow" }
                : {}
              : {
                  pathLength: 1,
                  className: "draw-path",
                  style: { animationDelay: `${200 + i * 35}ms` },
                })}
          />
        );
      })}

      <rect
        x={CX - 78}
        y={146}
        width={156}
        height={68}
        rx={12}
        fill="var(--surface-1)"
        stroke="var(--border-strong)"
        className="draw-fade"
        style={{ animationDelay: "80ms" }}
      />
      <g className="draw-fade" style={{ animationDelay: "160ms" }}>
        <text
          x={CX}
          y={168}
          textAnchor="middle"
          fontFamily={LABEL_FONT}
          fontSize={12}
          fontWeight={700}
          letterSpacing="0.06em"
          fill="var(--foreground)"
        >
          AGENT
        </text>
        <text
          x={CX}
          y={184}
          textAnchor="middle"
          fontFamily={LABEL_FONT}
          fontSize={10}
          fontWeight={500}
          letterSpacing="0.04em"
          fill="var(--faint)"
        >
          Reasoning tool loop
        </text>
        <text
          x={CX}
          y={200}
          textAnchor="middle"
          fontFamily={LABEL_FONT}
          fontSize={10}
          fontWeight={600}
          letterSpacing="0.04em"
          fill="var(--accent)"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {status}
        </text>
      </g>

      {NODES.map((node, i) => {
        const hot = hotIndex === i;
        const color = hot ? "var(--accent)" : "var(--muted)";
        return (
          <g
            key={node.name}
            className="draw-fade"
            style={{ animationDelay: `${280 + i * 35}ms` }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={hot ? 4 : 3}
              fill={color}
              style={{ transition: "r 0.2s ease, fill 0.2s ease" }}
            />
            <text
              x={node.lx}
              y={node.ly}
              textAnchor={node.anchor}
              fontFamily={LABEL_FONT}
              fontSize={compact ? 10 : 11}
              fontWeight={hot ? 600 : 500}
              letterSpacing="0.02em"
              fill={color}
            >
              {node.name}
            </text>
          </g>
        );
      })}

      <g className="draw-fade" style={{ animationDelay: "700ms" }}>
        <rect
          x={CX - 114}
          y={344}
          width={228}
          height={42}
          rx={12}
          fill={submitted ? "var(--accent-subtle)" : "var(--surface-1)"}
          stroke={submitted ? "var(--accent)" : "var(--border-strong)"}
          strokeDasharray={submitted ? undefined : "4 4"}
        />
        <text
          x={CX}
          y={361}
          textAnchor="middle"
          fontFamily={LABEL_FONT}
          fontSize={11}
          fontWeight={700}
          letterSpacing="0.05em"
          fill={submitted ? "var(--foreground)" : "var(--faint)"}
        >
          CITED ANSWER
        </text>
        <text
          x={CX}
          y={376}
          textAnchor="middle"
          fontFamily={LABEL_FONT}
          fontSize={9.5}
          fontWeight={500}
          letterSpacing="0.03em"
          fill={submitted ? "var(--accent)" : "var(--faint)"}
        >
          Uncertainty surfaced
        </text>
      </g>
    </svg>
  );
}
