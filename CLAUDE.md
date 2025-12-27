# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a personal portfolio website for an AI Product Manager built with Next.js 16 (App Router), Tailwind CSS 4, and TypeScript.

### Key Patterns

**Theme System**: Dark/light mode via `next-themes`. CSS variables defined in `globals.css` with `.dark` class variants. Theme toggle in header persists user preference.

**Styling**: Tailwind CSS 4 with CSS variables for colors (`--foreground`, `--background`, `--accent`, `--muted`, `--border`). The `@theme inline` block in `globals.css` maps these to Tailwind utilities (e.g., `bg-background`, `text-foreground`). Components can use either `var(--color-name)` or Tailwind's `color-*` classes.

**Case Studies**: Dynamic routes at `/case-studies/[slug]`. Data defined in `src/lib/case-studies.ts` with `CaseStudy` type. Uses `generateStaticParams` for SSG. Note: Next.js 16 requires `params` to be awaited (e.g., `const { slug } = await params`).

- `projectType`: Either `'personal'` or `'client'` to categorize projects
- Client projects can include optional `clientName` and `testimonial` fields
- Helper functions: `getCaseStudy(slug)` and `getAllCaseStudySlugs()`

### File Layout

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - React components (Header, Hero, About, CaseStudies, Skills, Contact, Footer, ThemeProvider, ThemeToggle)
- `src/lib/case-studies.ts` - Case study data and helper functions
