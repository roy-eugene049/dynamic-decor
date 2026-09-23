import { createFileRoute, Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'

import { useDecorState } from '../hooks/useDecorState'
import ImageGallery from '../components/decor/ImageGallery'
import UploadPanel from '../components/decor/UploadPanel'
import TransitionSelector from '../components/decor/TransitionSelector'
import ThemeToggle from '../components/ThemeToggle'

export const Route = createFileRoute('/app')({
  component: ControllerApp,
})

function ControllerApp() {
  const {
    state,
    statusMessage,
    isUploading,
    assignImageToActiveFrame,
    clearActiveFrame,
    setTransitionEffect,
    setTransitionSpeed,
    removeImage,
    uploadFiles,
    resetSession,
  } = useDecorState(true)

  return (
    <div className="controller-shell">
      <header className="controller-header">
        <div className="page-wrap controller-header__inner">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden />
            <div>
              <p className="brand-name">Dynamic Decor</p>
              <p className="brand-sub">Remote controller</p>
            </div>
          </div>

          <div className="controller-header__actions">
            <Link to="/" className="ghost-link" target="_blank">
              Open frame
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="page-wrap controller-main">
        <header className="controller-hero">
          <div>
            <p className="section-kicker">Studio</p>
            <h1 className="hero-title">Curate the wall</h1>
            <p className="hero-copy">
              Upload artwork, choose a transition, and put pieces on the digital
              frame — without reloading either display.
            </p>
          </div>

          <div className="hero-actions">
            {state.activeImageId && (
              <button
                type="button"
                onClick={clearActiveFrame}
                className="btn-secondary"
              >
                Clear frame
              </button>
            )}
            <button type="button" onClick={resetSession} className="btn-ghost">
              Reset session
            </button>
          </div>
        </header>

        <div className="controller-grid">
          <div className="controller-grid__primary">
            <UploadPanel
              onUpload={uploadFiles}
              imageCount={state.uploadedImages.length}
              isUploading={isUploading}
            />
            <ImageGallery
              images={state.uploadedImages}
              activeImageId={state.activeImageId}
              onSelectImage={assignImageToActiveFrame}
              onRemoveImage={removeImage}
            />
          </div>

          <aside className="controller-grid__aside">
            <TransitionSelector
              effect={state.transitionEffect}
              speed={state.transitionSpeed}
              onEffectChange={setTransitionEffect}
              onSpeedChange={setTransitionSpeed}
            />
          </aside>
        </div>
      </main>

      {statusMessage && (
        <div className="toast" role="status" aria-live="polite">
          {statusMessage}
        </div>
      )}
    </div>
  )
}
