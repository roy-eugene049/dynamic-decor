import {
  Aperture,
  Blend,
  Layers2,
  MoveHorizontal,
  Sparkles,
  Zap,
} from 'lucide-react'
import type { TransitionEffect, TransitionSpeed } from '../../types/decor'

const EFFECTS: {
  id: TransitionEffect
  label: string
  hint: string
  icon: typeof Blend
}[] = [
  { id: 'crossfade', label: 'Crossfade', hint: 'Soft dissolve', icon: Blend },
  { id: 'zoom', label: 'Soft Zoom', hint: 'Ken Burns', icon: Aperture },
  { id: 'slide', label: 'Slide', hint: 'Gentle glide', icon: MoveHorizontal },
  { id: 'blur', label: 'Dreamy', hint: 'Blur dissolve', icon: Sparkles },
  { id: 'instant', label: 'Instant', hint: 'Museum cut', icon: Zap },
]

const SPEEDS: { id: TransitionSpeed; label: string }[] = [
  { id: 'slow', label: 'Slow' },
  { id: 'normal', label: 'Normal' },
  { id: 'fast', label: 'Fast' },
]

type TransitionSelectorProps = {
  effect: TransitionEffect
  speed: TransitionSpeed
  onEffectChange: (effect: TransitionEffect) => void
  onSpeedChange: (speed: TransitionSpeed) => void
}

export default function TransitionSelector({
  effect,
  speed,
  onEffectChange,
  onSpeedChange,
}: TransitionSelectorProps) {
  return (
    <section className="glass-card">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">Playback</p>
          <h2 className="section-title">
            <Layers2 className="section-title__icon" strokeWidth={1.75} />
            Transitions
          </h2>
        </div>
      </div>

      <div className="effect-grid" role="radiogroup" aria-label="Transition style">
        {EFFECTS.map((item) => {
          const Icon = item.icon
          const selected = effect === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onEffectChange(item.id)}
              className={`effect-chip ${selected ? 'is-selected' : ''}`}
            >
              <Icon className="effect-chip__icon" strokeWidth={1.75} />
              <span className="effect-chip__label">{item.label}</span>
              <span className="effect-chip__hint">{item.hint}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        <p className="speed-label">Speed</p>
        <div className="segmented" role="radiogroup" aria-label="Transition speed">
          {SPEEDS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={speed === item.id}
              onClick={() => onSpeedChange(item.id)}
              className={`segmented__btn ${speed === item.id ? 'is-selected' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
