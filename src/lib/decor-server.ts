import fs from 'node:fs/promises'
import path from 'node:path'

const TRANSITION_EFFECTS = new Set([
  'crossfade',
  'zoom',
  'slide',
  'blur',
  'instant',
])
const TRANSITION_SPEEDS = new Set(['slow', 'normal', 'fast'])

export const MIME_BY_EXT: Record<string, string> = {
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

/** Local disk for dev; ephemeral /tmp on Vercel serverless */
function dataRoot() {
  if (process.env.VERCEL) {
    return path.join('/tmp', 'dynamic-decor-data')
  }
  return path.resolve(process.cwd(), '.data')
}

export function uploadsDir() {
  return path.join(dataRoot(), 'uploads')
}

function stateFile() {
  return path.join(dataRoot(), 'state.json')
}

export async function ensureDataDirs() {
  await fs.mkdir(dataRoot(), { recursive: true })
  await fs.mkdir(uploadsDir(), { recursive: true })
}

export function normalizeState(state: any) {
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

export async function getState() {
  await ensureDataDirs()
  try {
    const data = await fs.readFile(stateFile(), 'utf-8')
    return normalizeState(JSON.parse(data))
  } catch {
    return normalizeState(defaultState)
  }
}

export async function saveState(state: any) {
  await ensureDataDirs()
  const normalized = normalizeState(state)
  await fs.writeFile(stateFile(), JSON.stringify(normalized, null, 2))
  return normalized
}

export async function writeUploadFile(filename: string, buffer: Buffer) {
  await ensureDataDirs()
  const safeName = path.basename(filename)
  await fs.writeFile(path.join(uploadsDir(), safeName), buffer)
  return safeName
}

export async function readUploadFile(filename: string) {
  const safeName = path.basename(filename)
  if (!safeName || safeName !== filename) {
    return null
  }
  try {
    const data = await fs.readFile(path.join(uploadsDir(), safeName))
    return { data, safeName }
  } catch {
    return null
  }
}

export async function deleteUploadFilesForId(id: string) {
  try {
    const files = await fs.readdir(uploadsDir())
    for (const f of files) {
      if (f.startsWith(`${id}.`)) {
        await fs.unlink(path.join(uploadsDir(), f))
      }
    }
  } catch {
    // ignore
  }
}

/** One-time copy from legacy public/uploads into .data/uploads (local only) */
export async function migrateLegacyUploads() {
  if (process.env.VERCEL) return
  const legacy = path.resolve(process.cwd(), 'public/uploads')
  try {
    const entries = await fs.readdir(legacy)
    await ensureDataDirs()
    for (const file of entries) {
      if (file.startsWith('.')) continue
      const dest = path.join(uploadsDir(), file)
      try {
        await fs.access(dest)
      } catch {
        await fs.copyFile(path.join(legacy, file), dest)
      }
    }
  } catch {
    // no legacy folder
  }
}
