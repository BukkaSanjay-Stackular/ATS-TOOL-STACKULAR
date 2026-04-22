---
name: Frontend Security Findings
description: All security findings with severity, status, and remediation
type: project
---

## Review Date: 2026-04-20 | Reviewed By: security-engineer agent
## Last Updated: 2026-04-21

## Open Findings

### CRITICAL — Plaintext passwords in JS bundle
- **File:** `src/constants/users.ts` (previously `AuthContext.tsx`)
- **Risk:** Anyone with the built `dist/` JS file sees all 7 passwords in plaintext
- **Fix:** Compute bcrypt hashes offline → store in `.env.local` (gitignored) → compare with `bcryptjs` at login
- **Status:** OPEN

### HIGH — localStorage session unsigned, no expiry
- **File:** `src/context/AuthContext.tsx`
- **Risk:** Session never expires; any JS on same origin can write a valid-looking session
- **Fix:** HMAC-SHA256 sign session payload using SubtleCrypto; signing key in sessionStorage (tab-scoped); 8h TTL
- **Status:** OPEN

### HIGH — Role elevation via localStorage edit
- **Files:** `AuthContext.tsx` + `ProtectedRoute.tsx`
- **Risk:** Open browser console → set `localStorage.ats_user` with `role: "recruitment"` → instant access
- **Fix:** Resolved automatically when HMAC signing above is implemented
- **Status:** OPEN (blocked on HIGH above)

### HIGH — JD drafts unsigned in localStorage
- **File:** `src/context/JDContext.tsx`
- **Risk:** `ats_jd_drafts` in localStorage can be manually edited — attacker can change `createdBy`, `assignedTo`, `status`, or inject arbitrary JD content
- **Fix:** Same HMAC signing approach as session; or move to sessionStorage for tab-scoped isolation
- **Status:** OPEN (new finding — added 2026-04-21)

### MEDIUM — No brute-force lockout
- **File:** `src/pages/LoginPage.tsx`
- **Fix:** Lock form after 5 failed attempts for 10 minutes (in-memory state + localStorage timestamp)
- **Status:** OPEN

### LOW — Missing autoComplete on password field
- **File:** `src/pages/LoginPage.tsx`
- **Fix:** Add `autoComplete="current-password"` or `"off"` for shared machines
- **Status:** OPEN

## Cleared Findings
- XSS in error display — `{error}` is React text node, not raw HTML. Clean.
- Route guard bypass — guard logic sound; only exploitable via role elevation finding above.

## Accepted Until 2026-07-20
All findings accepted for internal Phase 1 (no public exposure, no PII stored).
Become hard blockers at: broader rollout, internet hosting, backend integration, or candidate data added.
