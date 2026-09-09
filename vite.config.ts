import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Deployed on Cloudflare Pages, which serves the project from the domain
// root (unlike a GitHub Pages project site, there's no repo-name subpath).
const base = "/";

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon-32.png"],
      manifest: {
        id: base,
        name: "Dottle – Pixel Art Sprite Editor",
        short_name: "Dottle",
        description:
          "A mobile-first pixel art sprite editor for 16×16, 24×24 and 32×32 sprites.",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#09090b",
        theme_color: "#09090b",
        orientation: "portrait",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Everything the app needs is bundled at build time, so precache the
        // full asset graph for offline use and let Workbox serve it from the
        // cache first.
        globPatterns: ["**/*.{js,css,html,png,svg,woff,woff2}"],
        navigateFallback: `${base}index.html`,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
