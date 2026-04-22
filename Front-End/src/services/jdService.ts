import type { JDDraft } from '../types'

/**
 * Generate JD by calling FastAPI server directly
 * TEST BRANCH: Connects to FastAPI at http://localhost:8000
 * 
 * Note: In production, this should call .NET Backend instead:
 *       http://localhost:5000/api/jd/generate
 */
export async function generateJD(draft: JDDraft): Promise<string> {
  try {
    console.log('📝 Calling FastAPI to generate JD...', draft.jobTitle)

    // Map frontend field names to API field names
    const payload = {
      experienceLevel: draft.experienceLevel,
      jobTitle: draft.jobTitle,
      location: draft.location,
      workMode: draft.workMode,
      workHours: draft.workHours,
      duration: draft.duration,
      stipend: draft.stipend || null,
      salary: draft.salary || null,
      fullTimeOfferSalary: draft.fullTimeOfferSalary || null,
      experienceYears: draft.experienceYears || null,
      roleDescription: draft.roleDescription,
      companyName: 'Stackular'
    }

    console.log('📤 Sending payload to FastAPI:', payload)

    // Call FastAPI endpoint
    const response = await fetch('http://localhost:8000/generate-jd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    console.log('📬 FastAPI Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ FastAPI Error:', errorData)
      throw new Error(`FastAPI Error: ${errorData.error || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log('✅ FastAPI Success:', data.message)
    console.log('📄 Generated JD length:', data.jd?.length)

    if (!data.jd) {
      throw new Error('No JD content in response')
    }

    return data.jd
  } catch (error) {
    console.error('❌ Error calling FastAPI:', error)
    
    // Fallback: Show error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to generate JD: ${errorMessage}`)
  }
}
