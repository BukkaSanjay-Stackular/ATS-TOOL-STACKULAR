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
