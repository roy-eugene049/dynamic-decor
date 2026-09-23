export type TransitionEffect =
  | 'crossfade'
  | 'zoom'
  | 'slide'
  | 'blur'
  | 'instant'

export type TransitionSpeed = 'slow' | 'normal' | 'fast'

export type UploadedImage = {
  id: string
  name: string
  dataUrl: string
  width: number
  height: number
  createdAt: number
}

export type DecorState = {
  activeImageId: string | null
  uploadedImages: UploadedImage[]
  transitionEffect: TransitionEffect
  transitionSpeed: TransitionSpeed
}

export const TRANSITION_DURATIONS: Record<TransitionSpeed, number> = {
  slow: 2200,
  normal: 1200,
  fast: 600,
}

export function createInitialDecorState(): DecorState {
  return {
    activeImageId: null,
    uploadedImages: [],
    transitionEffect: 'crossfade',
    transitionSpeed: 'normal',
  }
}
