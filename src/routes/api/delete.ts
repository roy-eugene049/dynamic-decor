import { createFileRoute } from '@tanstack/react-router'
import {
  deleteUploadFilesForId,
  getState,
  saveState,
} from '../../lib/decor-server'

export const Route = createFileRoute('/api/delete')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { id } = await request.json()
          const state = await getState()
          state.uploadedImages = state.uploadedImages.filter(
            (img: { id: string }) => img.id !== id,
          )
          if (state.activeImageId === id) {
            state.activeImageId = null
          }
          await saveState(state)
          await deleteUploadFilesForId(id)
          return Response.json({ success: true })
        } catch (e) {
          return Response.json({ error: String(e) }, { status: 500 })
        }
      },
    },
  },
})
