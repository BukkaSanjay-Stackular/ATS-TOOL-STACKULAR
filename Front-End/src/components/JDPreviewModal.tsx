import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Edit3, Check, Copy } from 'lucide-react'
import { finalizeDraft } from '../services/jdApi'
import { useToast } from '../hooks/useToast'
import { PrimaryButton } from './ui/PrimaryButton'
import { ApiError } from '../types/api'
import type { JDDraft } from '../types'

interface Props {
  draftId: string
  previewJD: string
  draft: JDDraft
  queryKey: readonly unknown[]
  onClose: () => void
}

export function JDPreviewModal({ draftId, previewJD, draft, queryKey, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedJD, setEditedJD] = useState(previewJD)
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  async function handleCopy() {
    await navigator.clipboard.writeText(editedJD)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const finalizeMutation = useMutation({
    // The finalize endpoint requires the full draft payload alongside the approved JD text —
    // the backend uses it to create a finalized record rather than mutating the draft in place
    mutationFn: (finalJD: string) =>
      finalizeDraft(draftId, {
        finalJD,
        experience_level: draft.experienceLevel,
        job_title: draft.jobTitle,
        location: draft.location,
        work_mode: draft.workMode,
        work_hours: draft.workHours,
        duration: draft.duration,
        stipend_salary: draft.stipendSalary,
        fulltime_offer_salary: draft.fulltimeOfferSalary,
        years_of_experience: draft.yearsOfExperience,
        role_description: draft.roleDescription,
        assigned_to: draft.assignedTo,
      }),
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
            {/* Copy */}
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: copied ? '#86efac' : '#9ca3af',
                background: 'transparent',
                border: '1px solid #37373f',
                cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6b7280')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#37373f')}
            >
              {copied ? <Check style={{ width: '13px', height: '13px' }} /> : <Copy style={{ width: '13px', height: '13px' }} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            {/* Edit toggle */}
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
                color: isEditing ? '#6ea8fe' : '#9ca3af',
                background: isEditing ? 'rgba(29,43,164,0.12)' : 'transparent',
                border: `1px solid ${isEditing ? 'rgba(29,43,164,0.4)' : '#37373f'}`,
                cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = isEditing ? 'rgba(29,43,164,0.6)' : '#6b7280')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = isEditing ? 'rgba(29,43,164,0.4)' : '#37373f')}
            >
              <Edit3 style={{ width: '13px', height: '13px' }} />
              {isEditing ? 'Preview' : 'Edit'}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}
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
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #37373f',
                color: '#e5e7eb',
                padding: '0 0 16px 0',
                fontSize: '13px',
                fontFamily: 'Sora, sans-serif',
                lineHeight: 1.8,
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <pre style={{ color: '#e5e7eb', fontSize: '13px', fontFamily: 'Sora, sans-serif', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>
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
          <PrimaryButton
            onClick={() => finalizeMutation.mutate(editedJD)}
            loading={finalizeMutation.isPending}
            loadingText="Finalizing..."
          >
            <Check style={{ width: '14px', height: '14px' }} />
            Approve & Finalize
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
