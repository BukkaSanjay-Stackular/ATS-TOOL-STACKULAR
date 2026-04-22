---
name: Frontend Dev Notes
description: Design tokens, styling patterns, animation details, gotchas, tech debt
type: project
---

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| background | `#0c0c0c` | Page background |
| surface | `#161719` | Cards, panels, sidebar |
| surface-2 | `#1a1d20` | Inputs, selects, toggle bars |
| border | `#37373f` | All borders and dividers |
| accent | `#1d2ba4` | Primary blue — buttons, active nav, focus rings |
| accent-hover | `#12219e` | Button hover state |
| text | `#ffffff` | Primary text |
| text-muted | `#9ca3af` | Secondary / placeholder text |
| font | `Sora, sans-serif` | All text via `--font-primary` CSS var |

## Styling Patterns — Always Follow

### Inputs / Selects / Textareas
```tsx
style={{ background: '#1a1d20', border: '1px solid #37373f', color: '#fff', borderRadius: '8px', padding: '10px 14px' }}
onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
```

### Primary Button
```tsx
style={{ background: '#1d2ba4' }}
onMouseEnter={(e) => (e.currentTarget.style.background = '#12219e')}
onMouseLeave={(e) => (e.currentTarget.style.background = '#1d2ba4')}
```

### Cards
```tsx
style={{ background: '#161719', border: '1px solid #37373f', borderRadius: '16px' }}
```

### Active Nav Link (React Router NavLink)
```tsx
style={({ isActive }) => isActive ? { background: '#1d2ba4', color: '#fff' } : { color: '#9ca3af' }}
```

### Ghost / Secondary Button
```tsx
style={{ color: '#9ca3af', border: '1px solid #37373f', background: 'transparent' }}
onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
```

## Glow Orb

`GlowOrb.tsx` — include in every full-page layout (RecruitmentLayout, InterviewerLayout, any future layout).
- `useRef` + `useEffect` with `window.addEventListener('mousemove')`
- Updates `ref.current.style.left/top` directly — NEVER setState — zero re-renders
- Starts at `left: 50vw; top: 50vh` (center) on mount
- `transition: left 0.18s ease-out, top 0.18s ease-out`
- `filter: blur(56px)`, `z-index: 0`, `pointer-events: none`, `width/height: 520px`
- LoginPage has its own inline orb instance (lives outside layout tree)

## Login Page Animation

Triggered on successful auth. Keyframes in `index.css`: `card-collapse`, `greeting-in`, `greeting-out`.

| Time | Event |
|---|---|
| 0ms | Card fades/scales out (`card-collapse`), flying logo mounts at original logoRef position |
| 80ms | Flying logo CSS-transitions to center (`calc(50vw - 40px)`, `calc(50vh - 72px)`), grows to 80px |
| 900ms | Greeting appears below logo: `Good morning/afternoon/evening, {capturedUser} 😊` |
| 2300ms | Greeting fades out, logo CSS-transitions to top-left corner (`left: 16px, top: 14px`) |
| 2980ms | `navigate(dest)` fires |

`getGreeting()` — `h < 12` morning, `h < 17` afternoon, else evening.
`capturedUser` captured at submit time via `setCapturedUser(username)` before state can clear.

## Gotchas & Rules

- **Navigator path for interviewers**: LoginPage navigates to `/interviewer/dashboard`. With nested layout, this resolves correctly — do not change.
- **JDProvider position**: Wraps `AuthProvider` in App.tsx. Intentional — JD context available everywhere.
- **No decorative SVG lines**: Multiple attempts were rejected by the user. Do not add SVG branch/arc/vine decorations to any page.
- **No custom cursor**: `cursor: none` + logo-cursor div was removed by user. Keep native browser cursor always.
- **No Tailwind color hover classes**: All hover/focus/active color changes via inline JS handlers only.
- **Always import `useAuth` from `context/useAuth.ts`** — never directly from `context/AuthContext.tsx`
- **Always import `useJD` from `context/useJD.ts`** — never directly from `context/JDContext.tsx`
- **gitnexus / symdex**: Not indexed yet. Run `npx gitnexus analyze` and `uvx symdex index` in `Front-End/` before using MCP tools.

## Tech Debt (carried forward + new)

| File | Issue | Priority |
|---|---|---|
| `tsconfig.app.json` | `"strict": true` likely missing — verify | High |
| `AuthContext.tsx` | `JSON.parse(stored)` in useState has no try/catch | High |
| `JDContext.tsx` | `JSON.parse` in `loadFromStorage` has try/catch ✓ | — |
| `JobPostingPage.tsx` | `generateJD()` call needs try/catch — UI can get stuck on loading | High |
| `AuthContext.tsx` | `login()` is sync, call sites treat it as async — make async before backend swap | High |
| `LoginPage.tsx` | `setLoading(false)` should be in try/finally | Medium |
| `ProtectedRoute.tsx` | Wrong-role redirect goes to `/login` — should go to user's own panel | Medium |
| `jdService.ts` | Old `JDParams` type fully replaced by `JDDraft` ✓ | — |
