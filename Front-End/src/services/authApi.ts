import { apiFetch } from './apiClient'
import type { LoginResponse } from '../types/api'
import type { UserRole } from '../types'

interface BackendLoginResponse {
  success: boolean
  message: string
  data: {
    userType: string
    name: string
    email: string
  }
}

function mapUserRole(userType: string, fallbackRole: UserRole): UserRole {
  const normalized = userType.toLowerCase()
  if (normalized === 'recruiter' || normalized === 'recruitment') return 'recruitment'
  if (normalized === 'interviewer') return 'interviewer'
  return fallbackRole
}

export async function login(
  username: string,
  password: string,
  role: UserRole
): Promise<LoginResponse> {
  const res = await apiFetch<BackendLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ userName: username, password, role }),
  })

  return {
    token: '',
    user: {
      id: res.data.email,
      username,
      name: res.data.name,
      role: mapUserRole(res.data.userType, role),
    },
  }
}
