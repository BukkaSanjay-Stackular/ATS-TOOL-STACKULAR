---
name: Frontend Architecture
description: Tech stack, full file map, routes, JD status machine, ADRs, API integration design (Sprint 1)
type: project
---

## Stack
- React 19 + TypeScript 6 (strict mode)
- Vite 8 with `@tailwindcss/vite` plugin (no tailwind.config.js needed)
- Tailwind CSS v4
- React Router v7 (nested routes)
- Lucide React for icons
- **TanStack Query** — global data layer (added Sprint 1, used project-wide going forward)
- No external UI component library, no animation libraries

## Folder Structure (post Sprint 1)

```
src/
  services/
    apiClient.ts                          — base fetch wrapper, JWT header, 401 handling
    authApi.ts                            — login() → POST /api/auth/login
    jdApi.ts                              — all JD HTTP calls
  hooks/
    useToast.ts                           — showToast(message, type)
  types/
    index.ts                              — UserRole, ExperienceLevel, JDStatus, User, JDDraft
    api.ts                                — ApiError, LoginResponse, JDPreviewResponse
  context/
    AuthContext.tsx                       — token + user only, login() async, logout() clears cache
    useAuth.ts                            — useAuth() hook
  components/
    GlowOrb.tsx                           — cursor-tracking glow orb (ref-driven, zero re-renders)
    ProtectedRoute.tsx                    — role-based route guard
    Toast/
      ToastProvider.tsx                   — fixed top-right toast stack, wraps App
      Toast.tsx                           — single toast, auto-dismisses 4s
    JDPreviewModal.tsx                    — LLM preview + inline edit + Approve button
    DownloadButton.tsx                    — GET /api/drafts/:id/pdf → blob → anchor download
    layout/
      RecruitmentLayout.tsx               — sidebar + Outlet + GlowOrb
      InterviewerLayout.tsx               — sidebar + Outlet + GlowOrb
  pages/
    LoginPage.tsx                         — panel picker + sign-in + logo-fly animation
    recruitment/
      DashboardPage.tsx                   — placeholder
      JobPostingPage.tsx                  — JD creation, assign, preview modal, finalize, download
    interviewer/
      InterviewerDashboard.tsx            — minimal welcome
      InterviewerJobPostingPage.tsx       — polling, assigned JDs, role description, submit back
  App.tsx                                 — QueryClientProvider + ToastProvider wrap
  main.tsx
  index.css                               — global styles + keyframes
```

## Deleted in Sprint 1
```
src/context/JDContext.tsx     — retired, replaced by TanStack Query cache
src/context/useJD.ts          — retired
src/services/jdService.ts     — replaced by jdApi.ts
src/constants/users.ts        — truth lives in DB now
```

## Routes

| Path | Component | Role | Status |
|---|---|---|---|
| `/login` | LoginPage | public | done |
| `/recruitment/job-posting` | JobPostingPage | recruitment | Sprint 1 |
| `/recruitment/dashboard` | DashboardPage | recruitment | placeholder |
| `/interviewer/dashboard` | InterviewerDashboard | interviewer | done |
| `/interviewer/job-posting` | InterviewerJobPostingPage | interviewer | Sprint 1 |

App.tsx: `QueryClientProvider` → `ToastProvider` → `AuthProvider` → `BrowserRouter`
(JDProvider removed in Sprint 1)

## JD Status Machine

```
'draft'     → saved to DB, invisible to interviewers
'assigned'  → assigned to ≥1 interviewers, visible in interviewer portal
'returned'  → interviewer submitted role description back to recruitment
'finalized' → recruitment generated + approved JD, stored in generated_jd
```

