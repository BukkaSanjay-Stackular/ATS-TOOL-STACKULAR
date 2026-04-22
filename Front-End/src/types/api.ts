import type { ExperienceLevel, JDStatus, UserRole } from './index'

export class ApiError extends Error {
  constructor(
    public override message: string,
    public status: number,
    public fields?: Record<string, string>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface LoginResponse {
  token: string
  user: {
    id: number
    username: string
    name: string
    role: UserRole
  }
}

export interface JDPreviewResponse {
  previewJD: string
}

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
  role_description: string
  assigned_to: string[]
  status: JDStatus
  created_by: string
  created_at: string
  generated_jd: string
}
