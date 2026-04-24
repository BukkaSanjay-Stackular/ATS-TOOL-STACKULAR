import { Briefcase, UserCheck } from 'lucide-react'
import type { UserRole } from '../../types'

interface Props {
  // null = initial screen (show divider between options, no active state)
  selected: UserRole | null
  onSelect: (role: UserRole) => void
}

const PANELS = [
  { role: 'recruitment' as UserRole, Icon: Briefcase, label: 'Recruitment Panel' },
  { role: 'interviewer' as UserRole, Icon: UserCheck, label: 'Interviewer Panel' },
]

export function PanelSelector({ selected, onSelect }: Props) {
  const isInitialScreen = selected === null

  return (
    <div
      className="flex p-1 rounded-xl"
      style={{ background: '#1a1d20', gap: isInitialScreen ? 0 : '8px' }}
    >
      {PANELS.map(({ role, Icon, label }, idx) => {
        const isActive = selected === role
        return (
          <div key={role} className="contents">
            {/* Vertical divider only shown before a button has been selected */}
            {idx > 0 && isInitialScreen && (
              <div className="w-px my-1.5" style={{ background: '#37373f' }} />
            )}
            <button
              type="button"
              onClick={() => onSelect(role)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
              style={isActive ? { background: '#1d2ba4', color: '#fff' } : { color: '#9ca3af' }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#1d2ba4' }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          </div>
        )
      })}
    </div>
  )
}
