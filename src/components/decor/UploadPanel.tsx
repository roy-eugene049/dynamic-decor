import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'

type UploadPanelProps = {
  onUpload: (files: FileList | File[]) => void
  activeFrameLabel: string | null
  imageCount: number
}

export default function UploadPanel({
  onUpload,
  activeFrameLabel,
  imageCount,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return
    onUpload(files)
  }

  return (
    <div className="decor-panel">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="decor-kicker mb-1">Upload</p>
          <h2 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
            Art library
          </h2>
        </div>
        <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--sea-ink-soft)]">
          {imageCount} {imageCount === 1 ? 'piece' : 'pieces'}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onClick={() => inputRef.current?.click()}
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
        className={`upload-dropzone flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${isDragging ? 'border-[var(--decor-accent)] bg-[rgba(196,149,106,0.12)]' : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--decor-accent-soft)]'}`}
      >
        <ImagePlus className="h-8 w-8 text-[var(--decor-accent)]" strokeWidth={1.5} />
        <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
          Drop JPG or PNG here
        </p>
        <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
          or click to browse · max 8MB each
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        multiple
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />

      {activeFrameLabel && (
        <p className="mt-3 mb-0 rounded-xl bg-[rgba(196,149,106,0.12)] px-3 py-2 text-xs text-[var(--sea-ink-soft)]">
          Assigning to{' '}
          <strong className="text-[var(--sea-ink)]">{activeFrameLabel}</strong>
        </p>
      )}
    </div>
  )
}
