import { Spinner } from './Spinner'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
}

// Main blue CTA button used across all primary actions (Sign In, Create JD, Finalize...).
// Pass `loading` to swap content for a spinner + loadingText automatically.
export function PrimaryButton({ loading, loadingText, children, disabled, style, ...props }: Props) {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 22px',
        borderRadius: '9px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#ffffff',
        background: '#1d2ba4',
        border: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        fontFamily: 'Sora, sans-serif',
        boxShadow: !isDisabled ? '0 4px 16px rgba(29,43,164,0.35)' : 'none',
        ...style,
      }}
      onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.background = '#12219e' }}
      onMouseLeave={(e) => { if (!isDisabled) e.currentTarget.style.background = '#1d2ba4' }}
    >
      {loading ? <Spinner /> : null}
      {loading && loadingText ? loadingText : children}
    </button>
  )
}
