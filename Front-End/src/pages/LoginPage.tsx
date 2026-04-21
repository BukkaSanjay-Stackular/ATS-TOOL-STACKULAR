import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, UserCheck, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import stackularLogo from '../assets/Stackular_logo.svg'
import type { UserRole } from '../types'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState<UserRole | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!role) {
      setError('Please select a panel first.')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    const ok = login(username, password, role)
    setLoading(false)
    if (!ok) {
      setError('Invalid credentials. Please check your username and password.')
      return
    }
    navigate(role === 'recruitment' ? '/recruitment/job-posting' : '/interviewer/dashboard')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0c0c0c 0%, #161719 50%, #0c0c0c 100%)' }}
      onClick={() => { if (role) { setRole(null); setError(''); setUsername(''); setPassword('') } }}
    >
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2.5 mb-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <img
                src={stackularLogo}
                alt="Stackular logo"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <h1
              className="text-3xl font-extrabold text-white uppercase tracking-[0.22em] leading-none"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              Stackular
            </h1>
          </div>
          <p className="text-sm" style={{ color: '#9ca3af' }}>Applicant Tracking System</p>
        </div>

        <div
          className="rounded-2xl shadow-2xl p-8"
          style={{ background: '#161719', border: '1px solid #37373f' }}
        >
          <h2
            className="text-xl font-semibold text-white mb-2"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {role ? 'Sign in to your panel' : 'Choose your panel'}
          </h2>
          {!role ? (
            <>
              <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>
                Select the panel you want to access.
              </p>

              <div
                className="flex p-1 rounded-xl"
                style={{ background: '#1a1d20' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setRole('recruitment')
                    setError('')
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1d2ba4')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Briefcase className="w-4 h-4" />
                  Recruitment Panel
                </button>
                <div className="w-px my-1.5" style={{ background: '#37373f' }} />
                <button
                  type="button"
                  onClick={() => {
                    setRole('interviewer')
                    setError('')
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1d2ba4')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <UserCheck className="w-4 h-4" />
                  Interviewer Panel
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                className="flex gap-2 mb-6 p-1 rounded-xl"
                style={{ background: '#1a1d20' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setRole('recruitment')
                    setError('')
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
                  style={
                    role === 'recruitment'
                      ? { background: '#1d2ba4', color: '#fff' }
                      : { color: '#9ca3af' }
                  }
                >
                  <Briefcase className="w-4 h-4" />
                  Recruitment Panel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('interviewer')
                    setError('')
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
                  style={
                    role === 'interviewer'
                      ? { background: '#1d2ba4', color: '#fff' }
                      : { color: '#9ca3af' }
                  }
                >
                  <UserCheck className="w-4 h-4" />
                  Interviewer Panel
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#e5e7eb' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg text-white placeholder-gray-500 focus:outline-none transition"
                    style={{
                      background: '#1a1d20',
                      border: '1px solid #37373f',
                      color: '#fff',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#e5e7eb' }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-white placeholder-gray-500 focus:outline-none transition"
                      style={{
                        background: '#1a1d20',
                        border: '1px solid #37373f',
                        color: '#fff',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#9ca3af' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    className="text-sm rounded-lg px-3 py-2"
                    style={{ color: '#fca5a5', background: '#2c0b0e', border: '1px solid #7f1d1d' }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: '#1d2ba4' }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#12219e')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#1d2ba4')}
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#6b7280' }}>
          Internal use only · Stackular ATS v1.0
        </p>
      </div>
    </div>
  )
}
