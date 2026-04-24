import { useState } from 'react'
import { Users, ChevronDown } from 'lucide-react'
import { SectionLabel } from '../ui/SectionLabel'
import { INTERVIEWERS } from '../../constants/jd'

interface Props {
  assignedTo: string[]
  onChange: (assigned: string[]) => void
}

export function AssignInterviewerPanel({ assignedTo, onChange }: Props) {
  const [open, setOpen] = useState(false)
  // Pending selection lives here until "Confirm" — so closing without confirming discards changes
  const [pending, setPending] = useState<string[]>([])

  function openDropdown() {
    setPending(assignedTo)
    setOpen(true)
  }

  function confirm() {
    onChange(pending)
    setOpen(false)
  }

  function toggle(username: string) {
    setPending((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]
    )
  }

  const hasAssignment = assignedTo.length > 0

  return (
    <>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0' }}>
              Assign to Interviewer
            </p>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
              Optionally delegate role description to an interviewer.
            </p>
          </div>

          {/* Dropdown trigger */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={openDropdown}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: hasAssignment ? '#6ea8fe' : '#9ca3af',
                border: `1px solid ${hasAssignment ? 'rgba(29,43,164,0.5)' : '#37373f'}`,
                background: hasAssignment ? 'rgba(29,43,164,0.12)' : 'transparent',
                cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = hasAssignment ? 'rgba(29,43,164,0.2)' : '#161719')}
              onMouseLeave={(e) => (e.currentTarget.style.background = hasAssignment ? 'rgba(29,43,164,0.12)' : 'transparent')}
            >
              <Users style={{ width: '14px', height: '14px' }} />
              {hasAssignment ? `${assignedTo.length} Assigned` : 'Select Interviewers'}
              <ChevronDown style={{ width: '13px', height: '13px', opacity: 0.6 }} />
            </button>

            {open && (
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
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', padding: '4px 8px 8px', margin: 0 }}>
                  Select interviewers
                </p>

                <div style={{ marginBottom: '8px' }}>
                  {INTERVIEWERS.map((iv) => (
                    <label
                      key={iv.username}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', color: '#e5e7eb', fontSize: '13px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1d20')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <input
                        type="checkbox"
                        checked={pending.includes(iv.username)}
                        onChange={() => toggle(iv.username)}
                        style={{ accentColor: '#1d2ba4', width: '14px', height: '14px' }}
                      />
                      <span>{iv.name}</span>
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', padding: '8px 4px 4px', borderTop: '1px solid #37373f' }}>
                  <button
                    onClick={confirm}
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
                    onClick={() => setOpen(false)}
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

        {/* Confirmed assignee pills */}
        {hasAssignment && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
            {assignedTo.map((u) => (
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
    </>
  )
}
