import { apiFetch, apiFetchBlob } from './apiClient'
import type { ApiDraft, JDPreviewResponse } from '../types/api'
import type { ExperienceLevel, JDDraft } from '../types'

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
    roleDescription: d.role_description ?? '',
    assignedTo: d.assigned_to ?? [],
    status: d.status,
    createdBy: d.created_by,
    createdAt: d.created_at,
    generatedJD: d.generated_jd ?? '',
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
  const raw = await apiFetch<ApiDraft[]>(`/drafts?${params.toString()}`)
  return raw.map(mapDraft)
}

export async function createDraft(payload: CreateDraftPayload): Promise<JDDraft> {
  const raw = await apiFetch<ApiDraft>('/drafts', {
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
  return mapDraft(raw)
}

export async function assignDraft(id: string, assignedTo: string[]): Promise<JDDraft> {
  const raw = await apiFetch<ApiDraft>(`/drafts/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assigned_to: assignedTo }),
  })
  return mapDraft(raw)
}

export async function submitRoleDescription(id: string, roleDescription: string): Promise<JDDraft> {
  const raw = await apiFetch<ApiDraft>(`/drafts/${id}/role-description`, {
    method: 'PATCH',
    body: JSON.stringify({ role_description: roleDescription }),
  })
  return mapDraft(raw)
}

export async function submitDraft(id: string): Promise<JDDraft> {
  const raw = await apiFetch<ApiDraft>(`/drafts/${id}/submit`, { method: 'PATCH', body: '{}' })
  return mapDraft(raw)
}

export async function generatePreview(id: string): Promise<JDPreviewResponse> {
  return apiFetch<JDPreviewResponse>(`/drafts/${id}/generate`, { method: 'POST', body: '{}' })
}

export async function finalizeDraft(id: string, finalJD: string): Promise<JDDraft> {
  const raw = await apiFetch<ApiDraft>(`/drafts/${id}/finalize`, {
    method: 'POST',
    body: JSON.stringify({ finalJD }),
  })
  return mapDraft(raw)
}

export async function dismissDraft(id: string, username: string): Promise<JDDraft> {
  const raw = await apiFetch<ApiDraft>(`/drafts/${id}/dismiss`, {
    method: 'PATCH',
    body: JSON.stringify({ username }),
  })
  return mapDraft(raw)
}

export async function deleteDraft(id: string): Promise<void> {
  await apiFetch<void>(`/drafts/${id}`, { method: 'DELETE' })
}

export async function getPdf(id: string): Promise<Blob> {
  return apiFetchBlob(`/drafts/${id}/pdf`)
}
