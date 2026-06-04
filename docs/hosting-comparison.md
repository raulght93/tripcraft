# Estudio comparativo de hosting (2026)

> Objetivo: elegir dónde desplegar Tripcraft con coste **gratuito o mínimo**, y
> ver si esa elección **condiciona el stack** (framework, backend, auth, DB).
> Datos verificados en junio 2026 (las tarifas cambian; revisar antes de escalar).

## TL;DR

- **Tu intuición "Cloudflare Pages queda pequeño" no se sostiene con los números.**
  Para la carga de Tripcraft (SPA estática + API ligera + DB pequeña), CF es de
  los **más generosos** del mercado y el **único** de los grandes que **permite
  uso comercial en el plan gratuito**.
- **Vercel Hobby prohíbe el uso comercial** y empuja a Next.js + servicios de
  datos de terceros (Upstash/Neon envueltos). Es una trampa si esto algún día
  monetiza.
- **Recomendación: seguir en Cloudflare** (Pages + Workers + D1 + R2), con la
  clave de mantener el front como **SPA Vite framework-agnóstica** → el coste de
  cambiar de host queda bajo (no hay lock-in). El host deja de ser una decisión
  irreversible.

## Por qué la carga de Tripcraft es "barata" por naturaleza

1. **Front estático** (SPA Vite) → se sirve como assets; en CF eso es **ancho de
   banda ilimitado** gratis.
2. **Imágenes vía hotlink a Wikimedia** (ya hoy) → no consumen tu ancho de banda
   ni storage. (Esquiva incluso la cláusula de "no servir media" de CF.)
3. **Backend mínimo:** guardar/leer "mis viajes" (JSON pequeños) + auth ligera.
   Lecturas/escrituras puntuales, no streaming, no cómputo pesado.
4. **DB pequeña:** un viaje son ~decenas de KB de JSON. 500 MB–5 GB sobran para
   miles de viajes.

El gasto real solo aparecería con tráfico masivo o media propia — ninguno de los
dos es el caso a corto/medio plazo.

## Tabla comparativa

| Plataforma | Free tier (lo relevante) | Backend / DB en free | Uso comercial en free | Ata a framework | Veredicto para Tripcraft |
|---|---|---|---|---|---|
| **Cloudflare** (Pages + Workers + D1 + KV + R2) | **Ancho de banda ilimitado** (estático). Workers 100k req/día (~3M/mes). D1 5 GB + 5M filas leídas/día. KV 1 GB. R2 10 GB + **egress gratis**. | ✅ Workers (API), D1 (SQL), KV, R2 nativos | ✅ **Sí, permitido** | ❌ No (agnóstico: Vite, cualquier cosa) | 🟢 **Mejor encaje.** Ya lo usáis. Más cuota que el resto para esta carga. |
| **Vercel** (Hobby) | 100 GB transfer/mes, ~1M invocaciones func/mes, 1M edge req/mes, 1 GB Blob. Caps duros (esperas al reset). | ⚠️ Funciones sí; DB = Vercel KV (Upstash) / Postgres (Neon), partners | ❌ **Prohibido** (solo personal). Comercial → Pro $20/usuario/mes | ⚠️ Sí, fuerte pull a Next.js | 🟡 DX excelente, pero restricción comercial + lock-in. Vale solo si te quedas en portfolio puro. |
| **Netlify** (Free) | 100 GB BW + 300 min build (cuentas legacy); nuevas cuentas en modelo de **créditos** desde 2025/2026. 125k func + 1M edge func. Pausa al exceder. | ⚠️ Functions; DB de terceros | ✅ Permitido | ❌ No | 🟡 Correcto, pero el viraje a créditos hace el coste menos predecible. |
| **Supabase** (Free) | Backend, **no host de front**. 500 MB Postgres, **Auth 50k MAU**, RLS, 1 GB storage, 500k edge func. **Pausa el proyecto tras 7 días inactivo.** | ✅ Postgres + **Auth + RLS** llave en mano | ✅ Permitido | ❌ No | 🟢 Como **capa de backend/auth** (no de hosting). La pausa por inactividad es el pero para algo "siempre on". |
| **Render** (Free) | Web service gratis pero **duerme tras 15 min** (cold start 30-60 s). Starter $7/mes. | ✅ Server + Postgres (con límites) | ✅ Permitido | ❌ No | 🔴 Cold starts matan la UX de una API interactiva. Solo si necesitaras server persistente. |
| **Railway** | **Sin free tier** desde 2023. $5 trial; luego Hobby $5/mes (incluye $5 de cómputo). | ✅ Server + DBs | ✅ Permitido | ❌ No | 🔴 No gratis. Innecesario para esta carga serverless. |
| **Fly.io** | **Sin free tier** desde 2024. Trial 2h VM/7 días. ~$2/mes una VM mínima 24/7. | ✅ VMs + Postgres | ✅ Permitido | ❌ No | 🔴 No gratis. Pensado para servidores always-on, no para esto. |
| **GitHub Pages** | Estático gratis, 100 GB soft, 1 GB repo. | ❌ Sin backend | ✅ Permitido | ❌ No | 🟡 Solo serviría el front; necesitarías backend en otro sitio. Útil como mirror/OSS. |

