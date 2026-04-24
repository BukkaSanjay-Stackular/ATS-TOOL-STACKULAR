import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useToast } from '../../hooks/useToast'
import { getDrafts, submitRoleDescription, submitDraft, dismissDraft } from '../../services/jdApi'
import { DraftListView } from '../../components/interviewer/DraftListView'
import { DraftDetailView } from '../../components/interviewer/DraftDetailView'
import { ApiError } from '../../types/api'
import type { JDDraft } from '../../types'

// Stat card shown at the top of the page.
function StatCard({ label, value, Icon, accent, bg }: { label: string; value: number; Icon: React.ElementType; accent: string; bg: string }) {
  return (
    <div
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
      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: '18px', height: '18px', color: accent }} />
      </div>
      <div>
        <p style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>{label}</p>
      </div>
    </div>
  )
}

export default function InterviewerJobPostingPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const QUERY_KEY = ['drafts', 'interviewer', user?.username] as const

  // Poll every 5 seconds — recruitment can assign new JDs at any time and the
  // interviewer shouldn't need to refresh manually to see them.
  const { data: allMyDrafts = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getDrafts({ assignedTo: user!.username }),
    enabled: !!user,
    refetchInterval: 5000,
  })

  const activeDrafts = allMyDrafts.filter((d) => d.status === 'assigned')
  const submittedCount = allMyDrafts.filter((d) => d.status === 'returned' || d.status === 'finalized').length

  const [selectedDraft, setSelectedDraft] = useState<JDDraft | null>(null)
  const [roleDescription, setRoleDescription] = useState('')

  const submitMutation = useMutation({
    mutationFn: async ({ id, description }: { id: string; description: string }) => {
      await submitRoleDescription(id, description)
      await submitDraft(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      showToast('Role description submitted. The recruitment team has been notified.', 'success')
      setSelectedDraft(null)
      setRoleDescription('')
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Failed to submit, please try again.'
      showToast(msg, 'error')
    },
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) => dismissDraft(id, user!.username),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: () => showToast('Failed to dismiss, please try again.', 'error'),
  })

  function handleSelectDraft(draft: JDDraft) {
    setSelectedDraft(draft)
    setRoleDescription(draft.roleDescription ?? '')
  }

  function handleBack() {
    setSelectedDraft(null)
    setRoleDescription('')
  }

  function handleDismiss(id: string) {
    if (!user) return
    dismissMutation.mutate(id)
    if (selectedDraft?.id === id) handleBack()
  }

  return (
    <div className="p-6" style={{ minHeight: '100vh' }}>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <StatCard label="Assigned to me" value={activeDrafts.length} Icon={FileText} accent="#1d2ba4" bg="rgba(29,43,164,0.12)" />
        <StatCard label="Submitted" value={submittedCount} Icon={CheckCircle} accent="#22c55e" bg="rgba(20,83,45,0.2)" />
      </div>

      {/* List heading */}
      {!selectedDraft && (
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700, margin: 0, fontFamily: 'Sora, sans-serif' }}>
            Assigned JDs
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: '4px 0 0 0' }}>
            {isLoading && allMyDrafts.length === 0
              ? 'Loading...'
              : allMyDrafts.length === 0
              ? 'No job postings assigned yet.'
              : `${allMyDrafts.length} total — click to fill in a role description`}
          </p>
        </div>
      )}

      {selectedDraft ? (
        <DraftDetailView
          draft={selectedDraft}
          roleDescription={roleDescription}
          onRoleDescriptionChange={setRoleDescription}
          onBack={handleBack}
          onSubmit={() => submitMutation.mutate({ id: selectedDraft.id, description: roleDescription })}
          isSubmitting={submitMutation.isPending}
        />
      ) : (
        <DraftListView
          drafts={allMyDrafts}
          isLoading={isLoading}
          onSelect={handleSelectDraft}
          onDismiss={handleDismiss}
          isDismissing={dismissMutation.isPending}
        />
      )}
    </div>
  )
}
