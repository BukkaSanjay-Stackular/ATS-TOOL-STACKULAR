import { ApiError } from '../types/api'
import { queryClient } from '../lib/queryClient'

const BASE_URL = '/api'

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('ats_user')
    if (!stored) return null
    const parsed = JSON.parse(stored) as { token?: string }
    return parsed.token ?? null
  } catch {
    return null
  }
}

function handleExpired(): never {
  localStorage.removeItem('ats_user')
  queryClient.clear()
  window.dispatchEvent(new CustomEvent('ats:session-expired'))
  throw new ApiError('Session expired', 401)
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers }).catch(() => {
    throw new ApiError('No connection, check your network', 0)
  })

  if (res.status === 401) return handleExpired()

  if (!res.ok) {
    let body: { message?: string; fields?: Record<string, string> } = {}
    try { body = await res.json() } catch { /* empty */ }
    throw new ApiError(body.message ?? 'Server error', res.status, body.fields)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function apiFetchBlob(path: string): Promise<Blob> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { headers }).catch(() => {
    throw new ApiError('No connection, check your network', 0)
  })

  if (res.status === 401) return handleExpired()
  if (!res.ok) throw new ApiError('Download failed', res.status)
  return res.blob()
}
