export type UserRole = 'recruitment' | 'interviewer'
export type ExperienceLevel = 'intern' | 'fresher' | 'experienced'

// JD lifecycle: draft (saved, hidden) → assigned (interviewer can see it) →
// returned (interviewer submitted role description) → finalized (recruitment approved)
export type JDStatus = 'draft' | 'assigned' | 'returned' | 'finalized'

export interface User {
  id: string
  username: string
  role: UserRole
  name: string
}

// Frontend-facing draft shape. All fields non-nullable — nulls are normalized
// in mapDraft() so the rest of the app doesn't have to guard against them.
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
