import { useCallback, useEffect, useRef, useState } from 'react'
import { getImageDimensions } from '../lib/frame-sizing'
import {
  createInitialDecorState,
  type DecorState,
  type TransitionEffect,
  type TransitionSpeed,
} from '../types/decor'

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'image/gif',
]
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const MAX_FILE_BYTES = 20 * 1024 * 1024

function isAcceptedFile(file: File): boolean {
  if (file.type && ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
    return true
  }
  const name = file.name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not read image'))
    }
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.readAsDataURL(file)
  })
}

function createImageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `img-${crypto.randomUUID()}`
  }
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function stateSignature(state: DecorState) {
  return JSON.stringify({
    activeImageId: state.activeImageId,
    transitionEffect: state.transitionEffect,
    transitionSpeed: state.transitionSpeed,
    uploadedImages: state.uploadedImages.map((img) => ({
      id: img.id,
      dataUrl: img.dataUrl,
      name: img.name,
      width: img.width,
      height: img.height,
      createdAt: img.createdAt,
    })),
  })
}

async function patchState(partial: Partial<DecorState>) {
  const res = await fetch('/api/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial),
  })
  if (!res.ok) throw new Error('Failed to sync state')
  const data = await res.json()
  return data.state as DecorState
}

export function useDecorState(poll = true) {
  const [state, setState] = useState<DecorState>(createInitialDecorState)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const signatureRef = useRef(stateSignature(createInitialDecorState()))

  useEffect(() => {
    let active = true
    let timer: number | null = null

    async function fetchState() {
      try {
        const res = await fetch('/api/state')
        if (!res.ok || !active) return
        const data = (await res.json()) as DecorState
        const next = {
          ...createInitialDecorState(),
          ...data,
          uploadedImages: Array.isArray(data.uploadedImages)
            ? data.uploadedImages
            : [],
        }
        const sig = stateSignature(next)
        if (sig !== signatureRef.current) {
          signatureRef.current = sig
          setState(next)
        }
      } catch {
        // Ignore polling errors
      }
    }

    fetchState()

    if (poll) {
      timer = window.setInterval(fetchState, 1200)
    }

    return () => {
      active = false
      if (timer) clearInterval(timer)
    }
  }, [poll])

  const flashStatus = useCallback((message: string) => {
    setStatusMessage(message)
    window.setTimeout(() => {
      setStatusMessage((current) => (current === message ? null : current))
    }, 2800)
  }, [])

  const applyLocalState = useCallback((next: DecorState) => {
    signatureRef.current = stateSignature(next)
    setState(next)
  }, [])

  const assignImageToActiveFrame = useCallback(
    async (imageId: string) => {
      const optimistic = { ...state, activeImageId: imageId }
      applyLocalState(optimistic)
      try {
        const saved = await patchState({ activeImageId: imageId })
        applyLocalState(saved)
      } catch {
        flashStatus('Failed to sync active image')
      }
    },
    [state, applyLocalState, flashStatus],
  )

  const clearActiveFrame = useCallback(async () => {
    const optimistic = { ...state, activeImageId: null }
    applyLocalState(optimistic)
    try {
      const saved = await patchState({ activeImageId: null })
      applyLocalState(saved)
    } catch {
      // ignore
    }
  }, [state, applyLocalState])

  const setTransitionEffect = useCallback(
    async (effect: TransitionEffect) => {
      const optimistic = { ...state, transitionEffect: effect }
      applyLocalState(optimistic)
      try {
        const saved = await patchState({ transitionEffect: effect })
        applyLocalState(saved)
      } catch {
        flashStatus('Failed to update transition')
      }
    },
    [state, applyLocalState, flashStatus],
  )

  const setTransitionSpeed = useCallback(
    async (speed: TransitionSpeed) => {
      const optimistic = { ...state, transitionSpeed: speed }
      applyLocalState(optimistic)
      try {
        const saved = await patchState({ transitionSpeed: speed })
        applyLocalState(saved)
      } catch {
        flashStatus('Failed to update speed')
      }
    },
    [state, applyLocalState, flashStatus],
  )

  const removeImage = useCallback(
    async (imageId: string) => {
      const uploadedImages = (state.uploadedImages || []).filter(
        (img) => img.id !== imageId,
      )
      const activeImageId =
        state.activeImageId === imageId ? null : state.activeImageId
      const optimistic = { ...state, uploadedImages, activeImageId }
      applyLocalState(optimistic)
      flashStatus('Image removed from library')

      try {
        await fetch('/api/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: imageId }),
        })
      } catch {
        // ignore
      }
    },
    [state, applyLocalState, flashStatus],
  )

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files)
      const valid = list.filter(isAcceptedFile)

      if (valid.length === 0) {
        flashStatus('Upload JPG, PNG, or WebP images only')
        return
      }

      setIsUploading(true)
      try {
        for (const file of valid) {
          if (file.size > MAX_FILE_BYTES) {
            flashStatus(`${file.name} exceeds 20MB limit`)
            continue
          }

          try {
            const originalDataUrl = await readFileAsDataUrl(file)
            let dimensions = { width: 1200, height: 800 }
            try {
              dimensions = await getImageDimensions(originalDataUrl)
            } catch (e) {
              console.warn('Could not read image dimensions, using fallback', e)
            }

            const payload = {
              id: createImageId(),
              name: file.name,
              originalDataUrl,
              width: dimensions.width,
              height: dimensions.height,
              createdAt: Date.now(),
            }

            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })

            if (res.ok) {
              const data = await res.json()
              setState((prev) => {
                const next = {
                  ...prev,
                  uploadedImages: [data.image, ...(prev.uploadedImages || [])],
                }
                signatureRef.current = stateSignature(next)
                return next
              })
              flashStatus(`Added ${file.name}`)
            } else {
              let errorText = `Server failed to save ${file.name}`
              try {
                const errJson = await res.json()
                if (errJson?.error) errorText = errJson.error
              } catch {
                // ignore
              }
              flashStatus(errorText)
            }
          } catch (err: any) {
            console.error('Upload failed:', err)
            flashStatus(
              `Failed to upload ${file.name}: ${err?.message || 'Network error'}`,
            )
          }
        }
      } finally {
        setIsUploading(false)
      }
    },
    [flashStatus],
  )

  const resetSession = useCallback(async () => {
    const newState = createInitialDecorState()
    applyLocalState(newState)
    flashStatus('Session reset')
    try {
      await patchState(newState)
    } catch {
      // ignore
    }
  }, [applyLocalState, flashStatus])

  const getImageById = useCallback(
    (imageId: string | null) => {
      if (!imageId) return null
      return state.uploadedImages.find((image) => image.id === imageId) ?? null
    },
    [state.uploadedImages],
  )

  const activeImage = state.activeImageId
    ? getImageById(state.activeImageId)
    : null

  return {
    state,
    statusMessage,
    isUploading,
    activeImage,
    assignImageToActiveFrame,
    clearActiveFrame,
    setTransitionEffect,
    setTransitionSpeed,
    removeImage,
    uploadFiles,
    resetSession,
    getImageById,
  }
}
