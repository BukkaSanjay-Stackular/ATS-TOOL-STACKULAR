import { useState } from 'react'
import {
  GraduationCap,
  UserPlus,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  Users,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Trash2,
  UserCheck,
  CornerDownLeft,
  FileText,
  LayoutList,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useJD } from '../../context/useJD'
import { generateJD } from '../../services/jdService'
import { INTERVIEWERS } from '../../constants/users'
import type { ExperienceLevel, JDDraft, JDStatus } from '../../types'

const LOCATIONS = ['Hyderabad', 'Chicago', 'Columbia', 'San Jose']
const WORK_MODES = ['On-site', 'Remote', 'Hybrid']
const WORK_HOURS = ['11:00 AM – 8:00 PM', '2:00 PM – 11:00 PM']

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

const selectStyle: React.CSSProperties = {
  background: '#1a1d20',
  border: '1px solid #37373f',
  color: '#fff',
  borderRadius: '8px',
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
  fontFamily: 'Sora, sans-serif',
  fontSize: '14px',
  cursor: 'pointer',
}

interface FormState {
  experience_level: ExperienceLevel | null
  job_title: string
  location: string
  work_mode: string
  work_hours: string
  duration: string
  stipend_salary: string
  fulltime_offer_salary: string
  years_of_experience: string
  roleDescription: string
  assignedTo: string[]
}

const emptyForm: FormState = {
  experience_level: null,
  job_title: '',
  location: '',
  work_mode: '',
  work_hours: '',
  duration: '',
  stipend_salary: '',
  fulltime_offer_salary: '',
  years_of_experience: '',
  roleDescription: '',
  assignedTo: [],
}

function statusBadge(status: JDStatus): React.ReactElement {
  const styles: Record<JDStatus, React.CSSProperties> = {
    draft: { background: '#374151', color: '#d1d5db' },
    assigned: { background: '#78350f', color: '#fcd34d' },
    returned: { background: '#1e3a5f', color: '#93c5fd' },
    finalized: { background: '#14532d', color: '#86efac' },
  }
  return (
    <span
      style={{
        ...styles[status],
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'capitalize',
        letterSpacing: '0.02em',
      }}
    >
      {status}
    </span>
  )
}

function SectionLabel({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'rgba(29, 43, 164, 0.18)',
          border: '1px solid rgba(29, 43, 164, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: '13px', height: '13px', color: '#6ea8fe' }} />
      </div>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#9ca3af',
        }}
      >
        {text}
      </span>
    </div>
  )
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '8px',
      }}
    >
      {children}
      {required && <span style={{ color: '#f87171' }}>*</span>}
    </label>
  )
}

