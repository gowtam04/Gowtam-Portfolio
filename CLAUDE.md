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
- Badge colors use `--personal` / `--client` CSS variables for `independent` / `professional` project types (legacy variable names).

**Theme-aware assets.** For images that need to differ between light and dark mode (e.g., the process flow diagram in `src/components/Process.tsx`), render both and toggle visibility with Tailwind `dark:` classes. Keeps the component a server component with no flash on refresh:
```tsx
<Image src="/images/process-flow-light-technical-v3.png" className="block dark:hidden" ... />
<Image src="/images/process-flow-dark-technical-v3.png"  className="hidden dark:block" ... />
```

**Case studies.** Data is defined in `src/lib/case-studies.ts`. Each entry has a `projectType` of `'independent'` or `'professional'`. Optional fields include `appStoreUrl`, `externalLink`, `clientName`, and `testimonial`. Use `getCaseStudy(slug)` and `getAllCaseStudySlugs()`. The slug list feeds `generateStaticParams` for SSG. The homepage grid (`CaseStudiesGrid`, a client component) provides search and project-type filtering; cards are rendered by `CaseStudyCard`.

**SEO and metadata.**
- `metadataBase` and site-wide metadata live in `src/app/layout.tsx`.
- `generateMetadata` in the case study page sets per-slug title, description, Open Graph, and Twitter cards.
- Homepage embeds Person + ProfilePage JSON-LD; case study pages embed Article + BreadcrumbList JSON-LD.
- `src/app/robots.ts` and `src/app/sitemap.ts` generate crawl directives and the sitemap (homepage + all case study URLs).

### File Layout

- `src/app/`: App Router pages, layouts, metadata, route segments (includes `robots.ts`, `sitemap.ts`, `not-found.tsx`, `icon.svg`, `apple-icon.tsx`)
- `src/components/`: UI components (Header, Hero, About, Process, CaseStudies, CaseStudiesGrid, CaseStudyCard, Skills, Contact, Footer, ThemeProvider, ThemeToggle)
- `src/lib/case-studies.ts`: case study data and helpers
- `public/diagrams/`: Excalidraw source files (`.excalidraw`). Exports to PNG go in `public/images/`.
- `PDFs/`: client deliverable PDFs (not part of the build)
- `case-study-*.md`: draft/reference case study content (not part of the build)
