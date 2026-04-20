---
name: ATS Stackular Project Overview
description: Project goals, phase plan, team ownership, and cross-folder API contracts
type: project
---

## What This Is
Internal ATS (Applicant Tracking System) used exclusively within the organization. Not publicly exposed. Credentials are predefined and distributed manually to named users.

## Two User Panels
- **Recruitment Panel** — post jobs, generate JDs, manage candidates
- **Interviewer Panel** — review candidates, submit feedback

## Phase Plan

| Phase | Scope | Status |
|---|---|---|
| 1 | Login page, Job Posting (Fresher + Experienced JD generation) | Done — Frontend |
| 2 | Recruitment Dashboard, Interviewer Panel features | Not started |
| 3 | Real backend API integration (replace all frontend mocks) | Not started |

## Folder Ownership

| Folder | Owner | Status |
|---|---|---|
| `Front-End/` | Frontend team | Phase 1 complete |
| `Back-End/` | Backend team | Not started |
| `AI & LLM's/` | AI/LLM team | Not started |

## Cross-Folder API Contracts

### JD Generation (Frontend → AI/LLM)
Frontend calls `generateJD()` in `Front-End/src/services/jdService.ts`.
When the AI API is ready, replace the function body with a real `fetch` call.

Expected request shape:
```ts
{ jobTitle: string, requiredSkills: string, experience?: string }
```
Expected response shape:
```ts
{ jobTitle: string, content: string }  // content is Markdown
```

### Authentication (Frontend → Backend)
Frontend `login()` in `Front-End/src/context/AuthContext.tsx` is the swap point.
When backend auth API is ready, replace the function body with a real API call.

Expected request: `{ username, password, role }`
Expected response: user object + session token