## Cómo condiciona el stack

1. **Front: SPA Vite (no Next.js).** Mantenerse framework-agnóstico es la decisión
   que más reduce riesgo: el front se despliega igual en CF, Netlify o GitHub
   Pages. Adoptar Next.js solo para encajar en Vercel sería atarse y heredar su
   restricción comercial. → **Seguimos en Vite.**
2. **Backend: Cloudflare Workers + D1.** Encaja con el patrón ya probado del Vasco
   (Worker + KV), pero migrando a **D1 (SQL)** para "mis viajes por usuario" +
   listados. KV se queda para cachés/sesiones.
3. **Auth: propia y ligera sobre Workers**, no Supabase/Clerk al principio:
   token de dispositivo anónimo → "reclama tu cuenta con email" (magic-link)
   opcional. Evita la pausa-por-inactividad de Supabase y una dependencia externa.
   *Supabase queda como plan B* si el coste de mantener auth propia crece.
4. **Imágenes:** seguir con hotlink a Wikimedia (gratis, esquiva la cláusula de
   media de CF). Si a futuro hay imágenes propias → **R2** (egress gratis).
5. **Portabilidad como póliza de seguro:** al no acoplarnos a primitivas
   propietarias salvo donde aporten (D1/R2), un eventual salto de host es barato.

## Decisión

**Cloudflare** (Pages + Workers + D1 + R2) con front **Vite SPA** y **auth propia
ligera**. Es gratis para el horizonte previsible, permite uso comercial si el
proyecto evoluciona, y no condiciona el framework. Supabase se reserva como capa
de auth/DB alternativa si hiciera falta.

## Fuentes

- [Cloudflare Workers — pricing](https://developers.cloudflare.com/workers/platform/pricing/) · [Pages — limits](https://developers.cloudflare.com/pages/platform/limits/) · [D1 — limits](https://developers.cloudflare.com/d1/platform/limits/) · [KV — limits](https://developers.cloudflare.com/kv/platform/limits/)
- [Cloudflare Pages pricing & bandwidth 2026 (DevToolReviews)](https://www.devtoolreviews.com/reviews/cloudflare-pages-pricing-bandwidth-limits-2026)
- [Vercel Pricing](https://vercel.com/pricing) · [Hobby plan](https://vercel.com/docs/plans/hobby) · [Vercel free tier limits 2026 (DeployWise)](https://deploywise.dev/blog/vercel-free-tier-limits-2026)
- [Netlify Pricing](https://www.netlify.com/pricing/) · [Netlify free tier 2026 (AgentDeals)](https://agentdeals.dev/vendor/netlify)
- [Supabase Pricing](https://supabase.com/pricing) · [Supabase free tier limits 2026 (Automation Atlas)](https://automationatlas.io/answers/supabase-free-tier-limits-2026/)
- [Platforms with a real free tier 2026 (Render)](https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026) · [Fly.io free tier 2026 (SaaSPricePulse)](https://www.saaspricepulse.com/blog/flyio-free-tier-2026)
