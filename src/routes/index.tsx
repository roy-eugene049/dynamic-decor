import { createFileRoute } from '@tanstack/react-router'
import DualBufferCrossfader from '../components/decor/DualBufferCrossfader'
import { useDecorState } from '../hooks/useDecorState'

export const Route = createFileRoute('/')({
  component: FrameView,
})

function FrameView() {
  const { activeImage, state } = useDecorState(true)

  return (
    <div className="frame-view">
      <DualBufferCrossfader
        image={activeImage}
        effect={state.transitionEffect}
        speed={state.transitionSpeed}
      />
    </div>
  )
}
