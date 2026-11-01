# Deployment

Dottle is a static, client-only site hosted on [Cloudflare Pages](https://pages.cloudflare.com/) at **https://dottle.pages.dev**. It needs no environment variables or serverless functions.

Every push to `main` triggers a production deployment. Other branches in this repo get their own preview URL.

## Setting up your own deployment

1. Fork the repo.
2. In the [Cloudflare dashboard](https://dash.cloudflare.com/), go to **Workers & Pages → Create → Pages → Connect to Git** and select your fork.
3. Set the build configuration:
   - Framework preset: **None** (or **Vite**, if offered)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: read from `.node-version` automatically; otherwise set the `NODE_VERSION` env var to `22`
4. Click **Save and Deploy**. You get a `<project>.pages.dev` URL right away. Custom domains go under the project's **Custom domains** tab.

To deploy from the command line instead:

```bash
npm run build
npx wrangler pages deploy dist
```

## How it's configured

`vite.config.ts` sets `base: "/"` because the app is served from the root of its domain, not from a repo-name subpath. Hosting it under a subpath means changing that value.

`npm run build` writes everything to `dist/`, including the generated `manifest.webmanifest` and `sw.js`.

`public/_headers` is copied into `dist/` unchanged. It sets `Cache-Control: public, max-age=0, must-revalidate` on `sw.js`, `registerSW.js`, and `manifest.webmanifest` so browsers always revalidate them. Without it, a stale cached service worker could hide new deployments from returning visitors.
