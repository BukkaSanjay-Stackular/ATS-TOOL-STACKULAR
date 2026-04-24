---
name: ATS Stackular Project Overview
description: Project goals, phase plan, team ownership, and cross-folder API contracts
type: project
---

## What This Is
Internal ATS (Applicant Tracking System) used exclusively within the organization. Not publicly exposed. Credentials managed server-side. JWT authentication via real .NET + MySQL backend.

## Two User Panels
- **Recruitment Panel** — create JD drafts, assign to interviewers, generate AI JDs, finalize, download PDF
- **Interviewer Panel** — see assigned JDs, fill in role description, submit back to recruitment

## Phase Plan

| Phase | Scope | Status |
|---|---|---|
| 1 | Login page, Job Posting (Intern + Fresher + Experienced JD creation) | Done — Frontend + Backend integrated |
| 2 | Recruitment Dashboard, Interviewer panel features, full modularization | Done — Frontend |
| 3 | Additional features TBD | Not started |

## Folder Ownership

| Folder | Owner | Status |
|---|---|---|
| `Front-End/` | Frontend team | Active — integrated with real API |
| `Back-End/` | Backend team | Active — .NET + MySQL |
| `AI & LLM's/` | AI/LLM team | Active — JD generation endpoint live |

## Auth Accounts (from API — `POST /api/auth/login`)

| Username | Password | Role |
|---|---|---|
| Amulya | amulya@hr-stack | recruitment |
| Sai Kalyan | kalyan@manager-stack | recruitment |
| Venkat | venkat@ceo-stack | recruitment |
| Karthik | karthik@dev-stack | interviewer |
| Fardeen | fardeen@dev-stack | interviewer |
| Jay | jay@engineer-stack | interviewer |
| Nadem | nadeem@engineer-stack | interviewer |
| Javeed | Javeed@design-stack | interviewer |

## Cross-Folder API Contract (live)

### Base
```
Base URL:  VITE_API_BASE_URL env var (falls back to /api)
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
GET  /api/drafts?createdBy=username    → JDDraft[]   (recruitment portal)
GET  /api/drafts?assignedTo=username   → JDDraft[]   (interviewer portal)

POST /api/drafts
Body:  { experience_level, job_title, location, work_mode, work_hours,
         duration?, stipend_salary?, fulltime_offer_salary?,
         years_of_experience?, role_description }
201:   ApiDraft | 400: { message, fields? }

PATCH /api/drafts/:id           (update draft fields)
PATCH /api/drafts/:id/assign    Body: { assigned_to: string[] }
PATCH /api/drafts/:id/role-description  Body: { role_description: string }
PATCH /api/drafts/:id/submit    Body: {}    (status → "returned")
PATCH /api/drafts/:id/dismiss   Body: { username: string }

POST /api/drafts/:id/generate   Body: {}   → { previewJD: string }
POST /api/drafts/:id/finalize   Body: { finalJD, + all draft fields }   → ApiDraft

GET    /api/drafts/:id/pdf      → application/pdf binary
DELETE /api/drafts/:id          → 204 no body
```

### ApiDraft server shape (snake_case, nullables)
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
  role_description: string | null     // null until interviewer fills it
  assigned_to: string[] | null        // null until recruitment assigns
  status: "draft" | "assigned" | "returned" | "finalized"
  created_by: string
  created_at: string                  // ISO 8601
  generated_jd: string | null         // null until AI generates
}
```

Frontend maps this to camelCase `JDDraft` via `mapDraft()` in `jdApi.ts`. Never use `ApiDraft` in components.
