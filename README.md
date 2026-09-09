# Dottle

A mobile-first pixel art sprite editor for the web. Draw crisp, tiny sprites in your browser — on your phone or your desktop — with a touch-friendly toolset, curated retro palettes, and one-tap PNG export.

The production build compiles down to a single, self-contained `index.html` file with everything inlined (JS, CSS, no external requests) — no backend, no accounts, no server-side code. Host it as a static file, drop it on a USB stick, or open it straight from disk; all sprites and settings are kept in your browser's local storage.

## Features

- **Canvas sizes** — 16×16, 24×24, and 32×32 sprites
- **Drawing tools** — pencil, eraser, fill (bucket), eyedropper, line, rectangle, ellipse, and move, each with a keyboard shortcut
- **Brush & symmetry** — adjustable brush size and horizontal/vertical/both-axis mirror drawing
- **Shape options** — filled or outlined rectangles/ellipses, global or contiguous fill
- **Transform tools** — flip, rotate, nudge (wrapping shift), center, auto-outline, and clear, all fully undoable
- **Color palettes** — PICO-8, Sweetie 16, Endesga 32, NA16, Game Boy, and Grayscale, plus custom colors and a recent-colors tray
- **Sprite gallery** — create, duplicate, rename, and delete multiple sprites, all persisted locally
- **Import** — bring in existing images, automatically resized and quantized to the sprite grid
- **Export** — download, share, or copy PNGs at 1×–32× scale with transparent, white, or black backgrounds
- **Undo/redo** — full history for every edit and transform
- **Mobile-tuned UI** — bottom toolbars, touch-friendly hit targets, pinch-to-zoom canvas, and a two-finger-tap undo gesture
- **Home-screen friendly** — standalone-display and status-bar meta tags let you pin it to an iOS/Android home screen without browser chrome (no offline support or install prompt yet — there's no web app manifest or service worker)

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 7](https://vite.dev/) for development and bundling
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) to produce a single portable `index.html` build
- [lucide-react](https://lucide.dev/) for icons

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser (or on your phone, on the same network). Note: the source `index.html` loads unbundled TypeScript modules, so it only works through the Vite dev server — opening it directly from disk will not run the app.

### Building the standalone file

```bash
npm run build
```

This produces `dist/index.html` — the single, self-contained file described above. Open it directly in a browser (`file://` works) or serve it from any static host.

### Available scripts

| Command             | Description                                                |
| ------------------- | ----------------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with hot reload                   |
| `npm run build`     | Build the single-file production bundle to `dist/`          |
| `npm run preview`   | Serve the production build locally to check it before deploying |
| `npm run typecheck` | Run the TypeScript compiler in check-only mode (no build script runs this automatically) |

## Project structure

```
src/
├── components/
│   ├── sheets/        # Bottom-sheet dialogs (gallery, export, color, transform, settings, ...)
│   ├── Header.tsx      # Top bar: sprite name, undo/redo, menu
│   ├── Toolbar.tsx      # Drawing tool selector
│   ├── OptionsBar.tsx   # Brush size, mirror, grid, zoom controls
│   ├── PaletteBar.tsx   # Color swatches
│   ├── PixelCanvas.tsx  # The drawing canvas itself
│   └── ui.tsx           # Shared UI primitives (buttons, sheets, thumbnails, toast)
├── lib/
│   ├── image.ts         # Image import/export, canvas rendering, sharing/clipboard
│   ├── palettes.ts      # Built-in color palettes
│   ├── pixels.ts        # Pixel buffer operations (flip, rotate, fill, outline, ...)
│   ├── sample.ts        # Default sample sprite
│   └── storage.ts       # LocalStorage persistence
├── state/
│   └── editor.ts        # Sprite collection + undo/redo reducer
├── types.ts             # Shared type definitions
└── App.tsx              # Application shell and layout
```

## Data & privacy

Dottle runs entirely client-side. Sprites and settings are stored in your browser's `localStorage` — nothing is uploaded to a server. Clearing your browser data will remove your saved sprites.

## Browser support

Any modern evergreen browser (Chrome, Safari, Firefox, Edge) on desktop or mobile. Some export options (native share sheet, clipboard image copy) depend on browser support for the Web Share and Clipboard APIs and will be hidden automatically if unavailable.

## License

Licensed under the [MIT License](LICENSE).