export default function JobPostingPage() {
  const { user } = useAuth()
  const { createDraft, updateDraft, deleteDraft, assignDraft, finalizeDraft, getDraftsForRecruitment } = useJD()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)
  const [pendingAssigned, setPendingAssigned] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [showGenerated, setShowGenerated] = useState(false)
  const [copiedJD, setCopiedJD] = useState(false)
  const [allDraftsOpen, setAllDraftsOpen] = useState(false)

  const myDrafts = user ? getDraftsForRecruitment(user.username) : []
  const returnedDrafts = myDrafts.filter((d) => d.status === 'returned')

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSelectLevel(level: ExperienceLevel) {
    setForm({ ...emptyForm, experience_level: level })
    setEditingId(null)
    setShowGenerated(false)
    setGeneratedContent('')
    setSuccessMsg('')
  }

  function isFormComplete(): boolean {
    if (!form.experience_level || !form.job_title || !form.location || !form.work_mode || !form.work_hours) return false
    if (!form.roleDescription) return false
    if (form.experience_level === 'intern' && !form.duration) return false
    if (form.experience_level === 'experienced' && !form.years_of_experience) return false
    return true
  }

  function handleSaveDraft() {
    if (!user || !form.experience_level) return
    const data = {
      experience_level: form.experience_level,
      job_title: form.job_title,
      location: form.location,
      work_mode: form.work_mode,
      work_hours: form.work_hours,
      duration: form.duration,
      stipend_salary: form.stipend_salary,
      fulltime_offer_salary: form.fulltime_offer_salary,
      years_of_experience: form.years_of_experience,
      roleDescription: form.roleDescription,
      assignedTo: form.assignedTo,
      createdBy: user.username,
    }
    if (editingId) {
      updateDraft(editingId, data)
    } else {
      createDraft(data)
    }
    setForm(emptyForm)
    setEditingId(null)
    setSuccessMsg('Draft saved successfully.')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  function handleAssign() {
    if (!user || !form.experience_level || form.assignedTo.length === 0) return
    const data = {
      experience_level: form.experience_level,
      job_title: form.job_title,
      location: form.location,
      work_mode: form.work_mode,
      work_hours: form.work_hours,
      duration: form.duration,
      stipend_salary: form.stipend_salary,
      fulltime_offer_salary: form.fulltime_offer_salary,
      years_of_experience: form.years_of_experience,
      roleDescription: form.roleDescription,
      assignedTo: form.assignedTo,
      createdBy: user.username,
    }
    if (editingId) {
      updateDraft(editingId, { ...data, status: 'assigned' })
    } else {
      const id = createDraft(data)
      assignDraft(id, form.assignedTo)
    }
    setForm(emptyForm)
    setEditingId(null)
    setSuccessMsg(`Assigned to ${form.assignedTo.join(', ')} — visible in their portal now.`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  async function handleCreateJD(draftId?: string) {
    if (!user) return

    let targetDraft: JDDraft | undefined
    if (draftId) {
      targetDraft = myDrafts.find((d) => d.id === draftId)
    } else if (isFormComplete() && form.experience_level) {
      const data = {
        experience_level: form.experience_level,
        job_title: form.job_title,
        location: form.location,
        work_mode: form.work_mode,
        work_hours: form.work_hours,
        duration: form.duration,
        stipend_salary: form.stipend_salary,
        fulltime_offer_salary: form.fulltime_offer_salary,
        years_of_experience: form.years_of_experience,
        roleDescription: form.roleDescription,
        assignedTo: form.assignedTo,
        createdBy: user.username,
      }
      const newId = editingId ?? createDraft(data)
      if (!editingId) {
        targetDraft = { ...data, id: newId, createdAt: new Date().toISOString(), status: 'draft', generatedJD: '' }
      } else {
        updateDraft(editingId, data)
        targetDraft = myDrafts.find((d) => d.id === editingId)
      }
    }

    if (!targetDraft) return

    setLoading(true)
    try {
      const content = await generateJD(targetDraft)
      finalizeDraft(targetDraft.id, content)
      setGeneratedContent(content)
      setShowGenerated(true)
      setForm(emptyForm)
      setEditingId(null)
    } finally {
      setLoading(false)
    }
  }

  function handleEditReturned(draft: JDDraft) {
    setForm({
      experience_level: draft.experience_level,
      job_title: draft.job_title,
      location: draft.location,
      work_mode: draft.work_mode,
      work_hours: draft.work_hours,
      duration: draft.duration,
      stipend_salary: draft.stipend_salary,
      fulltime_offer_salary: draft.fulltime_offer_salary,
      years_of_experience: draft.years_of_experience,
      roleDescription: draft.roleDescription,
      assignedTo: draft.assignedTo,
    })
    setEditingId(draft.id)
    setShowGenerated(false)
    setGeneratedContent('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleInterviewer(username: string) {
    setPendingAssigned((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]
    )
  }

  function confirmAssignment() {
    setField('assignedTo', pendingAssigned)
    setShowAssignDropdown(false)
  }

  function openAssignDropdown() {
    setPendingAssigned(form.assignedTo)
    setShowAssignDropdown(true)
  }

  async function handleCopyJD() {
    await navigator.clipboard.writeText(generatedContent)
    setCopiedJD(true)
    setTimeout(() => setCopiedJD(false), 2000)
  }

  const hasForm = form.experience_level !== null

  const levelMeta = {
    intern: { label: 'Intern', desc: 'Short-term internship with stipend_salary', Icon: GraduationCap },
    fresher: { label: 'Fresher', desc: 'Entry-level, no prior experience required', Icon: UserPlus },
    experienced: { label: 'Experienced', desc: 'Candidates with specific years of experience', Icon: Award },
  }

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(29, 43, 164, 0.2)',
              border: '1px solid rgba(29, 43, 164, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText style={{ width: '16px', height: '16px', color: '#6ea8fe' }} />
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'Sora, sans-serif',
              margin: 0,
            }}
          >
            Job Posting
          </h1>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0, paddingLeft: '48px' }}>
          Create and manage job descriptions for open positions.
        </p>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(20, 83, 45, 0.6)',
            color: '#86efac',
            border: '1px solid #166534',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          {successMsg}
        </div>
      )}

      {/* Generated JD result */}
      {showGenerated && generatedContent && (
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              background: '#161719',
              border: '1px solid #37373f',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid #37373f',
                background: 'rgba(29, 43, 164, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(29, 43, 164, 0.2)',
                    border: '1px solid rgba(29, 43, 164, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles style={{ width: '14px', height: '14px', color: '#6ea8fe' }} />
                </div>
                <div>
                  <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', margin: 0 }}>
                    Job Description Generated
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                    AI-generated — review before publishing
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleCopyJD}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: copiedJD ? '#86efac' : '#9ca3af',
                    border: '1px solid #37373f',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'Sora, sans-serif',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {copiedJD ? (
                    <Check style={{ width: '13px', height: '13px' }} />
                  ) : (
                    <Copy style={{ width: '13px', height: '13px' }} />
                  )}
                  {copiedJD ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => { setShowGenerated(false); setGeneratedContent('') }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#9ca3af',
                    border: '1px solid #37373f',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'Sora, sans-serif',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Dismiss
                </button>
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '13px',
                  lineHeight: '1.75',
                  color: '#e5e7eb',
                  margin: 0,
                }}
              >
                {generatedContent}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Experience Level Selector */}
      <div style={{ marginBottom: '28px' }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#9ca3af',
            marginBottom: '12px',
          }}
        >
          {hasForm ? 'Experience Level' : 'Select experience level to get started'}
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {(
            [
              {
                level: 'intern' as ExperienceLevel,
                Icon: GraduationCap,
                label: 'Intern',
                desc: 'Short-term with stipend_salary',
                gradient: 'linear-gradient(135deg, rgba(29,43,164,0.12) 0%, rgba(110,168,254,0.06) 100%)',
                activeGradient: 'linear-gradient(135deg, rgba(29,43,164,0.22) 0%, rgba(110,168,254,0.10) 100%)',
              },
              {
                level: 'fresher' as ExperienceLevel,
                Icon: UserPlus,
                label: 'Fresher',
                desc: 'Entry-level role',
                gradient: 'linear-gradient(135deg, rgba(20,83,45,0.12) 0%, rgba(134,239,172,0.06) 100%)',
                activeGradient: 'linear-gradient(135deg, rgba(20,83,45,0.22) 0%, rgba(134,239,172,0.10) 100%)',
              },
              {
                level: 'experienced' as ExperienceLevel,
                Icon: Award,
                label: 'Experienced',
                desc: 'Specific years required',
                gradient: 'linear-gradient(135deg, rgba(120,53,15,0.12) 0%, rgba(252,211,77,0.06) 100%)',
                activeGradient: 'linear-gradient(135deg, rgba(120,53,15,0.22) 0%, rgba(252,211,77,0.10) 100%)',
              },
            ] as const
          ).map(({ level, Icon, label, desc, gradient, activeGradient }) => {
            const isActive = form.experience_level === level
            return (
              <button
                key={level}
                onClick={() => handleSelectLevel(level)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '16px',
                  borderRadius: '14px',
                  textAlign: 'left',
                  minWidth: '168px',
                  flex: '1',
                  maxWidth: '220px',
                  background: isActive ? activeGradient : gradient,
                  border: `2px solid ${isActive ? '#1d2ba4' : '#37373f'}`,
                  cursor: 'pointer',
                  fontFamily: 'Sora, sans-serif',
                  boxShadow: isActive ? '0 0 0 1px rgba(29,43,164,0.3), 0 4px 20px rgba(29,43,164,0.15)' : 'none',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#1d2ba4'
                    e.currentTarget.style.background = activeGradient
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = '#37373f'
                    e.currentTarget.style.background = gradient
                  }
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(29,43,164,0.25)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isActive ? 'rgba(29,43,164,0.5)' : '#37373f'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    style={{
                      width: '16px',
                      height: '16px',
                      color: isActive ? '#6ea8fe' : '#9ca3af',
                    }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      color: isActive ? '#ffffff' : '#e5e7eb',
                      fontSize: '14px',
                      margin: '0 0 3px 0',
                    }}
                  >
                    {label}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: '1.4' }}>
                    {desc}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Two-column layout when form is open */}
      {hasForm && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

          {/* Main form */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                background: '#161719',
                border: '1px solid #37373f',
                borderRadius: '16px',
                padding: '28px',
              }}
            >

              {/* Section: Role Details */}
              <SectionLabel icon={Briefcase} text="Role Details" />

              {/* Job Title — full width */}
              <div style={{ marginBottom: '20px' }}>
                <FieldLabel required>Job Title</FieldLabel>
                <input
                  type="text"
                  value={form.job_title}
                  onChange={(e) => setField('job_title', e.target.value)}
                  placeholder="e.g. Frontend Developer, Data Analyst"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                />
              </div>

              {/* Intern-specific: Duration (full width, prominent) */}
              {form.experience_level === 'intern' && (
                <div style={{ marginBottom: '20px' }}>
                  <FieldLabel required>Duration</FieldLabel>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setField('duration', e.target.value)}
                    placeholder="e.g. 3 months, 6 months"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                  />
                </div>
              )}

              {/* Location + Work Mode + Work Hours — 3 col grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <FieldLabel required>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin style={{ width: '11px', height: '11px' }} />
                      Location
                    </span>
                  </FieldLabel>
                  <select
                    value={form.location}
                    onChange={(e) => setField('location', e.target.value)}
                    style={selectStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                  >
                    <option value="" disabled>Select</option>
                    {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <FieldLabel required>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Briefcase style={{ width: '11px', height: '11px' }} />
                      Work Mode
                    </span>
                  </FieldLabel>
                  <select
                    value={form.work_mode}
                    onChange={(e) => setField('work_mode', e.target.value)}
                    style={selectStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                  >
                    <option value="" disabled>Select</option>
                    {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <FieldLabel required>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock style={{ width: '11px', height: '11px' }} />
                      Work Hours
                    </span>
                  </FieldLabel>
                  <select
                    value={form.work_hours}
                    onChange={(e) => setField('work_hours', e.target.value)}
                    style={selectStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                  >
                    <option value="" disabled>Select</option>
                    {WORK_HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* Compensation section — level-specific, 2-col where applicable */}
              {form.experience_level === 'intern' && (
                <>
                  <div
                    style={{
                      height: '1px',
                      background: '#37373f',
                      margin: '24px 0',
                    }}
                  />
                  <SectionLabel icon={DollarSign} text="Compensation" />
                  <div style={{ marginBottom: '20px' }}>
                    <FieldLabel>Stipend / Salary INR</FieldLabel>
                    <input
                      type="text"
                      value={form.stipend_salary}
                      onChange={(e) => setField('stipend_salary', e.target.value)}
                      placeholder="e.g. 50000"
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                    />
                  </div>
                </>
              )}

              {form.experience_level === 'experienced' && (
                <>
                  <div style={{ height: '1px', background: '#37373f', margin: '24px 0' }} />
                  <SectionLabel icon={DollarSign} text="Compensation & Experience" />
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      marginBottom: '20px',
                    }}
                  >
                    <div>
                      <FieldLabel>Salary INR</FieldLabel>
                      <input
                        type="text"
                        value={form.fulltime_offer_salary}
                        onChange={(e) => setField('fulltime_offer_salary', e.target.value)}
                        placeholder="e.g. 1200000"
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Experience Years</FieldLabel>
                      <input
                        type="text"
                        value={form.years_of_experience}
                        onChange={(e) => setField('years_of_experience', e.target.value)}
                        placeholder="e.g. 3+ years, 5–8 years"
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                      />
                    </div>
                  </div>
                </>
              )}

              {form.experience_level === 'fresher' && (
                <>
                  <div style={{ height: '1px', background: '#37373f', margin: '24px 0' }} />
                  <SectionLabel icon={DollarSign} text="Compensation" />
                  <div style={{ marginBottom: '20px' }}>
                    <FieldLabel>Full-Time Offer Salary INR</FieldLabel>
                    <input
                      type="text"
                      value={form.fulltime_offer_salary}
                      onChange={(e) => setField('fulltime_offer_salary', e.target.value)}
                      placeholder="e.g. 600000"
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                    />
                  </div>
                </>
              )}

              {/* Role Description */}
              <div style={{ height: '1px', background: '#37373f', margin: '24px 0' }} />
              <SectionLabel icon={FileText} text="Role Description & Requirements" />
              <div style={{ marginBottom: '24px' }}>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={form.roleDescription}
                  onChange={(e) => setField('roleDescription', e.target.value)}
                  rows={6}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.7' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#1d2ba4')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#37373f')}
                />
                <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '6px' }}>
                  Be specific about responsibilities — the AI uses this to generate the full JD.
                </p>
              </div>

              {/* Assign to Interviewer */}
              <div style={{ height: '1px', background: '#37373f', margin: '24px 0' }} />
              <SectionLabel icon={Users} text="Assignment" />

              <div
                style={{
                  background: '#1a1d20',
                  border: '1px solid #37373f',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <p style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0' }}>
                      Assign to Interviewer
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                      Optionally delegate role description to an interviewer.
                    </p>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={openAssignDropdown}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: form.assignedTo.length > 0 ? '#6ea8fe' : '#9ca3af',
                        border: `1px solid ${form.assignedTo.length > 0 ? 'rgba(29,43,164,0.5)' : '#37373f'}`,
                        background: form.assignedTo.length > 0 ? 'rgba(29,43,164,0.12)' : 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'Sora, sans-serif',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = form.assignedTo.length > 0 ? 'rgba(29,43,164,0.2)' : '#161719')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = form.assignedTo.length > 0 ? 'rgba(29,43,164,0.12)' : 'transparent')}
                    >
                      <Users style={{ width: '14px', height: '14px' }} />
                      {form.assignedTo.length > 0
                        ? `${form.assignedTo.length} Assigned`
                        : 'Select Interviewers'}
                      <ChevronDown style={{ width: '13px', height: '13px', opacity: 0.6 }} />
                    </button>

                    {showAssignDropdown && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          right: 0,
                          zIndex: 50,
                          background: '#161719',
                          border: '1px solid #37373f',
                          borderRadius: '12px',
                          padding: '8px',
                          minWidth: '220px',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#9ca3af',
                            padding: '4px 8px 8px',
                            margin: 0,
                          }}
                        >
                          Select interviewers
                        </p>
                        <div style={{ marginBottom: '8px' }}>
                          {INTERVIEWERS.map((iv) => (
                            <label
                              key={iv.username}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: '#e5e7eb',
                                fontSize: '13px',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <input
                                type="checkbox"
                                checked={pendingAssigned.includes(iv.username)}
                                onChange={() => toggleInterviewer(iv.username)}
                                style={{ accentColor: '#1d2ba4', width: '14px', height: '14px' }}
                              />
                              <span>{iv.name}</span>
                            </label>
                          ))}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            padding: '8px 4px 4px',
                            borderTop: '1px solid #37373f',
                          }}
                        >
                          <button
                            onClick={confirmAssignment}
                            style={{
                              flex: 1,
                              padding: '7px 12px',
                              borderRadius: '7px',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#ffffff',
                              background: '#1d2ba4',
                              border: 'none',
                              cursor: 'pointer',
                              fontFamily: 'Sora, sans-serif',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#12219e')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#1d2ba4')}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setShowAssignDropdown(false)}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '7px',
                              fontSize: '13px',
                              color: '#9ca3af',
                              border: '1px solid #37373f',
                              background: 'transparent',
                              cursor: 'pointer',
                              fontFamily: 'Sora, sans-serif',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {form.assignedTo.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                    {form.assignedTo.map((u) => (
                      <span
                        key={u}
                        style={{
                          background: 'rgba(29,43,164,0.2)',
                          color: '#93c5fd',
                          border: '1px solid rgba(29,43,164,0.4)',
                          borderRadius: '999px',
                          padding: '3px 12px',
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleSaveDraft}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#e5e7eb',
                    border: '1px solid #37373f',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'Sora, sans-serif',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Save Draft
                </button>
                <button
                  onClick={handleAssign}
                  disabled={form.assignedTo.length === 0 || !form.experience_level || !form.job_title}
                  title={form.assignedTo.length === 0 ? 'Select at least one interviewer to assign' : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '10px 20px',
                    borderRadius: '9px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: form.assignedTo.length > 0 && form.job_title ? '#ffffff' : '#6b7280',
                    background: form.assignedTo.length > 0 && form.job_title ? 'rgba(29,43,164,0.15)' : 'transparent',
                    border: `1px solid ${form.assignedTo.length > 0 && form.job_title ? 'rgba(29,43,164,0.5)' : '#37373f'}`,
                    cursor: form.assignedTo.length > 0 && form.job_title ? 'pointer' : 'not-allowed',
                    fontFamily: 'Sora, sans-serif',
                    opacity: form.assignedTo.length > 0 && form.job_title ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (form.assignedTo.length > 0 && form.job_title) e.currentTarget.style.background = 'rgba(29,43,164,0.25)'
                  }}
                  onMouseLeave={(e) => {
                    if (form.assignedTo.length > 0 && form.job_title) e.currentTarget.style.background = 'rgba(29,43,164,0.15)'
                  }}
                >
                  <UserCheck style={{ width: '14px', height: '14px' }} />
                  Assign
                </button>
                <button
                  onClick={() => handleCreateJD()}
                  disabled={!isFormComplete() || loading}
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
                    cursor: isFormComplete() && !loading ? 'pointer' : 'not-allowed',
                    opacity: isFormComplete() && !loading ? 1 : 0.5,
                    fontFamily: 'Sora, sans-serif',
                    boxShadow: isFormComplete() && !loading ? '0 4px 16px rgba(29,43,164,0.35)' : 'none',
                  }}
                  onMouseEnter={(e) => { if (isFormComplete() && !loading) e.currentTarget.style.background = '#12219e' }}
                  onMouseLeave={(e) => { if (isFormComplete() && !loading) e.currentTarget.style.background = '#1d2ba4' }}
                >
                  {loading ? (
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#ffffff',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                  ) : (
                    <Sparkles style={{ width: '14px', height: '14px' }} />
                  )}
                  {loading ? 'Generating JD...' : 'Create JD'}
                </button>
              </div>
            </div>
          </div>

          {/* Live Summary Panel */}
          <div
            style={{
              width: '272px',
              flexShrink: 0,
              position: 'sticky',
              top: '24px',
            }}
          >
            <div
              style={{
                background: '#161719',
                border: '1px solid #37373f',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
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
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {(
                    [
                      { label: 'Job Title', value: form.job_title },
                      {
                        label: 'Experience Level',
                        value: form.experience_level
                          ? form.experience_level.charAt(0).toUpperCase() + form.experience_level.slice(1)
                          : '',
                      },
                      { label: 'Location', value: form.location },
                      { label: 'Work Mode', value: form.work_mode },
                      { label: 'Work Hours', value: form.work_hours },
                      ...(form.experience_level === 'intern'
                        ? [
                            { label: 'Duration', value: form.duration },
                            { label: 'Stipend', value: form.stipend_salary ? `₹${form.stipend_salary}` : '' },
                          ]
                        : form.experience_level === 'experienced'
                        ? [
                            { label: 'Salary', value: form.fulltime_offer_salary ? `₹${form.fulltime_offer_salary}` : '' },
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
                      {
                        label: 'Assigned To',
                        value: form.assignedTo.length > 0 ? form.assignedTo.join(', ') : '',
                      },
                    ] as { label: string; value: string }[]
                  ).map(({ label, value }) => (
                    <div key={label}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          color: '#6b7280',
                          marginBottom: '3px',
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          color: value ? '#e5e7eb' : '#374151',
                          lineHeight: '1.4',
                        }}
                      >
                        {value || '—'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress indicator */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #37373f' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>
                      Completion
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: isFormComplete() ? '#86efac' : '#9ca3af',
                        fontWeight: 700,
                      }}
                    >
                      {isFormComplete() ? 'Ready' : 'In progress'}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      background: '#37373f',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: isFormComplete()
                          ? 'linear-gradient(90deg, #1d2ba4, #6ea8fe)'
                          : 'linear-gradient(90deg, #1d2ba4, #1d2ba4)',
                        borderRadius: '999px',
                        width: (() => {
                          const fields = [
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
                          const filled = fields.filter(Boolean).length
                          return `${Math.round((filled / fields.length) * 100)}%`
                        })(),
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Returned from Interviewers */}
      {returnedDrafts.length > 0 && (
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
                {returnedDrafts.length} {returnedDrafts.length === 1 ? 'draft' : 'drafts'} need your review
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {returnedDrafts.map((draft) => {
              const meta = draft.experience_level ? levelMeta[draft.experience_level] : null
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
                      {meta && (
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: '#1a1d20',
                            border: '1px solid #37373f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <meta.Icon style={{ width: '12px', height: '12px', color: '#9ca3af' }} />
                        </div>
                      )}
                      <p style={{ fontWeight: 700, color: '#ffffff', fontSize: '15px', margin: 0 }}>
                        {draft.job_title}
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
                        {draft.experience_level}
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
                    <button
                      onClick={() => handleEditReturned(draft)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#e5e7eb',
                        border: '1px solid #37373f',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'Sora, sans-serif',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCreateJD(draft.id)}
                      disabled={loading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#ffffff',
                        background: '#1d2ba4',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        fontFamily: 'Sora, sans-serif',
                      }}
                      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#12219e' }}
                      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#1d2ba4' }}
                    >
                      {loading ? (
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#ffffff',
                            borderRadius: '50%',
                            display: 'inline-block',
                            animation: 'spin 0.7s linear infinite',
                          }}
                        />
                      ) : (
                        <Sparkles style={{ width: '13px', height: '13px' }} />
                      )}
                      Create JD
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All JDs collapsible */}
      {myDrafts.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <button
            onClick={() => setAllDraftsOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
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
              {allDraftsOpen
                ? <ChevronUp style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                : <ChevronDown style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
              }
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700, display: 'block' }}>
                All JDs
              </span>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                {myDrafts.length} total
              </span>
            </div>
          </button>

          {allDraftsOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {myDrafts.map((draft) => (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#ffffff',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {draft.job_title || 'Untitled'}
                    </p>
                    <span
                      style={{
                        background: '#1a1d20',
                        color: '#9ca3af',
                        border: '1px solid #37373f',
                        borderRadius: '999px',
                        padding: '2px 9px',
                        fontSize: '11px',
                        fontWeight: 500,
                        flexShrink: 0,
                      }}
                    >
                      {draft.experience_level}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {statusBadge(draft.status)}
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      {new Date(draft.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteDraft(draft.id)}
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
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Keyframe for spinner — injected via style tag */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
