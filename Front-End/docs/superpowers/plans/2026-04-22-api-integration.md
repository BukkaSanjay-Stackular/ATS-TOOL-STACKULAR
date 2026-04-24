# Plan: Sprint 1 — API Integration
Date: 2026-04-22
Spec: Front-End/.claude/memory/architecture.md
Goal: Replace all localStorage-based auth and JD state with a real API layer backed by JWT auth and TanStack Query.
Architecture: Service layer (apiClient → authApi/jdApi) + TanStack Query cache + AuthContext for token only
Tech stack: React 19, TypeScript strict, Vite, TanStack Query v5, React Router v7

---

## Files

### New
- `src/lib/queryClient.ts` — singleton QueryClient (NEW)
- `src/types/api.ts` — ApiError, LoginResponse, JDPreviewResponse, ApiDraft server shape (NEW)
- `src/services/apiClient.ts` — base fetch wrapper, JWT header, error parsing, 401 dispatch (NEW)
- `src/services/authApi.ts` — login() HTTP call (NEW)
- `src/services/jdApi.ts` — all JD HTTP calls + ApiDraft→JDDraft mapper (NEW)
- `src/hooks/useToast.ts` — showToast hook (NEW)
- `src/components/Toast/Toast.tsx` — single toast item, auto-dismiss 4s (NEW)
- `src/components/Toast/ToastProvider.tsx` — fixed top-right stack, max 3 (NEW)
- `src/components/JDPreviewModal.tsx` — LLM preview + edit textarea + Approve button (NEW)
- `src/components/DownloadButton.tsx` — GET /api/drafts/:id/pdf → blob → anchor download (NEW)

### Modified
- `src/types/index.ts` — JDDraft normalized to camelCase, AuthContextValue updated
- `src/context/AuthContext.tsx` — login() async, JWT stored, logout clears cache
- `src/App.tsx` — add QueryClientProvider + ToastProvider, remove JDProvider
- `src/pages/LoginPage.tsx` — await async login(), inline error on 401, toast on 500
- `src/pages/recruitment/JobPostingPage.tsx` — full TanStack Query rewrite
- `src/pages/interviewer/InterviewerJobPostingPage.tsx` — useQuery polling + useMutation

### Deleted
- `src/context/JDContext.tsx`
- `src/context/useJD.ts`
- `src/services/jdService.ts`
- `src/constants/users.ts`

---

## Task 1: Install TanStack Query and create QueryClient singleton

**Goal:** Add TanStack Query and export a singleton QueryClient used by both App.tsx and apiClient.ts.

### Step 1: Install
```bash
cd Front-End
npm install @tanstack/react-query
```

### Step 2: Create singleton
File: `src/lib/queryClient.ts`
```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})
```

### Step 3: Verify
```bash
cd Front-End && npm run build
# Expected: no errors, @tanstack/react-query resolves
```

### Step 4: Commit
```bash
git add src/lib/queryClient.ts package.json package-lock.json
git commit -m "Install TanStack Query and add QueryClient singleton"
```

---

## Task 2: Create API types

**Goal:** Define all types that represent server responses and errors.

File: `src/types/api.ts`
```typescript
import type { ExperienceLevel, JDStatus, UserRole } from './index'

export class ApiError extends Error {
  constructor(
    public override message: string,
    public status: number,
    public fields?: Record<string, string>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface LoginResponse {
  token: string
  user: {
    id: number
    username: string
    name: string
    role: UserRole
  }
}

export interface JDPreviewResponse {
  previewJD: string
}

export interface ApiDraft {
  id: string
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
  status: JDStatus
  created_by: string
  created_at: string
  generated_jd: string
}
```

### Step 3: Commit
```bash
git add src/types/api.ts
git commit -m "Add API types: ApiError, LoginResponse, JDPreviewResponse, ApiDraft"
```

---

## Task 3: Normalize JDDraft to camelCase in types/index.ts

**Goal:** JDDraft uses camelCase throughout the frontend. ApiDraft (snake_case) is the server shape — mapped in jdApi.ts.

File: `src/types/index.ts`
```typescript
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

export interface GeneratedJD {
  jobTitle: string
  content: string
}
```

### Step 3: Commit
```bash
git add src/types/index.ts
git commit -m "Normalize JDDraft to camelCase, remove password from User"
```

