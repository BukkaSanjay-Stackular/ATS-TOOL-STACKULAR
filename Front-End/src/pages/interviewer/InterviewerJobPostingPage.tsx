import { useState } from 'react'
import { MapPin, Monitor, Clock, ChevronLeft, FileText, CheckCircle, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useJD } from '../../context/useJD'
import type { JDDraft } from '../../types'

const inputStyle: React.CSSProperties = {
  background: '#1a1d20',
  border: '1px solid #37373f',
  color: '#fff',
  borderRadius: '8px',
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
  fontFamily: 'Sora, sans-serif',
  fontSize: '14px',
}

function compensationDisplay(draft: JDDraft): string {
  if (draft.experienceLevel === 'intern') return `₹${draft.stipend} stipend · ${draft.duration}`
  if (draft.experienceLevel === 'experienced') return `₹${draft.salary} per annum`
  return `₹${draft.fullTimeOfferSalary} full-time offer`
}

function levelLabel(level: JDDraft['experienceLevel']): string {
  const labels = { intern: 'Intern', fresher: 'Fresher', experienced: 'Experienced' }
  return labels[level]
}

function StatusBadge({ status }: { status: JDDraft['status'] }): React.ReactElement {
  const styles: Record<JDDraft['status'], React.CSSProperties> = {
    draft: { background: '#374151', color: '#d1d5db' },
    assigned: { background: '#78350f', color: '#fcd34d' },
    returned: { background: '#1e3a5f', color: '#93c5fd' },
    finalized: { background: '#14532d', color: '#86efac' },
  }
  return (
    <span
      style={{
        ...styles[status],
        padding: '2px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  )
}

export default function InterviewerJobPostingPage() {
  const { user } = useAuth()
  const { getDraftsForInterviewer, getAllDraftsForInterviewer, submitRoleDescription, dismissDraftForInterviewer } = useJD()

  const [selectedDraft, setSelectedDraft] = useState<JDDraft | null>(null)
  const [roleDescription, setRoleDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<string | null>(null)

  const activeDrafts = user ? getDraftsForInterviewer(user.username) : []
  const allMyDrafts = user ? getAllDraftsForInterviewer(user.username) : []
  const submittedCount = allMyDrafts.filter(
    (d) => d.status === 'returned' || d.status === 'finalized'
  ).length

  function handleSelectDraft(draft: JDDraft) {
    setSelectedDraft(draft)
    setRoleDescription(draft.roleDescription ?? '')
    setSubmitted(null)
  }

  function handleBack() {
    setSelectedDraft(null)
    setRoleDescription('')
    setSubmitted(null)
  }

  async function handleSubmit() {
    if (!selectedDraft || !roleDescription.trim()) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 400))
    submitRoleDescription(selectedDraft.id, roleDescription)
    setSubmitted(selectedDraft.id)
    setSubmitting(false)
    setSelectedDraft(null)
    setRoleDescription('')
  }

  function handleDismiss(id: string) {
    if (!user) return
    dismissDraftForInterviewer(id, user.username)
    if (selectedDraft?.id === id) handleBack()
  }

  const stats = [
    {
      label: 'Assigned to me',
      value: activeDrafts.length,
      icon: FileText,
      accent: '#1d2ba4',
      bg: 'rgba(29,43,164,0.12)',
    },
    {
      label: 'Submitted',
      value: submittedCount,
      icon: CheckCircle,
      accent: '#22c55e',
      bg: 'rgba(20,83,45,0.2)',
    },
  ]

  return (
    <div className="p-6" style={{ minHeight: '100vh' }}>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {stats.map(({ label, value, icon: Icon, accent, bg }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: '#161719',
              border: '1px solid #37373f',
              borderRadius: '14px',
              padding: '16px 20px',
              minWidth: '180px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon style={{ width: '18px', height: '18px', color: accent }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {submitted && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: '#14532d', color: '#86efac', border: '1px solid #166534', marginBottom: '20px' }}
        >
          Role description submitted successfully. The recruitment team has been notified.
        </div>
      )}

      {/* Detail view */}
      {selectedDraft && (
        <div
          style={{
            background: '#161719',
            border: '1px solid #37373f',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#9ca3af',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginBottom: '20px',
              fontFamily: 'Sora, sans-serif',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
          >
            <ChevronLeft style={{ width: '16px', height: '16px' }} />
            Back to list
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <DetailRow label="Job Title" value={selectedDraft.jobTitle} />
            <DetailRow label="Experience Level" value={levelLabel(selectedDraft.experienceLevel)} />
            <DetailRow label="Location" value={selectedDraft.location} />
            <DetailRow label="Work Mode" value={selectedDraft.workMode} />
            <DetailRow label="Work Hours" value={selectedDraft.workHours} />
            <DetailRow label="Compensation" value={compensationDisplay(selectedDraft)} />
            {selectedDraft.experienceLevel === 'intern' && (
              <DetailRow label="Duration" value={selectedDraft.duration} />
            )}
            <DetailRow label="Assigned By" value={selectedDraft.createdBy} />
            <DetailRow label="Posted" value={new Date(selectedDraft.createdAt).toLocaleDateString()} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#e5e7eb', marginBottom: '6px' }}>
              Role Description <span style={{ color: '#f87171' }}>*</span>
            </label>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', marginTop: 0 }}>
              Describe the role, day-to-day responsibilities, required skills, and any other relevant details.
            </p>
            <textarea
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              rows={8}
              placeholder="e.g. This role involves designing and implementing scalable APIs..."
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !roleDescription.trim()}
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
              cursor: submitting || !roleDescription.trim() ? 'not-allowed' : 'pointer',
              opacity: submitting || !roleDescription.trim() ? 0.5 : 1,
              fontFamily: 'Sora, sans-serif',
            }}
            onMouseEnter={(e) => { if (!submitting && roleDescription.trim()) e.currentTarget.style.background = '#12219e' }}
            onMouseLeave={(e) => { if (!submitting && roleDescription.trim()) e.currentTarget.style.background = '#1d2ba4' }}
          >
            {submitting && (
              <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            )}
            {submitting ? 'Submitting...' : 'Submit Back to Recruitment'}
          </button>
        </div>
      )}

      {/* List view */}
      {!selectedDraft && (
        <>
          <div style={{ marginBottom: '12px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700, margin: 0, fontFamily: 'Sora, sans-serif' }}>
              Assigned JDs
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0 0' }}>
              {allMyDrafts.length === 0 ? 'No job postings assigned yet.' : `${allMyDrafts.length} total — click to fill in a role description`}
            </p>
          </div>

          {allMyDrafts.length === 0 ? (
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
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allMyDrafts.map((draft) => {
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
                      onClick={() => isActive ? handleSelectDraft(draft) : undefined}
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
                          {levelLabel(draft.experienceLevel)}
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

                    {/* Delete button */}
                    <button
                      onClick={() => handleDismiss(draft.id)}
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
                        cursor: 'pointer',
                        color: '#6b7280',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
                        e.currentTarget.style.color = '#ef4444'
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
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
      <span style={{ fontSize: '13px', color: '#e5e7eb' }}>{value || '—'}</span>
    </div>
  )
}
