export type FrameState = {
  imageId: string | null
}

export type UploadedImage = {
  id: string
  name: string
  dataUrl: string
  width: number
  height: number
  createdAt: number
}

export type DecorState = {
  frames: Record<string, FrameState>
  activeFrameId: string | null
  uploadedImages: UploadedImage[]
}

export type FrameDefinition = {
  id: string
  label: string
}

/** Reference living room image (1024×723) */
export const SCENE_BACKGROUND = '/living-room-scene.png'

export const SCENE_ASPECT = 1024 / 723

export const FRAME_DEFINITIONS: FrameDefinition[] = [
  { id: 'frame1', label: 'Left' },
  { id: 'frame2', label: 'Center' },
  { id: 'frame3', label: 'Right' },
]

export function createInitialDecorState(): DecorState {
  const frames = Object.fromEntries(
    FRAME_DEFINITIONS.map((frame) => [frame.id, { imageId: null }]),
  )

  return {
    frames,
    activeFrameId: FRAME_DEFINITIONS[0]?.id ?? null,
    uploadedImages: [],
  }
}
