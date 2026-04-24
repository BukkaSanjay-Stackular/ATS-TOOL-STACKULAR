import { useState } from 'react'

// Drives the post-login logo animation: collapse card → fly logo to center →
// show greeting → fly logo to sidebar corner → navigate.
type AnimPhase = 'idle' | 'collapse' | 'fly-center' | 'greet' | 'fly-corner'

interface UseLoginAnimationReturn {
  animPhase: AnimPhase
  flyStyle: React.CSSProperties
  capturedUser: string
  isAnimating: boolean
  startAnimation: (logoEl: HTMLImageElement, username: string, onDone: () => void) => void
}

export function useLoginAnimation(): UseLoginAnimationReturn {
  const [animPhase, setAnimPhase] = useState<AnimPhase>('idle')
  const [flyStyle, setFlyStyle] = useState<React.CSSProperties>({})
  const [capturedUser, setCapturedUser] = useState('')

  function startAnimation(logoEl: HTMLImageElement, username: string, onDone: () => void) {
    const rect = logoEl.getBoundingClientRect()
    setCapturedUser(username.toUpperCase())

    // Stamp clone exactly over the original logo — no transition yet so it snaps in place
    setFlyStyle({
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      transition: 'none',
      zIndex: 100,
      objectFit: 'contain',
    })
    setAnimPhase('collapse')

    // 80ms = one paint cycle so the clone renders before the CSS transition starts
    setTimeout(() => {
      setAnimPhase('fly-center')
      setFlyStyle({
        position: 'fixed',
        left: 'calc(50vw - 40px)',
        top: 'calc(50vh - 72px)',
        width: '80px',
        height: '80px',
        transition: [
          'left 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          'top 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          'width 600ms ease-out',
          'height 600ms ease-out',
        ].join(', '),
        zIndex: 100,
        objectFit: 'contain',
      })
    }, 80)

    // Show greeting once the fly-center transition is done (~700ms)
    setTimeout(() => setAnimPhase('greet'), 900)

    // Fly to the sidebar logo position (top-left corner)
    setTimeout(() => {
      setAnimPhase('fly-corner')
      setFlyStyle({
        position: 'fixed',
        left: '16px',
        top: '14px',
        width: '32px',
        height: '32px',
        transition: [
          'left 650ms cubic-bezier(0.4, 0, 0.2, 1)',
          'top 650ms cubic-bezier(0.4, 0, 0.2, 1)',
          'width 500ms ease-in',
          'height 500ms ease-in',
        ].join(', '),
        zIndex: 100,
        objectFit: 'contain',
      })
    }, 2300)

    // Navigate after logo lands in the corner (2300ms start + 650ms transition = ~2950ms)
    setTimeout(onDone, 2980)
  }

  return {
    animPhase,
    flyStyle,
    capturedUser,
    isAnimating: animPhase !== 'idle',
    startAnimation,
  }
}