---

## Task 4: Create apiClient.ts

**Goal:** Single fetch wrapper that attaches JWT, parses errors, and dispatches `ats:session-expired` on 401.

File: `src/services/apiClient.ts`
```typescript
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
```

### Step 3: Commit
```bash
git add src/services/apiClient.ts
git commit -m "Add apiClient: JWT header, error parsing, 401 session-expired dispatch"
```

---

## Task 5: Create authApi.ts

**Goal:** Single function that calls POST /api/auth/login and returns typed response.

File: `src/services/authApi.ts`
```typescript
import { apiFetch } from './apiClient'
import type { LoginResponse } from '../types/api'
import type { UserRole } from '../types'

export async function login(
  username: string,
  password: string,
  role: UserRole
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, role }),
  })
}
```

### Step 3: Commit
```bash
git add src/services/authApi.ts
git commit -m "Add authApi: login() calls POST /api/auth/login"
```

---

## Task 6: Create jdApi.ts

**Goal:** All JD HTTP calls with ApiDraft→JDDraft mapping so pages always receive camelCase.

File: `src/services/jdApi.ts`
```typescript
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
```

### Step 3: Commit
```bash
git add src/services/jdApi.ts
git commit -m "Add jdApi: all JD HTTP calls with ApiDraft→JDDraft camelCase mapping"
```

---

## Task 7: Build Toast system

**Goal:** Global toast stack for critical errors. Fixed top-right, auto-dismiss 4s, max 3 visible.

File: `src/hooks/useToast.ts`
```typescript
import { useContext } from 'react'
import { ToastContext } from '../components/Toast/ToastProvider'

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
```

File: `src/components/Toast/Toast.tsx`
```typescript
import { useEffect } from 'react'

export type ToastType = 'error' | 'success' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

const borderColor: Record<ToastType, string> = {
  error: '#ef4444',
  success: '#22c55e',
  info: '#3b82f6',
}

interface Props {
  toast: ToastItem
  onRemove: (id: string) => void
}

export function Toast({ toast, onRemove }: Props) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  return (
    <div
      style={{
        background: '#1f2937',
        border: `1px solid #37373f`,
        borderLeft: `4px solid ${borderColor[toast.type]}`,
        borderRadius: '10px',
        padding: '12px 16px',
        color: '#e5e7eb',
        fontSize: '13px',
        fontFamily: 'Sora, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        minWidth: '280px',
        maxWidth: '380px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <span>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          padding: 0,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
      >
        ×
      </button>
    </div>
  )
}
```

File: `src/components/Toast/ToastProvider.tsx`
```typescript
import { createContext, useCallback, useState, useEffect } from 'react'
import { Toast } from './Toast'
import type { ToastItem, ToastType } from './Toast'
import { useNavigate } from 'react-router-dom'

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const navigate = useNavigate()

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString()
    setToasts((prev) => {
      const next = [...prev, { id, message, type }]
      return next.length > 3 ? next.slice(next.length - 3) : next
    })
  }, [])

  useEffect(() => {
    function handleExpired() {
      showToast('Your session expired. Please sign in again.', 'error')
      navigate('/login')
    }
    window.addEventListener('ats:session-expired', handleExpired)
    return () => window.removeEventListener('ats:session-expired', handleExpired)
  }, [showToast, navigate])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
```

### Step 3: Commit
```bash
git add src/hooks/useToast.ts src/components/Toast/
git commit -m "Add Toast system: ToastProvider, Toast item, useToast hook"
```

---

## Task 8: Rewrite AuthContext.tsx

**Goal:** `login()` calls authApi, stores JWT. `logout()` clears cache. Exposes `isLoading`.

File: `src/context/AuthContext.tsx`
```typescript
import { createContext, useState } from 'react'
import { login as apiLogin } from '../services/authApi'
import { queryClient } from '../lib/queryClient'
import type { User, UserRole } from '../types'
import type { ApiError } from '../types/api'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface StoredAuth {
  token: string
  user: User
}

