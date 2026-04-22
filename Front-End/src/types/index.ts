export type UserRole = 'recruitment' | 'interviewer'
export type ExperienceLevel = 'intern' | 'fresher' | 'experienced'
export type JDStatus = 'draft' | 'assigned' | 'returned' | 'finalized'

export interface User {
  id: number
  username: string
  role: UserRole
  name: string
  password?: string
}

export interface JDDraft {
  id: string
  experienceLevel: ExperienceLevel
  jobTitle: string
  location: string
  workMode: string
  workHours: string
  duration: string
  stipend: string
  salary: string
  fullTimeOfferSalary: string
  experienceYears: string
  roleDescription: string
  assignedTo: string[]
  status: JDStatus
  createdBy: string
  createdAt: string
  generatedJD: string
}

export interface GeneratedJD {
  jobTitle: string
  content: string
}
