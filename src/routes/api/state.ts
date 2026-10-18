import { createFileRoute } from '@tanstack/react-router'
import {
  getState,
  migrateLegacyUploads,
  saveState,
} from '../../lib/decor-server'

export const Route = createFileRoute('/api/state')({
  server: {
    handlers: {
      GET: async () => {
        await migrateLegacyUploads()
        const state = await getState()
        return Response.json(state)
      },
      POST: async ({ request }) => {
        try {
          const parsed = await request.json()
          const currentState = await getState()
          const mergedState = {
            activeImageId:
              'activeImageId' in parsed
                ? parsed.activeImageId
                : currentState.activeImageId,
            uploadedImages: Array.isArray(parsed.uploadedImages)
              ? parsed.uploadedImages
              : currentState.uploadedImages,
            transitionEffect:
              'transitionEffect' in parsed
                ? parsed.transitionEffect
                : currentState.transitionEffect,
            transitionSpeed:
              'transitionSpeed' in parsed
                ? parsed.transitionSpeed
                : currentState.transitionSpeed,
          }
          const saved = await saveState(mergedState)
          return Response.json({ success: true, state: saved })
        } catch {
          return Response.json({ error: 'Invalid JSON' }, { status: 400 })
        }
      },
    },
  },
})
