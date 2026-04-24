import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, UserCheck, FileText } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useToast } from '../../hooks/useToast'
import { useJDMutations } from '../../hooks/useJDMutations'
import { getDrafts } from '../../services/jdApi'
import { JDPreviewModal } from '../../components/JDPreviewModal'
import { ExperienceLevelSelector } from '../../components/job-posting/ExperienceLevelSelector'
import { JDFormFields } from '../../components/job-posting/JDFormFields'
import { AssignInterviewerPanel } from '../../components/job-posting/AssignInterviewerPanel'
import { LiveSummaryPanel } from '../../components/job-posting/LiveSummaryPanel'
import { ReturnedDraftsSection } from '../../components/job-posting/ReturnedDraftsSection'
import { JDListPanel } from '../../components/job-posting/JDListPanel'
import { EMPTY_FORM } from '../../components/job-posting/types'
import type { JDFormState } from '../../components/job-posting/types'
import type { ExperienceLevel, JDDraft } from '../../types'

export default function JobPostingPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const QUERY_KEY = ['drafts', user?.username] as const

  const { data: allDrafts = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getDrafts({ createdBy: user!.username }),
    enabled: !!user,
  })

  const returnedDrafts = allDrafts.filter((d) => d.status === 'returned')

  // --- Form state ---
  const [form, setForm] = useState<JDFormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // --- Preview modal state ---
  const [previewDraftId, setPreviewDraftId] = useState<string | null>(null)
  const [previewJD, setPreviewJD] = useState('')
  const [previewDraft, setPreviewDraft] = useState<JDDraft | null>(null)

  // --- Copy-to-clipboard feedback ---
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set())

  function setField<K extends keyof JDFormState>(key: K, value: JDFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    // Clear field-level error as soon as the user starts typing
    if (fieldErrors[key]) setFieldErrors((prev) => { const next = { ...prev }; delete next[key]; return next })
  }

  function handleSelectLevel(level: ExperienceLevel) {
    // Switching level resets the whole form — avoid stale values from the previous level
    setForm({ ...EMPTY_FORM, experience_level: level })
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

  function buildPayload() {
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

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFieldErrors({})
  }

  // --- Mutations via shared hook ---
  const {
    assignMutation,
    generateFromFormMutation,
    updateAndGenerateMutation,
    generateFromDraftMutation,
    deleteDraftMutation,
    generatingDraftId,
    setGeneratingDraftId,
  } = useJDMutations({
    queryKey: QUERY_KEY,
    showToast,
    setFieldErrors,
    onAssignSuccess: (assignedTo) => {
      showToast(`Assigned to ${assignedTo.join(', ')} — visible in their portal.`, 'success')
      resetForm()
    },
    onGenerateSuccess: (draft, jd) => {
      setPreviewDraftId(draft.id)
      setPreviewJD(jd)
      setPreviewDraft(draft)
      resetForm()
    },
    getDraftById: (id) => allDrafts.find((d) => d.id === id),
  })

  // --- Action handlers ---
  function handleAssign() {
    if (!user || !form.experience_level || form.assignedTo.length === 0) return
    assignMutation.mutate({ payload: buildPayload(), editId: editingId })
  }

  function handleCreateJDFromForm() {
    if (!user || !form.experience_level) return
    if (editingId) {
      setGeneratingDraftId(editingId)
      updateAndGenerateMutation.mutate({ id: editingId, payload: buildPayload() })
    } else {
      generateFromFormMutation.mutate(buildPayload())
    }
  }

  function handleCreateJDFromDraft(draftId: string) {
    setGeneratingDraftId(draftId)
    generateFromDraftMutation.mutate(draftId)
  }

  function handleEditReturned(draft: JDDraft) {
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

  async function handleCopyJD(id: string, text: string) {
    await navigator.clipboard.writeText(text)
    setCopiedIds((prev) => new Set(prev).add(id))
    setTimeout(() => setCopiedIds((prev) => { const next = new Set(prev); next.delete(id); return next }), 2000)
  }

  const hasForm = form.experience_level !== null
  const isGeneratingFromForm = generateFromFormMutation.isPending || updateAndGenerateMutation.isPending
  const isAssigning = assignMutation.isPending
  const isBusy = isAssigning || isGeneratingFromForm || generateFromDraftMutation.isPending

  const canAssign = form.assignedTo.length > 0 && !!form.job_title && !isBusy
  const canCreate = isFormComplete() && !isBusy

  return (
    <div style={{ padding: '32px 28px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(29, 43, 164, 0.2)',
              border: '1px solid rgba(29, 43, 164, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <FileText style={{ width: '16px', height: '16px', color: '#6ea8fe' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', fontFamily: 'Sora, sans-serif', margin: 0 }}>
            Job Posting
          </h1>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0, paddingLeft: '48px' }}>
          Create and manage job descriptions for open positions.
        </p>
      </div>

      {/* Preview modal */}
      {previewDraftId && previewJD && previewDraft && (
        <JDPreviewModal
          draftId={previewDraftId}
          previewJD={previewJD}
          draft={previewDraft}
          queryKey={QUERY_KEY}
          onClose={() => { setPreviewDraftId(null); setPreviewJD(''); setPreviewDraft(null) }}
        />
      )}

      {/* Experience level cards */}
      <ExperienceLevelSelector selected={form.experience_level} onSelect={handleSelectLevel} />

      {/* Two-column layout: form + live summary */}
      {hasForm && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: '#161719', border: '1px solid #37373f', borderRadius: '16px', padding: '28px' }}>
              <JDFormFields form={form} setField={setField} fieldErrors={fieldErrors} />

              <AssignInterviewerPanel
                assignedTo={form.assignedTo}
                onChange={(assigned) => setField('assignedTo', assigned)}
              />

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Assign — outline-blue when active, disabled-grey otherwise */}
                <button
                  onClick={handleAssign}
                  disabled={!canAssign}
                  title={form.assignedTo.length === 0 ? 'Select at least one interviewer to assign' : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '10px 20px',
                    borderRadius: '9px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: canAssign ? '#ffffff' : '#6b7280',
                    background: canAssign ? 'rgba(29,43,164,0.15)' : 'transparent',
                    border: `1px solid ${canAssign ? 'rgba(29,43,164,0.5)' : '#37373f'}`,
                    cursor: canAssign ? 'pointer' : 'not-allowed',
                    fontFamily: 'Sora, sans-serif',
                    opacity: canAssign ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => { if (canAssign) e.currentTarget.style.background = 'rgba(29,43,164,0.25)' }}
                  onMouseLeave={(e) => { if (canAssign) e.currentTarget.style.background = 'rgba(29,43,164,0.15)' }}
                >
                  <UserCheck style={{ width: '14px', height: '14px' }} />
                  {isAssigning ? 'Assigning...' : 'Assign'}
                </button>

                {/* Create JD — primary blue */}
                <button
                  onClick={handleCreateJDFromForm}
                  disabled={!canCreate}
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
                    cursor: canCreate ? 'pointer' : 'not-allowed',
                    opacity: canCreate ? 1 : 0.5,
                    fontFamily: 'Sora, sans-serif',
                    boxShadow: canCreate ? '0 4px 16px rgba(29,43,164,0.35)' : 'none',
                  }}
                  onMouseEnter={(e) => { if (canCreate) e.currentTarget.style.background = '#12219e' }}
                  onMouseLeave={(e) => { if (canCreate) e.currentTarget.style.background = '#1d2ba4' }}
                >
                  {isGeneratingFromForm ? (
                    <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
                  ) : (
                    <Sparkles style={{ width: '14px', height: '14px' }} />
                  )}
                  {isGeneratingFromForm ? 'Generating JD...' : 'Create JD'}
                </button>
              </div>
            </div>
          </div>

          <LiveSummaryPanel form={form} isComplete={isFormComplete()} />
        </div>
      )}

      <ReturnedDraftsSection
        drafts={returnedDrafts}
        generatingDraftId={generatingDraftId}
        onReview={handleEditReturned}
        onCreateJD={handleCreateJDFromDraft}
      />

      <JDListPanel
        drafts={allDrafts}
        isLoading={isLoading}
        copiedIds={copiedIds}
        onCopy={handleCopyJD}
        onEditFinalized={(draft) => { setPreviewDraftId(draft.id); setPreviewJD(draft.roleDescription); setPreviewDraft(draft) }}
        onDelete={(id) => deleteDraftMutation.mutate(id)}
        isDeleting={deleteDraftMutation.isPending}
      />
    </div>
  )
}
