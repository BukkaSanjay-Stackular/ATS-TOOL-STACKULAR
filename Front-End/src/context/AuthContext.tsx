import { createContext, useState } from 'react'
import { login as apiLogin } from '../services/authApi'
import { queryClient } from '../lib/queryClient'
import type { User, UserRole } from '../types'

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

// We store the full user object alongside the token so the app can render the
// correct role/name immediately on page refresh without a round-trip to /me
function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem('ats_user')
    return raw ? (JSON.parse(raw) as StoredAuth) : null
  } catch {
    // Corrupt localStorage (e.g. another script wrote invalid JSON) — treat as logged out
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Pass loadStoredAuth as a function (lazy init) so JSON.parse runs only once
  // on mount, not on every re-render
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
    // Clear cached query data so the next user who logs in on the same browser
    // doesn't briefly see the previous user's drafts
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
