# AI Web Studio V2.0 — Ultimate Local-First Production Studio

نسخه نهایی و یکپارچه‌ی AI Web Studio. هدف این نسخه یک Web IDE مستقل و local-first است که تولید، ویرایش، طراحی بصری، چندعاملی، QA و خروجی Production را در یک چرخه واحد جمع می‌کند.

## هسته‌ها
- Local AI via Ollama + deterministic fallback
- Multi-Agent Orchestrator و Autonomous Build Loop
- Design System + Asset Agent + 3D/GSAP-ready pipeline
- File Agent + Visual Editor + Component System
- AI Explain / Refactor / Optimize
- Version History + Diff + Restore
- SEO / AEO / GEO / Accessibility / Performance QA
- Self-Healing QA loop
- Component & Template Library
- Project Manager + Live Preview + responsive device modes
- Build Manifest برای ثبت ساختار و کیفیت پروژه
- Safe Terminal command set
- ZIP Export

## اجرا
```bash
npm install
npm run dev
```
Frontend: http://localhost:5173
Backend: http://localhost:8787

## Ollama
به‌صورت local اجرا می‌شود. متغیرهای محیطی قابل تنظیم هستند:
- `OLLAMA_URL` (default: http://127.0.0.1:11434)
- `OLLAMA_MODEL` (default: qwen2.5-coder:7b)

اگر Ollama در دسترس نباشد، generator از fallback داخلی استفاده می‌کند.

## نکته Production
قبل از انتشار عمومی، دامنه، canonical URL، تصاویر واقعی، analytics، سیاست‌های امنیتی سرور و محتوای واقعی کسب‌وکار را جایگزین مقادیر نمونه کنید. این پروژه local-first است و deployment provider خاصی را تحمیل نمی‌کند.


## Cloudflare deployment note

The full V2.0 Studio is local-first and requires its Node/Express API plus writable filesystem and optional Ollama. Cloudflare Pages can host the Vite frontend, but it cannot run this Express filesystem backend unchanged. For a full Cloudflare deployment, migrate the `/api` layer to Cloudflare Workers/Pages Functions and persist data in D1/R2/KV as appropriate.

The frontend now uses `VITE_API_URL` and defaults to same-origin `/api`, so it is ready for that architecture.
