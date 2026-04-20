---
name: Frontend Dev Notes
description: Structural blockers, tech debt register, and code review findings from Phase 1
type: project
---

## Structural Blockers — Fix Before Phase 2

| File | Issue |
|---|---|
| `tsconfig.app.json` | `"strict": true` missing — TypeScript safety weakened |
| `App.tsx` | `AuthProvider` wraps `BrowserRouter` — must flip: BrowserRouter outside, AuthProvider inside |
| `AuthContext.tsx` | `JSON.parse(stored)` in useState has no try/catch — crashes on stale localStorage |
| `JobPostingPage.tsx` | `generateJD()` has no try/catch — UI permanently stuck on loading state if it throws |
| `LoginPage.tsx` | `setLoading(false)` unreachable if `login()` throws — wrap in try/finally |

## Tech Debt Register

| File | Issue | Priority |
|---|---|---|
| `AuthContext.tsx` | `login()` is sync, call sites treat it as async — make async before backend swap | High |
| `LoginPage.tsx` | 400ms artificial delay belongs in `login()` body, not the page | Medium |
| `ProtectedRoute.tsx` | Wrong-role redirect goes to `/login` — should go to user's own panel | Medium |
| `LoginPage.tsx` | Role tab switch doesn't clear username/password fields | Medium |
| `App.tsx` | Interviewer subtree has no parent route or index redirect | Medium |
| `jdService.ts` | `JDParams` duplicates `FresherJobForm`/`ExperiencedJobForm` — consolidate in types | Low |
| `JobPostingPage.tsx` | `setTimeout` in `handleCopy` not cleared on reset — use `useRef` | Low |
| `JobPostingPage.tsx` | 7 state variables — split into `JDForm` child component when it grows | Low |
| `RecruitmentLayout.tsx` | Spurious `user?.name` optional chaining — non-null guaranteed by ProtectedRoute | Nitpick |

## Patterns to Follow
- Always import `useAuth` from `context/useAuth.ts`, never from `context/AuthContext.tsx`
- Mock service functions always have a comment: "swap this body with real API call"
- New layout components go in `components/layout/`, new pages go in `pages/<panel>/`
