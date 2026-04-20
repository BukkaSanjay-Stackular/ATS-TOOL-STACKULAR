---
name: Backend API Contracts
description: API shapes the frontend expects — must match these when building backend endpoints
type: project
---

## Authentication API

Frontend swap point: `Front-End/src/context/AuthContext.tsx` → `login()` function body

### POST /auth/login
**Request:**
```json
{ "username": "string", "password": "string", "role": "recruitment" | "interviewer" }
```
**Response (success 200):**
```json
{
  "user": { "id": number, "username": "string", "role": "string", "name": "string" },
  "token": "string"
}
```
**Response (failure 401):**
```json
{ "error": "Invalid credentials" }
```

### POST /auth/logout
Invalidates session server-side.

---

## Notes for Backend Team
- Frontend currently uses hardcoded credentials in `AuthContext.tsx` — this is Phase 1 only
- When backend auth is ready, only the `login()` function body needs updating on the frontend
- Return a short-lived JWT — frontend will store it (replacing the current unsigned localStorage session)
- Role must be one of: `"recruitment"` | `"interviewer"` — exact string match required
