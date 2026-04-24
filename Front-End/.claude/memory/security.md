---
name: Frontend Security Findings
description: All security findings with severity, status, and remediation
type: project
---

## Review Date: 2026-04-20 | Last Updated: 2026-04-24

---

## Resolved Findings (since backend integration)

### ~~CRITICAL — Plaintext passwords in JS bundle~~
- **Was:** `src/constants/users.ts` — all passwords in the built `dist/` file
- **Resolution:** File deleted. Auth is now `POST /api/auth/login` — passwords managed by backend.

### ~~HIGH — localStorage session unsigned, no expiry~~
- **Was:** `src/context/AuthContext.tsx` — manually constructed session, no TTL
- **Resolution:** JWT issued by backend with server-side expiry. Frontend stores token only.

### ~~HIGH — Role elevation via localStorage edit~~
- **Was:** Open console → edit `localStorage.ats_user` → gain recruitment role
- **Resolution:** Role is embedded in the JWT and verified by the backend on every request. Frontend role claim from localStorage is used only for UI routing — not for data access.

### ~~HIGH — JD drafts unsigned in localStorage~~
- **Was:** `src/context/JDContext.tsx` — `ats_jd_drafts` localStorage key editable by user
- **Resolution:** `JDContext.tsx` deleted. All JD state lives on the server. `ats_jd_drafts` key no longer used.

---

## Open Findings

### MEDIUM — No brute-force protection on login
- **File:** `Front-End/src/components/login/LoginForm.tsx` (form) — enforcement should be backend
- **Risk:** Unlimited login attempts against `POST /api/auth/login`
- **Fix:** Backend rate limiting on `/api/auth/login` (preferred). Client-side fallback: lock form after 5 failed attempts for 10 minutes.
- **Status:** OPEN — backend team item

### LOW — autoComplete not set on password field
- **File:** `Front-End/src/components/login/LoginForm.tsx`
- **Risk:** Browser may autofill on shared machines
- **Fix:** Add `autoComplete="current-password"` to the password `<input>`
- **Status:** OPEN (5-minute fix, low priority)

---

## Cleared (always-clean) Findings
- XSS in error display — `{error}` is a React text node, not raw HTML. Clean.
- Route guard bypass — `ProtectedRoute` uses JWT-derived user role. Backend enforces data access.

## Accepted Until 2026-07-20
All remaining findings accepted for internal use (private network, named users, no PII stored).

**Hard gates — become blockers at any of:**
- Internet-accessible hosting
- Sensitive candidate data (resumes, evaluations) introduced
- Broader rollout beyond current 8 named users
