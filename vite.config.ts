import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(rootDir, '.data')
const legacyUploadsDir = path.join(rootDir, 'public', 'uploads')

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ['react', 'react-dom'],
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
  server: {
    watch: {
      // Absolute paths — chokidar ignores are unreliable with globs alone on macOS
      ignored: [
        dataDir,
        path.join(dataDir, '**'),
        legacyUploadsDir,
        path.join(legacyUploadsDir, '**'),
        '**/.data/**',
        '**/public/uploads/**',
      ],
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
})

export default config
