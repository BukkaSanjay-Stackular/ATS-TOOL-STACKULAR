import { MapPin, Monitor, Clock, Trash2 } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge'
import type { JDDraft } from '../../types'

interface Props {
  drafts: JDDraft[]
  isLoading: boolean
  onSelect: (draft: JDDraft) => void
  onDismiss: (id: string) => void
  isDismissing: boolean
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: '#161719',
        border: '1px solid #37373f',
        borderRadius: '14px',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <div style={{ width: '160px', height: '14px', borderRadius: '4px', background: '#2a2d31' }} />
          <div style={{ width: '56px', height: '20px', borderRadius: '999px', background: '#2a2d31' }} />
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ width: '80px', height: '12px', borderRadius: '4px', background: '#2a2d31' }} />
          <div style={{ width: '60px', height: '12px', borderRadius: '4px', background: '#2a2d31' }} />
          <div style={{ width: '100px', height: '12px', borderRadius: '4px', background: '#2a2d31' }} />
        </div>
      </div>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#2a2d31', flexShrink: 0 }} />
    </div>
  )
}

const LEVEL_LABELS: Record<JDDraft['experienceLevel'], string> = {
  intern: 'Intern',
  fresher: 'Fresher',
  experienced: 'Experienced',
}

export function DraftListView({ drafts, isLoading, onSelect, onDismiss, isDismissing }: Props) {
  if (isLoading && drafts.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (drafts.length === 0) {
    return (
      <div
        style={{
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          background: '#161719',
          border: '1px solid #37373f',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#1a1d20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
          }}
        >
          <Monitor style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
        </div>
        <p style={{ fontWeight: 600, color: '#ffffff', margin: '0 0 6px 0' }}>No JDs assigned to you yet.</p>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
          When the recruitment team assigns a job posting, it will appear here.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {drafts.map((draft) => {
        // Only active (assigned) drafts are clickable — returned/finalized are read-only
        const isActive = draft.status === 'assigned'
        return (
          <div
            key={draft.id}
            style={{
              background: '#161719',
              border: '1px solid #37373f',
              borderRadius: '14px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            {/* Clickable area */}
            <button
              onClick={() => isActive && onSelect(draft)}
              disabled={!isActive}
              style={{
                flex: 1,
                minWidth: 0,
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: isActive ? 'pointer' : 'default',
                fontFamily: 'Sora, sans-serif',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <p style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px', margin: 0 }}>{draft.jobTitle}</p>
                <span
                  style={{
                    background: '#1e3a5f',
                    color: '#93c5fd',
                    borderRadius: '999px',
                    padding: '1px 8px',
                    fontSize: '11px',
                    flexShrink: 0,
                  }}
                >
                  {LEVEL_LABELS[draft.experienceLevel]}
                </span>
                <StatusBadge status={draft.status} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#9ca3af' }}>
                  <MapPin style={{ width: '12px', height: '12px' }} />
                  {draft.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#9ca3af' }}>
                  <Monitor style={{ width: '12px', height: '12px' }} />
                  {draft.workMode}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#9ca3af' }}>
                  <Clock style={{ width: '12px', height: '12px' }} />
                  {draft.workHours}
                </span>
              </div>
            </button>

            {/* Dismiss / remove-from-list button */}
            <button
              onClick={() => onDismiss(draft.id)}
              disabled={isDismissing}
              title="Remove from my list"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #37373f',
                background: 'transparent',
                cursor: isDismissing ? 'not-allowed' : 'pointer',
                color: '#6b7280',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isDismissing) {
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
              <Trash2 style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
