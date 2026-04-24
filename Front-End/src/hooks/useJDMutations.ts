import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createDraft,
  updateDraft,
  assignDraft,
  deleteDraft,
} from '../services/jdApi'
import { ApiError } from '../types/api'
import type { CreateDraftPayload } from '../services/jdApi'
import type { JDDraft } from '../types'
import type { ToastType } from '../components/Toast/Toast'

interface Options {
  queryKey: readonly unknown[]
  showToast: (msg: string, type: ToastType) => void
  setFieldErrors: (errors: Record<string, string>) => void
  // Called after a successful assign so the page can reset form + show toast
  onAssignSuccess: (assignedTo: string[]) => void
  // Called after any successful JD generation so the page can open the preview modal
  onGenerateSuccess: (draft: JDDraft, previewJD: string) => void
  // Lets generateFromDraft resolve the full draft object from the cached list
  getDraftById: (id: string) => JDDraft | undefined
}

export function useJDMutations({
  queryKey,
  showToast,
  setFieldErrors,
  onAssignSuccess,
  onGenerateSuccess,
  getDraftById,
}: Options) {
  const queryClient = useQueryClient()

  // Tracks which draft row is currently spinning while generating from the list
  const [generatingDraftId, setGeneratingDraftId] = useState<string | null>(null)

  function handleApiError(err: unknown, fallback: string) {
    // 400 with field-level errors → highlight the bad fields inline
    if (err instanceof ApiError && err.status === 400 && err.fields) {
      setFieldErrors(err.fields as Record<string, string>)
    } else {
      showToast(fallback, 'error')
    }
  }

  // Assign: create (or update) a draft and immediately mark it assigned
  const assignMutation = useMutation({
    mutationFn: async ({ payload, editId }: { payload: CreateDraftPayload; editId: string | null }) => {
      if (editId) {
        await updateDraft(editId, payload)
        await assignDraft(editId, payload.assignedTo ?? [])
      } else {
        const draft = await createDraft(payload)
        await assignDraft(draft.id, payload.assignedTo ?? [])
      }
      return payload.assignedTo ?? []
    },
    onSuccess: (assignedTo) => {
      queryClient.invalidateQueries({ queryKey })
      onAssignSuccess(assignedTo)
    },
    onError: (err) => handleApiError(err, 'Failed to assign, please try again.'),
  })

  // Generate JD from the current form — backend generates inline during POST /drafts
  // and stores the result in role_description. No separate generate step needed.
  const generateFromFormMutation = useMutation({
    mutationFn: async (payload: CreateDraftPayload) => {
      const draft = await createDraft(payload)
      return { draft, previewJD: draft.roleDescription }
    },
    onSuccess: ({ draft, previewJD }) => {
      queryClient.invalidateQueries({ queryKey })
      onGenerateSuccess(draft, previewJD)
    },
    onError: (err) => handleApiError(err, 'Failed to generate JD, please try again.'),
  })

  // Generate JD while editing a returned draft — saves edits, then uses the updated
  // role_description as the preview (backend does not have a separate generate endpoint)
  const updateAndGenerateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CreateDraftPayload }) => {
      const draft = await updateDraft(id, payload)
      return { draft, previewJD: draft.roleDescription }
    },
    onSuccess: ({ draft, previewJD }) => {
      queryClient.invalidateQueries({ queryKey })
      onGenerateSuccess(draft, previewJD)
      setGeneratingDraftId(null)
    },
    onError: (err) => {
      handleApiError(err, 'Failed to generate JD, please try again.')
      setGeneratingDraftId(null)
    },
  })

  // Re-open JD preview for an existing draft row — reads role_description directly
  const generateFromDraftMutation = useMutation({
    mutationFn: async (draftId: string) => {
      const draft = getDraftById(draftId)
      if (!draft) throw new Error('Draft not found')
      return draft.roleDescription
    },
    onSuccess: (previewJD, draftId) => {
      const draft = getDraftById(draftId)
      if (!draft) {
        showToast('Failed to load draft data, please try again.', 'error')
        setGeneratingDraftId(null)
        return
      }
      onGenerateSuccess(draft, previewJD)
      setGeneratingDraftId(null)
    },
    onError: () => {
      showToast('Failed to load JD, please try again.', 'error')
      setGeneratingDraftId(null)
    },
  })

  const deleteDraftMutation = useMutation({
    mutationFn: (id: string) => deleteDraft(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: () => showToast('Failed to delete, please try again.', 'error'),
  })

  return {
    assignMutation,
    generateFromFormMutation,
    updateAndGenerateMutation,
    generateFromDraftMutation,
    deleteDraftMutation,
    generatingDraftId,
    setGeneratingDraftId,
  }
}
