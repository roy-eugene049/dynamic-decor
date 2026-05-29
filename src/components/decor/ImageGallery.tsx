import { Trash2 } from 'lucide-react'
import type { UploadedImage } from '../../types/decor'

type ImageGalleryProps = {
  images: UploadedImage[]
  activeFrameId: string | null
  onSelectImage: (imageId: string) => void
  onRemoveImage: (imageId: string) => void
  onDragStartImage: (imageId: string | null) => void
}

export default function ImageGallery({
  images,
  activeFrameId,
  onSelectImage,
  onRemoveImage,
  onDragStartImage,
}: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="decor-panel mt-4">
        <p className="decor-kicker mb-1">Gallery</p>
        <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
          Uploaded artwork will appear here. Select an image to place it on the
          active frame.
        </p>
      </div>
    )
  }

  return (
    <div className="decor-panel mt-4">
      <p className="decor-kicker mb-1">Gallery</p>
      <h3 className="m-0 mb-3 text-sm font-semibold text-[var(--sea-ink)]">
        Your collection
      </h3>

      <ul className="gallery-grid m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-2">
        {images.map((image) => (
          <li key={image.id} className="group relative">
            <button
              type="button"
              draggable
              onDragStart={() => onDragStartImage(image.id)}
              onDragEnd={() => onDragStartImage(null)}
              onClick={() => onSelectImage(image.id)}
              disabled={!activeFrameId}
              title={
                activeFrameId
                  ? `Assign to active frame`
                  : 'Select a frame first'
              }
              className="gallery-thumb block w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-0 transition hover:-translate-y-0.5 hover:border-[var(--decor-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <img
                src={image.dataUrl}
                alt={image.name}
                className="aspect-square w-full object-cover"
              />
              <span className="block truncate px-2 py-1.5 text-left text-[0.68rem] font-medium text-[var(--sea-ink-soft)]">
                {image.name}
              </span>
            </button>

            <button
              type="button"
              aria-label={`Remove ${image.name}`}
              onClick={(event) => {
                event.stopPropagation()
                onRemoveImage(image.id)
              }}
              className="absolute top-1.5 right-1.5 rounded-lg bg-black/55 p-1.5 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
