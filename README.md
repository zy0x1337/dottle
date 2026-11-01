<div align="center">

# Dottle

**A mobile-first pixel art sprite editor for the web.**

Draw crisp 16×16 to 32×32 sprites on your phone or desktop. Install it as an app and keep drawing offline. No account, no uploads.

[**Open Dottle →**](https://dottle.pages.dev)

[![License: MIT](https://img.shields.io/badge/license-MIT-3178c6?style=flat-square)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable%20%2B%20offline-5a0fc8?style=flat-square&logo=pwa&logoColor=white)](#install-as-an-app)
[![Deployed on Cloudflare Pages](https://img.shields.io/badge/deployed%20on-cloudflare%20pages-f38020?style=flat-square&logo=cloudflarepages&logoColor=white)](docs/deployment.md)

</div>

<table>
<tr>
<td width="65%"><img src="docs/screenshots/desktop.png" alt="Desktop layout with side panels for preview, options, and palette"></td>
<td width="35%"><img src="docs/screenshots/mobile.png" alt="Mobile layout with bottom toolbars"></td>
</tr>
<tr>
<td align="center"><sub>Desktop: side panels for preview, options, and palette</sub></td>
<td align="center"><sub>Mobile: compact bottom toolbars</sub></td>
</tr>
</table>

## Features

**Drawing**

- Pencil, eraser, fill, eyedropper, line, rectangle, ellipse, and move tools
- Brush sizes 1–4 and horizontal, vertical, or both-axis mirror drawing
- Filled or outlined shapes, global or contiguous fill
- Flip, rotate, nudge (wrapping shift), center, auto-outline, and clear
- Full undo/redo for every edit and transform

**Color**

- Built-in palettes: PICO-8, Sweetie 16, Endesga 32, NA16, Game Boy, and Grayscale
- Custom colors and a recent-colors tray

**Sprites**

- Canvas sizes of 16×16, 24×24, and 32×32
- A gallery to create, duplicate, rename, and delete sprites
- Image import: exact 16, 24, or 32 px squares come in 1:1, anything else is resampled to fit the grid (original colors are kept)
- PNG export at 1×–32× with a transparent, white, or black background, by download, share sheet, or clipboard

**Made for touch**

- Bottom toolbars and large hit targets
- Pinch to zoom, two-finger tap to undo
- Installable PWA that works with no network connection

## Keyboard shortcuts

| Key | Action | Key | Action |
|---|---|---|---|
| `P` | Pencil | `M` | Move |
| `E` | Eraser | `X` | Cycle mirror mode |
| `F` | Fill | `G` | Toggle grid |
| `I` | Eyedropper | `[` / `]` | Brush size down / up |
| `L` | Line | `+` / `-` | Zoom in / out |
| `R` | Rectangle | `0` | Reset view |
| `O` | Ellipse | `Ctrl/⌘ Z` | Undo |
| | | `Ctrl/⌘ Shift Z` or `Ctrl/⌘ Y` | Redo |

## Install as an app

| Platform | How |
|---|---|
| **Desktop** (Chrome / Edge) | Click the install icon in the address bar, or menu → *Install Dottle…* |
| **Android** (Chrome) | Menu → *Add to Home screen* / *Install app* |
| **iOS** (Safari) | Share → *Add to Home Screen* |

After the first load, the app works offline. New versions install in the background and take effect the next time you open it.

## Your data

Dottle runs entirely in your browser. Sprites and settings live in `localStorage` and nothing is uploaded to a server. That also means clearing your browser data deletes your sprites, and they don't follow you to other devices, so export anything you want to keep.

## Browser support

Any modern evergreen browser (Chrome, Safari, Firefox, Edge) on desktop or mobile. The share and copy-to-clipboard export options depend on the Web Share and Clipboard APIs and are hidden where they aren't available.

## Development

```bash
npm install
npm run dev
```

Built with [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 7](https://vite.dev/), [Tailwind CSS 4](https://tailwindcss.com/), and [vite-plugin-pwa](https://vite-pwa-org.netlify.app/). There's no backend: the production build is a static site.

- [CONTRIBUTING.md](CONTRIBUTING.md): setup, project structure, and how to send a change
- [docs/deployment.md](docs/deployment.md): deploying to Cloudflare Pages

## License

[MIT](LICENSE)
