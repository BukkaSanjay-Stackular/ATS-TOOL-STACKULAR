import type { ExperienceLevel } from '../../types'

// Form state for the JD creation form. Shared between JobPostingPage and its
// sub-components so props stay typed without re-declaring the shape everywhere.
export interface JDFormState {
  experience_level: ExperienceLevel | null
  job_title: string
  location: string
  work_mode: string
  work_hours: string
  duration: string
  stipend_salary: string
  fulltime_offer_salary: string
  years_of_experience: string
  roleDescription: string
  assignedTo: string[]
}

export const EMPTY_FORM: JDFormState = {
  experience_level: null,
  job_title: '',
  location: '',
  work_mode: '',
  work_hours: '',
  duration: '',
  stipend_salary: '',
  fulltime_offer_salary: '',
  years_of_experience: '',
  roleDescription: '',
  assignedTo: [],
}
