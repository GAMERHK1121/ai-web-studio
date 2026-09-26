# Connect Cloudflare Workers AI

This version uses Cloudflare Pages Functions + Workers AI. The AI binding must be named `AI`.

## Cloudflare dashboard
1. Open Workers & Pages → `ai-web-studio`.
2. Open Settings → Bindings.
3. Choose the Production environment.
4. Add → Workers AI.
5. Set Variable name to `AI`.
6. Save.
7. Redeploy the project.

The function calls `context.env.AI.run()` with the Cloudflare-hosted Qwen3 model `@cf/qwen/qwen3-30b-a3b-fp8`.

## Test
Open the site and call `/api/ai/status` or use the app's AI status indicator. The binding must be present in the deployed Function environment.
