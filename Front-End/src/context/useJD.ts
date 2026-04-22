import { useContext } from 'react'
import { JDContext } from './JDContext'

export function useJD() {
  const ctx = useContext(JDContext)
  if (!ctx) throw new Error('useJD must be used inside JDProvider')
  return ctx
}
