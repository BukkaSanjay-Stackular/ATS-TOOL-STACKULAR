import { ChevronLeft } from 'lucide-react'
import { PrimaryButton } from '../ui/PrimaryButton'
import type { JDDraft } from '../../types'

interface Props {
  draft: JDDraft
  roleDescription: string
  onRoleDescriptionChange: (value: string) => void
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

// Full detail view for a single assigned JD — shows job meta and a textarea
// for the interviewer to fill in the role description before submitting.
export function DraftDetailView({ draft, roleDescription, onRoleDescriptionChange, onBack, onSubmit, isSubmitting }: Props) {
  const canSubmit = !isSubmitting && roleDescription.trim().length > 0

  return (
    <div
      style={{
        background: '#161719',
        border: '1px solid #37373f',
        borderRadius: '16px',
        padding: '24px',
      }}
    >
      <button
        onClick={onBack}
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

      {/* Job metadata grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <DetailRow label="Job Title" value={draft.jobTitle} />
        <DetailRow label="Experience Level" value={levelLabel(draft.experienceLevel)} />
        <DetailRow label="Location" value={draft.location} />
        <DetailRow label="Work Mode" value={draft.workMode} />
        <DetailRow label="Work Hours" value={draft.workHours} />
        <DetailRow label="Compensation" value={compensationDisplay(draft)} />
        {draft.experienceLevel === 'intern' && (
          <DetailRow label="Duration" value={draft.duration} />
        )}
        <DetailRow label="Assigned By" value={draft.createdBy} />
        <DetailRow label="Posted" value={new Date(draft.createdAt).toLocaleDateString()} />
      </div>

      {/* Role description textarea */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#e5e7eb', marginBottom: '6px' }}>
          Role Description <span style={{ color: '#f87171' }}>*</span>
        </label>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', marginTop: 0 }}>
          Describe the role, day-to-day responsibilities, required skills, and any other relevant details.
        </p>
        <textarea
          value={roleDescription}
          onChange={(e) => onRoleDescriptionChange(e.target.value)}
          rows={8}
          placeholder="e.g. This role involves designing and implementing scalable APIs..."
          style={{
            background: '#1a1d20',
            border: '1px solid #37373f',
            color: '#fff',
            borderRadius: '8px',
            padding: '10px 14px',
            width: '100%',
            outline: 'none',
            fontFamily: 'Sora, sans-serif',
            fontSize: '14px',
            resize: 'vertical',
            lineHeight: '1.6',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
        />
      </div>

      <PrimaryButton
        onClick={onSubmit}
        disabled={!canSubmit}
        loading={isSubmitting}
        loadingText="Submitting..."
      >
        Submit Back to Recruitment
      </PrimaryButton>
    </div>
  )
}

// --- Helpers ---

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ color: '#9ca3af', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
      <span style={{ fontSize: '13px', color: '#e5e7eb' }}>{value || '—'}</span>
    </div>
  )
}

function levelLabel(level: JDDraft['experienceLevel']): string {
  return { intern: 'Intern', fresher: 'Fresher', experienced: 'Experienced' }[level]
}

function compensationDisplay(draft: JDDraft): string {
  if (draft.experienceLevel === 'intern') return `₹${draft.stipendSalary} stipend · ${draft.duration}`
  if (draft.experienceLevel === 'experienced') return `₹${draft.fulltimeOfferSalary} per annum`
  return `₹${draft.fulltimeOfferSalary} full-time offer`
}
