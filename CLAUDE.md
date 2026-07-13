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

Personal portfolio website for an AI Architect at [gowtam.ai](https://gowtam.ai). Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript. Single-page homepage composition with a dynamic `/case-studies/[slug]` route.

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
- The token set is warm ink / cream paper plus one copper accent (`--accent`), with surfaces (`--surface-1`, `--surface-2`) and text tiers (`--foreground`, `--muted`, `--faint`). Project-type badges use a soft label with a dot (copper = professional, neutral = independent); the old `--personal` / `--client` variables no longer exist.

**Design system.** Visual language is **Warm Authority** (human editorial, professional AI architect): Fraunces + Plus Jakarta Sans, copper kickers, pill CTAs, soft elevation, restrained motion (`Reveal`, `CountUp`, `.hero-enter`, `prefers-reduced-motion`). Reference: `docs/design/redesign-preview.html`. Utility class names `.mono-label` / `.mono-meta` / `.mono-stat` remain but are no longer monospace.

**Theme-aware assets.** Architecture diagrams are inline SVG components (`src/components/diagrams.tsx`) that consume CSS variables, so they follow the theme automatically. For raster images that must differ per theme, render both variants and toggle with Tailwind `dark:` classes (`block dark:hidden` / `hidden dark:block`).

**Case studies.** Data is defined in `src/lib/case-studies.ts`. Each entry has a `projectType` of `'independent'` or `'professional'`. Optional fields include `appStoreUrl`, `externalLink`, `clientName`, `testimonial`, `featured`, and `stats`. Use `getCaseStudy(slug)` and `getAllCaseStudySlugs()`. The slug list feeds `generateStaticParams` for SSG. The homepage grid (`CaseStudiesGrid`, a client component) filters by project type; `featured` studies render as large panels with diagrams, the rest as compact index rows. Detail pages render a metadata band, a `stats` count-up band, indexed sections with a sticky TOC (`CaseStudyToc`), and prev/next navigation from array order.

**SEO and metadata.**
- `metadataBase` and site-wide metadata live in `src/app/layout.tsx`.
- `generateMetadata` in the case study page sets per-slug title, description, Open Graph, and Twitter cards.
- Homepage embeds Person + ProfilePage JSON-LD; case study pages embed Article + BreadcrumbList JSON-LD.
- `src/app/robots.ts` and `src/app/sitemap.ts` generate crawl directives and the sitemap (homepage + all case study URLs).

### File Layout

- `src/app/`: App Router pages, layouts, metadata, route segments (includes `robots.ts`, `sitemap.ts`, `not-found.tsx`, `icon.svg`, `apple-icon.tsx`)
- `src/components/`: UI components (Header, Hero, About, AgentAnatomy, CaseStudies, CaseStudiesGrid, CaseStudyBody, CaseStudyToc, Skills, Contact, Footer, SectionHeading, Reveal, CountUp, diagrams, ThemeProvider, ThemeToggle)
- `src/lib/case-studies.ts`: case study data and helpers
- `public/diagrams/`: Excalidraw source files (`.excalidraw`). Exports to PNG go in `public/images/`.
- `PDFs/`: client deliverable PDFs (not part of the build)
- `case-study-*.md`: draft/reference case study content (not part of the build)
