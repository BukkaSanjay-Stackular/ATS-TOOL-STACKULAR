import { useContext } from 'react'
import { ToastContext } from '../components/Toast/ToastProvider'

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
