# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See `AGENTS.md` for deeper working conventions (imports, TS style, naming, formatting). This file covers the non-obvious stuff that is easy to miss.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build (also runs TypeScript checks)
npm run start    # Start production server
npm run lint     # Run ESLint
```

There is no explicit `typecheck` script. Either run `npx tsc -p tsconfig.json --noEmit` or rely on `npm run build`, which runs TS checks as part of the Next build. There is no test runner configured.

## Architecture

Personal portfolio website for an AI Architect at [gowtam.ai](https://gowtam.ai). Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript. The homepage is an interactive low-poly 3D room (three.js via `@react-three/fiber` + `@react-three/drei`); classic pages include `/case-studies`, `/case-studies/[slug]`, `/plain`, `/privacy`, and the app pages.

**3D room.** Read `docs/design/room-architecture.md` before touching `src/components/room/`: it has the ownership map, the object component contract, coordinates, palette, and layout reservations. Key points:
- Routes `/`, `/work`, `/games`, `/cars`, `/about`, `/places`, `/contact` each render `<RoomExperience initialSpot=...>` (Teeko lives at `/about#teeko`). The panel for the route is server-rendered; the canvas is `next/dynamic` with `ssr: false`. Opening/closing panels uses `history.pushState` via the store (`store.tsx`), not Next navigation, so the canvas never remounts.
- All room copy lives in `src/lib/room-content.ts` (panels, `/plain`, Markdown, llms.txt). Unknown personal details are `ph("Label", "key")` placeholders listed in `ROOM_PLACEHOLDERS`; they render as dashed `[Label]` chips. Do not invent facts about Gowtam.
- Hotspot hitboxes, labels, and camera views are in `src/components/room/hotspots.ts`. Picking is central (`Interaction.tsx`); objects wrap meshes in `<Hotspot id>` for the hover glow.
- 3D components read `store.getState()` / `store.fx` inside `useFrame` instead of re-rendering. `react-hooks/immutability` is disabled for `src/components/room/**` because R3F mutates three.js objects by design.
- Real photos for the framed pictures can be dropped in as `public/images/room/usa.jpg` / `india.jpg` (detected at build time by `src/lib/room-photos.ts`).
- Dev helpers: `?time=night|dawn|day|dusk` forces the sky, `?orbit=1` (dev only) enables a free orbit camera, `?webgl=0` forces the fallback.

### Key Patterns

**No em dashes.** Do not use `—` anywhere in the codebase. Use commas, colons, semicolons, parentheses, or hyphens instead.

**Next.js 16 `params` are a Promise.** Dynamic routes must await:
```tsx
type Props = { params: Promise<{ slug: string }> };
const { slug } = await params;
```
See `src/app/case-studies/[slug]/page.tsx` for the canonical example. This applies to both `generateMetadata` and the page component.

**Theme system (next-themes + CSS variables).**
- `ThemeProvider` uses `attribute="class"`, so `<html>` gets a `.dark` class, not `data-theme`.
- Defaults to `dark` theme with `enableSystem={false}` (no OS preference fallback).
- Color tokens live as CSS variables in `src/app/globals.css` under `:root` and `.dark`. Components read them as `text-[var(--foreground)]`, `bg-[var(--background)]`, etc.
- `globals.css` declares `@custom-variant dark (&:where(.dark, .dark *));` so Tailwind's `dark:` variant follows the `.dark` class (not `prefers-color-scheme`). Without this line, Tailwind `dark:` utilities would ignore the in-app theme toggle and respond only to the OS setting. Do not remove it.
- The token set is deep navy / cool paper plus one cyan accent (`--accent`), with surfaces (`--surface-1`, `--surface-2`) and text tiers (`--foreground`, `--muted`, `--faint`). Project-type badges use a soft label with a dot (cyan = professional, neutral = independent); the old `--personal` / `--client` variables no longer exist.

**Design system.** Visual language is **Midnight Current** (X-aligned cool authority for a professional AI architect): Fraunces + Plus Jakarta Sans, cyan kickers and primary pill CTAs, soft elevation, restrained motion (`CountUp`, `prefers-reduced-motion`). Reference: `docs/design/redesign-preview.html`. The room chrome (`src/components/room/ui/room.css`) is always dark and independent of next-themes; the approved 3D reference is `docs/design/prototypes/room-3d.html`. Utility class names `.mono-label` / `.mono-meta` / `.mono-stat` remain but are no longer monospace.

**Theme-aware assets.** Architecture diagrams are inline SVG components (`src/components/diagrams.tsx`) that consume CSS variables, so they follow the theme automatically. For raster images that must differ per theme, render both variants and toggle with Tailwind `dark:` classes (`block dark:hidden` / `hidden dark:block`).

**Case studies.** Data is defined in `src/lib/case-studies.ts`. Each entry has a `projectType` of `'independent'` or `'professional'`. Optional fields include `appStoreUrl`, `externalLink`, `clientName`, `testimonial`, `featured`, and `stats`. Use `getCaseStudy(slug)` and `getAllCaseStudySlugs()`. The slug list feeds `generateStaticParams` for SSG. The `/case-studies` grid (`CaseStudiesGrid`, a client component) filters by project type; `featured` studies render as large panels with diagrams, the rest as compact index rows. Detail pages render a metadata band, a `stats` count-up band, indexed sections with a sticky TOC (`CaseStudyToc`), and prev/next navigation from array order.

**SEO and metadata.**
- `metadataBase` and site-wide metadata live in `src/app/layout.tsx`.
- `generateMetadata` in the case study page sets per-slug title, description, Open Graph, and Twitter cards.
- Homepage embeds Person + ProfilePage JSON-LD and other room routes embed page + BreadcrumbList JSON-LD (`src/components/room/seo/RoomJsonLd.tsx`); case study pages embed Article + BreadcrumbList JSON-LD. Room route metadata comes from `roomMetadata()` in `src/lib/room-metadata.ts`.
- `src/app/robots.ts` and `src/app/sitemap.ts` generate crawl directives and the sitemap (homepage + all case study URLs).

### File Layout

- `src/app/`: App Router pages, layouts, metadata, route segments (includes `robots.ts`, `sitemap.ts`, `not-found.tsx`, `icon.svg`, `apple-icon.tsx`)
- `src/components/`: classic UI components (Header, Footer, CaseStudiesGrid, CaseStudyBody, CaseStudyToc, SectionHeading, CountUp, diagrams, OakToolOrbit, ThemeProvider, ThemeToggle)
- `src/components/room/`: the 3D room (foundation files, `objects/` per object, `ui/` DOM chrome, `seo/` JSON-LD)
- `src/lib/case-studies.ts`: case study data and helpers
- `src/lib/room-content.ts`, `room-projects.ts`, `room-metadata.ts`, `room-photos.ts`: room copy, work panel projects, per-route metadata, optional photos
- `src/lib/markdown-pages.ts` + `src/middleware.ts`: Markdown negotiation (`Accept: text/markdown`) for every page
- `public/diagrams/`: Excalidraw source files (`.excalidraw`). Exports to PNG go in `public/images/`.
- `PDFs/`: client deliverable PDFs (not part of the build)
- `case-study-*.md`: draft/reference case study content (not part of the build)
