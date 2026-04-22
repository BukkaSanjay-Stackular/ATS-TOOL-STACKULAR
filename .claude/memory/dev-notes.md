# Dev Notes

## 2026-04-21
- Pattern: JD state managed via `JDContext` + `useJD` hook in `Front-End/src/context/` — all drafts persisted to `localStorage` key `ats_jd_drafts`
- Convention: Hover interactions use `onMouseEnter/Leave` inline style mutation — never Tailwind hover color classes — applies to all interactive elements across the app
- Convention: All user accounts defined in `Front-End/src/constants/users.ts` as `USERS` and `INTERVIEWERS` — `AuthContext` imports from there, not inline
- Gotcha: `GlowOrb` updates DOM directly via `ref.current.style` on `mousemove` (no React state) — keep it this way; adding `setState` would cause excessive re-renders
- Pattern: `JDDraft.status` transitions: draft → assigned (on createDraft with assignedTo) → returned (interviewer submits) → finalized (generateJD called)
- Convention: Selects use inline `selectStyle` object with `background: #1a1d20; border: 1px solid #37373f` — defined at module level in each page file
- Gotcha: `JDProvider` wraps `AuthProvider` in `App.tsx` — reversing this order would cause `useJD` to be unavailable in auth-dependent components
- Convention: `InterviewerLayout` and `RecruitmentLayout` share identical structure — only sidebar label and nav items differ; keep them separate files, do not abstract
