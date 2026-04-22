---
name: Frontend Architecture
description: Tech stack, full file map, routes, JD status machine, ADRs, API swap points
type: project
---

## Stack
- React 19 + TypeScript 6 (strict mode)
- Vite 8 with `@tailwindcss/vite` plugin (no tailwind.config.js needed)
- Tailwind CSS v4
- React Router v7 (nested routes)
- Lucide React for icons
- No external UI component library, no animation libraries

## Folder Structure

```
src/
  constants/
    users.ts                            — USERS array + INTERVIEWERS filter (single source of truth)
  types/
    index.ts                            — UserRole, ExperienceLevel, JDStatus, User, JDDraft, GeneratedJD
  context/
    AuthContext.tsx                     — AuthProvider, imports USERS from constants, login/logout
    useAuth.ts                          — useAuth() hook
    JDContext.tsx                       — JDProvider, localStorage-persisted JD draft CRUD
    useJD.ts                            — useJD() hook
  services/
    jdService.ts                        — generateJD(draft: JDDraft) mock → swap for real API
  components/
    GlowOrb.tsx                         — cursor-tracking glow orb (ref-driven, zero re-renders)
    ProtectedRoute.tsx                  — role-based route guard
    layout/
      RecruitmentLayout.tsx             — sidebar + Outlet + GlowOrb
      InterviewerLayout.tsx             — sidebar + Outlet + GlowOrb
  pages/
    LoginPage.tsx                       — panel picker + sign-in + logo-fly animation
    recruitment/
      DashboardPage.tsx                 — placeholder
      JobPostingPage.tsx                — JD creation, assign to interviewer, returned JDs, all drafts
    interviewer/
      InterviewerDashboard.tsx          — stats: assigned count, submitted count, recent activity
      InterviewerJobPostingPage.tsx     — assigned JD list + fill role description + submit back
  App.tsx
  main.tsx
  index.css                             — global styles + keyframes (card-collapse, greeting-in, greeting-out)
```

## Routes

| Path | Component | Role | Status |
|---|---|---|---|
| `/login` | LoginPage | public | done |
| `/recruitment/job-posting` | JobPostingPage | recruitment | done |
| `/recruitment/dashboard` | DashboardPage | recruitment | placeholder |
| `/interviewer/dashboard` | InterviewerDashboard | interviewer | done |
| `/interviewer/job-posting` | InterviewerJobPostingPage | interviewer | done |

Both `/recruitment` and `/interviewer` are parent routes wrapping layout components. `JDProvider` wraps `AuthProvider` wraps `BrowserRouter` in App.tsx.

## JD Status Machine

```
'draft'     → created, not yet assigned (recruitment may have filled role description)
'assigned'  → assigned to ≥1 interviewers, waiting for role description fill
'returned'  → interviewer submitted role description back to recruitment
'finalized' → recruitment generated JD text, stored in draft.generatedJD
```

Status badge colors: draft=gray (#374151), assigned=amber (#78350f), returned=blue (#1e3a5f), finalized=green.
JD drafts persisted to localStorage key `ats_jd_drafts`.

## JD Fields by Experience Level

**Intern:** Job Title, Duration, Location, Work Mode, Work Hours, Stipend/Salary, Role Description
**Fresher:** Job Title, Location, Work Mode, Work Hours, Full-Time Offer Salary, Role Description
**Experienced:** Job Title, Location, Work Mode, Work Hours, Salary, Role Description

Location options: Hyderabad, Chicago, Columbia, San Jose
Work Mode options: On-site, Remote, Hybrid
Work Hours options: `11:00 AM – 8:00 PM` / `2:00 PM – 11:00 PM`

## Auth Accounts (`src/constants/users.ts`)

Recruitment: Amulya, Sai Kalyan, Venkat | Interviewer: Karthik, Fardeen, Jay, Nadem
Session persisted to localStorage key `ats_user`.

## Architecture Decision Records

### ADR-1: No backend — localStorage only
All auth and JD state in localStorage. `generateJD` simulates 1200ms delay. Single swap-point for real API.

### ADR-2: GlowOrb as shared component
`GlowOrb.tsx` uses `ref.current.style` mutation in `mousemove` — zero React re-renders. Include in every layout wrapper. LoginPage has its own inline instance (outside layout system).

### ADR-3: USERS moved to constants
Previously inline in AuthContext. Now in `src/constants/users.ts` so JDContext and any future feature can reference the interviewer list without coupling to AuthContext.

### ADR-4: Inline styles over Tailwind for colors
All color overrides, hover/focus/active states use inline styles + `onMouseEnter/Leave/Focus/Blur` handlers. Tailwind used only for layout utilities. Do not introduce `hover:bg-[...]` Tailwind classes.

### ADR-5: InterviewerLayout mirrors RecruitmentLayout
Same structure — sidebar + Outlet + GlowOrb. Nav items point to `/interviewer/dashboard` and `/interviewer/job-posting`.

## API Swap Points

| File | Function | What to replace |
|---|---|---|
| `src/services/jdService.ts` | `generateJD()` body | Replace `setTimeout` mock with real fetch to AI/LLM API |
| `src/context/AuthContext.tsx` | `login()` body | Replace USERS lookup with real fetch to backend auth API |
