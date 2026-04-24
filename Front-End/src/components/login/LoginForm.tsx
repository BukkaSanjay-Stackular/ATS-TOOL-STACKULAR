import { useState } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { PrimaryButton } from '../ui/PrimaryButton'

interface Props {
  loading: boolean
  // Blocks submission during the post-login animation so no double-submit
  disabled: boolean
  error: string
  onSubmit: (username: string, password: string) => void
}

// Owns its own field state — parent only needs to know credentials when submitted.
export function LoginForm({ loading, disabled, error, onSubmit }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(username, password)
  }

  return (
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
          className="w-full px-3.5 py-2.5 rounded-lg placeholder-gray-500 focus:outline-none transition"
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
            className="w-full px-3.5 py-2.5 pr-10 rounded-lg placeholder-gray-500 focus:outline-none transition"
            style={{ background: '#1a1d20', border: '1px solid #37373f', color: '#fff' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
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

      <PrimaryButton
        type="submit"
        disabled={disabled}
        loading={loading}
        loadingText="Signing in..."
        style={{ width: '100%' }}
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </PrimaryButton>
    </form>
  )
}
