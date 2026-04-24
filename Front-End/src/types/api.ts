import type { ExperienceLevel, JDStatus, UserRole } from './index'

// Backend wraps every response in this envelope. Always unwrap with `.data`.
export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  errors: unknown | null
}

// Extends Error so callers can use `instanceof ApiError` to distinguish our
// typed API errors from unexpected runtime errors (e.g. TypeError, RangeError)
export class ApiError extends Error {
  status: number
  // Populated by the server on 400 responses to highlight specific form fields
  fields?: Record<string, string>

  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    username: string
    name: string
    role: UserRole
  }
}

export interface JDPreviewResponse {
  previewJD: string
}

// Raw server shape — snake_case, nullable fields. Never use this directly in
// the UI. Always go through mapDraft() in jdApi.ts to get a JDDraft instead.
export interface ApiDraft {
  id: string
  experience_level: ExperienceLevel
  job_title: string
  location: string
  work_mode: string
  work_hours: string
  duration: string
  stipend_salary: string
  fulltime_offer_salary: string
  years_of_experience: string
  role_description: string | null   // null until AI generates (overwritten by AI on create, then by interviewer on submit)
  assigned_to: string[] | null      // null until recruitment assigns
  status: JDStatus
  created_by: string
  created_at: string
}
