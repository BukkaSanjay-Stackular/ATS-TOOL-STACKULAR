import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Edit3, Check } from 'lucide-react'
import { finalizeDraft } from '../services/jdApi'
import { useToast } from '../hooks/useToast'
import { ApiError } from '../types/api'

interface Props {
  draftId: string
  previewJD: string
  queryKey: readonly unknown[]
  onClose: () => void
}

export function JDPreviewModal({ draftId, previewJD, queryKey, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedJD, setEditedJD] = useState(previewJD)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const finalizeMutation = useMutation({
    mutationFn: (finalJD: string) => finalizeDraft(draftId, finalJD),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      showToast('Job description finalized successfully.', 'success')
      onClose()
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Finalize failed, try again'
      showToast(msg, 'error')
    },
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#161719',
          border: '1px solid #37373f',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #37373f',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>
            JD Preview
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsEditing((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#9ca3af',
                background: 'transparent',
                border: '1px solid #37373f',
                cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6b7280')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#37373f')}
            >
              <Edit3 style={{ width: '13px', height: '13px' }} />
              {isEditing ? 'Preview' : 'Edit'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {isEditing ? (
            <textarea
              value={editedJD}
              onChange={(e) => setEditedJD(e.target.value)}
              style={{
                width: '100%',
                minHeight: '400px',
                background: '#1a1d20',
                border: '1px solid #37373f',
                borderRadius: '8px',
                color: '#e5e7eb',
                padding: '14px',
                fontSize: '13px',
                fontFamily: 'monospace',
                lineHeight: 1.7,
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
            />
          ) : (
            <pre
              style={{
                color: '#e5e7eb',
                fontSize: '13px',
                fontFamily: 'Sora, sans-serif',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {editedJD}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #37373f',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => finalizeMutation.mutate(editedJD)}
            disabled={finalizeMutation.isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '9px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
              background: '#1d2ba4',
              border: 'none',
              cursor: finalizeMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: finalizeMutation.isPending ? 0.6 : 1,
              fontFamily: 'Sora, sans-serif',
            }}
            onMouseEnter={(e) => { if (!finalizeMutation.isPending) e.currentTarget.style.background = '#12219e' }}
            onMouseLeave={(e) => { if (!finalizeMutation.isPending) e.currentTarget.style.background = '#1d2ba4' }}
          >
            {finalizeMutation.isPending ? (
              <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <Check style={{ width: '14px', height: '14px' }} />
            )}
            {finalizeMutation.isPending ? 'Finalizing...' : 'Approve & Finalize'}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
