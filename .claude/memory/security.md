---
name: ATS Project-Wide Security Posture
description: Cross-cutting security decisions, accepted risks, and review schedule
type: project
---

## Posture
Internal-only tool. No public exposure. 8 named users. Backend integration complete — JWT auth via real .NET API. No candidate PII stored yet.

## Resolved Since Last Review (2026-04-24)

The following findings from the Sprint 0 security review are **resolved** because the frontend now uses real backend JWT auth instead of localStorage mock auth:

- ~~CRITICAL — Plaintext passwords in JS bundle~~ — `constants/users.ts` deleted. Auth is `POST /api/auth/login`.
- ~~HIGH — localStorage session unsigned, no expiry~~ — JWT issued by backend; expiry managed server-side.
- ~~HIGH — Role elevation via localStorage edit~~ — Role comes from JWT payload verified by backend on every request.
- ~~HIGH — JD drafts unsigned in localStorage~~ — `JDContext.tsx` and `ats_jd_drafts` localStorage key deleted. All JD state lives on the server.

## Remaining Open Findings

### MEDIUM — No brute-force lockout on login form
- **File:** `Front-End/src/pages/LoginPage.tsx` → `LoginForm.tsx`
- **Risk:** Unlimited login attempts against the backend
- **Fix:** Either backend rate-limiting (preferred) or client-side lockout after 5 attempts (10 min cooldown)
- **Status:** OPEN — backend team should implement rate limiting on `POST /api/auth/login`

### LOW — autoComplete not set on password field
- **File:** `Front-End/src/components/login/LoginForm.tsx`
- **Fix:** Add `autoComplete="current-password"` on the password `<input>`
- **Status:** OPEN

## Accepted Risks (valid until 2026-07-20)
All remaining findings accepted for internal use (private network, no PII stored, named users only).

**Hard gates — become blockers at any of:**
- Internet-accessible hosting
- Sensitive candidate data introduced
- Broader rollout beyond current 8 named users

## Notes
See `Front-End/.claude/memory/security.md` for detailed frontend-specific findings history.
