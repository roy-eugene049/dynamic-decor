import path from 'node:path'
import { createFileRoute } from '@tanstack/react-router'
import { MIME_BY_EXT, readUploadFile } from '../../lib/decor-server'

export const Route = createFileRoute('/uploads/$filename')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const filename = decodeURIComponent(params.filename || '')
        const file = await readUploadFile(filename)
        if (!file) {
          return new Response('Not found', { status: 404 })
        }

        const ext = path.extname(file.safeName).toLowerCase()
        const mime = MIME_BY_EXT[ext] || 'application/octet-stream'

        return new Response(new Uint8Array(file.data), {
          status: 200,
          headers: {
            'Content-Type': mime,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Length': String(file.data.byteLength),
          },
        })
      },
    },
  },
})
