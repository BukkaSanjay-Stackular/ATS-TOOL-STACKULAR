---
name: Frontend Architecture
description: Stack, full file map, TanStack Router structure, JD status machine, ADRs
type: project
---

## Stack
- React 19 + TypeScript (strict, `erasableSyntaxOnly: true`)
- Vite with `@tailwindcss/vite` plugin (no tailwind.config.js)
- Tailwind CSS v4
- **TanStack Router** — all routing (`@tanstack/react-router`) — React Router DOM removed
- TanStack Query v5 — all server state
- Lucide React icons, Sora font
- No external UI component library, no animation libraries

## Full File Map (src/)

```
router.tsx                    — ALL routes via TanStack Router; imported into App.tsx

lib/
  queryClient.ts              — QueryClient(retry:1, staleTime:30_000)

constants/
  jd.ts                       — INTERVIEWERS, LOCATIONS, WORK_MODES, WORK_HOURS, LEVEL_META

services/
  apiClient.ts                — apiFetch<T> + apiFetchBlob: attaches JWT Bearer, parses ApiError,
                                on 401 dispatches 'ats:session-expired' + throws
  authApi.ts                  — login() → POST /api/auth/login → LoginResponse
  jdApi.ts                    — getDrafts, createDraft, updateDraft, assignDraft,
                                submitRoleDescription, submitDraft, generatePreview,
                                finalizeDraft, dismissDraft, deleteDraft, getPdf
                                mapDraft() — ONLY place ApiDraft → JDDraft conversion happens

types/
  index.ts                    — UserRole, ExperienceLevel, JDStatus, User, JDDraft (camelCase, non-nullable)
  api.ts                      — ApiError class, LoginResponse, JDPreviewResponse,
                                ApiDraft (snake_case, nullable — never use in UI directly)

hooks/
  useToast.ts                 — { showToast }
  useLoginAnimation.ts        — 4-phase animation state machine; startAnimation(logoEl, username, onDone)
  useJDMutations.ts           — 5 mutations: assign, generateFromForm, updateAndGenerate,
                                generateFromDraft, delete; plus generatingDraftId state

context/
  AuthContext.tsx             — AuthProvider: async login(), logout() clears queryClient;
                                stores { token, user } in localStorage 'ats_user';
                                lazy init via loadStoredAuth function passed to useState
  useAuth.ts                  — useAuth() hook

components/
  GlowOrb.tsx                 — cursor-tracking orb; ref.current.style mutation only — zero re-renders
  ProtectedRoute.tsx          — role guard: useNavigate + useEffect (no <Navigate /> in TanStack Router)
  JDPreviewModal.tsx          — LLM preview, Edit toggle, Copy, Approve & Finalize; uses PrimaryButton
  DownloadButton.tsx          — getPdf → blob URL → anchor download → revoke; uses Spinner

  ui/
    PrimaryButton.tsx         — blue filled; loading swaps children for Spinner + loadingText
    GhostButton.tsx           — outline; danger prop enables red-hover variant
    Spinner.tsx               — Tailwind animate-spin; size: 'sm'|'md'|'lg'
    StatusBadge.tsx           — draft=grey, assigned=amber, returned=blue, finalized=green
    FormInput.tsx             — extends InputHTMLAttributes; error prop shows message + keeps border red
    FormSelect.tsx            — extends SelectHTMLAttributes; blue focus border
    FieldLabel.tsx            — flex label; required prop adds red asterisk inline
    SectionLabel.tsx          — icon + text section header

  layout/
    RecruitmentLayout.tsx     — sidebar (Link activeProps/inactiveProps) + Outlet + GlowOrb
    InterviewerLayout.tsx     — sidebar (Link activeProps/inactiveProps) + Outlet + GlowOrb

  login/
    PanelSelector.tsx         — role selector; null=divider between buttons, selected=gap + highlight
    LoginForm.tsx             — owns username/password/showPassword; calls onSubmit(username, password)

  job-posting/
    types.ts                  — JDFormState interface + EMPTY_FORM constant
    ExperienceLevelSelector.tsx — 3 gradient cards (intern/fresher/experienced)
    JDFormFields.tsx          — FormInput/FormSelect/FieldLabel; conditional by experience_level
    AssignInterviewerPanel.tsx — dropdown; pending state discarded on cancel, committed on Confirm
    LiveSummaryPanel.tsx      — sticky sidebar; real-time form reflection + progress bar
    ReturnedDraftsSection.tsx — returned drafts section; null if empty
    JDListPanel.tsx           — collapsible all-JDs list; skeleton loading; StatusBadge + DownloadButton

  interviewer/
    DraftListView.tsx         — loading skeleton | empty state | draft list; StatusBadge
    DraftDetailView.tsx       — metadata grid + role description textarea + PrimaryButton

  Toast/
    Toast.tsx                 — single toast; auto-dismiss 4s
    ToastProvider.tsx         — fixed top-right, max 3; listens for 'ats:session-expired'
                                → navigate({ to: '/login' })

pages/
  LoginPage.tsx               — useLoginAnimation + PanelSelector + LoginForm + GlowOrb
  recruitment/
    JobPostingPage.tsx        — orchestrator: useQuery + useJDMutations + all sub-components
    DashboardPage.tsx         — minimal placeholder
  interviewer/
    InterviewerDashboard.tsx  — minimal welcome only
    InterviewerJobPostingPage.tsx — stat cards + DraftListView/DraftDetailView;
                                   refetchInterval:5000 (interviewers get assigned at any time)
```

