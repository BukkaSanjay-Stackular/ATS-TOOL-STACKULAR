---
name: ATS Project-Wide Security Posture
description: Cross-cutting security decisions, accepted risks, and review schedule
type: project
---

## Posture
Internal-only tool. No public exposure. 7 named users. No sensitive candidate data stored yet (Phase 1).

## Accepted Risks (valid until 2026-07-20)
Phase 1 frontend auth is mock-only (hardcoded credentials, unsigned localStorage session). Accepted because:
- Private network only
- No candidate PII stored
- Credentials distributed manually

**Hard gate — these risks become blockers at any of:**
- Internet-accessible hosting
- Sensitive candidate data introduced
- Backend integration begins

## Detailed Findings
See `Front-End/.claude/memory/security.md` for the full frontend security findings report.
