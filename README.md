# Dottle

A mobile-first pixel art sprite editor for the web. Draw crisp, tiny sprites in your browser — on your phone or your desktop — with a touch-friendly toolset, curated retro palettes, and one-tap PNG export.

**[Try it live](https://zy0x1337.github.io/dottle/)** — installable as a home-screen app and fully usable offline after the first visit.

Dottle is a static, client-only web app: no backend, no accounts, no server-side code. It's a Progressive Web App — once loaded, a service worker caches everything it needs, so it keeps working with no network connection. Sprites and settings are kept in your browser's local storage.

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
- **Installable & offline-capable** — a full PWA with a web app manifest and a service worker that precaches every asset; install it to your home screen or desktop and keep drawing with no network connection

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 7](https://vite.dev/) for development and bundling
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox) for the web app manifest and offline service worker
- [lucide-react](https://lucide.dev/) for icons
- GitHub Actions + GitHub Pages for hosting and deployment

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser (or on your phone, on the same network). Note: the source `index.html` loads unbundled TypeScript modules, so it only works through the Vite dev server — opening it directly from disk will not run the app. The service worker is also disabled in dev mode, so offline behavior can only be checked against a production build (see below).

### Building for production

```bash
npm run build
npm run preview
```

`npm run build` writes a standard static site to `dist/` (HTML, JS, CSS, icons, plus the generated `manifest.webmanifest` and `sw.js`). `npm run preview` serves that build locally — hard-refresh once so the service worker installs, then use your browser's dev tools to go offline and confirm the app still loads.

Because the deployment target is a GitHub Pages *project* site, `vite.config.ts` hardcodes `base: "/dottle/"`. If you fork this to a different repo name (or a `<user>.github.io` user site, which is served from `/`), update `base` there to match.

### Available scripts

| Command             | Description                                                |
| ------------------- | ----------------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with hot reload (no service worker) |
| `npm run build`     | Build the static production site, including the PWA manifest and service worker, to `dist/` |
| `npm run preview`   | Serve the production build locally to check it before deploying |
| `npm run typecheck` | Run the TypeScript compiler in check-only mode (no build script runs this automatically) |

## Deployment

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which type-checks, builds, and publishes `dist/` to GitHub Pages via `actions/deploy-pages`. The live site is served at `https://zy0x1337.github.io/dottle/`.

## Installing as an app

Dottle is an installable Progressive Web App:

- **Desktop Chrome/Edge**: click the install icon in the address bar (or menu → "Install Dottle…").
- **Android Chrome**: menu → "Add to Home screen" / "Install app".
- **iOS Safari**: Share → "Add to Home Screen".

After the first load, a service worker precaches the app shell and all assets, so subsequent visits — and drawing sessions — work with no network connection at all. New deployments update automatically in the background and take effect the next time the app is opened.

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
