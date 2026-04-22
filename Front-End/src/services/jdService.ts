import type { JDDraft } from '../types'

export async function generateJD(draft: JDDraft): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1200))

  const levelLabel =
    draft.experienceLevel === 'intern'
      ? 'Intern'
      : draft.experienceLevel === 'fresher'
      ? 'Fresher / Entry-Level'
      : 'Experienced Professional'

  const compensationLine =
    draft.experienceLevel === 'intern'
      ? `- Stipend: ₹${draft.stipend} INR\n- Duration: ${draft.duration}`
      : draft.experienceLevel === 'fresher'
      ? `- Full-Time Offer Salary: ₹${draft.fullTimeOfferSalary} INR`
      : `- Salary: ₹${draft.salary} INR`

  const roleDescSection = draft.roleDescription
    ? `\n## Role Overview\n${draft.roleDescription}\n`
    : ''

  const content = `## Job Title
${draft.jobTitle}

## Experience Level
${levelLabel}

## Location & Work Details
- Location: ${draft.location}
- Work Mode: ${draft.workMode}
- Work Hours: ${draft.workHours}

## Compensation
${compensationLine}
${roleDescSection}
## About the Role
We are looking for a talented ${levelLabel} to join the Stackular team as a **${draft.jobTitle}**. This is an exciting opportunity to work in a fast-paced, collaborative environment where your contributions directly impact our product and customers.

## Key Responsibilities
- Design, develop, and deliver high-quality work aligned with ${draft.jobTitle} responsibilities.
- Collaborate with cross-functional teams to define requirements and ship features.
- Participate in reviews and contribute to best practices within the team.
- Proactively communicate progress, blockers, and ideas to stakeholders.
${draft.experienceLevel === 'experienced' ? '- Mentor junior team members and contribute to architectural decisions.\n- Lead initiatives and drive improvements across the engineering organization.' : draft.experienceLevel === 'intern' ? '- Learn and grow under the guidance of experienced team members.\n- Contribute meaningfully to live projects during the internship duration.' : '- Grow rapidly by working alongside experienced professionals.\n- Build foundational knowledge and skills in a structured environment.'}

## What We Offer
- Competitive compensation package
- Flexible ${draft.workMode.toLowerCase()} work environment
- Learning & development opportunities
- Collaborative and inclusive culture at Stackular
${draft.experienceLevel === 'experienced' ? '- Leadership growth path and technical ownership opportunities' : draft.experienceLevel === 'intern' ? `- Hands-on experience with a ${draft.duration} internship program\n- Potential full-time opportunity for high performers` : '- Structured onboarding program with dedicated mentorship\n- Clear career growth pathway'}

## How to Apply
Send your resume and portfolio to our recruitment team at Stackular. Shortlisted candidates will be contacted within 5–7 business days for further assessment rounds.

---
*This job description was created using Stackular ATS.*`.trim()

  return content
}
