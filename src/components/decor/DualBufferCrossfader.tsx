import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  TRANSITION_DURATIONS,
  type TransitionEffect,
  type TransitionSpeed,
  type UploadedImage,
} from '../../types/decor'

type DualBufferCrossfaderProps = {
  image: UploadedImage | null
  effect: TransitionEffect
  speed: TransitionSpeed
}

type BufferSlot = {
  key: string
  src: string | null
  name: string
}

async function preloadImage(src: string) {
  const img = new Image()
  img.decoding = 'async'
  img.src = src
  if (typeof img.decode === 'function') {
    try {
      await img.decode()
      return
    } catch {
      // fall through
    }
  }
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to preload image'))
  })
}

export default function DualBufferCrossfader({
  image,
  effect,
  speed,
}: DualBufferCrossfaderProps) {
  const [active, setActive] = useState<BufferSlot>({
    key: 'empty',
    src: null,
    name: '',
  })
  const [incoming, setIncoming] = useState<BufferSlot | null>(null)
  const [phase, setPhase] = useState<'idle' | 'transitioning'>('idle')
  const seqRef = useRef(0)
  const activeSrcRef = useRef<string | null>(null)
  const pendingSrcRef = useRef<string | null>(null)
  const effectRef = useRef(effect)
  const speedRef = useRef(speed)

  effectRef.current = effect
  speedRef.current = speed

  const imageId = image?.id ?? null
  const imageSrc = image?.dataUrl ?? null
  const imageName = image?.name ?? ''

  useEffect(() => {
    if (imageSrc === activeSrcRef.current) return
    if (imageSrc === pendingSrcRef.current) return

    const seq = ++seqRef.current
    const currentEffect = effectRef.current
    const duration = TRANSITION_DURATIONS[speedRef.current] ?? 1200

    let cancelled = false
    let timer: number | null = null

    async function run() {
      if (!imageSrc) {
        if (cancelled || seq !== seqRef.current) return
        pendingSrcRef.current = null
        activeSrcRef.current = null
        setIncoming(null)
        setPhase('idle')
        setActive({ key: `empty-${seq}`, src: null, name: '' })
        return
      }

      pendingSrcRef.current = imageSrc

      try {
        await preloadImage(imageSrc)
      } catch {
        // Still show via <img>
      }

      if (cancelled || seq !== seqRef.current) return

      const nextSlot: BufferSlot = {
        key: `${imageId}-${seq}`,
        src: imageSrc,
        name: imageName,
      }

      // First paint or instant cut — no animation
      if (!activeSrcRef.current || currentEffect === 'instant') {
        activeSrcRef.current = imageSrc
        pendingSrcRef.current = null
        setIncoming(null)
        setPhase('idle')
        setActive(nextSlot)
        return
      }

      setIncoming(nextSlot)
      setPhase('transitioning')

      timer = window.setTimeout(() => {
        if (cancelled || seq !== seqRef.current) return
        activeSrcRef.current = imageSrc
        pendingSrcRef.current = null
        setActive(nextSlot)
        setIncoming(null)
        setPhase('idle')
      }, duration)
    }

    run()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [imageId, imageSrc, imageName])

  const durationMs = TRANSITION_DURATIONS[speed] ?? 1200
  const styleVars = {
    '--fx-duration': `${durationMs}ms`,
  } as CSSProperties

  return (
    <div className="frame-stage" style={styleVars}>
      <Layer slot={active} role="active" effect={effect} phase={phase} />
      {incoming && (
        <Layer
          slot={incoming}
          role="incoming"
          effect={effect}
          phase={phase}
        />
      )}

      {!active.src && !incoming && (
        <div className="frame-waiting">
          <span className="frame-waiting__label">Waiting for artwork</span>
        </div>
      )}
    </div>
  )
}

function Layer({
  slot,
  role,
  effect,
  phase,
}: {
  slot: BufferSlot
  role: 'active' | 'incoming'
  effect: TransitionEffect
  phase: 'idle' | 'transitioning'
}) {
  if (!slot.src) return null

  const className = [
    'frame-layer',
    `frame-layer--${role}`,
    `effect-${effect}`,
    phase === 'transitioning' ? 'is-transitioning' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <img src={slot.src} alt={slot.name} className="frame-layer__img" />
    </div>
  )
}
