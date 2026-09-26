# AI Web Studio V3 — Cloud / Claude-style

This version is designed as a Claude-style workspace: left navigation, clean chat-first composer, project workspace, live preview and QA.

## Cloudflare

- Frontend: React + Vite on Pages
- API: Pages Functions in `functions/api/[[path]].js`
- AI: optional Cloudflare Workers AI binding named `AI`
- Browser local persistence: projects/files are kept in localStorage for this first cloud build

### Cloudflare AI binding

In the Pages project:
Settings → Functions → Bindings → Add → Workers AI → Variable name: `AI`

Redeploy after adding the binding.

Workers AI is available on Free and Paid plans with a daily free allocation; usage above the free allocation requires the paid plan.

## Deploy

1. `npm install`
2. `npm run build`
3. `git add .`
4. `git commit -m "AI Web Studio V3 cloud Claude UI"`
5. `git push`

Cloudflare Git integration will build and deploy the new commit.
