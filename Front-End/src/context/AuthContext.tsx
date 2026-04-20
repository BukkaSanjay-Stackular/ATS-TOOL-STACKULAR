import { createContext, useState, useEffect } from 'react'
import type { User, UserRole } from '../types'

const USERS: Array<User & { password: string }> = [
  { id: 1, username: 'Amulya', password: 'amulya@hr-stack', role: 'recruitment', name: 'Recruitment Team' },
  { id: 2, username: 'Sai Kalyan', password: 'kalyan@manager-stack', role: 'recruitment', name: 'Recruitment Team' },
  { id: 3, username: 'Venkat', password: 'venkat@ceo-stack', role: 'recruitment', name: 'Recruitment Team' },
  { id: 4, username: 'Karthik', password: 'karthik@dev-stack', role: 'interviewer', name: 'Interview Panel' },
  { id: 5, username: 'Fardeen', password: 'fardeen@dev-stack', role: 'interviewer', name: 'Interview Panel' },
  { id: 6, username: 'Jay', password: 'jay@engineer-stack', role: 'interviewer', name: 'Interview Panel' },
  { id: 7, username: 'Nadem', password: 'nadeem@engineer-stack', role: 'interviewer', name: 'Interview Panel' },
]

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
      (u) => u.username === username && u.password === password && u.role === role
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
