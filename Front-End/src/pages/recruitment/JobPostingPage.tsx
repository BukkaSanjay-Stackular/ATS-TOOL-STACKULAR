import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { useToast } from '../../hooks/useToast'
import { getDrafts, createDraft, assignDraft, generatePreview, deleteDraft } from '../../services/jdApi'
import { JDPreviewModal } from '../../components/JDPreviewModal'
import { DownloadButton } from '../../components/DownloadButton'
import { ApiError } from '../../types/api'
import type { CreateDraftPayload } from '../../services/jdApi'
import type { ExperienceLevel, JDStatus } from '../../types'

const INTERVIEWERS = [
  { username: 'Karthik', name: 'Karthik' },
  { username: 'Fardeen', name: 'Fardeen' },
  { username: 'Jay', name: 'Jay' },
  { username: 'Nadem', name: 'Nadem' },
  { username: 'Javeed', name: 'Javeed' },
]

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

function SkeletonCard() {
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
        <div style={{ width: '60px', height: '12px', borderRadius: '4px', background: '#2a2d31' }} />
        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#2a2d31' }} />
      </div>
    </div>
  )
}

export default function JobPostingPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const QUERY_KEY = ['drafts', user?.username] as const

  const { data: allDrafts = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getDrafts({ createdBy: user!.username }),
    enabled: !!user,
  })

  const returnedDrafts = allDrafts.filter((d) => d.status === 'returned')

  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)
  const [pendingAssigned, setPendingAssigned] = useState<string[]>([])
  const [previewDraftId, setPreviewDraftId] = useState<string | null>(null)
  const [previewJD, setPreviewJD] = useState('')
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set())
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generatingDraftId, setGeneratingDraftId] = useState<string | null>(null)
  const [allDraftsOpen, setAllDraftsOpen] = useState(false)

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (fieldErrors[key]) setFieldErrors((prev) => { const next = { ...prev }; delete next[key]; return next })
  }

  function handleSelectLevel(level: ExperienceLevel) {
    setForm({ ...emptyForm, experience_level: level })
    setEditingId(null)
    setFieldErrors({})
  }

  function isFormComplete(): boolean {
    if (!form.experience_level || !form.job_title || !form.location || !form.work_mode || !form.work_hours) return false
    if (!form.roleDescription) return false
    if (form.experience_level === 'intern' && !form.duration) return false
    if (form.experience_level === 'experienced' && !form.years_of_experience) return false
    return true
  }

  function buildPayload(): CreateDraftPayload {
    return {
      experience_level: form.experience_level!,
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
    }
  }

  function handleApiError(err: unknown, fallbackMsg: string) {
    if (err instanceof ApiError && err.status === 400 && err.fields) {
      setFieldErrors(err.fields as Record<string, string>)
    } else {
      showToast(fallbackMsg, 'error')
    }
  }

  const saveDraftMutation = useMutation({
    mutationFn: (payload: CreateDraftPayload) => createDraft(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      showToast('Draft saved successfully.', 'success')
      setForm(emptyForm)
      setEditingId(null)
    },
    onError: (err) => handleApiError(err, 'Failed to save draft, please try again.'),
  })

  const assignMutation = useMutation({
    mutationFn: async (payload: CreateDraftPayload) => {
      const draft = await createDraft(payload)
      await assignDraft(draft.id, payload.assignedTo ?? [])
      return { draft, assignedTo: payload.assignedTo ?? [] }
    },
    onSuccess: ({ assignedTo }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      showToast(`Assigned to ${assignedTo.join(', ')} — visible in their portal.`, 'success')
      setForm(emptyForm)
      setEditingId(null)
    },
    onError: (err) => handleApiError(err, 'Failed to assign, please try again.'),
  })

  const generateFromFormMutation = useMutation({
    mutationFn: async (payload: CreateDraftPayload) => {
      const draft = await createDraft(payload)
      const result = await generatePreview(draft.id)
      return { draftId: draft.id, previewJD: result.previewJD }
    },
    onSuccess: ({ draftId, previewJD: preview }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      setPreviewDraftId(draftId)
      setPreviewJD(preview)
      setForm(emptyForm)
      setEditingId(null)
    },
    onError: (err) => handleApiError(err, 'Failed to generate JD, please try again.'),
  })

  const generateFromDraftMutation = useMutation({
    mutationFn: (draftId: string) => generatePreview(draftId),
    onSuccess: (result, draftId) => {
      setPreviewDraftId(draftId)
      setPreviewJD(result.previewJD)
      setGeneratingDraftId(null)
    },
    onError: () => {
      showToast('Failed to generate JD, please try again.', 'error')
      setGeneratingDraftId(null)
    },
  })

  const deleteDraftMutation = useMutation({
    mutationFn: (id: string) => deleteDraft(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: () => showToast('Failed to delete, please try again.', 'error'),
  })

  function handleSaveDraft() {
    if (!user || !form.experience_level) return
    saveDraftMutation.mutate(buildPayload())
  }

  function handleAssign() {
    if (!user || !form.experience_level || form.assignedTo.length === 0) return
    assignMutation.mutate(buildPayload())
  }

  function handleCreateJDFromForm() {
    if (!user || !form.experience_level) return
    if (editingId) {
      setGeneratingDraftId(editingId)
      generateFromDraftMutation.mutate(editingId)
    } else {
      generateFromFormMutation.mutate(buildPayload())
    }
  }

  function handleCreateJDFromDraft(draftId: string) {
    setGeneratingDraftId(draftId)
    generateFromDraftMutation.mutate(draftId)
  }

  function handleEditReturned(draft: typeof allDrafts[0]) {
    setForm({
      experience_level: draft.experienceLevel,
      job_title: draft.jobTitle,
      location: draft.location,
      work_mode: draft.workMode,
      work_hours: draft.workHours,
      duration: draft.duration,
      stipend_salary: draft.stipendSalary,
      fulltime_offer_salary: draft.fulltimeOfferSalary,
      years_of_experience: draft.yearsOfExperience,
      roleDescription: draft.roleDescription,
      assignedTo: draft.assignedTo,
    })
    setEditingId(draft.id)
    setFieldErrors({})
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

  async function handleCopyJD(id: string, text: string) {
    await navigator.clipboard.writeText(text)
    setCopiedIds((prev) => new Set(prev).add(id))
    setTimeout(() => setCopiedIds((prev) => { const next = new Set(prev); next.delete(id); return next }), 2000)
  }

  const hasForm = form.experience_level !== null
  const isGeneratingFromForm = generateFromFormMutation.isPending
  const isSaving = saveDraftMutation.isPending
  const isAssigning = assignMutation.isPending
  const isBusy = isSaving || isAssigning || isGeneratingFromForm || generateFromDraftMutation.isPending

  const levelMeta = {
    intern: { label: 'Intern', desc: 'Short-term internship with stipend', Icon: GraduationCap },
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

      {/* JD Preview Modal */}
      {previewDraftId && previewJD && (
        <JDPreviewModal
          draftId={previewDraftId}
          previewJD={previewJD}
          queryKey={QUERY_KEY}
          onClose={() => { setPreviewDraftId(null); setPreviewJD('') }}
        />
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
                desc: 'Short-term with stipend',
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

              {/* Job Title */}
              <div style={{ marginBottom: '20px' }}>
                <FieldLabel required>Job Title</FieldLabel>
                <input
                  type="text"
                  value={form.job_title}
                  onChange={(e) => setField('job_title', e.target.value)}
                  placeholder="e.g. Frontend Developer, Data Analyst"
                  style={{
                    ...inputStyle,
                    ...(fieldErrors.job_title ? { borderColor: '#ef4444' } : {}),
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = fieldErrors.job_title ? '#ef4444' : '#1d2ba4')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = fieldErrors.job_title ? '#ef4444' : '#37373f')}
                />
                {fieldErrors.job_title && (
                  <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>{fieldErrors.job_title}</p>
                )}
              </div>

              {/* Intern-specific: Duration */}
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

              {/* Location + Work Mode + Work Hours */}
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

              {/* Compensation — intern */}
              {form.experience_level === 'intern' && (
                <>
                  <div style={{ height: '1px', background: '#37373f', margin: '24px 0' }} />
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

              {/* Compensation — experienced */}
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

              {/* Compensation — fresher */}
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
                  disabled={isBusy || !form.job_title}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '9px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#e5e7eb',
                    border: '1px solid #37373f',
                    background: 'transparent',
                    cursor: isBusy || !form.job_title ? 'not-allowed' : 'pointer',
                    opacity: isBusy || !form.job_title ? 0.5 : 1,
                    fontFamily: 'Sora, sans-serif',
                  }}
                  onMouseEnter={(e) => { if (!isBusy && form.job_title) e.currentTarget.style.background = '#1a1d20' }}
                  onMouseLeave={(e) => { if (!isBusy && form.job_title) e.currentTarget.style.background = 'transparent' }}
                >
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={handleAssign}
                  disabled={isBusy || form.assignedTo.length === 0 || !form.experience_level || !form.job_title}
                  title={form.assignedTo.length === 0 ? 'Select at least one interviewer to assign' : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '10px 20px',
                    borderRadius: '9px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: form.assignedTo.length > 0 && form.job_title && !isBusy ? '#ffffff' : '#6b7280',
                    background: form.assignedTo.length > 0 && form.job_title && !isBusy ? 'rgba(29,43,164,0.15)' : 'transparent',
                    border: `1px solid ${form.assignedTo.length > 0 && form.job_title && !isBusy ? 'rgba(29,43,164,0.5)' : '#37373f'}`,
                    cursor: form.assignedTo.length > 0 && form.job_title && !isBusy ? 'pointer' : 'not-allowed',
                    fontFamily: 'Sora, sans-serif',
                    opacity: form.assignedTo.length > 0 && form.job_title && !isBusy ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (form.assignedTo.length > 0 && form.job_title && !isBusy) e.currentTarget.style.background = 'rgba(29,43,164,0.25)'
                  }}
                  onMouseLeave={(e) => {
                    if (form.assignedTo.length > 0 && form.job_title && !isBusy) e.currentTarget.style.background = 'rgba(29,43,164,0.15)'
                  }}
                >
                  <UserCheck style={{ width: '14px', height: '14px' }} />
                  {isAssigning ? 'Assigning...' : 'Assign'}
                </button>
                <button
                  onClick={handleCreateJDFromForm}
                  disabled={!isFormComplete() || isBusy}
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
                    cursor: isFormComplete() && !isBusy ? 'pointer' : 'not-allowed',
                    opacity: isFormComplete() && !isBusy ? 1 : 0.5,
                    fontFamily: 'Sora, sans-serif',
                    boxShadow: isFormComplete() && !isBusy ? '0 4px 16px rgba(29,43,164,0.35)' : 'none',
                  }}
                  onMouseEnter={(e) => { if (isFormComplete() && !isBusy) e.currentTarget.style.background = '#12219e' }}
                  onMouseLeave={(e) => { if (isFormComplete() && !isBusy) e.currentTarget.style.background = '#1d2ba4' }}
                >
                  {isGeneratingFromForm ? (
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
                  {isGeneratingFromForm ? 'Generating JD...' : 'Create JD'}
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
              const meta = draft.experienceLevel ? levelMeta[draft.experienceLevel] : null
              const isGenerating = generatingDraftId === draft.id
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
                        {draft.experienceLevel}
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
                      Review
                    </button>
                    <button
                      onClick={() => handleCreateJDFromDraft(draft.id)}
                      disabled={isGenerating || !!generatingDraftId}
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
                        cursor: isGenerating || !!generatingDraftId ? 'not-allowed' : 'pointer',
                        opacity: isGenerating || !!generatingDraftId ? 0.5 : 1,
                        fontFamily: 'Sora, sans-serif',
                      }}
                      onMouseEnter={(e) => { if (!isGenerating && !generatingDraftId) e.currentTarget.style.background = '#12219e' }}
                      onMouseLeave={(e) => { if (!isGenerating && !generatingDraftId) e.currentTarget.style.background = '#1d2ba4' }}
                    >
                      {isGenerating ? (
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
              {isLoading ? 'Loading...' : `${allDrafts.length} total`}
            </span>
          </div>
        </button>

        {allDraftsOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {isLoading && allDrafts.length === 0 ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : allDrafts.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px', padding: '12px 0' }}>
                No job postings yet. Create your first one above.
              </p>
            ) : (
              allDrafts.map((draft) => (
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
                      {draft.jobTitle || 'Untitled'}
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
                      {draft.experienceLevel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {statusBadge(draft.status)}
                    {draft.status === 'finalized' && draft.generatedJD && (
                      <>
                        <button
                          onClick={() => handleCopyJD(draft.id, draft.generatedJD)}
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
                          {copiedIds.has(draft.id) ? (
                            <Check style={{ width: '12px', height: '12px' }} />
                          ) : (
                            <Copy style={{ width: '12px', height: '12px' }} />
                          )}
                          {copiedIds.has(draft.id) ? 'Copied!' : 'Copy'}
                        </button>
                        <DownloadButton draftId={draft.id} jobTitle={draft.jobTitle} />
                      </>
                    )}
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      {new Date(draft.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteDraftMutation.mutate(draft.id)}
                      disabled={deleteDraftMutation.isPending}
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
                        cursor: deleteDraftMutation.isPending ? 'not-allowed' : 'pointer',
                        color: '#6b7280',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        if (!deleteDraftMutation.isPending) {
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
