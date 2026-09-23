import { MonitorPlay, Trash2 } from 'lucide-react'
import type { UploadedImage } from '../../types/decor'

type ImageGalleryProps = {
  images: UploadedImage[]
  activeImageId?: string | null
  onSelectImage: (imageId: string) => void
  onRemoveImage: (imageId: string) => void
}

export default function ImageGallery({
  images,
  activeImageId,
  onSelectImage,
  onRemoveImage,
}: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <section className="glass-card">
        <p className="section-kicker">Gallery</p>
        <h2 className="section-title">Your collection</h2>
        <p className="empty-copy">
          Uploaded artwork appears here. Select a piece to put it on the wall.
        </p>
      </section>
    )
  }

  return (
    <section className="glass-card">
      <div className="mb-4">
        <p className="section-kicker">Gallery</p>
        <h2 className="section-title">Your collection</h2>
      </div>

      <ul className="gallery-grid">
        {images.map((image) => {
          const isActive = activeImageId === image.id

          return (
            <li key={image.id} className={`gallery-card ${isActive ? 'is-on-wall' : ''}`}>
              <button
                type="button"
                onClick={() => onSelectImage(image.id)}
                title="Display on frame"
                className="gallery-card__media"
              >
                <img src={image.dataUrl} alt={image.name} />
                {isActive && (
                  <span className="on-wall-pill">
                    <span className="on-wall-pill__dot" />
                    On Wall
                  </span>
                )}
              </button>

              <div className="gallery-card__meta">
                <p className="gallery-card__name">{image.name}</p>
                <div className="gallery-card__actions">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Display ${image.name}`}
                    onClick={() => onSelectImage(image.id)}
                  >
                    <MonitorPlay className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    aria-label={`Remove ${image.name}`}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Remove “${image.name}” from your library?`,
                        )
                      ) {
                        onRemoveImage(image.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
