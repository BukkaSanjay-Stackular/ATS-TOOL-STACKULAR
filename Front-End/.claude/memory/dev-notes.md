---
name: Frontend Dev Notes
description: Design tokens, styling patterns, UI component library, animation details, gotchas
type: project
---

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| background | `#0c0c0c` | Page background |
| surface | `#161719` | Cards, panels, sidebar |
| surface-2 | `#1a1d20` | Inputs, selects, toggle bars |
| border | `#37373f` | All borders and dividers |
| accent | `#1d2ba4` | Primary blue — buttons, active nav, focus |
| accent-hover | `#12219e` | Button hover state |
| text | `#ffffff` | Primary text |
| text-muted | `#9ca3af` | Secondary / placeholder |
| font | `Sora, sans-serif` | All text |

## UI Component Library (`components/ui/`) — Always Use These

### PrimaryButton
```tsx
<PrimaryButton onClick={fn} loading={isPending} loadingText="Saving...">
  <Icon style={{ width: '14px', height: '14px' }} /> Save
</PrimaryButton>
```
`loading` swaps children for `<Spinner size="sm" />` + loadingText. `disabled || loading` → cursor:not-allowed + opacity:0.5.

### GhostButton
```tsx
<GhostButton onClick={fn} danger>Delete</GhostButton>
```
Default: grey outline + grey text. `danger`: red border + red text on hover.

### Spinner
```tsx
<Spinner size="sm" />  // 12px
<Spinner size="md" />  // 14px (default)
<Spinner size="lg" />  // 18px
```
Uses Tailwind `animate-spin`. **Never write `@keyframes spin` style blocks** — use this component.

### StatusBadge
```tsx
<StatusBadge status={draft.status} />
```
draft=grey (`#374151`/`#d1d5db`) · assigned=amber (`#78350f`/`#fcd34d`) · returned=blue (`#1e3a5f`/`#93c5fd`) · finalized=green (`#14532d`/`#86efac`)

### FormInput / FormSelect
```tsx
<FormInput value={v} onChange={e => set(e.target.value)} error={fieldErrors.job_title} />
<FormSelect value={v} onChange={e => set(e.target.value)}><option>...</option></FormSelect>
```
Blue focus border. FormInput shows error text below and keeps border red even while focused with an error.

### FieldLabel / SectionLabel
```tsx
<FieldLabel required>Job Title</FieldLabel>
<SectionLabel icon={Users} text="Assignment" />
```
FieldLabel uses `display: flex` — red asterisk stays inline even when children contains an icon span.

## Styling Patterns (raw elements not covered by ui/)

### Inputs (raw)
```tsx
style={{ background: '#1a1d20', border: '1px solid #37373f', color: '#fff', borderRadius: '8px', padding: '10px 14px' }}
onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
```

### Cards
```tsx
style={{ background: '#161719', border: '1px solid #37373f', borderRadius: '16px' }}
```

### Active Nav Link (TanStack Router)
```tsx
<Link to="/path"
  activeProps={{ style: { background: '#1d2ba4', color: '#fff' } }}
  inactiveProps={{ style: { color: '#9ca3af' } }}
>
```
No `NavLink` in TanStack Router. Use `Link` with `activeProps`/`inactiveProps`.

### Danger Icon Button
```tsx
onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#ef4444' }}
onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#37373f'; e.currentTarget.style.color = '#6b7280' }}
```

## Login Page Animation (`useLoginAnimation` hook)

4-phase state machine. Keyframes in `src/index.css`: `card-collapse`, `greeting-in`, `greeting-out`.

| Time | Phase | Event |
|---|---|---|
| 0ms | collapse | Card fades/scales out; flying logo clone stamps over original |
| 80ms | fly-center | Logo transitions to center (80px). 80ms = one paint cycle so clone renders before CSS transition fires |
| 900ms | greet | `Good morning/afternoon/evening, {username} 😊` fades in |
| 2300ms | fly-corner | Greeting fades; logo flies to top-left (16px, 14px) |
| 2980ms | — | `onDone()` fires → navigate to destination |

`getGreeting()` — `h < 12` morning · `h < 17` afternoon · else evening.

## Glow Orb (`GlowOrb.tsx`)

Include in every full-page layout (both layouts + LoginPage).
- `useRef` + `useEffect` + `window.addEventListener('mousemove')`
- Updates `ref.current.style.left/top` directly — **never setState** — zero re-renders
- Starts at center on mount; `transition: left 0.18s ease-out, top 0.18s ease-out`
- `filter: blur(56px)`, `z-index: 0`, `pointer-events: none`

## Comment Philosophy

Write comments only to explain **WHY** — hidden constraints, timing rationale, workarounds for external bugs, non-obvious invariants. Never explain WHAT the code does.

Good examples already in the codebase:
- `apiClient.ts` → why 204 is guarded before `.json()`; why CustomEvent instead of React
- `jdApi.ts` → why each `?? ''` / `?? []`; why `body: '{}'` on submitDraft
- `useLoginAnimation.ts` → why 80ms delay before CSS transition
- `AuthContext.tsx` → why full user object is stored; why lazy init on useState

## Gotchas

- **TanStack Router — object navigate**: `navigate({ to: '/path' })` not `navigate('/path')`. String form causes TypeScript error.
- **TanStack Router — `*` misses `/`**: Catch-all does not match root path. `rootIndexRoute` with `path: '/'` handles it.
- **No NavLink**: Use `<Link activeProps=... inactiveProps=...>`. No `NavLink` export in TanStack Router.
- **No `<Navigate />`**: Use `useNavigate` + `useEffect` in ProtectedRoute and similar guards.
- **erasableSyntaxOnly**: Never `public`/`private` on constructor params. Declare fields above, assign in body.
- **snake_case ↔ camelCase boundary**: Translation only in `mapDraft()`. Never use `ApiDraft` in components.
- **Nullable server fields**: `role_description`, `assigned_to`, `generated_jd` are `| null` in `ApiDraft`. `mapDraft()` normalizes to `''`/`[]`. `JDDraft` is always non-nullable.
- **fieldErrors keys are snake_case**: Field errors from 400 responses use API field names (`job_title`, not `jobTitle`). `setField` clears using the same snake_case key — mismatch means the error never clears.
- **submitDraft body must be `'{}'`**: .NET backend requires a JSON body even with no payload; no body = 400.
- **401 handling is automatic**: `apiClient.ts` catches 401, dispatches `'ats:session-expired'`, throws. `ToastProvider` navigates to `/login`. Do not add extra 401 handling in components.
- **No Tailwind hover color classes**: All color changes via inline JS event handlers.
- **No inline spinners**: Use `<Spinner />`. Never write `@keyframes spin` in a component.
- **getDrafts `createdBy` is a filter**: `GET /api/drafts?createdBy=username` — backend filters; `createdBy` is NOT in `CreateDraftPayload`.
- **gitnexus / symdex**: Run `npx gitnexus analyze` and `uvx symdex index` in `Front-End/` before using MCP tools.

## Resolved Tech Debt (do not re-introduce)

| Was | Fix |
|---|---|
| Plaintext creds in `constants/users.ts` | Deleted — auth is real API |
| `JDContext` localStorage CRUD | Deleted — TanStack Query |
| React Router DOM | Removed — TanStack Router |
| Inline spinner `@keyframes spin` blocks | Replaced with `<Spinner />` component |
| `JSON.parse` without try/catch in AuthContext | Fixed — wrapped in try/catch |
| `login()` was sync, called as async | Fixed — `async function login()` with `finally` |
