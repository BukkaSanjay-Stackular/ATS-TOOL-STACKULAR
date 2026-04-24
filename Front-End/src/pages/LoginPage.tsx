import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../context/useAuth'
import { useToast } from '../hooks/useToast'
import { useLoginAnimation } from '../hooks/useLoginAnimation'
import { PanelSelector } from '../components/login/PanelSelector'
import { LoginForm } from '../components/login/LoginForm'
import GlowOrb from '../components/GlowOrb'
import stackularLogo from '../assets/Stackular_logo.svg'
import { ApiError } from '../types/api'
import type { UserRole } from '../types'

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

  const [role, setRole] = useState<UserRole | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { animPhase, flyStyle, capturedUser, isAnimating, startAnimation } = useLoginAnimation()

  function handleSelectRole(r: UserRole) {
    setRole(r)
    setError('')
  }

  async function handleSubmit(username: string, password: string) {
    setError('')
    if (!role) { setError('Please select a panel first.'); return }
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
    startAnimation(logoRef.current!, username, () => {
      navigate({ to: dest as '/recruitment/job-posting' | '/interviewer/dashboard' })
    })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0c0c0c 0%, #161719 50%, #0c0c0c 100%)' }}
      // Clicking outside the card resets back to the panel selector
      onClick={() => { if (role && !isAnimating) { setRole(null); setError('') } }}
    >
      <GlowOrb />

      {/* Flying logo clone — animated independently from the static header logo */}
      {isAnimating && (
        <img src={stackularLogo} alt="" aria-hidden="true" style={flyStyle} />
      )}

      {/* Greeting shown at screen center after the logo lands there */}
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
          <p style={{ color: '#fff', fontSize: '22px', fontWeight: 600, fontFamily: 'Sora, sans-serif', whiteSpace: 'nowrap' }}>
            {getGreeting()}, {capturedUser} 😊
          </p>
        </div>
      )}

      {/* Card — collapses into the flying logo after login */}
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
        {/* Brand header */}
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
            <h1 className="text-3xl font-extrabold text-white uppercase tracking-[0.22em] leading-none" style={{ fontFamily: 'Sora, sans-serif' }}>
              Stackular
            </h1>
          </div>
          <p className="text-sm" style={{ color: '#9ca3af' }}>Applicant Tracking System</p>
        </div>

        <div className="rounded-2xl shadow-2xl p-8" style={{ background: '#161719', border: '1px solid #37373f' }}>
          <h2 className="text-xl font-semibold text-white mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
            {role ? 'Sign in to your panel' : 'Choose your panel'}
          </h2>

          {!role ? (
            <>
              <p className="text-sm mb-6" style={{ color: '#9ca3af' }}>
                Select the panel you want to access.
              </p>
              <PanelSelector selected={null} onSelect={handleSelectRole} />
            </>
          ) : (
            <>
              <div className="mb-6">
                <PanelSelector selected={role} onSelect={handleSelectRole} />
              </div>
              <LoginForm
                loading={loading}
                disabled={isAnimating}
                error={error}
                onSubmit={handleSubmit}
              />
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
