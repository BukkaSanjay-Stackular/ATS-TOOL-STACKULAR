import { ApiError } from '../types/api'
import { queryClient } from '../lib/queryClient'

// Strip trailing slash so callers can write `/drafts` without worrying about double-slashes
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

// Read token from localStorage — wrapped in try/catch because JSON.parse throws on
// corrupt data (e.g. browser extension wrote something invalid to the same key)
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

// Called on any 401 response. We clear cache first so a future login doesn't
// inherit stale data from the expired session. The CustomEvent lets ToastProvider
// show a "session expired" message without this file importing React.
function handleExpired(): never {
  localStorage.removeItem('ats_user')
  queryClient.clear()
  window.dispatchEvent(new CustomEvent('ats:session-expired'))
  throw new ApiError('Session expired', 401)
}

async function readErrorBody(res: Response): Promise<{ message?: string; fields?: Record<string, string> }> {
  try {
    return await res.json()
  } catch {
    return {}
  }
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

  // .catch() converts network failures (offline, DNS failure) into a typed ApiError
  // instead of an untyped TypeError, so callers get consistent error handling
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  }).catch(() => {
    throw new ApiError('No connection, check your network', 0)
  })

  if (res.status === 401) {
    // Login should surface invalid credentials inline instead of clearing the current session.
    if (path === '/auth/login') {
      const body = await readErrorBody(res)
      throw new ApiError(body.message ?? 'Invalid credentials', 401, body.fields)
    }

    return handleExpired()
  }

  if (!res.ok) {
    // Server may send a JSON body with a human-readable message and field-level errors.
    // If the body isn't JSON (e.g. 502 from a proxy), we fall back to a generic message.
    const body = await readErrorBody(res)
    throw new ApiError(body.message ?? 'Server error', res.status, body.fields)
  }

  // 204 No Content — calling res.json() on an empty body throws, so return undefined
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// Separate fetch for binary responses — no Content-Type header so the browser
// handles the response as raw bytes rather than trying to parse it as JSON
export async function apiFetchBlob(path: string): Promise<Blob> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers,
  }).catch(() => {
    throw new ApiError('No connection, check your network', 0)
  })

  if (res.status === 401) return handleExpired()
  if (!res.ok) throw new ApiError('Download failed', res.status)
  return res.blob()
}
