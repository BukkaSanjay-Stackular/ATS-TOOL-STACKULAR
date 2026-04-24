import { CornerDownLeft, Sparkles } from 'lucide-react'
import { GhostButton } from '../ui/GhostButton'
import { PrimaryButton } from '../ui/PrimaryButton'
import { LEVEL_META } from '../../constants/jd'
import type { JDDraft } from '../../types'

interface Props {
  drafts: JDDraft[]
  generatingDraftId: string | null
  onReview: (draft: JDDraft) => void
  onCreateJD: (draftId: string) => void
}

// Drafts that interviewers have filled in and returned for recruitment to finalize.
export function ReturnedDraftsSection({ drafts, generatingDraftId, onReview, onCreateJD }: Props) {
  if (drafts.length === 0) return null

  return (
    <div style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            background: 'rgba(30, 58, 95, 0.5)',
            border: '1px solid rgba(147, 197, 253, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CornerDownLeft style={{ width: '14px', height: '14px', color: '#93c5fd' }} />
        </div>
        <div>
          <h2 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700, margin: 0 }}>
            Returned from Interviewers
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
            {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'} need your review
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {drafts.map((draft) => {
          const meta = draft.experienceLevel ? LEVEL_META[draft.experienceLevel] : null
          const isGenerating = generatingDraftId === draft.id
          const isBusy = !!generatingDraftId

          return (
            <div
              key={draft.id}
              style={{
                background: '#161719',
                border: '1px solid #37373f',
                borderLeft: '3px solid #93c5fd',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <p style={{ fontWeight: 700, color: '#ffffff', fontSize: '15px', margin: 0 }}>
                    {draft.jobTitle}
                  </p>
                  <span
                    style={{
                      background: '#1e3a5f',
                      color: '#93c5fd',
                      borderRadius: '999px',
                      padding: '2px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {meta?.label ?? draft.experienceLevel}
                  </span>
                </div>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 8px 0' }}>
                  Assigned to: {draft.assignedTo.join(', ')}
                </p>
                {draft.roleDescription && (
                  <p style={{ color: '#d1d5db', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                    {draft.roleDescription.slice(0, 120)}
                    {draft.roleDescription.length > 120 ? '...' : ''}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <GhostButton onClick={() => onReview(draft)}>Review</GhostButton>
                <PrimaryButton
                  loading={isGenerating}
                  loadingText=""
                  disabled={isBusy}
                  onClick={() => onCreateJD(draft.id)}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <Sparkles style={{ width: '13px', height: '13px' }} />
                  Create JD
                </PrimaryButton>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
