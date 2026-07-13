import type { ReactNode } from "react";
import { OakToolOrbit } from "./OakToolOrbit";

/*
 * Architecture diagrams for flagship case studies, drawn in site tokens so
 * they follow the theme. Soft strokes and copper on the critical path.
 * Oak uses the animated tool-orbit client component.
 */

const LABEL_FONT = "var(--font-jakarta), system-ui, sans-serif";

interface BoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  accent?: boolean;
}

function Box({ x, y, w, h, label, sub, accent }: BoxProps) {
  const cx = x + w / 2;
  const labelY = sub ? y + h / 2 - 2 : y + h / 2 + 4;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={accent ? "var(--accent-subtle)" : "var(--surface-2)"}
        stroke={accent ? "var(--accent)" : "var(--border-strong)"}
      />
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        fontFamily={LABEL_FONT}
        fontSize={13}
        fontWeight={500}
        letterSpacing="0.06em"
        fill="var(--foreground)"
      >
        {label}
      </text>
      {sub && (
        <text
          x={cx}
          y={y + h / 2 + 15}
          textAnchor="middle"
          fontFamily={LABEL_FONT}
          fontSize={10}
          letterSpacing="0.06em"
          fill={accent ? "var(--accent)" : "var(--muted)"}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function Caption({
  x,
  y,
  children,
  accent,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: string;
  accent?: boolean;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontFamily={LABEL_FONT}
      fontSize={10}
      letterSpacing="0.08em"
      fill={accent ? "var(--accent)" : "var(--muted)"}
    >
      {children}
    </text>
  );
}

function Wire({
  d,
  accent,
  dashed,
}: {
  d: string;
  accent?: boolean;
  dashed?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={accent ? "var(--accent)" : "var(--faint)"}
      strokeWidth={1}
      strokeDasharray={dashed ? "3 3" : undefined}
    />
  );
}

/* Arrowhead pointing right / down / up, appended at (x, y) */
const right = (x: number, y: number) =>
  `M${x - 6} ${y - 5} L${x} ${y} L${x - 6} ${y + 5}`;
const down = (x: number, y: number) =>
  `M${x - 5} ${y - 6} L${x} ${y} L${x + 5} ${y - 6}`;
const up = (x: number, y: number) =>
  `M${x - 5} ${y + 6} L${x} ${y} L${x + 5} ${y + 6}`;

/** Animated Oak tool orbit (client). Prefer this over a static pipeline. */
export function OakDiagram({ compact = false }: { compact?: boolean } = {}) {
  return <OakToolOrbit compact={compact} />;
}

export function AnnieDiagram() {
  return (
    <svg
      viewBox="0 0 640 330"
      role="img"
      aria-label="Annie ACS architecture: a chat widget calls a route, retrieve, respond pipeline; media arrives only through structured events; FAISS indexes hot-swap in Tigris object storage with Postgres pointers; staff manage everything from an admin panel"
      className="h-auto w-full"
    >
      <Box x={16} y={40} w={130} h={56} label="WIDGET" sub="3 EMBED MODES" />
      <Wire d={`M146 68 H182 ${right(182, 68)}`} />

      <Box x={184} y={44} w={110} h={48} label="ROUTE" />
      <Wire d={`M294 68 H326 ${right(326, 68)}`} />
      <Box x={328} y={44} w={130} h={48} label="RETRIEVE" sub="DUAL FAISS" />
      <Wire d={`M458 68 H490 ${right(490, 68)}`} />
      <Box x={492} y={44} w={130} h={48} label="RESPOND" sub="SSE STREAM" />

      {/* The signature: structured media events, never LLM text */}
      <Wire d={`M393 92 V140 H81 V102 ${up(81, 96)}`} accent />
      <Caption x={237} y={132} accent>STRUCTURED MEDIA EVENTS · NEVER LLM TEXT</Caption>

      <Box x={184} y={190} w={110} h={48} label="POSTGRES" sub="FTS · POINTERS" />
      <Box x={328} y={190} w={130} h={48} label="FAISS × TIGRIS" sub="ATOMIC HOT-SWAP" accent />
      <Box x={492} y={190} w={130} h={48} label="ADMIN" sub="JWT · ANALYTICS" />

      <Wire d={`M239 190 V98 ${up(239, 92)}`} />
      <Wire d={`M393 190 V150`} />
      <Wire d={`M492 214 H464 ${right(468, 214)}`} dashed />

      <Box x={184} y={272} w={196} h={44} label="INSIGHTS AGENT" sub="CORPUS Q&A · CITED" />
      <Wire d={`M239 272 V244 ${up(239, 238)}`} />

      <Caption x={624} y={316} anchor="end">ANNIE ACS · PLATFORM</Caption>
    </svg>
  );
}

export function AgentRedDiagram() {
  return (
    <svg
      viewBox="0 0 640 300"
      role="img"
      aria-label="Agent RED architecture: an orchestrator routes tasks to navigation, battle, and menu agents, which drive a Game Boy emulator over extracted memory state"
      className="h-auto w-full"
    >
      <Box x={230} y={16} w={180} h={52} label="ORCHESTRATOR" sub="SONNET · ROUTING" />

      <Wire d={`M270 68 L130 108 ${down(130, 112)}`} />
      <Wire d={`M320 68 V108 ${down(320, 112)}`} />
      <Wire d={`M370 68 L510 108 ${down(510, 112)}`} />

      <Box x={56} y={114} w={148} h={56} label="NAVIGATION" sub="HAIKU · A* PATHS" />
      <Box x={246} y={114} w={148} h={56} label="BATTLE" sub="SONNET → OPUS" accent />
      <Box x={436} y={114} w={148} h={56} label="MENU" sub="HAIKU · ITEMS" />

      <Wire d={`M130 170 V210 ${down(130, 214)}`} />
      <Wire d={`M320 170 V210 ${down(320, 214)}`} />
      <Wire d={`M510 170 V210 ${down(510, 214)}`} />

      <Box x={56} y={216} w={528} h={48} label="PYBOY EMULATOR" sub="MEMORY STATE · 60 FPS" />

      <Caption x={320} y={292}>KNOWLEDGE BASE · 223 MAPS · 151 POKEMON · TYPE CHARTS</Caption>
    </svg>
  );
}

export function LimsDiagram() {
  return (
    <svg
      viewBox="0 0 640 190"
      role="img"
      aria-label="LIMS workflow: samples flow from intake through accessioning, testing, and review to results, at more than ten thousand samples per day"
      className="h-auto w-full"
    >
      <Box x={16} y={48} w={104} h={48} label="INTAKE" />
      <Wire d={`M120 72 H140 ${right(140, 72)}`} />
      <Box x={142} y={48} w={116} h={48} label="ACCESSION" />
      <Wire d={`M258 72 H278 ${right(278, 72)}`} />
      <Box x={280} y={48} w={104} h={48} label="TESTING" />
      <Wire d={`M384 72 H404 ${right(404, 72)}`} />
      <Box x={406} y={48} w={104} h={48} label="REVIEW" />
      <Wire d={`M510 72 H530 ${right(530, 72)}`} accent />
      <Box x={532} y={48} w={92} h={48} label="RESULTS" accent />

      <Caption x={320} y={140} accent>10,000+ SAMPLES / DAY</Caption>
      <Caption x={320} y={164}>REPLACED SALESFORCE · DEPLOYED COMPANY-WIDE</Caption>
    </svg>
  );
}

const DIAGRAMS: Record<string, ReactNode> = {
  oak: <OakDiagram />,
  "annie-acs": <AnnieDiagram />,
  "agent-red": <AgentRedDiagram />,
  "diagnostic-lab-lims": <LimsDiagram />,
};

export function getDiagram(
  slug: string,
  options?: { compact?: boolean }
): ReactNode | null {
  if (slug === "oak") {
    return <OakDiagram compact={options?.compact} />;
  }
  return DIAGRAMS[slug] ?? null;
}
