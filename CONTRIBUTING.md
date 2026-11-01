# Contributing to Dottle

Thanks for helping out. Bug reports, ideas, and pull requests are all welcome.

For anything bigger than a small fix, please [open an issue](https://github.com/zy0x1337/dottle/issues/new/choose) first so we can agree on the approach before you put time into it.

## Setup

You need Node 22 (see [`.node-version`](.node-version)).

```bash
npm install
npm run dev
```

Open the printed local URL in your browser, or on your phone if it's on the same network and you start the server with `npm run dev -- --host`.

The source `index.html` loads unbundled TypeScript modules, so it only runs through Vite. Opening it directly from disk won't work.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload (no service worker) |
| `npm run build` | Build the static site, PWA manifest, and service worker to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run the TypeScript compiler in check-only mode (`build` doesn't do this for you) |

## Project structure

```
src/
├── components/
│   ├── sheets/          # Bottom-sheet dialogs (gallery, export, color, transform, settings, ...)
│   ├── Header.tsx       # Top bar: sprite name, undo/redo, menu
│   ├── Toolbar.tsx      # Drawing tool selector
│   ├── OptionsBar.tsx   # Brush size, mirror, grid, zoom controls
│   ├── PaletteBar.tsx   # Color swatches
│   ├── PixelCanvas.tsx  # The drawing canvas, pointer input, and gestures
│   └── ui.tsx           # Shared UI primitives (buttons, sheets, thumbnails, toast)
├── lib/
│   ├── image.ts         # Image import/export, canvas rendering, sharing/clipboard
│   ├── palettes.ts      # Built-in color palettes
│   ├── pixels.ts        # Pixel buffer operations (flip, rotate, fill, outline, ...)
│   ├── sample.ts        # Default sample sprite
│   └── storage.ts       # localStorage persistence
├── state/
│   └── editor.ts        # Sprite collection + undo/redo reducer
├── types.ts             # Shared type definitions
└── App.tsx              # Application shell, layout, keyboard shortcuts
```

## Before you open a pull request

There's no automated test suite or CI yet, so these checks are manual:

1. `npm run typecheck` passes.
2. `npm run build` passes.
3. You tried the change in a browser. If it touches drawing, gestures, or layout, try it at phone width with touch too, since Dottle is mobile-first.
4. If it touches offline behavior, check it against a production build. The service worker is disabled in dev mode, so run `npm run build` and `npm run preview`, hard-refresh once so the service worker installs, then go offline in your browser's dev tools and reload.
5. Any user-visible change is reflected in the [README](README.md).

If you add a tool or a transform, make sure it works with undo/redo. If you add a keyboard shortcut, add it to the table in the README.

## Pull requests

- Branch off `main` and keep each pull request to one change.
- Match the surrounding code: TypeScript, function components, Tailwind classes, and the `@/` import alias for `src/`.
- Write commit messages in the [Conventional Commits](https://www.conventionalcommits.org/) style: `feat:`, `fix:`, `docs:`, `chore:`.
- Include a screenshot or short recording for visual changes.

Pushes to `main` deploy to production automatically, see [docs/deployment.md](docs/deployment.md).

## Reporting bugs

Please include your device, browser, and whether you're using the installed app, plus steps to reproduce. For security problems, follow [SECURITY.md](SECURITY.md) instead of opening a public issue with the details.

## Code of conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By taking part, you agree to it.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
