import type { DragEvent } from 'react'

type FrameProps = {
  id: string
  label: string
  isActive: boolean
  imageUrl: string | null
  onSelect: (id: string) => void
  onDropImage?: (frameId: string) => void
  dragImageId?: string | null
}

export default function Frame({
  id,
  label,
  isActive,
  imageUrl,
  onSelect,
  onDropImage,
  dragImageId,
}: FrameProps) {
  const handleDragOver = (event: DragEvent) => {
    if (!dragImageId) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    if (dragImageId) onDropImage?.(id)
  }

  return (
    <button
      type="button"
      aria-label={`${label} frame${isActive ? ', selected' : ''}`}
      aria-pressed={isActive}
      onClick={() => onSelect(id)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`decor-frame group cursor-pointer border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--decor-accent)] ${isActive ? 'decor-frame--active z-20' : 'z-10'}`}
    >
      <div className="decor-frame__wood">
        <div className="decor-frame__mat">
          <div className="decor-frame__canvas">
            {imageUrl ? (
              <img
                key={imageUrl}
                src={imageUrl}
                alt=""
                className="decor-frame__art"
                draggable={false}
              />
            ) : (
              <div className="decor-frame__empty">
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[#8a8278]">
                  No art
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isActive && <span className="decor-frame__badge">Active</span>}
    </button>
  )
}
