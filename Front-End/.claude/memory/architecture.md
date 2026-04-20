---
name: Frontend Architecture
description: Tech stack, folder structure, routes, component map, and API swap points
type: project
---

## Stack
- React 19 + TypeScript (strict mode — currently MISSING, add `"strict": true` to tsconfig.app.json)
- Vite 8 with `@tailwindcss/vite` plugin (no tailwind.config.js needed)
- Tailwind CSS v4
- React Router v6 (nested routes)
- Lucide React for icons
- No external UI component library

## Folder Structure
```
src/
  types/index.ts                        — User, HireType, JD shared types
  context/
    AuthContext.tsx                     — AuthProvider + USERS array + login/logout logic
    useAuth.ts                          — useAuth hook (split for fast-refresh compliance)
  services/
    jdService.ts                        — generateJD() mock → swap body for real API
  components/
    ProtectedRoute.tsx                  — role-based route guard
    layout/RecruitmentLayout.tsx        — sidebar nav for recruitment panel
  pages/
    LoginPage.tsx
    recruitment/
      DashboardPage.tsx                 — placeholder (Phase 2)
      JobPostingPage.tsx                — Phase 1 complete
    interviewer/
      InterviewerDashboard.tsx          — placeholder (Phase 2)
  App.tsx
  main.tsx
```

## Routes
| Path | Role | Status |
|---|---|---|
| `/login` | public | done |
| `/recruitment/job-posting` | recruitment | done |
| `/recruitment/dashboard` | recruitment | placeholder |
| `/interviewer/dashboard` | interviewer | placeholder |

## API Swap Points
| File | Function | What to replace |
|---|---|---|
| `src/services/jdService.ts` | `generateJD()` body | Replace `setTimeout` mock with real `fetch` to AI/LLM API |
| `src/context/AuthContext.tsx` | `login()` body | Replace USERS lookup with real `fetch` to Backend auth API |

## Credentials (Phase 1 only)
7 named users in `AuthContext.tsx`. Pattern: `<name>@<role>-stack`.
Recruitment: Amulya, Sai Kalyan, Venkat. Interviewer: Karthik, Fardeen, Jay, Nadem.
Move to `.env.local` (gitignored) before any broader rollout.