function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem('ats_user')
    return raw ? (JSON.parse(raw) as StoredAuth) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useState<StoredAuth | null>(loadStoredAuth)
  const [isLoading, setIsLoading] = useState(false)

  async function login(username: string, password: string, role: UserRole): Promise<void> {
    setIsLoading(true)
    try {
      const res = await apiLogin(username, password, role)
      const auth: StoredAuth = { token: res.token, user: res.user }
      localStorage.setItem('ats_user', JSON.stringify(auth))
      setStored(auth)
    } finally {
      setIsLoading(false)
    }
  }

  function logout(): void {
    localStorage.removeItem('ats_user')
    queryClient.clear()
    setStored(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user: stored?.user ?? null,
        token: stored?.token ?? null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
```

### Step 3: Commit
```bash
git add src/context/AuthContext.tsx
git commit -m "Rewrite AuthContext: async login with JWT, logout clears query cache"
```

---

## Task 9: Update App.tsx

**Goal:** Wrap app with QueryClientProvider and ToastProvider. Remove JDProvider.

File: `src/App.tsx`
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast/ToastProvider'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RecruitmentLayout from './components/layout/RecruitmentLayout'
import InterviewerLayout from './components/layout/InterviewerLayout'
import DashboardPage from './pages/recruitment/DashboardPage'
import JobPostingPage from './pages/recruitment/JobPostingPage'
import InterviewerDashboard from './pages/interviewer/InterviewerDashboard'
import InterviewerJobPostingPage from './pages/interviewer/InterviewerJobPostingPage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/recruitment"
                element={
                  <ProtectedRoute role="recruitment">
                    <RecruitmentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="job-posting" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="job-posting" element={<JobPostingPage />} />
              </Route>

              <Route
                path="/interviewer"
                element={
                  <ProtectedRoute role="interviewer">
                    <InterviewerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<InterviewerDashboard />} />
                <Route path="job-posting" element={<InterviewerJobPostingPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

### Step 3: Commit
```bash
git add src/App.tsx
git commit -m "Wrap app with QueryClientProvider and ToastProvider, remove JDProvider"
```

---

## Task 10: Delete retired files

**Goal:** Remove JDContext, useJD, jdService, constants/users — no longer needed.

```bash
cd Front-End/src
rm context/JDContext.tsx
rm context/useJD.ts
rm services/jdService.ts
rm constants/users.ts
```

### Step 2: Verify no remaining imports
```bash
cd Front-End
grep -r "JDContext\|useJD\|jdService\|constants/users" src/
# Expected: no output — all imports removed
```

### Step 3: Commit
```bash
git add -u
git commit -m "Delete retired files: JDContext, useJD, jdService, constants/users"
```

---

## Task 11: Create JDPreviewModal.tsx

**Goal:** Show LLM-generated preview text, allow inline editing, Approve triggers finalizeDraft mutation.

File: `src/components/JDPreviewModal.tsx`
```typescript
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Edit3, Check } from 'lucide-react'
import { finalizeDraft } from '../services/jdApi'
import { useToast } from '../hooks/useToast'
import { ApiError } from '../types/api'

interface Props {
  draftId: string
  previewJD: string
  queryKey: readonly unknown[]
  onClose: () => void
}

export function JDPreviewModal({ draftId, previewJD, queryKey, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedJD, setEditedJD] = useState(previewJD)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const finalizeMutation = useMutation({
    mutationFn: (finalJD: string) => finalizeDraft(draftId, finalJD),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      showToast('Job description finalized successfully.', 'success')
      onClose()
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Finalize failed, try again'
      showToast(msg, 'error')
    },
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#161719',
          border: '1px solid #37373f',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #37373f',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>
            JD Preview
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsEditing((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#9ca3af',
                background: 'transparent',
                border: '1px solid #37373f',
                cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6b7280')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#37373f')}
            >
              <Edit3 style={{ width: '13px', height: '13px' }} />
              {isEditing ? 'Preview' : 'Edit'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {isEditing ? (
            <textarea
              value={editedJD}
              onChange={(e) => setEditedJD(e.target.value)}
              style={{
                width: '100%',
                minHeight: '400px',
                background: '#1a1d20',
                border: '1px solid #37373f',
                borderRadius: '8px',
                color: '#e5e7eb',
                padding: '14px',
                fontSize: '13px',
                fontFamily: 'monospace',
                lineHeight: 1.7,
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
            />
          ) : (
            <pre
              style={{
                color: '#e5e7eb',
                fontSize: '13px',
                fontFamily: 'Sora, sans-serif',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {editedJD}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #37373f',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => finalizeMutation.mutate(editedJD)}
            disabled={finalizeMutation.isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '9px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              background: '#1d2ba4',
              border: 'none',
              cursor: finalizeMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: finalizeMutation.isPending ? 0.6 : 1,
              fontFamily: 'Sora, sans-serif',
            }}
            onMouseEnter={(e) => { if (!finalizeMutation.isPending) e.currentTarget.style.background = '#12219e' }}
            onMouseLeave={(e) => { if (!finalizeMutation.isPending) e.currentTarget.style.background = '#1d2ba4' }}
          >
            {finalizeMutation.isPending ? (
              <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <Check style={{ width: '14px', height: '14px' }} />
            )}
            {finalizeMutation.isPending ? 'Finalizing...' : 'Approve & Finalize'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
```

### Step 3: Commit
```bash
git add src/components/JDPreviewModal.tsx
git commit -m "Add JDPreviewModal: LLM preview display, inline edit, finalize mutation"
```

---

## Task 12: Create DownloadButton.tsx

**Goal:** Calls GET /api/drafts/:id/pdf, creates blob URL, triggers anchor download, revokes URL.

File: `src/components/DownloadButton.tsx`
```typescript
import { useState } from 'react'
import { Download } from 'lucide-react'
import { getPdf } from '../services/jdApi'
import { useToast } from '../hooks/useToast'
import { ApiError } from '../types/api'

interface Props {
  draftId: string
  jobTitle: string
}

export function DownloadButton({ draftId, jobTitle }: Props) {
  const [downloading, setDownloading] = useState(false)
  const { showToast } = useToast()

  async function handleDownload() {
    setDownloading(true)
    try {
      const blob = await getPdf(draftId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${jobTitle.replace(/\s+/g, '_')}_JD.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Download failed, try again'
      showToast(msg, 'error')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#e5e7eb',
        background: 'transparent',
        border: '1px solid #37373f',
        cursor: downloading ? 'not-allowed' : 'pointer',
        opacity: downloading ? 0.6 : 1,
        fontFamily: 'Sora, sans-serif',
      }}
      onMouseEnter={(e) => { if (!downloading) e.currentTarget.style.borderColor = '#6b7280' }}
      onMouseLeave={(e) => { if (!downloading) e.currentTarget.style.borderColor = '#37373f' }}
    >
      {downloading ? (
        <span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
      ) : (
        <Download style={{ width: '13px', height: '13px' }} />
      )}
      {downloading ? 'Downloading...' : 'Download PDF'}
    </button>
  )
}
```

### Step 3: Commit
```bash
git add src/components/DownloadButton.tsx
git commit -m "Add DownloadButton: PDF blob download via GET /api/drafts/:id/pdf"
```

---

## Task 13: Update LoginPage.tsx

**Goal:** `handleSubmit` awaits async `login()`, shows inline error on ApiError, toast on network errors.

### Changes (replace handleSubmit and the ok check):
```typescript
// Add import at top
import { ApiError } from '../types/api'
import { useToast } from '../hooks/useToast'

// Inside component, add:
const { showToast } = useToast()

// Replace handleSubmit:
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  setError('')
  if (!role) {
    setError('Please select a panel first.')
    return
  }
  setLoading(true)
  try {
    await login(username, password, role)
    // animation sequence runs after login succeeds — keep existing animation logic below
    setCapturedUser(username)
    setAnimPhase('collapse')
    // ... rest of existing animation code unchanged
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      setError('Invalid credentials. Please check your username and password.')
    } else {
      showToast('Something went wrong, please try again.', 'error')
    }
  } finally {
    setLoading(false)
  }
}
```

The animation logic that currently runs after `if (!ok) { ... }` moves inside the `try` block after `await login(...)`. The `navigate` call inside the animation stays as-is. No other changes to the file.

### Step 3: Commit
```bash
git add src/pages/LoginPage.tsx
git commit -m "Update LoginPage: async login, inline 401 error, toast on network failure"
```

---

## Task 14: Update JobPostingPage.tsx

**Goal:** Replace all `useJD` calls with `useQuery` + `useMutation`. Add preview modal, download button, skeleton, inline errors.

### Key imports to add/change:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as jdApi from '../../services/jdApi'
import { JDPreviewModal } from '../../components/JDPreviewModal'
import { DownloadButton } from '../../components/DownloadButton'
import { useToast } from '../../hooks/useToast'
import { ApiError } from '../../types/api'
// Remove: useJD, generateJD, INTERVIEWERS import
```

### Inline interviewer list (replaces constants/users.ts for Sprint 1):
```typescript
const INTERVIEWERS = [
  { username: 'Karthik', name: 'Karthik' },
  { username: 'Fardeen', name: 'Fardeen' },
  { username: 'Jay', name: 'Jay' },
  { username: 'Nadem', name: 'Nadem' },
  { username: 'Javeed', name: 'Javeed' },
]
```

### Updated FormState (camelCase to match JDDraft):
```typescript
interface FormState {
  experienceLevel: ExperienceLevel | null
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
}

const emptyForm: FormState = {
  experienceLevel: null,
  jobTitle: '',
  location: '',
  workMode: '',
  workHours: '',
  duration: '',
  stipendSalary: '',
  fulltimeOfferSalary: '',
  yearsOfExperience: '',
  roleDescription: '',
  assignedTo: [],
}
```

### State and query setup inside component:
```typescript
export default function JobPostingPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [previewJD, setPreviewJD] = useState<string | null>(null)
  const [previewDraftId, setPreviewDraftId] = useState<string | null>(null)
  const [copiedJD, setCopiedJD] = useState(false)
  const [allDraftsOpen, setAllDraftsOpen] = useState(false)

  const queryKey = ['drafts', user?.username] as const

  const { data: myDrafts = [], isLoading: draftsLoading } = useQuery({
    queryKey,
    queryFn: () => jdApi.getDrafts({ createdBy: user!.username }),
    enabled: !!user,
  })

  const returnedDrafts = myDrafts.filter((d) => d.status === 'returned')
```

### Save Draft mutation:
```typescript
  const saveDraftMutation = useMutation({
    mutationFn: (data: jdApi.CreateDraftPayload) => jdApi.createDraft(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      setForm(emptyForm)
      setEditingId(null)
      setFieldErrors({})
      showToast('Draft saved successfully.', 'success')
    },
    onError: (err) => {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields)
      } else {
        showToast(err instanceof ApiError ? err.message : 'Failed to save draft', 'error')
      }
    },
  })
```

### Assign mutation:
```typescript
  const assignMutation = useMutation({
    mutationFn: async ({ data, id }: { data: jdApi.CreateDraftPayload; id: string | null }) => {
      if (id) {
        return jdApi.assignDraft(id, data.assignedTo ?? [])
      }
      const draft = await jdApi.createDraft(data)
      return jdApi.assignDraft(draft.id, data.assignedTo ?? [])
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey })
      setForm(emptyForm)
      setEditingId(null)
      setFieldErrors({})
      showToast(`Assigned — visible in interviewer portal now.`, 'success')
    },
    onError: (err) => {
      showToast(err instanceof ApiError ? err.message : 'Failed to assign', 'error')
    },
  })
```

### Generate mutation:
```typescript
  const generateMutation = useMutation({
    mutationFn: async ({ data, id }: { data: jdApi.CreateDraftPayload | null; id: string | null }) => {
      if (id) return { previewResult: await jdApi.generatePreview(id), draftId: id }
      const draft = await jdApi.createDraft(data!)
      const preview = await jdApi.generatePreview(draft.id)
      return { previewResult: preview, draftId: draft.id }
    },
    onSuccess: ({ previewResult, draftId }) => {
      queryClient.invalidateQueries({ queryKey })
      setPreviewJD(previewResult.previewJD)
      setPreviewDraftId(draftId)
      setForm(emptyForm)
      setEditingId(null)
    },
    onError: (err) => {
      showToast(err instanceof ApiError ? err.message : 'Generation failed, try again', 'error')
    },
  })
```

### Handler functions:
```typescript
  function handleSaveDraft() {
    if (!user || !form.experienceLevel) return
    saveDraftMutation.mutate({
      experienceLevel: form.experienceLevel,
      jobTitle: form.jobTitle,
      location: form.location,
      workMode: form.workMode,
      workHours: form.workHours,
      duration: form.duration,
      stipendSalary: form.stipendSalary,
      fulltimeOfferSalary: form.fulltimeOfferSalary,
      yearsOfExperience: form.yearsOfExperience,
      roleDescription: form.roleDescription,
      createdBy: user.username,
    })
  }

  function handleAssign() {
    if (!user || !form.experienceLevel || form.assignedTo.length === 0) return
    assignMutation.mutate({
      data: {
        experienceLevel: form.experienceLevel,
        jobTitle: form.jobTitle,
        location: form.location,
        workMode: form.workMode,
        workHours: form.workHours,
        duration: form.duration,
        stipendSalary: form.stipendSalary,
        fulltimeOfferSalary: form.fulltimeOfferSalary,
        yearsOfExperience: form.yearsOfExperience,
        roleDescription: form.roleDescription,
        assignedTo: form.assignedTo,
        createdBy: user.username,
      },
      id: editingId,
    })
  }

  async function handleCreateJD(draftId?: string) {
    if (!user) return
    if (draftId) {
      generateMutation.mutate({ data: null, id: draftId })
      return
    }
    if (!isFormComplete() || !form.experienceLevel) return
    generateMutation.mutate({
      data: {
        experienceLevel: form.experienceLevel,
        jobTitle: form.jobTitle,
        location: form.location,
        workMode: form.workMode,
        workHours: form.workHours,
        duration: form.duration,
        stipendSalary: form.stipendSalary,
        fulltimeOfferSalary: form.fulltimeOfferSalary,
        yearsOfExperience: form.yearsOfExperience,
        roleDescription: form.roleDescription,
        assignedTo: form.assignedTo,
        createdBy: user.username,
      },
      id: editingId,
    })
  }
```

### isFormComplete update (camelCase fields):
```typescript
  function isFormComplete(): boolean {
    if (!form.experienceLevel || !form.jobTitle || !form.location || !form.workMode || !form.workHours) return false
    if (!form.roleDescription) return false
    if (form.experienceLevel === 'intern' && !form.duration) return false
    if (form.experienceLevel === 'experienced' && !form.yearsOfExperience) return false
    return true
  }
```

### Skeleton loading (render when draftsLoading):
```typescript
  if (draftsLoading) {
    return (
      <div className="p-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: '#161719',
              border: '1px solid #37373f',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '10px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <div style={{ height: '16px', width: '40%', background: '#374151', borderRadius: '4px', marginBottom: '10px' }} />
            <div style={{ height: '12px', width: '60%', background: '#2d3748', borderRadius: '4px' }} />
          </div>
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    )
  }
```

### Preview modal and finalized card actions in JSX:
```typescript
  // In the returned JDs section, on finalized cards add:
  {draft.status === 'finalized' && (
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
      <button
        onClick={() => {
          navigator.clipboard.writeText(draft.generatedJD)
          setCopiedJD(true)
          setTimeout(() => setCopiedJD(false), 2000)
        }}
        style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px',
          borderRadius:'8px', fontSize:'13px', fontWeight:600, color:'#e5e7eb',
          background:'transparent', border:'1px solid #37373f', cursor:'pointer',
          fontFamily:'Sora, sans-serif' }}
        onMouseEnter={(e)=>(e.currentTarget.style.borderColor='#6b7280')}
        onMouseLeave={(e)=>(e.currentTarget.style.borderColor='#37373f')}
      >
        {copiedJD ? <Check style={{width:'13px',height:'13px'}} /> : <Copy style={{width:'13px',height:'13px'}} />}
        {copiedJD ? 'Copied!' : 'Copy JD'}
      </button>
      <DownloadButton draftId={draft.id} jobTitle={draft.jobTitle} />
    </div>
  )}

  // After the main JSX return, render modal conditionally:
  {previewJD && previewDraftId && (
    <JDPreviewModal
      draftId={previewDraftId}
      previewJD={previewJD}
      queryKey={queryKey}
      onClose={() => { setPreviewJD(null); setPreviewDraftId(null) }}
    />
  )}
```

### Step 3: Commit
```bash
git add src/pages/recruitment/JobPostingPage.tsx
git commit -m "Rewrite JobPostingPage: TanStack Query mutations, preview modal, skeleton, inline errors"
```

---

## Task 15: Update InterviewerJobPostingPage.tsx

**Goal:** Replace `useJD` with `useQuery` (5s polling) and `useMutation` for submit + dismiss.

### Key imports:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as jdApi from '../../services/jdApi'
import { useToast } from '../../hooks/useToast'
import { ApiError } from '../../types/api'
// Remove: useJD import
```

### Replace data layer inside component:
```typescript
export default function InterviewerJobPostingPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const [selectedDraft, setSelectedDraft] = useState<JDDraft | null>(null)
  const [roleDescription, setRoleDescription] = useState('')

  const queryKey = ['drafts', 'interviewer', user?.username] as const

  const { data: allMyDrafts = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => jdApi.getDrafts({ assignedTo: user!.username }),
    enabled: !!user,
    refetchInterval: 5000,
  })

  const activeDrafts = allMyDrafts.filter((d) => d.status === 'assigned')
  const submittedCount = allMyDrafts.filter(
    (d) => d.status === 'returned' || d.status === 'finalized'
  ).length

  const submitMutation = useMutation({
    mutationFn: async ({ id, roleDesc }: { id: string; roleDesc: string }) => {
      await jdApi.submitRoleDescription(id, roleDesc)
      return jdApi.submitDraft(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      setSelectedDraft(null)
      setRoleDescription('')
      showToast('Role description submitted successfully.', 'success')
    },
    onError: (err) => {
      showToast(err instanceof ApiError ? err.message : 'Submit failed, try again', 'error')
    },
  })

  const dismissMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => jdApi.dismissDraft(id, user!.username),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey })
      if (selectedDraft?.id === id) { setSelectedDraft(null); setRoleDescription('') }
    },
    onError: (err) => {
      showToast(err instanceof ApiError ? err.message : 'Failed to dismiss', 'error')
    },
  })

  function handleSelectDraft(draft: JDDraft) {
    setSelectedDraft(draft)
    setRoleDescription(draft.roleDescription ?? '')
  }

  function handleBack() {
    setSelectedDraft(null)
    setRoleDescription('')
  }

  function handleSubmit() {
    if (!selectedDraft || !roleDescription.trim()) return
    submitMutation.mutate({ id: selectedDraft.id, roleDesc: roleDescription })
  }

  function handleDismiss(id: string) {
    dismissMutation.mutate({ id })
  }
```

### Field name updates in JSX (camelCase):
```typescript
  // Replace all references:
  draft.jobTitle          // was draft.jobTitle (already camelCase in current file — verify)
  draft.experienceLevel   // was draft.experienceLevel
  draft.workMode          // was draft.workMode
  draft.workHours         // was draft.workHours
  // compensationDisplay function update:
  function compensationDisplay(draft: JDDraft): string {
    if (draft.experienceLevel === 'intern') return `₹${draft.stipendSalary} stipend · ${draft.duration}`
    if (draft.experienceLevel === 'experienced') return `₹${draft.stipendSalary} per annum`
    return `₹${draft.fulltimeOfferSalary} full-time offer`
  }
```

### Skeleton on first load (before drafts arrive):
```typescript
  if (isLoading) {
    return (
      <div className="p-6">
        {[1, 2].map((i) => (
          <div key={i} style={{ background:'#161719', border:'1px solid #37373f',
            borderRadius:'14px', padding:'20px', marginBottom:'10px',
            animation:'pulse 1.5s ease-in-out infinite' }}>
            <div style={{ height:'16px', width:'40%', background:'#374151', borderRadius:'4px', marginBottom:'10px' }} />
            <div style={{ height:'12px', width:'60%', background:'#2d3748', borderRadius:'4px' }} />
          </div>
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    )
  }
```

### Button loading state (replace `submitting` state with mutation isPending):
```typescript
  // Submit button:
  disabled={submitMutation.isPending || !roleDescription.trim()}
  // text:
  {submitMutation.isPending ? 'Submitting...' : 'Submit Back to Recruitment'}
```

### Step 3: Commit
```bash
git add src/pages/interviewer/InterviewerJobPostingPage.tsx
git commit -m "Rewrite InterviewerJobPostingPage: polling useQuery, useMutation for submit and dismiss"
```

---

## Final Verification

```bash
cd Front-End
npm run build
# Expected: zero TypeScript errors, clean build

grep -r "useJD\|JDContext\|jdService\|constants/users\|INTERVIEWERS" src/
# Expected: no output except the inline INTERVIEWERS array in JobPostingPage.tsx
```
