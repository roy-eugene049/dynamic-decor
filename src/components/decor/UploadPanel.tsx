import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle } from 'lucide-react'

type UploadPanelProps = {
  onUpload: (files: FileList | File[]) => void
  imageCount: number
  isUploading?: boolean
}

export default function UploadPanel({
  onUpload,
  imageCount,
  isUploading = false,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = (files: FileList | null) => {
    if (!files?.length || isUploading) return
    onUpload(files)
  }

  return (
    <section className="glass-card">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">Library</p>
          <h2 className="section-title">Upload artwork</h2>
        </div>
        <span className="count-pill">
          {imageCount} {imageCount === 1 ? 'piece' : 'pieces'}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-busy={isUploading}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (!isUploading) inputRef.current?.click()
          }
        }}
        onClick={() => {
          if (!isUploading) inputRef.current?.click()
        }}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
        className={`upload-zone ${isDragging ? 'is-dragging' : ''} ${isUploading ? 'is-uploading' : ''}`}
      >
        {isUploading ? (
          <>
            <LoaderCircle
              className="upload-zone__icon upload-zone__icon--spin"
              strokeWidth={1.5}
            />
            <p className="upload-zone__title">Uploading artwork…</p>
            <p className="upload-zone__hint">Saving to your library</p>
          </>
        ) : (
          <>
            <ImagePlus className="upload-zone__icon" strokeWidth={1.5} />
            <p className="upload-zone__title">Drop artwork here</p>
            <p className="upload-zone__hint">
              or click to browse · JPG, PNG, WebP · max 20MB
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp,image/gif,image/*"
        multiple
        disabled={isUploading}
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </section>
  )
}
