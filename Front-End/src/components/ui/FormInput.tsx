// Dark-themed input matching the app's design tokens. Highlights blue on focus
// and stays red when there's a validation error (even while focused).
interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function FormInput({ error, style, onFocus, onBlur, ...props }: Props) {
  const borderBase = error ? '#ef4444' : '#37373f'
  const borderFocus = error ? '#ef4444' : '#1d2ba4'

  return (
    <div>
      <input
        {...props}
        style={{
          background: '#1a1d20',
          border: `1px solid ${borderBase}`,
          color: '#fff',
          borderRadius: '8px',
          padding: '10px 14px',
          width: '100%',
          outline: 'none',
          fontFamily: 'Sora, sans-serif',
          fontSize: '14px',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = borderFocus
          onFocus?.(e)
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = borderBase
          onBlur?.(e)
        }}
      />
      {error && (
        <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>{error}</p>
      )}
    </div>
  )
}
