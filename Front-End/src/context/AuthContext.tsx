import { createContext, useState, useEffect } from 'react'
import type { User, UserRole } from '../types'
import { USERS } from '../constants/users'

interface AuthContextValue {
  user: User | null
  login: (username: string, password: string, role: UserRole) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ats_user')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('ats_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('ats_user')
    }
  }, [user])

  function login(username: string, password: string, role: UserRole): boolean {
    const match = USERS.find(
      (u) => u.username.toLocaleLowerCase() === username.toLocaleLowerCase() && u.password === password && u.role === role
    )
    if (!match) return false
    setUser({ id: match.id, username: match.username, role: match.role, name: match.name })
    return true
  }

  function logout() {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export { AuthContext }
