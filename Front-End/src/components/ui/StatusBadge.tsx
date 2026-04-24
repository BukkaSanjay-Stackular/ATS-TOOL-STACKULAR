import type { JDStatus } from '../../types'

// Each status maps to a distinct color so recruiters can scan the list at a glance.
const BADGE_STYLES: Record<JDStatus, React.CSSProperties> = {
  draft:     { background: '#374151', color: '#d1d5db' },
  assigned:  { background: '#78350f', color: '#fcd34d' },
  returned:  { background: '#1e3a5f', color: '#93c5fd' },
  finalized: { background: '#14532d', color: '#86efac' },
}

export function StatusBadge({ status }: { status: JDStatus }) {
  return (
    <span
      style={{
        ...BADGE_STYLES[status],
        padding: '2px 10px',
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
