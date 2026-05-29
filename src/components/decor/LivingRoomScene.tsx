import { FRAME_DEFINITIONS, SCENE_ASPECT } from '../../types/decor'
import type { DecorState, UploadedImage } from '../../types/decor'
import Frame from './Frame'
import LivingRoomBackdrop from './LivingRoomBackdrop'

type LivingRoomSceneProps = {
  state: DecorState
  getImage: (imageId: string | null) => UploadedImage | null
  onSelectFrame: (frameId: string) => void
  onDropOnFrame: (frameId: string, imageId: string) => void
  dragImageId: string | null
}

export default function LivingRoomScene({
  state,
  getImage,
  onSelectFrame,
  onDropOnFrame,
  dragImageId,
}: LivingRoomSceneProps) {
  return (
    <section
      aria-label="Living room preview"
      className="living-room-scene relative mx-auto w-full max-w-5xl"
    >
      <div
        className="living-room-canvas relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: SCENE_ASPECT }}
      >
        <LivingRoomBackdrop />

        <div className="scene-frames">
          {FRAME_DEFINITIONS.map((definition) => {
            const frameState = state.frames[definition.id]
            const image = getImage(frameState?.imageId ?? null)

            return (
              <Frame
                key={definition.id}
                id={definition.id}
                label={definition.label}
                isActive={state.activeFrameId === definition.id}
                imageUrl={image?.dataUrl ?? null}
                onSelect={onSelectFrame}
                dragImageId={dragImageId}
                onDropImage={(frameId) => {
                  if (dragImageId) onDropOnFrame(frameId, dragImageId)
                }}
              />
            )
          })}
        </div>
      </div>

      <p className="scene-footer m-0 px-4 py-3 text-center text-xs leading-relaxed">
        Click a frame to select it, then assign art from your library — or drag a
        thumbnail onto any frame. Each piece keeps its natural proportions.
      </p>
    </section>
  )
}
