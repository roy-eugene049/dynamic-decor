/** Default empty hook size (portrait placeholder) */
export const PLACEHOLDER_ART_SIZE = { width: 80, height: 106 }

const MAX_ART_WIDTH = 200
const MAX_ART_HEIGHT = 260
const MIN_ART_WIDTH = 56
const MIN_ART_HEIGHT = 56

/**
 * Scale artwork to wall-friendly bounds while preserving aspect ratio.
 */
export function scaleArtToWall(
  width: number,
  height: number,
  bounds: { maxW?: number; maxH?: number } = {},
): { width: number; height: number } {
  const maxW = bounds.maxW ?? MAX_ART_WIDTH
  const maxH = bounds.maxH ?? MAX_ART_HEIGHT

  if (width <= 0 || height <= 0) {
    return { ...PLACEHOLDER_ART_SIZE }
  }

  const ratio = width / height
  let w = width
  let h = height

  if (w > maxW) {
    w = maxW
    h = w / ratio
  }
  if (h > maxH) {
    h = maxH
    w = h * ratio
  }
  if (w < MIN_ART_WIDTH) {
    w = MIN_ART_WIDTH
    h = w / ratio
  }
  if (h < MIN_ART_HEIGHT) {
    h = MIN_ART_HEIGHT
    w = h * ratio
  }
  if (w > maxW) {
    w = maxW
    h = w / ratio
  }
  if (h > maxH) {
    h = maxH
    w = h * ratio
  }

  return {
    width: Math.round(w),
    height: Math.round(h),
  }
}

export function getImageDimensions(
  dataUrl: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('Could not read image dimensions'))
    img.src = dataUrl
  })
}
