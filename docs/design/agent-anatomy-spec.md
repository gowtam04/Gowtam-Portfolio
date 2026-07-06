# Section spec: "Anatomy of an agent system" (replaces Process)

> Fable design pass, 2026-07-05, scoped to the homepage Process section only.
> Status: **spec only, no code changed.** Implementation is a separate pass.
> Site-wide system: see `docs/design/fable-ui-strategy.md` (unchanged, still authoritative).

Replace `src/components/Process.tsx` ("Discover. Design. Develop.") with a new
section, **"Anatomy of an agent system"**: a technical cross-section of the six
layers Gowtam designs in every production agent system. The old section narrated
a delivery pipeline in which *agents* were the actors; the new one shows the
*architecture judgment* an AI Architect is hired for. Form follows: the timeline
spine (a flow metaphor) retires, and the section becomes stacked strata (a
structure metaphor), read like the labeled plate in an engineering document.

## Diagnosis (why the current section fails)

- The copy's subject is the agent, not the architect: "a requirements discovery
  agent runs...", "a solution architect agent turns...". It reads as operating
  agents, not designing systems.
- Discover / Design / Develop is product-manager process language; nothing in it
  is specific to AI systems except the word "agent."
- The visual system itself (mono labels, artifact chips, ember gates, spine) is
  good and stays in the site's vocabulary. This is a content-architecture
  replacement, not a restyle.

## What stays the same

- **Design system, untouched:** Instrument Sans + IBM Plex Mono via the existing
  `.mono-label` / `.mono-meta` / `.mono-stat` utilities; all color through CSS
  variables (`--foreground`, `--muted`, `--faint`, `--border`, `--border-strong`,
  `--surface-1`, `--accent`, `--accent-subtle`) so both themes work with zero
  extra work. No new colors, no new fonts.
- **Section furniture:** `SectionHeading` with index `02`, hairline rule to the
  container edge; `Reveal` entrances with the existing 60ms stagger philosophy;
  `scroll-mt-24` on the section root.
- **Artifact chips:** the exact chip treatment from the current section
  (`mono-meta rounded border border-[var(--border)] px-2.5 py-1 text-xs`).
- **Accent discipline:** ember appears only as the active-slab treatment in the
  stack map and the dash lead-ins in the closing list. No large fills.
- **Page order and indices:** About `01`, this section `02`, Work `03`,
  Capabilities `04`, Contact `05`. Only this section's label changes.
- **No em dashes** anywhere in copy or code (project rule).

## What goes away

- The phase timeline, gate nodes, and terminal "Shipped / Verified MVP" node.
- `src/components/TimelineSpine.tsx`: **delete the file.** Its only consumer is
  `Process.tsx`, and its scroll-linked ember (a flow metaphor) is replaced by the
  stack map's scroll-tracked active slab (a structure metaphor). The section
  keeps a quiet scroll-linked ember moment either way.
- The "Why this works" principles list, replaced by "How I decide" (below).

## Identity changes (outside the component)

- `src/components/Header.tsx` navLinks: `{ href: "/#process", label: "Process" }`
  becomes `{ href: "/#system", label: "System" }`.
- Section root: `id="system"` (was `id="process"`). Grep for any other
  `#process` references (none known besides Header).
- Component: replace `Process.tsx` with `src/components/AgentAnatomy.tsx`
  exporting `AgentAnatomy`; update the import and usage in `src/app/page.tsx`.

## The new composition

`SectionHeading` first, full width: index `02`, label `System`, title
"Anatomy of an agent system", lede (copy below).

