# AI Web Studio V2.0 — Cloudflare Pages Edition

This package is prepared for the **React/Vite frontend** deployment on Cloudflare Pages.

## Important architecture note

The full AI Web Studio is full-stack. The current Node/Express backend and local Ollama runtime are **not** deployed by Cloudflare Pages as a normal Node server.

This Pages edition therefore deploys the Studio frontend. To use the full API/AI features online, set `VITE_API_URL` to the URL of a separately hosted compatible backend, or migrate the API routes to Cloudflare Pages Functions/Workers.

If `VITE_API_URL` is empty, the frontend calls `/api/...` on the same origin.

## Cloudflare Pages settings

- Framework preset: React (Vite)
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

## Local verification

```bash
npm install
npm run build
npm run preview
```

## Environment variable

If your backend is hosted elsewhere, configure this **before building**:

```text
VITE_API_URL=https://YOUR-BACKEND.example.com
```

Do not put API secrets in `VITE_*` variables; Vite exposes these values to browser code.

## Git deployment

```bash
git init
git add .
git commit -m "Prepare AI Web Studio for Cloudflare Pages"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY
 git push -u origin main
```

Then import the repository in Cloudflare Pages.
