const MONO = "var(--font-plex-mono), ui-monospace, monospace";

function NodeLabel({
  x,
  y,
  children,
  size = 11,
  fill = "var(--muted)",
  delay,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  fill?: string;
  delay: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontFamily={MONO}
      fontSize={size}
      fontWeight={500}
      letterSpacing="0.08em"
      fill={fill}
      className="draw-fade"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </text>
  );
}

/**
 * The site's one animated flourish: Oak's real agent loop, drawn as a
 * hairline schematic. Connectors trace in, nodes and labels fade in after.
 */
export function HeroSchematic() {
  return (
    <svg
      viewBox="0 0 360 452"
      role="img"
      aria-label="Agent architecture schematic: a user query flows through a reasoning tool loop and schema validation to a cited answer with uncertainty surfaced"
      className="h-auto w-full max-w-[320px]"
    >
      {/* Node: user query */}
      <rect
        x={64}
        y={16}
        width={200}
        height={40}
        rx={6}
        fill="var(--surface-1)"
        stroke="var(--border-strong)"
        className="draw-fade"
        style={{ animationDelay: "100ms" }}
      />
      <NodeLabel x={164} y={40} delay={200}>
        USER QUERY
      </NodeLabel>

      {/* Connector: query to agent */}
      <path
        d="M164 56 V90 M158 84 L164 90 L170 84"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth={1}
        pathLength={1}
        className="draw-path"
        style={{ animationDelay: "250ms" }}
      />

      {/* Node: agent tool loop */}
      <rect
        x={64}
        y={96}
        width={200}
        height={72}
        rx={6}
        fill="var(--surface-1)"
        stroke="var(--border-strong)"
        className="draw-fade"
        style={{ animationDelay: "350ms" }}
      />
      <NodeLabel x={164} y={128} fill="var(--foreground)" delay={450}>
        AGENT
      </NodeLabel>
      <NodeLabel x={164} y={148} size={9} fill="var(--faint)" delay={450}>
        REASONING TOOL LOOP
      </NodeLabel>

      {/* Tool-loop arc with arrowhead */}
      <path
        d="M264 118 C300 118 300 146 264 146 M270 140 L264 146 L270 152"
        fill="none"
        stroke="var(--faint)"
        strokeWidth={1}
        pathLength={1}
        className="draw-path"
        style={{ animationDelay: "500ms" }}
      />
      <NodeLabel x={318} y={110} size={9} fill="var(--faint)" delay={650}>
        ×14
      </NodeLabel>

      {/* Connector: agent to validation */}
      <path
        d="M164 168 V202 M158 196 L164 202 L170 196"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth={1}
        pathLength={1}
        className="draw-path"
        style={{ animationDelay: "550ms" }}
      />

      {/* Node: schema validation */}
      <rect
        x={64}
        y={208}
        width={200}
        height={40}
        rx={6}
        fill="var(--surface-1)"
        stroke="var(--border-strong)"
        className="draw-fade"
        style={{ animationDelay: "650ms" }}
      />
      <NodeLabel x={164} y={232} delay={750}>
        SCHEMA VALIDATION
      </NodeLabel>

      {/* Retry loop back to the agent (dashed) */}
      <path
        d="M64 228 H40 V132 H58 M52 126 L58 132 L52 138"
        fill="none"
        stroke="var(--faint)"
        strokeWidth={1}
        strokeDasharray="3 3"
        className="draw-fade"
        style={{ animationDelay: "800ms" }}
      />
      <text
        x={32}
        y={186}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={9}
        letterSpacing="0.08em"
        fill="var(--faint)"
        transform="rotate(-90 32 186)"
        className="draw-fade"
        style={{ animationDelay: "800ms" }}
      >
        RETRY
      </text>

      {/* Connector: validation to answer */}
      <path
        d="M164 248 V282 M158 276 L164 282 L170 276"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth={1}
        pathLength={1}
        className="draw-path"
        style={{ animationDelay: "850ms" }}
      />

      {/* Node: cited answer (the redline moment) */}
      <rect
        x={64}
        y={288}
        width={200}
        height={56}
        rx={6}
        fill="var(--accent-subtle)"
        stroke="var(--accent)"
        className="draw-fade"
        style={{ animationDelay: "950ms" }}
      />
      <NodeLabel x={164} y={312} fill="var(--foreground)" delay={1050}>
        CITED ANSWER
      </NodeLabel>
      <NodeLabel x={164} y={330} size={9} fill="var(--accent)" delay={1050}>
        UNCERTAINTY SURFACED
      </NodeLabel>

      {/* Provider chips: model-agnostic footing */}
      {[
        { x: 64, w: 62, label: "GROK", cx: 95 },
        { x: 134, w: 62, label: "CLAUDE", cx: 165 },
        { x: 204, w: 62, label: "GPT-5.5", cx: 235 },
      ].map((chip) => (
        <g
          key={chip.label}
          className="draw-fade"
          style={{ animationDelay: "1150ms" }}
        >
          <rect
            x={chip.x}
            y={382}
            width={chip.w}
            height={26}
            rx={4}
            fill="none"
            stroke="var(--border)"
          />
          <text
            x={chip.cx}
            y={399}
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
      <NodeLabel x={164} y={438} size={9} fill="var(--faint)" delay={1250}>
        MODEL-AGNOSTIC · HOT-SWAP
      </NodeLabel>
    </svg>
  );
}
