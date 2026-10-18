# Dynamic Decor

Digital picture frame for the wall and a phone-friendly remote to drive it.

Open **`/`** on a display (TV, tablet, kiosk). Open **`/app`** on a phone or laptop to upload art, pick transitions, and push pieces to the frame — both stay in sync without a full reload.

## Run locally

```bash
bun install
bun run dev
```

- Frame: [http://localhost:3000](http://localhost:3000)
- Controller: [http://localhost:3000/app](http://localhost:3000/app)

Requires **Node 20+** (Bun is used for local install/dev).

## How it works

```
┌─────────────────┐         shared API          ┌──────────────────┐
│  /  (frame)     │ ◄── /api/state (poll) ──►   │  /app (remote)   │
│  DualBuffer     │         /api/upload         │  gallery/upload  │
│  Crossfader     │         /api/delete         │  transitions     │
└─────────────────┘         /uploads/:file      └──────────────────┘
                                    │
                          .data/  (local disk)
                          /tmp/…  (Vercel)
```

- **Display (`/`)** — full-bleed dual-buffer player. Crossfade, zoom, slide, blur, or instant swaps at slow / normal / fast.
- **Controller (`/app`)** — glassmorphic remote: upload, gallery assign/clear, transition controls, reset session.
- **State API** — TanStack Start server routes under `src/routes/api/*`. Uploads live outside `public/` so Vite does not reload on every write.
- **Deploy** — Nitro Vite plugin (`nitro()`) builds for Vercel. Framework preset: `tanstack-start` (`vercel.json`).

## Features

- JPG / PNG / WebP / GIF upload (drag-and-drop), **20MB** per file
- Shared gallery + active frame assignment across devices
- Dual-buffer transitions (no flash of empty frame)
- Server-backed persistence (`.data/state.json` + `.data/uploads/`)
- Dark / light theme on the controller

> On Vercel, filesystem storage is ephemeral (`/tmp`). Fine for demos; use durable storage (e.g. Blob + KV) for production persistence across cold starts.

## Project structure

```
src/
  routes/
    index.tsx              # Display frame
    app.tsx                # Remote controller
    api/state.ts           # GET/POST decor state
    api/upload.ts          # POST image upload
    api/delete.ts          # POST remove image
    uploads/$filename.ts   # Serve uploaded files
  components/decor/
    DualBufferCrossfader.tsx
    TransitionSelector.tsx
    UploadPanel.tsx
    ImageGallery.tsx
  hooks/useDecorState.ts   # Client sync + polling
  lib/decor-server.ts      # Shared server I/O
  types/decor.ts           # State + transition types
vite.config.ts             # TanStack Start + Nitro + Tailwind
vercel.json                # framework: tanstack-start
```

## Commands

```bash
bun run dev       # Vite + Start on :3000
bun run build     # Client + SSR + Nitro output → .output/
bun run preview   # Preview production build
bun run start     # Node server from .output/server
bun run test      # Vitest
```

## Deploy (Vercel)

1. Push a branch with Nitro configured (this repo already includes it).
2. Import the repo on Vercel — preset should read **TanStack Start**.
3. `@tanstack/react-start` must be **≥ 1.168.60** (XSS advisory).

Built with [TanStack Start](https://tanstack.com/start), React, TypeScript, Tailwind CSS, and [Nitro](https://nitro.build).
