import { useAuth } from '../../context/useAuth'

export default function InterviewerDashboard() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="p-8" style={{ minHeight: '100vh' }}>
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
        Welcome back, {user.name}
      </h1>
      <p className="text-sm mt-2" style={{ color: '#9ca3af' }}>
        Head to Job Posting to view and fill in your assigned job descriptions.
      </p>
    </div>
  )
}
