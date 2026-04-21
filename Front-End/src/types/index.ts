export type UserRole = 'recruitment' | 'interviewer'

export interface User {
  id: number
  username: string
  role: UserRole
  name: string
  password?: string
}

export type HireType = 'fresher' | 'experienced'

export interface FresherJobForm {
  jobTitle: string
  requiredSkills: string
}

export interface ExperiencedJobForm extends FresherJobForm {
  experience: string
}

export interface GeneratedJD {
  jobTitle: string
  content: string
}
