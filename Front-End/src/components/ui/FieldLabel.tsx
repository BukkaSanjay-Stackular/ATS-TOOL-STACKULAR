interface Props {
  children: React.ReactNode
  required?: boolean
}

export function FieldLabel({ children, required }: Props) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '8px',
      }}
    >
      {children}
      {required && <span style={{ color: '#f87171' }}>*</span>}
    </label>
  )
}
