import type { GeneratedJD } from '../types'

interface JDParams {
  jobTitle: string
  requiredSkills: string
  experience?: string
}

// Swap this function body with the real API call once backend is ready.
export async function generateJD(params: JDParams): Promise<GeneratedJD> {
  await new Promise((r) => setTimeout(r, 1200))

  const level = params.experience ? `experienced professional with ${params.experience} of experience` : 'fresher / entry-level candidate'
  const skills = params.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)

  const content = `
## Job Title
${params.jobTitle}

## About the Role
We are looking for a motivated ${level} to join our growing team as a **${params.jobTitle}**. This is an exciting opportunity to work on impactful projects in a collaborative environment.

## Key Responsibilities
- Design, develop, and maintain high-quality solutions related to ${params.jobTitle} responsibilities.
- Collaborate with cross-functional teams to define and ship new features.
- Participate in code reviews and contribute to best practices.
- Continuously learn and stay up-to-date with industry trends.
${params.experience ? `- Mentor junior team members and contribute to architectural decisions.` : `- Grow rapidly by learning from experienced team members.`}

## Required Skills
${skills.map((s) => `- ${s}`).join('\n')}

## What We Offer
- Competitive compensation package
- Flexible work environment
- Learning & development opportunities
- Collaborative and inclusive culture
${params.experience ? `- Leadership growth path` : `- Structured onboarding and mentorship program`}

## How to Apply
Send your resume and portfolio to our recruitment team. Shortlisted candidates will be contacted for further rounds.
`.trim()

  return { jobTitle: params.jobTitle, content }
}
