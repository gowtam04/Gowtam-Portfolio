"use client";

import { useEffect, useState } from "react";

const MONO = "var(--font-plex-mono), ui-monospace, monospace";

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

/* Deterministic orbit layout at module scope: SSR-safe, no runtime measurement */
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

/**
 * The hero's one animated flourish, v2 "tool orbit": Oak's agent core with
 * its real tools in orbit. After the draw-in, one spoke per loop iteration
 * goes hot and pulses toward the core; the cycle ends on a schema pass and
 * the cited answer lighting up. Purely decorative; reduced motion renders
 * the final state statically.
 */
export function HeroSchematic() {
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
      reduced ? 0 : 1700
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
    step === null || step < 5 ? `ITERATION ${(step ?? 0) + 1}` : "SUBMIT_ANSWER";

  return (
    <svg
      viewBox="0 0 452 466"
      role="img"
      aria-label="Agent architecture: a reasoning tool loop orchestrating tools such as run_sql and search_wiki, producing a schema-validated, cited answer"
      className="h-auto w-full max-w-[320px]"
    >
      {/* Spokes (under the core so they visually start at its edge) */}
      {NODES.map((node, i) => {
        const hot = hotIndex === i;
        return (
          <line
            key={node.name}
            x1={node.x}
            y1={node.y}
            x2={CX}
            y2={CY}
            stroke={hot ? "var(--accent)" : "var(--border-strong)"}
            strokeWidth={1}
            {...(looping
              ? hot
                ? { strokeDasharray: "4 4", className: "dashflow" }
                : {}
              : {
                  pathLength: 1,
                  className: "draw-path",
                  style: { animationDelay: `${250 + i * 40}ms` },
                })}
          />
        );
      })}

      {/* Agent core */}
      <rect
        x={CX - 75}
        y={148}
        width={150}
        height={64}
        rx={6}
        fill="var(--surface-1)"
        stroke="var(--border-strong)"
        className="draw-fade"
        style={{ animationDelay: "100ms" }}
      />
      <g className="draw-fade" style={{ animationDelay: "200ms" }}>
        <text
          x={CX}
          y={167}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={11}
          fontWeight={500}
          letterSpacing="0.08em"
          fill="var(--foreground)"
        >
          AGENT
        </text>
        <text
          x={CX}
          y={182}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={9}
          letterSpacing="0.08em"
          fill="var(--faint)"
        >
          REASONING TOOL LOOP
        </text>
        <text
          x={CX}
          y={199}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={9}
          letterSpacing="0.08em"
          fill="var(--accent)"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {status}
        </text>
      </g>

      {/* Tool dots + labels */}
      {NODES.map((node, i) => {
        const hot = hotIndex === i;
        const color = hot ? "var(--accent)" : "var(--faint)";
        return (
          <g
            key={node.name}
            className="draw-fade"
            style={{ animationDelay: `${350 + i * 40}ms` }}
          >
            <circle cx={node.x} cy={node.y} r={3} fill={color} />
            <text
              x={node.lx}
              y={node.ly}
              textAnchor={node.anchor}
              fontFamily={MONO}
              fontSize={10}
              letterSpacing="0.08em"
              fill={color}
            >
              {node.name}
            </text>
          </g>
        );
      })}

      {/* Output row: schema gate + the cited-answer redline moment */}
      <g className="draw-fade" style={{ animationDelay: "800ms" }}>
        <rect
          x={60}
          y={344}
          width={92}
          height={40}
          rx={6}
          fill="none"
          stroke={submitted ? "var(--border-strong)" : "var(--border)"}
        />
        <text
          x={106}
          y={368}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={9}
          letterSpacing="0.08em"
          fill={submitted ? "var(--foreground)" : "var(--faint)"}
        >
          SCHEMA ✓
        </text>

        <rect
          x={164}
          y={344}
          width={228}
          height={40}
          rx={6}
          fill={submitted ? "var(--accent-subtle)" : "none"}
          stroke={submitted ? "var(--accent)" : "var(--border)"}
          strokeDasharray={submitted ? undefined : "4 4"}
        />
        <text
          x={278}
          y={361}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={10.5}
          fontWeight={500}
          letterSpacing="0.08em"
          fill={submitted ? "var(--foreground)" : "var(--faint)"}
        >
          CITED ANSWER
        </text>
        <text
          x={278}
          y={375}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={8}
          letterSpacing="0.08em"
          fill={submitted ? "var(--accent)" : "var(--faint)"}
        >
          UNCERTAINTY SURFACED
        </text>
      </g>

      {/* Provider chips: model-agnostic footing (unchanged from v1) */}
      {[
        { x: 125, label: "GROK", cx: 156 },
        { x: 195, label: "CLAUDE", cx: 226 },
        { x: 265, label: "GPT-5.5", cx: 296 },
      ].map((chip) => (
        <g
          key={chip.label}
          className="draw-fade"
          style={{ animationDelay: "1000ms" }}
        >
          <rect
            x={chip.x}
            y={414}
            width={62}
            height={26}
            rx={4}
            fill="none"
            stroke="var(--border)"
          />
          <text
            x={chip.cx}
            y={431}
            textAnchor="middle"
            fontFamily={MONO}
            fontSize={9}
            letterSpacing="0.08em"
            fill="var(--faint)"
          >
            {chip.label}
          </text>
        </g>
      ))}
      <text
        x={CX}
        y={460}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={9}
        letterSpacing="0.08em"
        fill="var(--faint)"
        className="draw-fade"
        style={{ animationDelay: "1100ms" }}
      >
        MODEL-AGNOSTIC · HOT-SWAP
      </text>
    </svg>
  );
}
