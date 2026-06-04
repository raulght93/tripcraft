# Tripcraft

> Nombre de trabajo provisional.

Herramienta open-source de planificación de viajes. Clona una plantilla, ajústala
a tu viaje (fechas, presupuesto, ruta, actividades) y compártela — sin tocar código.

Nace de generalizar dos planificadores hechos a medida (un viaje de 6-8 meses por
África y un viaje familiar al País Vasco) en un motor único, agnóstico al viaje,
que consume el viaje como **datos** en vez de tenerlo cableado en el código.

## Estado

📋 **Fase 0 completada · Fase 1 en marcha** · gate de calidad activo
(`pnpm typecheck` + `pnpm lint` + `pnpm test` — 29 tests, cobertura núcleo 99% / 93%).

Documentos del proyecto:
- [`PRODUCT-ROADMAP.md`](PRODUCT-ROADMAP.md) — análisis, MVP, roadmap por fases, decisiones.
- [`docs/trip-schema-draft.md`](docs/trip-schema-draft.md) — Trip Schema + resultados del spike.
- [`docs/hosting-comparison.md`](docs/hosting-comparison.md) — estudio de despliegue (2026).
- [`docs/feature-inventory.md`](docs/feature-inventory.md) — **inventario de preservación**: todo lo de Africa/Basque (estética, temas, a11y, animaciones, integraciones, gotchas) marcado por fase, para no perder nada.
- [`docs/engineering-standards.md`](docs/engineering-standards.md) — **estándar de calidad / clean code** (núcleo puro, tests ≥90%, a11y como gate, budget de bundle, DoD).

En curso: **Fase 1 — engine genérico**. Hecho: esqueleto completo de Africa migrado
al schema (28 fases + 7 forks + secuencia), motor (sequencer/coste/**estacionalidad**/
validación) con suite de paridad, **gate de calidad cableado** (pnpm + tsc estricto +
Biome + CI) tras la [review de Fase 1](docs/review-fase1.md), y **shell `apps/web`**
(Vite + React): tabs derivadas de `trip.sequence`, coste por el engine, tema
light/dark/auto, validación en la frontera, tests RTL + axe. Modelo: tiers keyed,
country ISO con bandera derivada, fuente única de tipos vía Valibot.
Pendiente: contenido editorial, POIs, especies, add-ons; mapas; y enriquecer la UI.

## Desarrollo

```bash
corepack enable            # pnpm vía corepack (Node ≥22.6)
pnpm install
pnpm typecheck && pnpm lint && pnpm test
```

## Stack previsto

- React 18 + Vite 6 (sin CSS externo: tokens + inline styles)
- Leaflet + d3-geo + topojson para mapas
- Cloudflare: Pages (front) + Workers + KV/D1 (backend, persistencia, auth ligera)
- Monorepo pnpm workspaces (`packages/` · `apps/` · `trips/` · `worker/`)

## Origen

Repos predecesores (privados, contenido personal):
- `africa-trip-planning` — aporta el motor de planificación.
- `french-basque-family-trip` — aporta el backend y el modelo colaborativo.
