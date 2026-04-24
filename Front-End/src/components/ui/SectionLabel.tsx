interface Props {
  icon: React.ElementType
  text: string
}

export function SectionLabel({ icon: Icon, text }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'rgba(29, 43, 164, 0.18)',
          border: '1px solid rgba(29, 43, 164, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: '13px', height: '13px', color: '#6ea8fe' }} />
      </div>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#9ca3af',
        }}
      >
        {text}
      </span>
    </div>
  )
}
