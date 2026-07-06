import type { ReactNode } from "react";

/*
 * Architecture diagrams for flagship case studies, drawn in site tokens so
 * they follow the theme. Hairline strokes, mono labels, ember on the
 * critical path: redlines on an engineering drawing, not decoration.
 */

const MONO = "var(--font-plex-mono), ui-monospace, monospace";

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
        fontFamily={MONO}
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
          fontFamily={MONO}
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
      fontFamily={MONO}
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

export function OakDiagram() {
  return (
    <svg
      viewBox="0 0 640 260"
      role="img"
      aria-label="Oak architecture: a user query enters a reasoning tool loop over game data, passes schema validation, and streams back as a cited answer; Grok, Claude, and GPT are hot-swappable providers"
      className="h-auto w-full"
    >
      <Box x={16} y={56} w={96} h={48} label="USER" />
      <Wire d={`M112 80 H160 ${right(160, 80)}`} />

      <Box x={162} y={46} w={168} h={68} label="AGENT" sub="TOOL LOOP ×14" />

      <Box x={162} y={176} w={168} h={44} label="GAME DATA" sub="POSTGRES" />
      <Wire d={`M246 176 V120 ${up(246, 114)}`} />

      <Box x={392} y={56} w={128} h={48} label="ZOD SCHEMA" sub="VALIDATED" />
      <Wire d={`M330 80 H386 ${right(386, 80)}`} />

      {/* Retry line back to the agent */}
      <Wire d={`M456 56 V22 H246 V40 ${down(246, 44)}`} dashed />
      <Caption x={351} y={16}>RETRY</Caption>

      <Box x={548} y={46} w={82} h={68} label="CITED" sub="ANSWER" accent />
      <Wire d={`M520 80 H542 ${right(542, 80)}`} accent />
      <Caption x={589} y={132} accent>SSE</Caption>

      {/* Provider chips */}
      <Box x={392} y={176} w={70} h={30} label="" />
      <Caption x={427} y={195}>GROK</Caption>
      <Box x={470} y={176} w={70} h={30} label="" />
      <Caption x={505} y={195}>CLAUDE</Caption>
      <Box x={548} y={176} w={82} h={30} label="" />
      <Caption x={589} y={195}>GPT-5.5</Caption>
      <Caption x={511} y={232}>MODEL-AGNOSTIC · HOT-SWAP</Caption>

      <Caption x={16} y={248} anchor="start">OAK · REASONING PIPELINE</Caption>
    </svg>
  );
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

export function getDiagram(slug: string): ReactNode | null {
  return DIAGRAMS[slug] ?? null;
}
