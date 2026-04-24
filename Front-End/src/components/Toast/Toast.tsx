import { useEffect } from 'react'

export type ToastType = 'error' | 'success' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

const borderColor: Record<ToastType, string> = {
  error: '#ef4444',
  success: '#22c55e',
  info: '#3b82f6',
}

interface Props {
  toast: ToastItem
  onRemove: (id: string) => void
}

export function Toast({ toast, onRemove }: Props) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  return (
    <div
      style={{
        background: '#1f2937',
        border: `1px solid #37373f`,
        borderLeft: `4px solid ${borderColor[toast.type]}`,
        borderRadius: '10px',
        padding: '12px 16px',
        color: '#e5e7eb',
        fontSize: '13px',
        fontFamily: 'Sora, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        minWidth: '280px',
        maxWidth: '380px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <span>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          padding: 0,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
      >
        ×
      </button>
    </div>
  )
}
