# Dynamic Decor

Virtual interior decor simulator — upload artwork and preview it on wall-mounted frames in a customizable CSS living room.

## Run locally

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## MVP scope

- **CSS living room** — wall, floor, sofa, window, decor (fully editable in `styles.css`)
- **3 art frames** — aspect ratio follows each uploaded piece
- **Upload panel** — JPG/PNG, drag-and-drop, 8MB per file
- **Image gallery** — assign or drag art onto frames
- **Persistence** — `localStorage` (no backend)

## Customizing the scene

| File | Purpose |
|------|---------|
| `src/components/decor/LivingRoomBackdrop.tsx` | Room layer markup |
| `src/styles.css` (`.room__*` rules) | Colors, layout, furniture |
| `src/types/decor.ts` | Scene aspect ratio, frame count |

## Project structure

```
src/
  components/decor/
    LivingRoomBackdrop.tsx  # Room layers
    LivingRoomScene.tsx     # Scene + frames
    Frame.tsx               # Art frame chrome
    UploadPanel.tsx
    ImageGallery.tsx
  hooks/useDecorState.ts
  lib/frame-sizing.ts
  types/decor.ts
```

## Commands

```bash
bun run dev
bun run build
bun run preview
```

Built with [TanStack Start](https://tanstack.com/start), React, TypeScript, and Tailwind CSS.
