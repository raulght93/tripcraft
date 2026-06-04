# Trip Schema v0 — borrador (Fase 0)

> Objetivo del spike: probar que un viaje real (Africa) **cabe** en un documento
> serializable que un engine agnóstico pueda consumir sin pérdida de información
> ni de comportamiento. Si una fase de Africa no encaja limpia, el modelo cambia
> antes de invertir en el refactor grande.

## Principios

1. **El viaje es dato, no código.** Todo lo específico del viaje vive aquí;
   el engine no conoce ningún ID concreto (`watamu`, `fork_uganda`…).
2. **Forks de primera clase.** Una bifurcación de ruta es un dato, no un `if`.
   Un viaje puede tener 0..N forks.
3. **Secuencia explícita.** El orden del itinerario es una lista declarada,
   no el orden de `push()` en un `useMemo`.
4. **Costes parametrizados.** El multiplicador por nº de viajeros y la ventana
   de fechas son config del viaje, no constantes de módulo.

## Esqueleto del documento

```jsonc
{
  "id": "africa-2026",
  "slug": "africa-oriental-austral",
  "version": 1,
  "title": "África Oriental, Austral y Norte",
  "lang": "es",
  "currency": "EUR",
  "tiers": ["low", "mid", "high"],

  "meta": {
    "dateWindowDefault": { "start": "2026-11-10", "targetEnd": "2027-06-30" },
    "travelersDefault": 2,
    // Regla de coste: el subtotal de viaje escala así según nº de viajeros;
    // los extras per-person escalan lineal (x N). Des-hardcodea el "1.7x".
    "costMultiplierRule": { "type": "shared-accommodation", "factorBy": { "1": 1.0, "2": 1.7 } }
  },

  "phases": [
    {
      "id": "watamu",
      "title": "Watamu",
      "country": "KE",
      "flag": "🇰🇪",
      "daysBase": 8, "daysMin": 4, "daysMax": 14,
      "dailyCost":  { "low": 40, "mid": 90,  "high": 180 },
      "fixedCost":  { "low": 0,  "mid": 0,   "high": 0   },
      "hero": "…", "slides": ["…"],
      "info": { "language": "…", "currency": "…", "plug": "…" },
      "climateWarning": "Lluvias cortas en noviembre…",
      "safetyNote": null,
      "interests": ["dive", "nature"]
    }
    // … resto de fases
  ],

  "forks": [
    {
      "id": "fork_costa_ke",
      "label": "Costa Kenia",
      "icon": "🔀",
      "options": ["watamu", "lamu", "diani"],   // phaseIds
      "default": "watamu",
      "recs": { /* budget × interest → optionId, ex-forkRecs.js */ }
    }
    // … fork_uganda (incluye opción skip_*), fork_safari, fork_costa, fork1, fork2, fork_westafrica
  ],

  "sequence": [
    { "kind": "fork", "ref": "fork_costa_ke" },
    { "kind": "phase", "ref": "safari-ke" },
    { "kind": "phase", "ref": "mafia" },
    { "kind": "fork", "ref": "fork_uganda", "optional": true },
    { "kind": "fork", "ref": "fork_safari" },
    { "kind": "fork", "ref": "fork_costa" },
    { "kind": "fork", "ref": "fork1" },
    { "kind": "phase", "ref": "victoria" },
    { "kind": "fork", "ref": "fork2" },
    { "kind": "fork", "ref": "fork_westafrica", "optional": true },
    { "kind": "extensionGroup", "ref": "extensions", "members": ["ethiopia","egypt","jordan"], "reorderable": true }
  ],

  "pois":        { "watamu": [ { "name": "Mida Creek", "lat": -3.345, "lng": 39.974, "type": "viewpoint", "desc": "…" } ] },
  "addons":      { "watamu": [ { "id": "…", "icon": "…", "label": "…", "cost": [0,0,0], "days": 0 } ] },
  "species":     [ { "id": "…", "name": "…", "kind": "…", "phases": ["watamu"], "activities": ["dive"] } ],
  "seasonality": { "watamu": { "optimal": [1,2,3], "avoid": { "months": [], "reason": "" }, "events": [] } },
  "checklist":   [ { "id": "…", "label": "…", "category": "…", "triggerPhases": ["watamu"] } ],
  "videos":      { "watamu": "youtubeId" },
  "connectors":  { "watamu->safari-ke": { "mode": "overland", "cost": [0,0,0], "hours": 6 } }
}
```

## Mapeo desde la estructura actual de Africa

| Hoy (Africa) | En el schema |
|---|---|
| `data/phaseMeta.js` | `phases[].daysBase/Min/Max`, `dailyCost`, `fixedCost`, `meta.dateWindowDefault` |
| `data/phaseInfo.js` | `phases[].hero/slides/info` |
| `data/phases/*.js` (forks) | `forks[]` + `sequence[]` |
| `data/forkRecs.js` | `forks[].recs` |
| `data/phaseLocations.js` | `pois` |
| `data/addons.js` | `addons` |
| `data/species.js` | `species` |
| `data/seasonality.js` | `seasonality` |
| `data/checklistItems.js` | `checklist` |
| `data/videos.js` | `videos` |
| `data/connectors.js` | `connectors` |
| `useTripState.ACTIVE_PHASES` (push order) | `sequence[]` + sequencer genérico |
| `useTripState.defaultForkChoice` | `forks[].default` |
| `costs.js` 1.7x hardcoded | `meta.costMultiplierRule` |

## Criterios de éxito del spike — ✅ COMPLETADO (2026-06-04)

Ejecutable: `npm test` (Node ≥22.6, sin instalar nada). El spike de Fase 0 se
**graduó a la suite del engine**: [`packages/engine/test/`](../packages/engine/test/)
· datos: [`trips/africa/src/index.js`](../trips/africa/src/index.js)
· motor: [`packages/engine/src/`](../packages/engine/src/).

- [x] `watamu` (+ su fork `fork_costa_ke` y la fase fija `safari-ke`) se expresa
      entero en el schema, con números EXACTOS portados de `phaseMeta.js`.
- [x] Un sequencer genérico (`buildActivePhaseIds`) produce la misma lista de fases
      activas que `ACTIVE_PHASES` para cualquier `forkChoice` (default, lamu, diani).
- [x] `phaseCost()` da el mismo número que la fórmula de `utils/costs.js` en 8 casos
      (activos, descanso al 0.5, voluntariado al 0.5 fijo, multiplicador 1.7× de viajeros).
- [x] El engine no referencia ningún ID literal de Africa: se prueba con un segundo
      viaje `DEMO` (otros tiers, sin forks, otros ids) y con detección de un doc roto.

## Preguntas abiertas — estado tras el spike

1. **`extensionGroup` reordenables** → ✅ resuelto: encajan en `sequence` como un
   item `{ kind: "extensionGroup", members[], reorderable }`. El sequencer ya los
   recorre y `validateReferences` valida sus miembros. (El reorden en sí lo aplicará
   la UI mutando el array `members`.)
2. **`companions`** → ⏳ sigue abierto. Es muy específico de un viaje; candidato a
   **feature opcional / módulo aparte**, no parte del núcleo del schema. Decidir en Fase 1.
3. **TS para `schema` + `engine`** → ✅ decidido: sí. `schema` usa Valibot (tipos +
   validación de una fuente); `engine` es TS sin dependencias; `trips/*` siguen en JS.
