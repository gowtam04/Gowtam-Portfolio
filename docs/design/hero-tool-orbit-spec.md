# Hero schematic v2 — "Tool Orbit"

Replace the internals of `src/components/HeroSchematic.tsx` with an animated **tool
orbit**: the agent core in the center, its real tools arranged around it, one spoke
pulsing per loop iteration, then a schema-pass + cited-answer moment. This replaces the
current static vertical stack (query → agent → validation → answer), which reads as
generic. A live visual mockup of the approved concept is here — match its feel, not its
exact pixels: https://claude.ai/code/artifact/e34d097f-0903-4ccd-81a0-bd1dbdc343ca
(section "Concept B — The tool orbit").

## What stays the same

- **Component seam:** keep the exported name `HeroSchematic` and its usage in
  `Hero.tsx` untouched. Same slot, same `max-w-[320px]`-ish footprint (the new
  viewBox may be modestly wider/taller).
- **Provider chips block:** keep the `GROK / CLAUDE / GPT-5.5` chips and the
  `MODEL-AGNOSTIC · HOT-SWAP` caption at the bottom, exactly as designed today.
- **Design system:** all colors via the existing CSS custom properties
  (`--surface-1`, `--border`, `--border-strong`, `--muted`, `--faint`,
  `--foreground`, `--accent`, `--accent-subtle`) so both themes work with zero
  extra work. Mono type via `var(--font-plex-mono)`, `letterSpacing: 0.08em`,
  same 9–12px sizes as the current component.
- **Entrance:** reuse the existing `draw-fade` / `draw-path` classes for the
  one-time draw-in (spokes trace, labels fade), same stagger philosophy as now.
- **A11y:** `role="img"` with an updated `aria-label`, e.g. "Agent architecture:
  a reasoning tool loop orchestrating tools such as run_sql and search_wiki,
  producing a schema-validated, cited answer." The looping animation is purely
  decorative — no information exists only in motion.

## The new composition (top to bottom)

1. **Orbit stage** (~y 20–330 of the viewBox):
   - Center: the AGENT core — a rounded rect (`--surface-1` fill,
     `--border-strong` stroke) containing three lines: `AGENT` (foreground),
     `REASONING TOOL LOOP` (faint, 9px), and a live status line (accent, 9px)
     that reads `ITERATION 1` → `ITERATION 5` → `SUBMIT_ANSWER` as the loop runs.
   - Around it, on an ellipse (rx ≈ 148, ry ≈ 118), **10 real tool names** in
     faint mono text, each connected to the core by a 1px hairline spoke
     (`--border-strong`), with a 3px dot at the label end. Use these names
     (they are the production tool names — do not invent others):
     `resolve_entity`, `get_pokemon`, `get_move`, `estimate_damage`, `run_sql`,
     `search_wiki`, `get_learnset`, `compute_stat`, `get_usage_stats`,
     `get_encounters`.
   - Compute label/spoke positions with trig at module scope (deterministic, no
     runtime measurement, SSR-safe). Nudge top/bottom label baselines so nothing
     collides with the core.
2. **Output row** (~y 350–380): a small `SCHEMA ✓` chip and, beside it, a wide
   `CITED ANSWER · UNCERTAINTY SURFACED` bar. Idle state: faint text,
   `--border` stroke (answer bar dashed). Lit state: the chip goes
   border+text `--accent` is wrong here — chip goes a success-leaning treatment
   using `--foreground`/`--border-strong`, and the **answer bar** is the accent
   moment: solid `--accent` stroke, `--accent-subtle` fill, accent text. Keep the
   accent budget on the answer, matching the current design's "redline moment."
3. **Provider chips + caption**: unchanged from the current component.

## The loop behavior

After the entrance completes, run a cycle on a ~1.4s interval (client-side
`useEffect` + `setInterval`; component becomes `"use client"`):

- Steps 1–5: one spoke+label pair at a time goes **hot** — spoke stroke turns
  `--accent` with a `4 4` dash marching toward the core (a `dashflow` keyframe
  animating `stroke-dashoffset`; add it next to the existing `draw-*` styles in
  `globals.css`), label text turns `--accent`. Core status line shows
  `ITERATION n`. Use a fixed, hand-picked visit order (e.g. resolve_entity →
  run_sql → estimate_damage → compute_stat → search_wiki) — deterministic, no
  `Math.random()`.
- Step 6: all spokes cool down, core status shows `SUBMIT_ANSWER`, the
  `SCHEMA ✓` chip and the cited-answer bar light up, hold for one beat.
- Then the cycle restarts. Only class/attribute swaps per tick — no layout work.

**Reduced motion:** under `prefers-reduced-motion: reduce` (check via
`matchMedia` in the effect, and cover the CSS side in the existing reduced-motion
block), never start the interval; render the final state statically (no hot
spoke, `SUBMIT_ANSWER`, schema chip passed, answer bar lit). The existing rules
already neutralize `draw-fade`/`draw-path`; extend them to the new `dashflow`
class.

## Acceptance checklist

- [ ] Both themes look intentional (the tokens already differ per theme — verify
      the accent-lit answer bar and hot spokes read well on light `#c9552a` and
      dark `#e8703a` grounds).
- [ ] No hydration mismatch: initial server render is the idle/entrance state;
      the interval starts only in `useEffect`.
- [ ] `npm run lint` and `npx tsc --noEmit` pass; no new dependencies.
- [ ] Reduced-motion renders the complete static diagram (nothing invisible).
- [ ] Tool labels don't overlap the core or each other at the component's
      smallest rendered width (~280px); drop to 8 tools rather than shrink text
      below 9px if needed.
- [ ] The provider chips block and caption are pixel-identical to before.
