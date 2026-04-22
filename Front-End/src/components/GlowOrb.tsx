import { useEffect, useRef } from 'react'

export default function GlowOrb() {
  const orbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const orb = orbRef.current
    if (!orb) return

    function handleMouseMove(e: MouseEvent) {
      if (!orb) return
      orb.style.left = `${e.clientX - 260}px`
      orb.style.top = `${e.clientY - 260}px`
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div
      ref={orbRef}
      style={{
        position: 'fixed',
        width: '520px',
        height: '520px',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(29,43,164,0.45) 0%, rgba(29,43,164,0.12) 50%, transparent 70%)',
        filter: 'blur(56px)',
        pointerEvents: 'none',
        zIndex: 0,
        left: '50vw',
        top: '50vh',
        transition: 'left 0.18s ease-out, top 0.18s ease-out',
      }}
    />
  )
}
