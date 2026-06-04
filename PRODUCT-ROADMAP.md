# Tripcraft — Plan de producto y roadmap

> **Nombre de trabajo provisional: "Tripcraft".** Renombrable sin coste (repo + paquetes).
> Estado: documento de planificación. Última revisión: 2026-06-04.

De dos planificadores de viaje hardcodeados (Africa, País Vasco) a una **herramienta
genérica de planificación de viajes** open-source, donde cualquiera clona una
plantilla, la ajusta a su viaje y la comparte — sin tocar código.

---

## 0. Decisiones fijadas

Tomadas el 2026-06-04 (ver §6 para las que aún quedan abiertas):

| Decisión | Elección | Implicación |
|---|---|---|
| **Autoría de contenido** | Plantillas clonables | El MVP reutiliza Africa y Vasco como plantillas seed. No builder desde cero al principio. |
| **Base de código** | Híbrida: motor de Africa + backend del Vasco | Aprovecha el ≈70% genérico de Africa y el Worker+KV ya probado del Vasco. |
| **Alcance MVP** | Solo individual primero | Colaboración multi-usuario diferida a Fase 4. Reduce riesgo y time-to-market. |
| **Ambición / modelo** | Open-source / portfolio | Sin pagos, sin multi-tenant aislado fuerte. Auth ligera. Foco en calidad y self-host. |
| **Hosting** | Cloudflare (Pages + Workers + D1 + R2) | Gratis para el horizonte previsible, **uso comercial permitido**, sin lock-in de framework. Ver [`docs/hosting-comparison.md`](docs/hosting-comparison.md). |
| **Framework front** | Vite SPA (framework-agnóstico, **no** Next.js) | Portable entre hosts; evita atarse a Vercel y su restricción comercial. |
| **TypeScript** | Solo en `packages/schema` + `packages/engine` | El schema se define con **Valibot** (1 fuente → tipos TS *y* validación runtime). `trips/*` y la UI siguen en JS (`allowJs`). |
| **Backend / DB** | Cloudflare Workers + **D1 (SQL)** | Evoluciona el patrón Worker+KV del Vasco a SQL para "mis viajes por usuario". KV para cachés/sesiones. |
| **Auth** | Propia ligera sobre Workers | Token de dispositivo anónimo → magic-link opcional. Supabase como plan B. |

---

## 1. El hallazgo que encuadra todo

Africa y País Vasco **no son dos versiones de lo mismo**: son las dos mitades
complementarias del producto público.

| Dimensión | **Africa** (~22k líneas) | **País Vasco** (~7k líneas) |
|---|---|---|
| **Motor de planificación** | 🟢 Muy potente (presupuesto por tier, fases/forks, mapas global+regional, especies, seasonality, add-ons, companions, checklist, print PDF) | 🟡 Básico (presupuesto lineal, catálogo de actividades, itinerario drag-drop) |
| **Colaboración / backend** | 🔴 Inexistente (todo client-side, localStorage `rta_`, share por URL) | 🟢 **Resuelto** (Cloudflare Worker + KV, votos por miembro, comentarios, presencia, log, modo simulación, identidad) |
| **Modelo de coste** | 🟢 Sofisticado | 🟡 Lineal |
| **Acoplamiento al viaje concreto** | 30% (7 forks + 3 extensiones cableados) | 80% (datos), 20% infra reutilizable |

**Africa tiene el cerebro. País Vasco tiene el sistema nervioso multi-usuario.**
El producto público necesita ambos → de ahí la base **híbrida**.

### El verdadero reto

Ambas apps tienen el **contenido escrito por un desarrollador** en archivos `.js`.
Para ser herramienta general, el cuello de botella no es el backend ni la auth:
es **cómo crea un usuario su viaje sin tocar código**. La decisión "plantillas
clonables" lo resuelve para el MVP (clonar + ajustar) y difiere el builder
completo a fases posteriores.

---

## 2. Arquitectura objetivo: el viaje deja de ser código y pasa a ser un *documento*

Hoy un viaje **es código** (`data/phases/*.js`). El núcleo del refactor es
convertirlo en un **documento serializable (Trip Schema)** que un **engine
agnóstico** consume.

```
Trip {
  id, slug, title, lang, currency, version,
  meta: { dateWindowDefault, travelersDefault, costMultiplierRule },  // des-hardcodea "2 pers · 1.7x"
  phases:   [ Phase{ id, title, daysBase/Min/Max, dailyCost[tier], fixedCost[tier],
                     hero, slides, info, climateWarning, safetyNote } ],
  forks:    [ Fork{ id, label, icon, options:[phaseId…], default, recs } ],  // des-hardcodea los 7 forks
  sequence: [ ref|fork|ext … ],            // des-hardcodea ACTIVE_PHASES (el push order literal)
  pois, addons, species, seasonality, checklist, videos, connectors, …
}
```

El concepto **"fork"** (bifurcación de ruta) es una feature genérica excelente:
se conserva como ciudadano de primera clase del schema. Un viaje puede tener
0 forks (Vasco) o 7 (Africa). El sequencer genérico recorre `trip.sequence` +
`forkChoice` en vez del `seq.push(...)` literal de hoy.

### Qué se reutiliza vs qué se des-acopla

- **Reutilizable tal cual (≈70% de Africa):** `costs.js`, `dates.js`, shape de
  `phaseMeta`/`addons`, `PhaseDetail`/`ForkPanel`/render, seasonality, especies.
