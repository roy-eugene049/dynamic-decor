import { useState } from 'react'
import { FRAME_DEFINITIONS } from '../../types/decor'
import { useDecorState } from '../../hooks/useDecorState'
import ImageGallery from './ImageGallery'
import LivingRoomScene from './LivingRoomScene'
import UploadPanel from './UploadPanel'

export default function DynamicDecorApp() {
  const {
    state,
    statusMessage,
    activeFrame,
    setActiveFrame,
    assignImageToFrame,
    assignImageToActiveFrame,
    clearActiveFrame,
    removeImage,
    uploadFiles,
    resetSession,
    getImageById,
  } = useDecorState()

  const [dragImageId, setDragImageId] = useState<string | null>(null)

  const activeDefinition = FRAME_DEFINITIONS.find(
    (frame) => frame.id === state.activeFrameId,
  )

  const getImage = (imageId: string | null) => getImageById(imageId)

  return (
    <div className="page-wrap decor-app pb-10 pt-6 sm:pt-8">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="decor-kicker mb-2">Virtual interior studio</p>
          <h1 className="display-title m-0 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
            Dynamic Decor
          </h1>
          <p className="mt-2 mb-0 max-w-xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
            Upload artwork and preview it on wall-mounted digital frames in a
            living room scene. Each frame updates independently.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeFrame && state.activeFrameId && (
            <button
              type="button"
              onClick={clearActiveFrame}
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
            >
              Clear frame
            </button>
          )}
          <button
            type="button"
            onClick={resetSession}
            className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
          >
            Reset session
          </button>
        </div>
      </header>

      {statusMessage && (
        <p
          role="status"
          className="mb-4 rounded-xl border border-[var(--decor-accent-soft)] bg-[rgba(196,149,106,0.14)] px-4 py-2 text-sm font-medium text-[var(--sea-ink)]"
        >
          {statusMessage}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,320px)_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-24">
          <UploadPanel
            onUpload={uploadFiles}
            activeFrameLabel={activeDefinition?.label ?? null}
            imageCount={state.uploadedImages.length}
          />
          <ImageGallery
            images={state.uploadedImages}
            activeFrameId={state.activeFrameId}
            onSelectImage={assignImageToActiveFrame}
            onRemoveImage={removeImage}
            onDragStartImage={setDragImageId}
          />
        </aside>

        <LivingRoomScene
          state={state}
          getImage={getImage}
          onSelectFrame={setActiveFrame}
          onDropOnFrame={(frameId, imageId) => {
            assignImageToFrame(frameId, imageId)
            setDragImageId(null)
          }}
          dragImageId={dragImageId}
        />
      </div>
    </div>
  )
}
