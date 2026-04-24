import { useState } from 'react'
import { ChevronDown, ChevronUp, Copy, Check, Pencil, Trash2 } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge'
import { DownloadButton } from '../DownloadButton'
import type { JDDraft } from '../../types'

interface Props {
  drafts: JDDraft[]
  isLoading: boolean
  copiedIds: Set<string>
  onCopy: (id: string, text: string) => void
  onEditFinalized: (draft: JDDraft) => void
  onDelete: (id: string) => void
  isDeleting: boolean
}

// Skeleton shimmer row shown while the draft list is loading.
function SkeletonRow() {
  return (
    <div
      style={{
        background: '#161719',
        border: '1px solid #37373f',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div style={{ width: '140px', height: '14px', borderRadius: '4px', background: '#2a2d31' }} />
        <div style={{ width: '60px', height: '20px', borderRadius: '999px', background: '#2a2d31' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '56px', height: '20px', borderRadius: '999px', background: '#2a2d31' }} />
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#2a2d31' }} />
      </div>
    </div>
  )
}

export function JDListPanel({ drafts, isLoading, copiedIds, onCopy, onEditFinalized, onDelete, isDeleting }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ marginTop: '40px' }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: '16px',
          fontFamily: 'Sora, sans-serif',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            background: '#1a1d20',
            border: '1px solid #37373f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {open
            ? <ChevronUp style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
            : <ChevronDown style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
          }
        </div>
        <div style={{ textAlign: 'left' }}>
          <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700, display: 'block' }}>
            All JDs
          </span>
          <span style={{ color: '#9ca3af', fontSize: '12px' }}>
            {isLoading ? 'Loading...' : `${drafts.length} total`}
          </span>
        </div>
      </button>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {isLoading && drafts.length === 0 ? (
            <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
          ) : drafts.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '13px', padding: '12px 0' }}>
              No job postings yet. Create your first one above.
            </p>
          ) : (
            drafts.map((draft) => (
              <div
                key={draft.id}
                style={{
                  background: '#161719',
                  border: '1px solid #37373f',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#161719')}
              >
                {/* Title + experience level */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {draft.jobTitle || 'Untitled'}
                  </p>
                  <span style={{ background: '#1a1d20', color: '#9ca3af', border: '1px solid #37373f', borderRadius: '999px', padding: '2px 9px', fontSize: '11px', fontWeight: 500, flexShrink: 0 }}>
                    {draft.experienceLevel}
                  </span>
                </div>

                {/* Status + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <StatusBadge status={draft.status} />

                  {draft.status === 'finalized' && draft.roleDescription && (
                    <>
                      <button
                        onClick={() => onCopy(draft.id, draft.roleDescription)}
                        title="Copy JD"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 10px',
                          borderRadius: '7px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: copiedIds.has(draft.id) ? '#86efac' : '#9ca3af',
                          border: '1px solid #37373f',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontFamily: 'Sora, sans-serif',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {copiedIds.has(draft.id)
                          ? <Check style={{ width: '12px', height: '12px' }} />
                          : <Copy style={{ width: '12px', height: '12px' }} />
                        }
                        {copiedIds.has(draft.id) ? 'Copied!' : 'Copy'}
                      </button>

                      <button
                        onClick={() => onEditFinalized(draft)}
                        title="Edit JD"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 10px',
                          borderRadius: '7px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#9ca3af',
                          border: '1px solid #37373f',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontFamily: 'Sora, sans-serif',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Pencil style={{ width: '12px', height: '12px' }} />
                        Edit
                      </button>

                      <DownloadButton draftId={draft.id} jobTitle={draft.jobTitle} />
                    </>
                  )}

                  <span style={{ fontSize: '11px', color: '#6b7280' }}>
                    {new Date(draft.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => onDelete(draft.id)}
                    disabled={isDeleting}
                    title="Delete JD"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #37373f',
                      background: 'transparent',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      color: '#6b7280',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!isDeleting) {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
                        e.currentTarget.style.color = '#ef4444'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = '#37373f'
                      e.currentTarget.style.color = '#6b7280'
                    }}
                  >
                    <Trash2 style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
