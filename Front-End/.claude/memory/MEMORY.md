# Front-End Memory

## Quick Context
React 19 + TypeScript strict + Vite + Tailwind CSS v4 + **TanStack Router** + TanStack Query v5. Two portals: Recruitment (JD creation, assignment, finalization) and Interviewer (role description filling). Fully integrated with real .NET + MySQL API — no mock data. JWT auth. Sora font. Cursor-tracking GlowOrb in every layout. Login has a logo-fly animation.

Current branch: `task/api/assign`. Main branch: `main`.

Key rules:
- Router is TanStack Router — `navigate({ to: '/path' })` always, object syntax not string
- TanStack Router `*` does not match `/` — `rootIndexRoute` handles the root path explicitly
- `ApiDraft` (snake_case, nullable) → `mapDraft()` → `JDDraft` (camelCase, non-nullable). Never bypass this boundary.
- UI components live in `components/ui/` — use them, don't inline
- Comments explain WHY only — never WHAT

## Memory Index

- [Architecture](architecture.md) — Stack, full file map, routes, JD status machine, ADRs, API contracts
- [Dev Notes](dev-notes.md) — Design tokens, styling patterns, UI component library, animation details, gotchas
- [Security](security.md) — Security findings, resolved items, remaining open findings
