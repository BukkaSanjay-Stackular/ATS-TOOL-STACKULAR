import { LayoutList } from 'lucide-react'
import type { JDFormState } from './types'

interface Props {
  form: JDFormState
  isComplete: boolean
}

// Sticky sidebar showing a live reflection of the form — lets the recruiter see
// what the AI will receive without scrolling back up.
export function LiveSummaryPanel({ form, isComplete }: Props) {
  const levelCapitalized = form.experience_level
    ? form.experience_level.charAt(0).toUpperCase() + form.experience_level.slice(1)
    : ''

  const summaryRows: { label: string; value: string }[] = [
    { label: 'Job Title',         value: form.job_title },
    { label: 'Experience Level',  value: levelCapitalized },
    { label: 'Location',          value: form.location },
    { label: 'Work Mode',         value: form.work_mode },
    { label: 'Work Hours',        value: form.work_hours },
    ...(form.experience_level === 'intern'
      ? [
          { label: 'Duration', value: form.duration },
          { label: 'Stipend',  value: form.stipend_salary ? `₹${form.stipend_salary}` : '' },
        ]
      : form.experience_level === 'experienced'
      ? [
          { label: 'Salary',           value: form.fulltime_offer_salary ? `₹${form.fulltime_offer_salary}` : '' },
          { label: 'Experience Years', value: form.years_of_experience },
        ]
      : form.experience_level === 'fresher'
      ? [{ label: 'Full-Time Salary', value: form.fulltime_offer_salary ? `₹${form.fulltime_offer_salary}` : '' }]
      : []),
    {
      label: 'Role Description',
      value: form.roleDescription
        ? form.roleDescription.slice(0, 80) + (form.roleDescription.length > 80 ? '...' : '')
        : '',
    },
    { label: 'Assigned To', value: form.assignedTo.length > 0 ? form.assignedTo.join(', ') : '' },
  ]

  // Count required-ish fields to drive the progress bar
  const progressFields = [
    form.job_title,
    form.location,
    form.work_mode,
    form.work_hours,
    form.roleDescription,
    form.experience_level === 'intern' ? form.duration : null,
    form.experience_level === 'intern' ? form.stipend_salary : null,
    form.experience_level === 'experienced' ? form.fulltime_offer_salary : null,
    form.experience_level === 'experienced' ? form.years_of_experience : null,
    form.experience_level === 'fresher' ? form.fulltime_offer_salary : null,
  ].filter((f) => f !== null)
  const progressPct = Math.round((progressFields.filter(Boolean).length / progressFields.length) * 100)

  return (
    <div style={{ width: '272px', flexShrink: 0, position: 'sticky', top: '24px' }}>
      <div
        style={{
          background: '#161719',
          border: '1px solid #37373f',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid #37373f',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'rgba(29,43,164,0.18)',
              border: '1px solid rgba(29,43,164,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LayoutList style={{ width: '12px', height: '12px', color: '#6ea8fe' }} />
          </div>
          <span style={{ color: '#e5e7eb', fontWeight: 700, fontSize: '13px' }}>Live Summary</span>
        </div>

        {/* Rows */}
        <div style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {summaryRows.map(({ label, value }) => (
              <div key={label}>
                <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '3px' }}>
                  {label}
                </span>
                <span style={{ fontSize: '13px', color: value ? '#e5e7eb' : '#374151', lineHeight: '1.4' }}>
                  {value || '—'}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #37373f' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>Completion</span>
              <span style={{ fontSize: '11px', color: isComplete ? '#86efac' : '#9ca3af', fontWeight: 700 }}>
                {isComplete ? 'Ready' : 'In progress'}
              </span>
            </div>
            <div style={{ height: '4px', background: '#37373f', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #1d2ba4, #6ea8fe)',
                  borderRadius: '999px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
