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
    roleDescription: d.role_description,
    assignedTo: d.assigned_to,
    status: d.status,
    createdBy: d.created_by,
    createdAt: d.created_at,
    generatedJD: d.generated_jd,
  }
}

export interface CreateDraftPayload {
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
  assignedTo?: string[]
  createdBy: string
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
      experience_level: payload.experienceLevel,
      job_title: payload.jobTitle,
      location: payload.location,
      work_mode: payload.workMode,
      work_hours: payload.workHours,
      duration: payload.duration,
      stipend_salary: payload.stipendSalary,
      fulltime_offer_salary: payload.fulltimeOfferSalary,
      years_of_experience: payload.yearsOfExperience,
      role_description: payload.roleDescription,
      created_by: payload.createdBy,
    }),
  })
  return mapDraft(raw)
}

export async function assignDraft(id: string, assignedTo: string[]): Promise<JDDraft> {
  const raw = await apiFetch<ApiDraft>(`/drafts/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedTo }),
  })
  return mapDraft(raw)
}

export async function submitRoleDescription(id: string, roleDescription: string): Promise<JDDraft> {
  const raw = await apiFetch<ApiDraft>(`/drafts/${id}/role-description`, {
    method: 'PATCH',
    body: JSON.stringify({ roleDescription }),
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
