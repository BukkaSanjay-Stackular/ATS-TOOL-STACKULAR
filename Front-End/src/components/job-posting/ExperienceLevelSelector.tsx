import { GraduationCap, UserPlus, Award } from 'lucide-react'
import type { ExperienceLevel } from '../../types'

interface Props {
  selected: ExperienceLevel | null
  onSelect: (level: ExperienceLevel) => void
}

const LEVELS = [
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

export function ExperienceLevelSelector({ selected, onSelect }: Props) {
  return (
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
        {selected ? 'Experience Level' : 'Select experience level to get started'}
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {LEVELS.map(({ level, Icon, label, desc, gradient, activeGradient }) => {
          const isActive = selected === level
          return (
            <button
              key={level}
              onClick={() => onSelect(level)}
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
                <Icon style={{ width: '16px', height: '16px', color: isActive ? '#6ea8fe' : '#9ca3af' }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: isActive ? '#ffffff' : '#e5e7eb', fontSize: '14px', margin: '0 0 3px 0' }}>
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
  )
}
