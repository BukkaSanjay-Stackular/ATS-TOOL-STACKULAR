import { createContext, useCallback, useState, useEffect } from 'react'
import { Toast } from './Toast'
import type { ToastItem, ToastType } from './Toast'
import { useNavigate } from 'react-router-dom'

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const navigate = useNavigate()

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString()
    setToasts((prev) => {
      const next = [...prev, { id, message, type }]
      return next.length > 3 ? next.slice(next.length - 3) : next
    })
  }, [])

  useEffect(() => {
    function handleExpired() {
      showToast('Your session expired. Please sign in again.', 'error')
      navigate('/login')
    }
    window.addEventListener('ats:session-expired', handleExpired)
    return () => window.removeEventListener('ats:session-expired', handleExpired)
  }, [showToast, navigate])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
