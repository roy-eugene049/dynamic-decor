import { SCENE_BACKGROUND } from '../../types/decor'

/** Full living-room reference — sofa, floor, rug, and plant are baked into the image. */
export default function LivingRoomBackdrop() {
  return (
    <div className="room" aria-hidden>
      <img
        src={SCENE_BACKGROUND}
        alt=""
        className="room__scene-image"
        draggable={false}
      />
    </div>
  )
}
