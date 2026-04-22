import { createContext, useState, useEffect } from 'react'
import type { JDDraft } from '../types'

interface JDContextValue {
  drafts: JDDraft[]
  createDraft: (data: Omit<JDDraft, 'id' | 'createdAt' | 'status' | 'generatedJD'>) => string
  updateDraft: (id: string, changes: Partial<JDDraft>) => void
  deleteDraft: (id: string) => void
  assignDraft: (id: string, interviewerUsernames: string[]) => void
  submitRoleDescription: (id: string, roleDescription: string) => void
  finalizeDraft: (id: string, generatedJD: string) => void
  dismissDraftForInterviewer: (id: string, username: string) => void
  getDraftsForInterviewer: (username: string) => JDDraft[]
  getAllDraftsForInterviewer: (username: string) => JDDraft[]
  getDraftsForRecruitment: (username: string) => JDDraft[]
}

const JDContext = createContext<JDContextValue | null>(null)

function loadFromStorage(): JDDraft[] {
  try {
    const raw = localStorage.getItem('ats_jd_drafts')
    return raw ? (JSON.parse(raw) as JDDraft[]) : []
  } catch {
    return []
  }
}

function JDProvider({ children }: { children: React.ReactNode }) {
  const [drafts, setDrafts] = useState<JDDraft[]>(loadFromStorage)

  useEffect(() => {
    localStorage.setItem('ats_jd_drafts', JSON.stringify(drafts))
  }, [drafts])

  function createDraft(data: Omit<JDDraft, 'id' | 'createdAt' | 'status' | 'generatedJD'>): string {
    const id = Date.now().toString()
    const newDraft: JDDraft = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      status: 'draft',
      generatedJD: '',
    }
    setDrafts((prev) => [...prev, newDraft])
    return id
  }

  function updateDraft(id: string, changes: Partial<JDDraft>): void {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...changes } : d))
    )
  }

  function deleteDraft(id: string): void {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
  }

  function dismissDraftForInterviewer(id: string, username: string): void {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d
        const remaining = d.assignedTo.filter((u) => u !== username)
        return {
          ...d,
          assignedTo: remaining,
          status: d.status === 'assigned' && remaining.length === 0 ? 'draft' : d.status,
        }
      })
    )
  }

  function assignDraft(id: string, interviewerUsernames: string[]): void {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, assignedTo: interviewerUsernames, status: 'assigned' }
          : d
      )
    )
  }

  function submitRoleDescription(id: string, roleDescription: string): void {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, roleDescription, status: 'returned' } : d
      )
    )
  }

  function finalizeDraft(id: string, generatedJD: string): void {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, generatedJD, status: 'finalized' } : d
      )
    )
  }

  function getDraftsForInterviewer(username: string): JDDraft[] {
    return drafts.filter(
      (d) => d.status === 'assigned' && d.assignedTo.includes(username)
    )
  }

  function getAllDraftsForInterviewer(username: string): JDDraft[] {
    return drafts.filter((d) => d.assignedTo.includes(username))
  }

  function getDraftsForRecruitment(username: string): JDDraft[] {
    return drafts.filter((d) => d.createdBy === username)
  }

  return (
    <JDContext.Provider
      value={{
        drafts,
        createDraft,
        updateDraft,
        deleteDraft,
        assignDraft,
        submitRoleDescription,
        finalizeDraft,
        dismissDraftForInterviewer,
        getDraftsForInterviewer,
        getAllDraftsForInterviewer,
        getDraftsForRecruitment,
      }}
    >
      {children}
    </JDContext.Provider>
  )
}

export { JDContext, JDProvider }