Status badge colors: draft=gray (#374151), assigned=amber (#78350f), returned=blue (#1e3a5f), finalized=green.

---

## API Contract (Sprint 1 — .NET + MySQL backend)

### Base
```
Base URL:  /api
Auth:      Authorization: Bearer <jwt_token>  (all except /auth/login)
Content:   application/json
```

### Auth
```
POST /api/auth/login
Body:  { username, password, role: "recruitment" | "interviewer" }
200:   { token: string, user: { id, username, name, role } }
401:   { message: string }
```

### JD Endpoints
```
GET /api/drafts?createdBy=username          → JDDraft[]   (recruitment portal)
GET /api/drafts?assignedTo=username         → JDDraft[]   (interviewer — status:"assigned" only)

POST /api/drafts
Body:  { experience_level, job_title, location, work_mode, work_hours,
         duration?, stipend_salary?, fulltime_offer_salary?,
         years_of_experience?, createdBy }
201:   JDDraft | 400: { message, fields? }

PATCH /api/drafts/:id/assign
Body:  { assignedTo: string[] }
200:   JDDraft | 404: { message }

PATCH /api/drafts/:id/role-description
Body:  { roleDescription: string }
200:   JDDraft

PATCH /api/drafts/:id/submit
Body:  {}
200:   JDDraft   (status → "returned")

POST /api/drafts/:id/generate
Body:  {}
200:   { previewJD: string }   ← LLM output, NOT saved yet

POST /api/drafts/:id/finalize
Body:  { finalJD: string }     ← user-approved text (may be edited from preview)
200:   JDDraft   (status → "finalized")

GET /api/drafts/:id/pdf
200:   application/pdf binary | 404: { message }

DELETE /api/drafts/:id
204:   no body | 404: { message }

PATCH /api/drafts/:id/dismiss
Body:  { username: string }
200:   JDDraft
```

### JDDraft server shape
```typescript
{
  id: string
  experience_level: "intern" | "fresher" | "experienced"
  job_title: string
  location: string
  work_mode: string
  work_hours: string
  duration: string
  stipend_salary: string
  fulltime_offer_salary: string
  years_of_experience: string
  role_description: string
  assigned_to: string[]
  status: "draft" | "assigned" | "returned" | "finalized"
  created_by: string
  created_at: string   // ISO 8601
  generated_jd: string
}
```

### ApiError shape
```typescript
class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public fields?: Record<string, string>
  ) { super(message) }
}
```

---

## Auth Flow

### Login
```
POST /api/auth/login
  200 → store { token, user } in localStorage 'ats_user' → redirect to portal
  401 → inline error under form ("Invalid credentials")
  500/network → toast
```

### Token attachment
`apiClient.ts` reads token from localStorage, attaches `Authorization: Bearer` to every request.

### 401 on protected call
`apiClient.ts` → clear localStorage → `queryClient.clear()` → toast "Session expired" → redirect `/login`

### AuthContext shape
```typescript
interface AuthContextValue {
  user: User | null
  token: string | null
  login: (username: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  isLoading: boolean
}
```

---

## JD Flows

### Save Draft
```
POST /api/drafts → 201 → invalidateQueries(['drafts', username])
400 → inline field errors | 500 → toast
```

### Assign
```
Draft not saved: POST /api/drafts → PATCH /api/drafts/:id/assign (sequential)
Draft saved:     PATCH /api/drafts/:id/assign
200 → invalidateQueries(['drafts', username])
```

### Generate + Finalize
```
POST /api/drafts/:id/generate → { previewJD }
  → open JDPreviewModal (read-only display | "Edit" → textarea)
  → "Approve & Finalize" → POST /api/drafts/:id/finalize { finalJD }
    → 200 → invalidateQueries → modal closes → card shows Copy + Download PDF
```

### Download PDF
```
GET /api/drafts/:id/pdf → blob → anchor[download] → revoke URL
```

### Interviewer Polling
```typescript
useQuery(
  ['drafts', 'interviewer', username],
  () => jdApi.getDrafts(username),
  { refetchInterval: 5000 }   // silent background poll
)
```

### Interviewer Submit
```
PATCH /api/drafts/:id/role-description → PATCH /api/drafts/:id/submit
→ invalidateQueries(['drafts', 'interviewer', username])
```

### Query Keys
```typescript
['drafts', username]                    // recruitment
['drafts', 'interviewer', username]     // interviewer
```

---

## Error Handling

### Decision tree (apiClient.ts)
```
401  → clear token + queryClient.clear() + redirect /login + toast "Session expired"
400  → throw ApiError { message, fields } → component sets fieldErrors state (inline)
404  → throw ApiError { message } → toast
500  → toast "Server error, try again"
network failure → toast "No connection, check your network"
```

### Toast system
- Fixed top-right, auto-dismiss 4000ms, max 3 visible
- Inline styles only: bg #1f2937, colored left border (error=red, success=green, info=blue)

### Inline errors
```typescript
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
// Set on 400, cleared per-field on onChange
```

### Loading states
| Action | Button text |
|---|---|
| Login | "Signing in..." |
| Save Draft | "Saving..." |
| Assign | "Assigning..." |
| Generate JD | "Generating..." |
| Approve & Finalize | "Finalizing..." |
| Download PDF | "Downloading..." |
| Submit Role Desc | "Submitting..." |
| First page load | 3 skeleton cards |
| Background poll | Silent |

---

## Architecture Decision Records

### ADR-1: TanStack Query as global data layer
Replaces JDContext localStorage pattern. Handles caching, polling, loading, error states, and cache invalidation declaratively. Scales to full hiring pipeline in future sprints without new architecture decisions.

### ADR-2: Service layer under TanStack Query
`apiClient.ts` → `authApi.ts` / `jdApi.ts` are plain async functions. TanStack Query wraps them. Components never call `fetch` directly. Future sprints add new service files following the same pattern.

### ADR-3: Two-tier error handling
Toast for critical/session errors (handled once in apiClient.ts). Inline for field validation (handled per component via fieldErrors state). No mixed patterns.

### ADR-4: Backend PDF endpoint
PDF generation delegated to .NET backend (`GET /api/drafts/:id/pdf`). Frontend receives binary, creates blob URL, triggers anchor download. No client-side PDF library.

### ADR-5: Wait-for-server UI strategy
All mutations wait for server confirmation before updating UI. No optimistic updates. Internal HR tool — correctness over perceived speed.

### ADR-6: GlowOrb as shared component
`GlowOrb.tsx` uses `ref.current.style` mutation in `mousemove` — zero React re-renders. Include in every layout wrapper. LoginPage has its own inline instance.

### ADR-7: Inline styles over Tailwind for colors
All color overrides, hover/focus/active states use inline styles + `onMouseEnter/Leave/Focus/Blur` handlers. Tailwind used only for layout utilities. No `hover:bg-[...]` Tailwind classes.

### ADR-8: Polling scoped to InterviewerJobPostingPage
`refetchInterval: 5000` set only on the interviewer drafts query. No global polling. Background polls are silent — no spinner shown.
