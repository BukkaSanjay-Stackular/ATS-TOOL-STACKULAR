// Uses Tailwind's built-in animate-spin so there's no need for custom @keyframes
// across every file that wants a loading indicator.
interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = { sm: 12, md: 14, lg: 18 } as const

export function Spinner({ size = 'md' }: Props) {
  const px = SIZES[size]
  return (
    <span
      className="animate-spin"
      style={{
        width: px,
        height: px,
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#ffffff',
        borderRadius: '50%',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  )
}
