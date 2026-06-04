# Tripcraft

> Nombre de trabajo provisional.

Herramienta open-source de planificación de viajes. Clona una plantilla, ajústala
a tu viaje (fechas, presupuesto, ruta, actividades) y compártela — sin tocar código.

Nace de generalizar dos planificadores hechos a medida (un viaje de 6-8 meses por
África y un viaje familiar al País Vasco) en un motor único, agnóstico al viaje,
que consume el viaje como **datos** en vez de tenerlo cableado en el código.

## Estado

📋 **Planificación.** Ver [`PRODUCT-ROADMAP.md`](PRODUCT-ROADMAP.md) para el plan
completo, el MVP y el roadmap por fases.

Trabajo actual: **Fase 0 — spike del Trip Schema**
(ver [`docs/trip-schema-draft.md`](docs/trip-schema-draft.md)).

## Stack previsto

- React 18 + Vite 6 (sin CSS externo: tokens + inline styles)
- Leaflet + d3-geo + topojson para mapas
- Cloudflare: Pages (front) + Workers + KV/D1 (backend, persistencia, auth ligera)
- Monorepo pnpm workspaces (`packages/` · `apps/` · `trips/` · `worker/`)

## Origen

Repos predecesores (privados, contenido personal):
- `africa-trip-planning` — aporta el motor de planificación.
- `french-basque-family-trip` — aporta el backend y el modelo colaborativo.