## Deleted Files (do not reference)
```
src/context/JDContext.tsx     — retired; replaced by TanStack Query
src/context/useJD.ts          — retired
src/services/jdService.ts     — replaced by jdApi.ts
src/constants/users.ts        — truth lives in DB; auth is POST /api/auth/login
```

## TanStack Router Structure

```
rootRoute  (shell — just <Outlet />)
  rootIndexRoute   '/'                   → redirect /login
  loginRoute       '/login'              → LoginPage
  recruitmentRoute '/recruitment'        → ProtectedRoute(recruitment) > RecruitmentLayout
    recruitmentIndexRoute  '/'           → redirect /recruitment/job-posting
    recruitmentDashboardRoute 'dashboard' → DashboardPage
    recruitmentJobPostingRoute 'job-posting' → JobPostingPage
  interviewerRoute '/interviewer'        → ProtectedRoute(interviewer) > InterviewerLayout
    interviewerIndexRoute  '/'           → redirect /interviewer/dashboard
    interviewerDashboardRoute 'dashboard' → InterviewerDashboard
    interviewerJobPostingRoute 'job-posting' → InterviewerJobPostingPage
  catchAllRoute    '*'                   → redirect /login
```

**Critical:** `*` does NOT match `/` in TanStack Router. `rootIndexRoute` exists for this reason.

**App.tsx wrapper order:** `QueryClientProvider → AuthProvider → ToastProvider → RouterProvider`

## TanStack Query Keys

| Key | Where | Notes |
|---|---|---|
| `['drafts', username]` | JobPostingPage | recruitment; invalidated on all mutations |
| `['drafts', 'interviewer', username]` | InterviewerJobPostingPage | `refetchInterval: 5000` |

## JD Status Machine

```
'draft'     → saved; NOT visible to interviewers
'assigned'  → assigned to ≥1 interviewers; visible in interviewer portal
'returned'  → interviewer submitted role description back
'finalized' → recruitment approved JD after AI generation
```

## Architecture Decision Records

### ADR-1: TanStack Query as global data layer
Replaced JDContext localStorage pattern. Handles caching, polling, loading, invalidation. All server state goes through TanStack Query — components never call fetch directly.

### ADR-2: Service layer (apiClient → authApi / jdApi)
Plain async functions wrapped by TanStack Query. Future endpoints follow the same pattern.

### ADR-3: Two-tier error handling
Toast for critical/session errors (apiClient.ts handles once). Inline for field validation (component `fieldErrors` state). No mixing.

### ADR-4: Backend PDF endpoint
`GET /api/drafts/:id/pdf` returns binary. Frontend creates blob URL, triggers anchor download, revokes URL immediately after click (browser queues download before URL is revoked).

### ADR-5: Wait-for-server updates
No optimistic updates. All mutations wait for server confirmation. Internal HR tool — correctness over speed.

### ADR-6: GlowOrb as shared component
`ref.current.style` mutation on mousemove — zero React re-renders. In every layout + LoginPage.

### ADR-7: Inline styles over Tailwind for colors
Hover/focus/active via `onMouseEnter/Leave/Focus/Blur`. No `hover:bg-[...]` Tailwind classes.

### ADR-8: Polling scoped to InterviewerJobPostingPage
`refetchInterval: 5000` only on interviewer drafts query. Background polls are silent.

### ADR-9: erasableSyntaxOnly — no parameter properties
`tsconfig.app.json` has `"erasableSyntaxOnly": true`. Declare class fields explicitly above constructor; assign in body. Never use `public`/`private` on constructor parameters.

### ADR-10: TanStack Router (migrated from React Router DOM)
All routes in `src/router.tsx`. `RouterProvider` in App.tsx. `react-router-dom` fully removed.

### ADR-11: Modular component architecture
Large pages decomposed into hooks + sub-components. Shared UI in `components/ui/`. Page-specific sub-components in named sub-folders. Mutations extracted into `useJDMutations`. Animation logic in `useLoginAnimation`.

### ADR-12: Spinner via Tailwind animate-spin
`<Spinner />` component uses Tailwind's built-in class. No `@keyframes spin` style blocks in any component.

### ADR-13: Comment philosophy
Comments explain WHY only — hidden constraints, timing rationale, external bug workarounds. Never document WHAT the code does.
