import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, UserCheck, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useToast } from '../hooks/useToast'
import { ApiError } from '../types/api'
import stackularLogo from '../assets/Stackular_logo.svg'
import type { UserRole } from '../types'

type AnimPhase = 'idle' | 'collapse' | 'fly-center' | 'greet' | 'fly-corner'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const logoRef = useRef<HTMLImageElement>(null)
  const orbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (orbRef.current) {
        orbRef.current.style.left = `${e.clientX - 260}px`
        orbRef.current.style.top = `${e.clientY - 260}px`
      }
    }
    document.addEventListener('mousemove', onMouseMove)
    return () => document.removeEventListener('mousemove', onMouseMove)
  }, [])

  const [role, setRole] = useState<UserRole | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [animPhase, setAnimPhase] = useState<AnimPhase>('idle')
  const [flyStyle, setFlyStyle] = useState<React.CSSProperties>({})
  const [capturedUser, setCapturedUser] = useState('')

  const isAnimating = animPhase !== 'idle'

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
    } catch (err) {
      setLoading(false)
      if (err instanceof ApiError && err.status === 401) {
        setError('Invalid credentials. Please check your username and password.')
      } else {
        showToast('Something went wrong, please try again.', 'error')
      }
      return
    }
    setLoading(false)

    const dest = role === 'recruitment' ? '/recruitment/job-posting' : '/interviewer/dashboard'
    const rect = logoRef.current!.getBoundingClientRect()

    setCapturedUser(username.toUpperCase())

    // Mount flying logo exactly over the original logo — no transition yet
    setFlyStyle({
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transition: 'none',
      zIndex: 100,
      objectFit: 'contain',
    })

    // Collapse the card
    setAnimPhase('collapse')

    // After one paint cycle, start flying to center
    setTimeout(() => {
      setAnimPhase('fly-center')
      setFlyStyle({
        position: 'fixed',
        left: 'calc(50vw - 40px)',
        top: 'calc(50vh - 72px)',
        width: '80px',
        height: '80px',
        transition: [
          'left 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          'top 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          'width 600ms ease-out',
          'height 600ms ease-out',
        ].join(', '),
        zIndex: 100,
        objectFit: 'contain',
      })
    }, 80)

    // Show greeting once logo has arrived
    setTimeout(() => setAnimPhase('greet'), 900)

    // Fly logo to top-left corner (where sidebar logo lives)
    setTimeout(() => {
      setAnimPhase('fly-corner')
      setFlyStyle({
        position: 'fixed',
        left: '16px',
        top: '14px',
        width: '32px',
        height: '32px',
        transition: [
          'left 650ms cubic-bezier(0.4, 0, 0.2, 1)',
          'top 650ms cubic-bezier(0.4, 0, 0.2, 1)',
          'width 500ms ease-in',
          'height 500ms ease-in',
        ].join(', '),
        zIndex: 100,
        objectFit: 'contain',
      })
    }, 2300)

    // Navigate after logo lands
    setTimeout(() => navigate(dest), 2980)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0c0c0c 0%, #161719 50%, #0c0c0c 100%)' }}
      onClick={() => {
        if (role && !isAnimating) { setRole(null); setError(''); setUsername(''); setPassword('') }
      }}
    >
      {/* Cursor-tracking glow orb */}
      <div
        ref={orbRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '50vw',
          top: '50vh',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29,43,164,0.45) 0%, rgba(29,43,164,0.12) 50%, transparent 70%)',
          filter: 'blur(56px)',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'left 0.18s ease-out, top 0.18s ease-out',
        }}
      />


      {/* Flying logo — cloned from header, animated independently */}
      {isAnimating && (
        <img
          src={stackularLogo}
          alt=""
          aria-hidden="true"
          style={flyStyle}
        />
      )}

      {/* Greeting text — appears at center after logo arrives */}
      {(animPhase === 'greet' || animPhase === 'fly-corner') && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            left: '50%',
            top: 'calc(50vh + 18px)',
            zIndex: 99,
            pointerEvents: 'none',
            animation: animPhase === 'fly-corner'
              ? 'greeting-out 350ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
              : 'greeting-in 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          <p
            style={{
              color: '#fff',
              fontSize: '22px',
              fontWeight: 600,
              fontFamily: 'Sora, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {getGreeting()}, {capturedUser} 😊
          </p>
        </div>
      )}

      <div
        className="w-full max-w-md"
        style={{
          position: 'relative',
          zIndex: 10,
          ...(isAnimating
            ? { animation: 'card-collapse 380ms cubic-bezier(0.4, 0, 0.2, 1) forwards', pointerEvents: 'none' }
            : {}),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo / Brand */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center gap-2.5 mb-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <img
                ref={logoRef}
                src={stackularLogo}
                alt="Stackular logo"
                className="w-full h-full object-contain drop-shadow-lg"
                style={{ opacity: isAnimating ? 0 : 1 }}
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
            className="text-xl font-semibold text-white mb-1"
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
                  onClick={() => { setRole('recruitment'); setError('') }}
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
                  onClick={() => { setRole('interviewer'); setError('') }}
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
                  onClick={() => { setRole('recruitment'); setError('') }}
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
                  onClick={() => { setRole('interviewer'); setError('') }}
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
                    style={{ background: '#1a1d20', border: '1px solid #37373f', color: '#fff' }}
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
                      style={{ background: '#1a1d20', border: '1px solid #37373f', color: '#fff' }}
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
                  disabled={loading || isAnimating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: '#1d2ba4' }}
                  onMouseEnter={(e) => !(loading || isAnimating) && (e.currentTarget.style.background = '#12219e')}
                  onMouseLeave={(e) => !(loading || isAnimating) && (e.currentTarget.style.background = '#1d2ba4')}
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