- **A des-acoplar (≈30%):** `useTripState` (forks/sequence/extensions cableados),
  `AfricaGuide.buildTabs` (tabs literales), prefijo localStorage `rta_`,
  strings ES dispersos, el multiplicador 1.7x.

---

## 3. Estructura del repositorio (monorepo OSS, pnpm workspaces)

```
packages/
  schema/   Trip Schema + validación runtime   ← contrato único entre datos y motor
  engine/   cost · dates · seasonality · sequencer (sin React, sin viaje concreto)
  ui/       componentes presentacionales (heredados de Africa)
apps/
  web/      la SPA (orquestador genérico, ex-AfricaGuide)
trips/
  africa/   contenido Africa migrado al schema   ← plantilla seed #1
  basque/   contenido Vasco migrado al schema    ← plantilla seed #2
worker/     Cloudflare Worker + KV/D1 (del Vasco): "mis viajes" + auth ligera
```

Las dos apps actuales se convierten en **datos seed** del catálogo de plantillas:
el trabajo editorial previo no se tira, se vuelve el contenido inicial del producto.

---

## 4. MVP — alcance preciso

**Objetivo:** *"Un usuario entra, elige una plantilla (Africa o Vasco), la clona,
la ajusta a su viaje (fechas, días, forks, presupuesto, añadir/quitar/editar
actividades y notas), la guarda y la comparte por enlace — sin tocar código."*

### Entra en el MVP

1. **Trip-as-data** — extraer Africa al schema; engine genérico con **paridad
   funcional 1:1** con la app actual (mismo resultado, pero data-driven).
2. **Multi-trip** — `TripContext` + registry; localStorage nesteado por `tripId`.
3. **Catálogo de plantillas** (2: Africa, Vasco) + **"Clonar plantilla"** → copia editable.
4. **Edición nivel-plantilla** — días, forks, add-ons, fechas, travelers genérico,
   presupuesto, y **añadir/editar/borrar POIs/actividades y notas**.
   *(NO builder de fases desde cero — eso es Fase 3.)*
5. **Persistencia backend** (Worker+KV del Vasco) para "mis viajes" cross-device +
   **auth ligera**. URL-share se mantiene como export/fallback.
6. **i18n mínimo** — extraer strings ES a un layer; `lang` en el schema. No traducir
   todo aún, pero dejar de bloquear.

### NO entra (diferido, deliberado)

- ❌ Colaboración (votos/comentarios/presencia/simulación del Vasco) → Fase 4.
- ❌ Builder de viaje completamente desde cero → Fase 3.
- ❌ IA generativa → Fase 5.
- ❌ Pagos, multi-tenant aislado fuerte (no aplica en OSS individual).

---

## 5. Roadmap por fases

| Fase | Nombre | Resultado | Esfuerzo aprox. |
|---|---|---|---|
| **0** | Spike de arquitectura | Trip Schema v0 + prueba de que Africa "cabe" (1 fase migrada a mano). Decisión TS sí/no (§6). Scaffold monorepo. | ~1–2 sem |
| **1** | Engine genérico | Africa migrado a trip-as-data. Sequencer/forks/localStorage des-hardcodeados. **Paridad con la app actual**, sin features nuevas. | grueso del trabajo |
| **2** | **MVP público** | Multi-trip + catálogo + clonado + edición nivel-plantilla + backend + auth ligera. Vasco portado como 2ª plantilla. | medio |
| **3** | Edición avanzada | Builder parcial (crear/reordenar fases, POIs en mapa), i18n completo (EN), import básico. | medio |
| **4** | Colaboración | Injertar modelo Vasco: votos, comentarios, presencia, modo simulación, identidad. Multi-usuario real. | medio-alto |
| **5** | Inteligencia y comunidad | Autoría asistida por IA (describe→borrador), marketplace de plantillas comunitarias, PWA/offline. | alto |

---

## 6. Decisiones aún por refinar

**Decididas el 2026-06-04** (movidas a §0): TypeScript (schema+engine con Valibot),
auth (propia ligera sobre Workers), KV vs D1 (→ D1), hosting (Cloudflare) y
framework (Vite SPA). Ver el estudio en [`docs/hosting-comparison.md`](docs/hosting-comparison.md).

Aún abiertas:

1. **Imágenes a escala:** hoy hotlink a Wikimedia (con límites de tamaño ya
   documentados; además esquiva la cláusula de "no servir media" de CF). A escala
   pública o con imágenes propias → proxy/caché en **R2** (egress gratis).
2. **Nombre del producto** (hoy "Tripcraft" provisional) y dominio.
3. **Licencia OSS** (MIT vs AGPL — relevante si no se quiere que terceros lo
   releven como SaaS cerrado).
4. **Validador de schema:** Valibot (más pequeño, tree-shakeable) vs Zod (más
   ecosistema). Recomendación de partida: **Valibot**. → confirmar en el spike.

---

## 7. Siguiente paso concreto

**Fase 0 — spike del schema:** redactar `Trip Schema v0` y migrar **una sola fase
de Africa** (p. ej. `watamu`) a ese formato para probar que el engine la consume
sin pérdida. Eso valida (o rompe) toda la premisa antes de invertir en el refactor
grande. Borrador inicial en [`docs/trip-schema-draft.md`](docs/trip-schema-draft.md).
