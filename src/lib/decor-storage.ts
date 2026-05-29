import {
  createInitialDecorState,
  type DecorState,
  type FrameState,
  type UploadedImage,
} from '../types/decor'

const STORAGE_KEY = 'dynamic-decor:v2'

type PersistedPayload = {
  frames: Record<string, FrameState & { fit?: string }>
  activeFrameId: string | null
  uploadedImages: UploadedImage[]
}

export function loadDecorState(): DecorState {
  if (typeof window === 'undefined') {
    return createInitialDecorState()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialDecorState()

    const parsed = JSON.parse(raw) as PersistedPayload
    const initial = createInitialDecorState()

    const frames = { ...initial.frames }
    for (const frameId of Object.keys(frames)) {
      const saved = parsed.frames?.[frameId]
      if (!saved) continue
      frames[frameId] = {
        imageId: typeof saved.imageId === 'string' ? saved.imageId : null,
      }
    }

    const imageIds = new Set(
      (parsed.uploadedImages ?? []).map((image) => image.id),
    )

    for (const frame of Object.values(frames)) {
      if (frame.imageId && !imageIds.has(frame.imageId)) {
        frame.imageId = null
      }
    }

    const activeFrameId =
      parsed.activeFrameId && frames[parsed.activeFrameId]
        ? parsed.activeFrameId
        : initial.activeFrameId

    return {
      frames,
      activeFrameId,
      uploadedImages: Array.isArray(parsed.uploadedImages)
        ? parsed.uploadedImages
            .filter((image) => Boolean(image?.id && image?.dataUrl && image?.name))
            .map((image) => ({
              id: image.id,
              name: image.name,
              dataUrl: image.dataUrl,
              width:
                typeof image.width === 'number' && image.width > 0
                  ? image.width
                  : 3,
              height:
                typeof image.height === 'number' && image.height > 0
                  ? image.height
                  : 4,
              createdAt: image.createdAt ?? Date.now(),
            }))
        : [],
    }
  } catch {
    return createInitialDecorState()
  }
}

export function saveDecorState(state: DecorState) {
  if (typeof window === 'undefined') return

  const payload: PersistedPayload = {
    frames: state.frames,
    activeFrameId: state.activeFrameId,
    uploadedImages: state.uploadedImages,
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota exceeded or private mode — ignore for MVP
  }
}

export function clearDecorStorage() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
