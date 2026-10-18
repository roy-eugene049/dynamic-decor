import { createFileRoute } from '@tanstack/react-router'
import {
  getState,
  saveState,
  writeUploadFile,
} from '../../lib/decor-server'

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = await request.json()
          const { name, originalDataUrl, width, height, createdAt } = payload
          const rawId = payload.id
          const id =
            typeof rawId === 'string' && rawId.trim().length > 0
              ? rawId.trim()
              : `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

          if (!originalDataUrl) {
            return Response.json(
              { error: 'Missing image data' },
              { status: 400 },
            )
          }

          const matches = String(originalDataUrl).match(
            /^data:([A-Za-z0-9\/\+\-\.]+);base64,([\s\S]+)$/,
          )
          let urlPath = originalDataUrl

          if (matches && matches.length === 3) {
            const mimeType = matches[1].toLowerCase()
            let ext = 'jpg'
            if (mimeType.includes('png')) ext = 'png'
            else if (mimeType.includes('webp')) ext = 'webp'
            else if (mimeType.includes('gif')) ext = 'gif'
            else if (mimeType.includes('svg')) ext = 'svg'

            const base64Data = matches[2].replace(/\s/g, '')
            const buffer = Buffer.from(base64Data, 'base64')
            const filename = `${id}.${ext}`
            await writeUploadFile(filename, buffer)
            urlPath = `/uploads/${filename}`
          }

          const state = await getState()
          const newImage = {
            id,
            name: name || 'Untitled',
            dataUrl: urlPath,
            width: Number(width) || 1200,
            height: Number(height) || 800,
            createdAt: Number(createdAt) || Date.now(),
          }

          state.uploadedImages.unshift(newImage)
          await saveState(state)

          return Response.json({ success: true, image: newImage })
        } catch (e) {
          return Response.json({ error: String(e) }, { status: 500 })
        }
      },
    },
  },
})
