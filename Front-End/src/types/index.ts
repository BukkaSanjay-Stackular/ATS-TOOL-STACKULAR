export type UserRole = 'recruitment' | 'interviewer'
export type ExperienceLevel = 'intern' | 'fresher' | 'experienced'
export type JDStatus = 'draft' | 'assigned' | 'returned' | 'finalized'

export interface User {
  id: number
  username: string
  role: UserRole
  name: string
}

export interface JDDraft {
  id: string
  experienceLevel: ExperienceLevel
  jobTitle: string
  location: string
  workMode: string
  workHours: string
  duration: string
  stipendSalary: string
  fulltimeOfferSalary: string
  yearsOfExperience: string
  roleDescription: string
  assignedTo: string[]
  status: JDStatus
  createdBy: string
  createdAt: string
  generatedJD: string
}
