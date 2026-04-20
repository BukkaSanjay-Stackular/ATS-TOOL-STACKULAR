import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

interface Props {
  role: UserRole
  children: React.ReactNode
}

export default function ProtectedRoute({ role, children }: Props) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/login" replace />
  return <>{children}</>
}
