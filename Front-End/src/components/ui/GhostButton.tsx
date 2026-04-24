interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // danger turns hover state red — used for destructive actions like delete/dismiss
  danger?: boolean
}

export function GhostButton({ danger = false, children, disabled, style, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        color: '#e5e7eb',
        background: 'transparent',
        border: '1px solid #37373f',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'Sora, sans-serif',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return
        if (danger) {
          e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
          e.currentTarget.style.color = '#ef4444'
        } else {
          e.currentTarget.style.background = '#1a1d20'
        }
      }}
      onMouseLeave={(e) => {
        if (disabled) return
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = '#37373f'
        e.currentTarget.style.color = '#e5e7eb'
      }}
    >
      {children}
    </button>
  )
}
