import { apiFetch, apiFetchBlob } from './apiClient'
import type { ApiDraft, ApiEnvelope, JDPreviewResponse } from '../types/api'
import type { ExperienceLevel, JDDraft } from '../types'

// Single conversion point between the server's snake_case shape (ApiDraft) and
// the camelCase JDDraft we use everywhere in the UI. Nullable server fields are
// normalized to empty strings / empty arrays here so the rest of the app never
// needs to null-check them.
function mapDraft(d: ApiDraft): JDDraft {
  return {
    id: d.id,
    experienceLevel: d.experience_level,
    jobTitle: d.job_title,
    location: d.location,
    workMode: d.work_mode,
    workHours: d.work_hours,
    duration: d.duration,
    stipendSalary: d.stipend_salary,
    fulltimeOfferSalary: d.fulltime_offer_salary,
    yearsOfExperience: d.years_of_experience,
    roleDescription: d.role_description ?? '',   // holds AI-generated JD after create; overwritten by interviewer on submit
    assignedTo: d.assigned_to ?? [],             // null until recruitment assigns someone
    status: d.status,
    createdBy: d.created_by,
    createdAt: d.created_at,
  }
}

export interface CreateDraftPayload {
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

export async function getDrafts(query: { createdBy?: string; assignedTo?: string }): Promise<JDDraft[]> {
  const params = new URLSearchParams()
  if (query.createdBy) params.set('createdBy', query.createdBy)
  if (query.assignedTo) params.set('assignedTo', query.assignedTo)
  const raw = await apiFetch<ApiEnvelope<ApiDraft[]>>(`/drafts?${params.toString()}`)
  return raw.data.map(mapDraft)
}

export async function createDraft(payload: CreateDraftPayload): Promise<JDDraft> {
  const raw = await apiFetch<ApiEnvelope<ApiDraft>>('/drafts', {
    method: 'POST',
    body: JSON.stringify({
      experience_level: payload.experience_level,
      job_title: payload.job_title,
      location: payload.location,
      work_mode: payload.work_mode,
      work_hours: payload.work_hours,
      duration: payload.duration,
      stipend_salary: payload.stipend_salary,
      fulltime_offer_salary: payload.fulltime_offer_salary,
      years_of_experience: payload.years_of_experience,
      role_description: payload.roleDescription,
    }),
  })
  return mapDraft(raw.data)
}

export async function updateDraft(id: string, payload: CreateDraftPayload): Promise<JDDraft> {
  const raw = await apiFetch<ApiEnvelope<ApiDraft>>(`/drafts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      experience_level: payload.experience_level,
      job_title: payload.job_title,
      location: payload.location,
      work_mode: payload.work_mode,
      work_hours: payload.work_hours,
      duration: payload.duration,
      stipend_salary: payload.stipend_salary,
      fulltime_offer_salary: payload.fulltime_offer_salary,
      years_of_experience: payload.years_of_experience,
      role_description: payload.roleDescription,
    }),
  })
  return mapDraft(raw.data)
}

export async function assignDraft(id: string, assignedTo: string[]): Promise<JDDraft> {
  const raw = await apiFetch<ApiEnvelope<ApiDraft>>(`/drafts/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assigned_to: assignedTo }),
  })
  return mapDraft(raw.data)
}

export async function submitRoleDescription(id: string, roleDescription: string): Promise<JDDraft> {
  const raw = await apiFetch<ApiEnvelope<ApiDraft>>(`/drafts/${id}/role-description`, {
    method: 'PATCH',
    body: JSON.stringify({ role_description: roleDescription }),
  })
  return mapDraft(raw.data)
}

export async function submitDraft(id: string): Promise<JDDraft> {
  // body: '{}' — the backend expects a JSON body even though there's no payload;
  // sending no body causes a 400 from the .NET middleware
  const raw = await apiFetch<ApiEnvelope<ApiDraft>>(`/drafts/${id}/submit`, { method: 'PATCH', body: '{}' })
  return mapDraft(raw.data)
}

// Calls the dedicated AI-generation endpoint once the backend implements it.
// Until then, role_description is populated inline by POST /drafts.
export async function generatePreview(id: string): Promise<JDPreviewResponse> {
  const raw = await apiFetch<ApiEnvelope<JDPreviewResponse>>(`/drafts/${id}/generate`, { method: 'POST', body: '{}' })
  return raw.data
}

export interface FinalizeDraftPayload {
  finalJD: string
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
}

export async function finalizeDraft(id: string, payload: FinalizeDraftPayload): Promise<JDDraft> {
  const raw = await apiFetch<ApiEnvelope<ApiDraft>>(`/drafts/${id}/finalize`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return mapDraft(raw.data)
}

export async function dismissDraft(id: string, username: string): Promise<JDDraft> {
  const raw = await apiFetch<ApiEnvelope<ApiDraft>>(`/drafts/${id}/dismiss`, {
    method: 'PATCH',
    body: JSON.stringify({ username }),
  })
  return mapDraft(raw.data)
}

export async function deleteDraft(id: string): Promise<void> {
  await apiFetch<void>(`/drafts/${id}`, { method: 'DELETE' })
}

export async function getPdf(id: string): Promise<Blob> {
  return apiFetchBlob(`/drafts/${id}/pdf`)
}
