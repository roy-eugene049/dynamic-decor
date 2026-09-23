import fs from 'node:fs/promises'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ViteDevServer, Plugin } from 'vite'

const DATA_DIR = path.resolve(process.cwd(), '.data')
const STATE_FILE = path.join(DATA_DIR, 'state.json')
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')
const LEGACY_UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads')

const TRANSITION_EFFECTS = new Set([
  'crossfade',
  'zoom',
  'slide',
  'blur',
  'instant',
])
const TRANSITION_SPEEDS = new Set(['slow', 'normal', 'fast'])

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

const defaultState = {
  activeImageId: null as string | null,
  uploadedImages: [] as unknown[],
  transitionEffect: 'crossfade' as const,
  transitionSpeed: 'normal' as const,
}

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.mkdir(UPLOADS_DIR, { recursive: true })
}

async function migrateLegacyUploads() {
  try {
    const entries = await fs.readdir(LEGACY_UPLOADS_DIR)
    for (const file of entries) {
      if (file.startsWith('.')) continue
      const src = path.join(LEGACY_UPLOADS_DIR, file)
      const dest = path.join(UPLOADS_DIR, file)
      try {
        await fs.access(dest)
      } catch {
        await fs.copyFile(src, dest)
      }
    }
  } catch {
    // No legacy folder — fine
  }
}

function normalizeState(state: any) {
  const effect = TRANSITION_EFFECTS.has(state?.transitionEffect)
    ? state.transitionEffect
    : 'crossfade'
  const speed = TRANSITION_SPEEDS.has(state?.transitionSpeed)
    ? state.transitionSpeed
    : 'normal'

  return {
    activeImageId:
      typeof state?.activeImageId === 'string' ? state.activeImageId : null,
    uploadedImages: Array.isArray(state?.uploadedImages)
      ? state.uploadedImages.filter(
          (img: any) =>
            img &&
            typeof img.id === 'string' &&
            typeof img.dataUrl === 'string',
        )
      : [],
    transitionEffect: effect,
    transitionSpeed: speed,
  }
}

async function getState() {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf-8')
    return normalizeState(JSON.parse(data))
  } catch {
    return normalizeState(defaultState)
  }
}

async function saveState(state: any) {
  const normalized = normalizeState(state)
  await fs.writeFile(STATE_FILE, JSON.stringify(normalized, null, 2))
  return normalized
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

async function serveUpload(res: ServerResponse, filename: string) {
  // Prevent path traversal
  const safeName = path.basename(filename)
  if (!safeName || safeName !== filename) {
    res.statusCode = 400
    res.end('Bad request')
    return
  }

  const filePath = path.join(UPLOADS_DIR, safeName)
  try {
    const data = await fs.readFile(filePath)
    const ext = path.extname(safeName).toLowerCase()
    const mime = MIME_BY_EXT[ext] || 'application/octet-stream'
    res.statusCode = 200
    res.setHeader('Content-Type', mime)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Content-Length', data.byteLength)
    res.end(data)
  } catch {
    res.statusCode = 404
    res.end('Not found')
  }
}

let bootstrapped = false

async function bootstrap() {
  if (bootstrapped) return
  bootstrapped = true
  await ensureDirs()
  await migrateLegacyUploads()
}

export function dynamicDecorApi(): Plugin {
  return {
    name: 'dynamic-decor-api',
    async configureServer(server: ViteDevServer) {
      await bootstrap()

      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next()

        const url = new URL(req.url, 'http://localhost')
        const method = req.method

        // Serve uploads from .data/uploads (outside public/ so Vite won't reload)
        if (url.pathname.startsWith('/uploads/')) {
          const filename = decodeURIComponent(
            url.pathname.slice('/uploads/'.length),
          )
          await serveUpload(res, filename)
          return
        }

        if (!url.pathname.startsWith('/api/')) {
          return next()
        }

        if (url.pathname === '/api/state' && method === 'GET') {
          const state = await getState()
          sendJson(res, 200, state)
          return
        }

        if (url.pathname === '/api/state' && method === 'POST') {
          try {
            const bodyStr = await readBody(req)
            const parsed = JSON.parse(bodyStr)
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
            sendJson(res, 200, { success: true, state: saved })
          } catch {
            sendJson(res, 400, { error: 'Invalid JSON' })
          }
          return
        }

        if (url.pathname === '/api/upload' && method === 'POST') {
          try {
            const bodyStr = await readBody(req)
            const payload = JSON.parse(bodyStr)
            const { name, originalDataUrl, width, height, createdAt } = payload
            const rawId = payload.id
            const id =
              typeof rawId === 'string' && rawId.trim().length > 0
                ? rawId.trim()
                : `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

            if (!originalDataUrl) {
              sendJson(res, 400, { error: 'Missing image data' })
              return
            }

            const matches = originalDataUrl.match(
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
              await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer)
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

            sendJson(res, 200, { success: true, image: newImage })
          } catch (e) {
            sendJson(res, 500, { error: String(e) })
          }
          return
        }

        if (url.pathname === '/api/delete' && method === 'POST') {
          try {
            const bodyStr = await readBody(req)
            const { id } = JSON.parse(bodyStr)

            const state = await getState()
            state.uploadedImages = state.uploadedImages.filter(
              (img: any) => img.id !== id,
            )
            if (state.activeImageId === id) {
              state.activeImageId = null
            }
            await saveState(state)

            try {
              const files = await fs.readdir(UPLOADS_DIR)
              for (const f of files) {
                if (f.startsWith(`${id}.`)) {
                  await fs.unlink(path.join(UPLOADS_DIR, f))
                }
              }
            } catch {
              // ignore cleanup errors
            }

            sendJson(res, 200, { success: true })
          } catch (e) {
            sendJson(res, 500, { error: String(e) })
          }
          return
        }

        next()
      })
    },
  }
}
