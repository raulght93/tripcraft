# Tripcraft

> Nombre de trabajo provisional.

Herramienta open-source de planificación de viajes. Clona una plantilla, ajústala
a tu viaje (fechas, presupuesto, ruta, actividades) y compártela — sin tocar código.

Nace de generalizar dos planificadores hechos a medida (un viaje de 6-8 meses por
África y un viaje familiar al País Vasco) en un motor único, agnóstico al viaje,
que consume el viaje como **datos** en vez de tenerlo cableado en el código.

## Estado

📋 **Planificación + Fase 0 completada** (spike 23/23 OK — `npm run spike`).

Documentos del proyecto:
- [`PRODUCT-ROADMAP.md`](PRODUCT-ROADMAP.md) — análisis, MVP, roadmap por fases, decisiones.
- [`docs/trip-schema-draft.md`](docs/trip-schema-draft.md) — Trip Schema + resultados del spike.
- [`docs/hosting-comparison.md`](docs/hosting-comparison.md) — estudio de despliegue (2026).
- [`docs/feature-inventory.md`](docs/feature-inventory.md) — **inventario de preservación**: todo lo de Africa/Basque (estética, temas, a11y, animaciones, integraciones, gotchas) marcado por fase, para no perder nada.
- [`docs/engineering-standards.md`](docs/engineering-standards.md) — **estándar de calidad / clean code** (núcleo puro, tests ≥90%, a11y como gate, budget de bundle, DoD).

Siguiente: **Fase 1 — engine genérico** (migrar el resto de Africa al schema).

## Stack previsto

- React 18 + Vite 6 (sin CSS externo: tokens + inline styles)
- Leaflet + d3-geo + topojson para mapas
- Cloudflare: Pages (front) + Workers + KV/D1 (backend, persistencia, auth ligera)
- Monorepo pnpm workspaces (`packages/` · `apps/` · `trips/` · `worker/`)

## Origen

Repos predecesores (privados, contenido personal):
- `africa-trip-planning` — aporta el motor de planificación.
- `french-basque-family-trip` — aporta el backend y el modelo colaborativo.
