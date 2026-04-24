---
name: ATS Stackular — Root Dev Notes
description: Cross-cutting patterns and conventions for the entire monorepo
type: project
---

## 2026-04-24 (current state)

### Retired patterns — do not reference these
- `JDContext.tsx` / `useJD.ts` / `jdService.ts` — **deleted**. All JD state is now in TanStack Query + real API.
- `constants/users.ts` — **deleted**. Auth is `POST /api/auth/login` from the backend.
- React Router DOM — **replaced** by TanStack Router (`@tanstack/react-router`).
- `BrowserRouter`, `Routes`, `Route`, `NavLink`, `Navigate` — none of these exist anymore.
- `JDProvider` wrapping `AuthProvider` in App.tsx — `JDProvider` is gone. App.tsx now uses `QueryClientProvider → AuthProvider → ToastProvider → RouterProvider`.

### Active conventions

**Router — TanStack Router only**
- All routes in `Front-End/src/router.tsx`. App.tsx uses `<RouterProvider router={router} />`.
- Navigate: `navigate({ to: '/path' })` — always an object, never a plain string.
- Active nav links: `<Link activeProps={{ style: {...} }} inactiveProps={{ style: {...} }}>` — no `NavLink`.
- Guarded redirects: `useNavigate` + `useEffect` — no `<Navigate />` component.
- TanStack Router's `*` wildcard does NOT match `/` — explicit `rootIndexRoute` handles the root path.

**Type boundary — ApiDraft ↔ JDDraft**
- `ApiDraft` (snake_case, nullable) lives in `types/api.ts`. Never import it in components.
- `JDDraft` (camelCase, all non-nullable) lives in `types/index.ts`. Use this everywhere in the UI.
- `mapDraft()` in `jdApi.ts` is the only place that converts between the two.

**Styling**
- Inline styles + `onMouseEnter/Leave/Focus/Blur` handlers for all color changes. No `hover:bg-[...]` Tailwind classes.
- Design tokens: surface `#161719`, surface-2 `#1a1d20`, border `#37373f`, accent `#1d2ba4`, font `Sora, sans-serif`.

**Spinners**
- Use `<Spinner size="sm|md|lg" />` from `components/ui/Spinner.tsx` (Tailwind `animate-spin`).
- Never write `@keyframes spin` style blocks inside a component.

**Comments**
- Write only to explain WHY — hidden constraints, timing rationale, workarounds for external bugs.
- Never explain WHAT the code does. Never document the current task or callers.

**GlowOrb**
- Include `<GlowOrb />` in every full-page layout. Updates DOM directly via `ref.current.style` on `mousemove` — never setState.
