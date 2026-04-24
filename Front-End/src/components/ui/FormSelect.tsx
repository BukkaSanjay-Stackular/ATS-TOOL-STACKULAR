// Dark-themed select styled to match FormInput exactly.
interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function FormSelect({ style, onFocus, onBlur, children, ...props }: Props) {
  return (
    <select
      {...props}
      style={{
        background: '#1a1d20',
        border: '1px solid #37373f',
        color: '#fff',
        borderRadius: '8px',
        padding: '10px 14px',
        width: '100%',
        outline: 'none',
        fontFamily: 'Sora, sans-serif',
        fontSize: '14px',
        cursor: 'pointer',
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#1d2ba4'
        onFocus?.(e)
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#37373f'
        onBlur?.(e)
      }}
    >
      {children}
    </select>
  )
}