Then a two-column grid on `md+` (mirror About's rhythm: `grid md:grid-cols-5
gap-12`, left `md:col-span-2`, right `md:col-span-3`):

### Left column: the stack map (the section's hero moment)

A sticky (`sticky top-28`) diagram of the six layers as one cross-sectioned
block. Plain HTML/CSS, not SVG: six stacked slabs sharing hairline edges
(container `border border-[var(--border)] rounded-lg overflow-hidden` with
`divide-y divide-[var(--border)]`), so it reads as one sectioned solid, not six
chips.

- Each slab: an anchor (`href="#layer-01"` etc., jump target on the matching
  entry) with `mono-label` content: index + short name (`01  MODEL`,
  `02  TOOLS`, `03  ORCHESTRATION`, `04  MEMORY`, `05  EVALS`, `06  GUARDRAILS`),
  `px-4 py-3.5` or similar. Idle state: faint text on transparent background.
- **Active state** (the slab whose entry is in view): background
  `--accent-subtle`, text `--accent`, plus a 2px ember bar flush on the slab's
  left edge (an absolutely positioned span, not a border, so idle slabs don't
  shift). Exactly one slab is active at a time; this is the section's entire
  accent budget in the map.
- Hover on idle slabs: text steps up to `--muted` (150ms color transition, the
  site's feedback tier).
- Beneath the block, a caption: `mono-meta`, e.g. `CROSS-SECTION / PRODUCTION
  AGENT SYSTEM`, `text-xs`, faint.
- **Scroll tracking:** IntersectionObserver over the six entry elements, same
  recipe as `CaseStudyToc.tsx` (`rootMargin: "-20% 0px -70% 0px"`, threshold 0),
  active id in state. The component (or the map subtree) becomes `"use client"`.
  Initial active state: layer 01, so SSR and reduced-motion render something
  definite.
- **Mobile (below md): `hidden md:block`.** The entries carry all information;
  the map is navigational reinforcement, same collapse policy as the hero
  schematic.

### Right column: the six layer entries

Each entry (`id="layer-01"` .. `"layer-06"`, `scroll-mt-28`):

- `mono-label`: `Layer 01` (matches the "Phase 01" register of the old section).
- H3, same spec as the old phase titles: `text-xl font-semibold
  tracking-[-0.01em] text-[var(--foreground)]`.
- Description: `max-w-[62ch] text-[0.9375rem] leading-relaxed
  text-[var(--muted)]`.
- Artifact chips row (`mt-5 flex flex-wrap gap-2`), three chips per layer.
- Separation: `border-b border-[var(--border)]` between entries with generous
  padding (`py-10` first entry `pt-0`, last entry no border). The hairline-strata
  reading matters: entries should feel like labeled bands of one column, echoing
  the map.
- Entrances: each entry wrapped in `Reveal` with `delay={index * 60}`.

Deliberate differentiation from the Skills matrix (also an indexed hairline
list): entries here are full-width single column, carry artifact chips, use the
`Layer NN` mono-label above the title rather than a numeral beside it, and are
anchored to the stack map. Do not reuse the Skills two-column grid.

### Closing block: "How I decide"

Replaces "Why this works", keeps its exact styling: `mt-20 border-t
border-[var(--border)] pt-10`, `mono-label` heading `How I decide`, then a
`grid gap-x-12 gap-y-4 md:grid-cols-2` list where each item has the 3px-wide
ember dash lead-in (`mt-[0.65em] h-px w-3 bg-[var(--accent)]`) and
`text-sm leading-relaxed text-[var(--muted)]`.

## Copy (final, implement verbatim)

**Lede:** "Six layers I design deliberately in every production agent system.
The model is the smallest decision; the other five are what make it survive
real inputs."

**Layer 01 / Model** (map: `01 MODEL`)
Which model, at what reasoning effort, for which call. Routing and fallbacks are
decided up front, with explicit cost and latency budgets, so capability is
bought per call, not per system.
Chips: `model-matrix`, `routing-policy`, `latency-budget`

**Layer 02 / Tools** (map: `02 TOOLS`)
The contract surface between the model and the world: small, typed,
deterministic tools with schemas that are hard to misuse and errors that tell
the model what to do next.
Chips: `tool-specs`, `io-schemas`, `error-contracts`

**Layer 03 / Orchestration** (map: `03 ORCHESTRATION`)
The control flow above the model: plain workflow, single agent, or multiple
agents with scoped context. Handoffs, retries, and stop conditions are designed,
not emergent.
Chips: `control-flow`, `handoffs`, `stop-conditions`

**Layer 04 / Memory and state** (map: `04 MEMORY`)
What the system remembers, where it lives, and what it deliberately forgets:
context budgets per call, session state, and durable stores with clear
ownership.
Chips: `context-budget`, `session-state`, `durable-stores`

**Layer 05 / Evals and observability** (map: `05 EVALS`)
The harness that makes the system improvable: regression suites, traces on every
run, and eval gates on every change. A demo is not evidence; passing evals is.
Chips: `eval-suite`, `traces`, `regression-gates`

**Layer 06 / Guardrails** (map: `06 GUARDRAILS`)
Where humans stay in the loop: permissioned actions, uncertainty surfaced
instead of smoothed over, and hard stops in front of anything irreversible.
Chips: `permissions`, `hitl-gates`, `hard-stops`

**How I decide:**
1. An agent only where a workflow can't. Deterministic code is cheaper, faster,
   and testable; agents have to earn their place.
2. Multi-agent only when isolation pays. Splitting context costs coordination,
   and the split has to buy more than it costs.
3. The smallest model that passes the evals. Model choice is an eval result, not
   a brand preference.
4. The harness before the feature. Evals and traces come first, so every change
   after is measurable.

## Motion and states

- Entrances: `Reveal` only (fade-up 12px, staggered). No new keyframes; the
  existing motion grammar in `globals.css` is untouched.
- Active-slab change: color/background transition only, 250ms, existing easing.
  No layout shift (the ember edge bar is overlaid, not a border).
- **Reduced motion:** `Reveal` is already neutralized globally. The stack map's
  active tracking is state, not animation, and may keep working; its transitions
  are color-only and acceptable. Everything must be fully visible and legible
  with no motion at all.
- No hover lift, no scale, no continuous animation. The hero orbit stays the
  site's only looping moment.

## Acceptance checklist

- [ ] Both themes look intentional: active slab (`--accent-subtle` fill + ember
      text) reads clearly on dark `#e8703a` and light `#c9552a` grounds; chips
      and hairlines verified in both.
- [ ] Nav "System" link scrolls to the section with the heading clear of the
      sticky header (`scroll-mt-24`); slab anchors land entries clear of it
      (`scroll-mt-28`).
- [ ] Exactly one slab active at every scroll position from section top to the
      "How I decide" block; slab anchors and observer ids agree.
- [ ] No hydration mismatch: server renders layer 01 active; observer takes over
      in `useEffect`.
- [ ] Mobile (~375px): map hidden, entries and chips wrap cleanly, no horizontal
      overflow.
- [ ] Reduced motion: full section visible and static.
- [ ] `TimelineSpine.tsx` deleted; no dangling imports; no `#process` references
      remain (Header, page, any anchors).
- [ ] `npm run lint` and `npx tsc -p tsconfig.json --noEmit` pass; no new
      dependencies.
- [ ] No em dash characters anywhere in the diff.
