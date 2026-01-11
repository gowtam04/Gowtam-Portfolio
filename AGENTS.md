# AGENTS.md

This file provides working conventions for agentic coding assistants operating in this repository.

## Project Summary

- Next.js 16.1 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- Primary code lives in `src/`.
- CSS theme is driven by variables in `src/app/globals.css`.

## Agent Rules (Repo Specific)

- No em dashes: do not use the `—` character anywhere in the codebase.
  - Use commas, parentheses, colons, or hyphens instead.
- Prefer minimal, focused diffs.
- Do not add new tooling (test runners, formatters) unless requested.
- Do not `git commit` or push unless explicitly requested.

## Commands

All commands are run from the repo root.

### Install

- Install deps: `npm install`

### Dev

- Start dev server: `npm run dev`
  - Default: Next dev server (typically `http://localhost:3000`).

### Lint

- Run ESLint: `npm run lint`
- Lint one file (direct ESLint): `npx eslint src/components/Header.tsx`

### Typecheck

There is no explicit `typecheck` script; use one of these:

- Typecheck via TypeScript: `npx tsc -p tsconfig.json --noEmit`
- Typecheck as part of Next build: `npm run build`

### Build and Run

- Production build: `npm run build`
- Start prod server: `npm run start`

### Tests

- No test runner is currently configured in `package.json`.
- There are no `__tests__`, `*.test.*`, or `*.spec.*` files in this repo.

If you are asked to add tests later, first confirm the preferred test stack.
Common options for Next.js:

- Unit: Jest or Vitest
- E2E: Playwright

When a test runner exists, prefer commands that can run a single test file/test name.
Examples (only valid after adding the relevant tool):

- Jest single file: `npx jest src/lib/foo.test.ts`
- Jest single test name: `npx jest -t "does X"`
- Vitest single file: `npx vitest src/lib/foo.test.ts`
- Vitest single test name: `npx vitest -t "does X"`
- Playwright single spec: `npx playwright test tests/foo.spec.ts`

## Repository Layout

- `src/app/` - Next.js App Router pages, layouts, metadata, route segments
- `src/components/` - UI components
- `src/lib/` - data and helpers (case studies live here)

Key files:

- `src/app/layout.tsx` - root layout, metadata, theme provider wrapper
- `src/app/page.tsx` - homepage composition
- `src/app/case-studies/[slug]/page.tsx` - dynamic case study pages
- `src/lib/case-studies.ts` - case study data and helpers
- `src/app/globals.css` - Tailwind import + CSS variables + theme mapping

## Next.js Conventions

- App Router pages use server components by default.
- Client components must start with the directive: `"use client"` (first statement).
- Dynamic routes:
  - Case studies are at `/case-studies/[slug]`.
  - Static generation uses `generateStaticParams()`.

### Next.js 16 Params Gotcha

This repo is written for Next.js 16 behavior where `params` may be a promise.
Follow the established pattern used in `src/app/case-studies/[slug]/page.tsx`:

- Define props as `params: Promise<{ slug: string }>`
- Access as: `const { slug } = await params`

## Styling and Theme System

- Theme switching uses `next-themes` with a `.dark` class on `html`.
- CSS variables are defined in `src/app/globals.css` under `:root` and `.dark`.
- Tailwind CSS v4 is imported via `@import "tailwindcss";`.
- Tailwind color tokens are mapped through `@theme inline` in `src/app/globals.css`.

Guidelines:

- Prefer Tailwind utilities for layout and spacing.
- Prefer CSS variables for theme-aware colors:
  - `text-[var(--foreground)]`, `bg-[var(--background)]`, etc.
- Keep transitions subtle; avoid expensive global transitions beyond what exists.

## TypeScript Guidelines

- `strict` is enabled in `tsconfig.json`; keep types sound.
- Prefer `type` for unions and simple aliases; prefer `interface` for object shapes.
- Use `import type { Foo } from "..."` for type-only imports.
- Avoid `any`. If you must, contain it and justify it in the smallest scope.

## React and Component Guidelines

- Use functional components.
- Component files are PascalCase (e.g., `Header.tsx`).
- Prefer named exports for components (matches existing code).
- Avoid one-letter names except common callback params like `e` for events.

## Imports

Use a consistent import grouping order:

1. React and React hooks
2. Next.js imports (`next/*`)
3. Third-party libraries (`lucide-react`, etc.)
4. Internal aliases (`@/lib/*`, `@/components/*`)
5. Relative imports (`./ThemeToggle`)
6. Side-effect imports (CSS) last (e.g., `import "./globals.css"`)

Other import notes:

- Prefer `@/*` path alias for internal modules (configured in `tsconfig.json`).
- Keep import lists tidy; remove unused imports.

## Formatting

There is no Prettier config in this repo.
Follow existing conventions in the files you edit:

- 2-space indentation
- Double quotes for strings in TS/TSX
- Trailing commas where already used

## Naming Conventions

- Components: `PascalCase`
- Functions and variables: `camelCase`
- Types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE` only when truly constant and shared

## Error Handling Patterns

- In App Router pages, prefer Next helpers:
  - Use `notFound()` from `next/navigation` for missing resources.
  - For metadata generation, return a minimal fallback when data is missing.
- Prefer early returns over deeply nested conditionals.
- Do not swallow errors silently; if you catch errors, handle them intentionally.

## Linting

- ESLint config uses `eslint-config-next` (core-web-vitals + TypeScript).
- Keep changes lint-clean; run `npm run lint` after meaningful edits.

## Editor and AI Rule Files

- No Cursor rules found in `.cursor/rules/` or `.cursorrules`.
- No GitHub Copilot instructions found at `.github/copilot-instructions.md`.

If any of these are added later, update this file to reflect them.
