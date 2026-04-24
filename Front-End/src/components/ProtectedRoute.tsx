import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../context/useAuth'
import type { UserRole } from '../types'

interface Props {
  role: UserRole
  children: React.ReactNode
}

export default function ProtectedRoute({ role, children }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== role) {
      navigate({ to: '/login', replace: true })
    }
  }, [user, role, navigate])

  if (!user || user.role !== role) return null
  return <>{children}</>
}
