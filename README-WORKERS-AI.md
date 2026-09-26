# AI Web Studio — Cloudflare Workers + Workers AI

This version uses a Cloudflare Worker with Static Assets instead of a static-only deployment. The Worker serves the Vite `dist` folder and handles `/api/*` routes. Workers AI is configured as the `AI` binding in `wrangler.jsonc`.

## Cloudflare setup

1. Push this project to the GitHub repository.
2. In Cloudflare, create/open the **Workers** project for `ai-web-studio` (not a static-only asset-only deployment).
3. Connect the GitHub repository.
4. Build command: `npm run build`
5. Deploy command: `npx wrangler deploy`
6. Root directory: `/`
7. `wrangler.jsonc` already contains the Workers AI binding named `AI`.
8. Redeploy.

## Test

Open `/api/ai/status` on the Worker domain. A working deployment returns `connected: true` and `provider: "cloudflare-workers-ai"`.

Then POST to `/api/ai/test` from the app or browser devtools to verify an actual model call.

Model: `@cf/qwen/qwen3-30b-a3b-fp8`
