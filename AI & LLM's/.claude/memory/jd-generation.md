---
name: JD Generation API Contract
description: What the frontend mock produces today and what the real AI API must return
type: project
---

## Frontend Swap Point
`Front-End/src/services/jdService.ts` → `generateJD()` function body
Replace the mock body with a real `fetch` call — nothing else changes.

## API Contract

### POST /api/jd/generate
**Request:**
```json
{
  "jobTitle": "string",
  "requiredSkills": "string",
  "experience": "string"   // optional — omit for fresher roles
}
```
**Response (success 200):**
```json
{
  "jobTitle": "string",
  "content": "string"   // Markdown-formatted job description
}
```

## What the Mock Currently Generates
The mock produces a Markdown JD with these sections:
- `## Job Title`
- `## About the Role`
- `## Key Responsibilities`
- `## Required Skills` (parsed from comma-separated input)
- `## What We Offer`
- `## How to Apply`

Fresher vs experienced variants differ in responsibilities and benefits copy.

## Notes for AI/LLM Team
- `content` field must be valid Markdown — frontend renders it in a `<pre>` tag today, may switch to a Markdown renderer in Phase 2
- `requiredSkills` arrives as a comma-separated string — parse it into a list for the prompt
- `experience` is only present for "experienced" job postings — use its absence to signal entry-level tone
- Response time: frontend shows a spinner with no timeout — keep generation under 30s
