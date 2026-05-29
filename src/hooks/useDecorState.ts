import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clearDecorStorage,
  loadDecorState,
  saveDecorState,
} from '../lib/decor-storage'
import { getImageDimensions } from '../lib/frame-sizing'
import {
  createInitialDecorState,
  type DecorState,
  type UploadedImage,
} from '../types/decor'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg']
const MAX_FILE_BYTES = 8 * 1024 * 1024

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
  return `img-${crypto.randomUUID()}`
}

export function useDecorState() {
  const [state, setState] = useState<DecorState>(createInitialDecorState)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const hydrated = useRef(false)

  useEffect(() => {
    setState(loadDecorState())
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    saveDecorState(state)
  }, [state])

  const flashStatus = useCallback((message: string) => {
    setStatusMessage(message)
    const timer = window.setTimeout(() => setStatusMessage(null), 2800)
    return () => window.clearTimeout(timer)
  }, [])

  const setActiveFrame = useCallback((frameId: string) => {
    setState((prev) => ({ ...prev, activeFrameId: frameId }))
  }, [])

  const assignImageToFrame = useCallback(
    (frameId: string, imageId: string) => {
      setState((prev) => {
        if (!prev.frames[frameId]) return prev
        return {
          ...prev,
          activeFrameId: frameId,
          frames: {
            ...prev.frames,
            [frameId]: { ...prev.frames[frameId], imageId },
          },
        }
      })
    },
    [],
  )

  const assignImageToActiveFrame = useCallback(
    (imageId: string) => {
      setState((prev) => {
        const frameId = prev.activeFrameId
        if (!frameId || !prev.frames[frameId]) return prev
        return {
          ...prev,
          frames: {
            ...prev.frames,
            [frameId]: { ...prev.frames[frameId], imageId },
          },
        }
      })
    },
    [],
  )

  const clearActiveFrame = useCallback(() => {
    setState((prev) => {
      const frameId = prev.activeFrameId
      if (!frameId || !prev.frames[frameId]) return prev
      return {
        ...prev,
        frames: {
          ...prev.frames,
          [frameId]: { ...prev.frames[frameId], imageId: null },
        },
      }
    })
  }, [])

  const removeImage = useCallback(
    (imageId: string) => {
      setState((prev) => {
        const frames = { ...prev.frames }
        for (const [id, frame] of Object.entries(frames)) {
          if (frame.imageId === imageId) {
            frames[id] = { ...frame, imageId: null }
          }
        }
        return {
          ...prev,
          frames,
          uploadedImages: prev.uploadedImages.filter(
            (image) => image.id !== imageId,
          ),
        }
      })
      flashStatus('Image removed from library')
    },
    [flashStatus],
  )

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files)
      const valid = list.filter((file) => ACCEPTED_TYPES.includes(file.type))

      if (valid.length === 0) {
        flashStatus('Upload JPG or PNG images only')
        return
      }

      const added: UploadedImage[] = []

      for (const file of valid) {
        if (file.size > MAX_FILE_BYTES) {
          flashStatus(`${file.name} exceeds 8MB limit`)
          continue
        }

        try {
          const dataUrl = await readFileAsDataUrl(file)
          const { width, height } = await getImageDimensions(dataUrl)
          added.push({
            id: createImageId(),
            name: file.name,
            dataUrl,
            width,
            height,
            createdAt: Date.now(),
          })
        } catch {
          flashStatus(`Failed to read ${file.name}`)
        }
      }

      if (added.length === 0) return

      setState((prev) => ({
        ...prev,
        uploadedImages: [...added, ...prev.uploadedImages],
      }))

      flashStatus(
        added.length === 1
          ? `Added ${added[0].name}`
          : `Added ${added.length} images`,
      )
    },
    [flashStatus],
  )

  const resetSession = useCallback(() => {
    clearDecorStorage()
    setState(createInitialDecorState())
    flashStatus('Session reset')
  }, [flashStatus])

  const getImageById = useCallback(
    (imageId: string | null) => {
      if (!imageId) return null
      return state.uploadedImages.find((image) => image.id === imageId) ?? null
    },
    [state.uploadedImages],
  )

  const activeFrame = state.activeFrameId
    ? state.frames[state.activeFrameId]
    : null

  return {
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
  }
}
