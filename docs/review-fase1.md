# Review independiente — Fase 0 → Fase 1

> Revisión externa del plan (roadmap + docs) y del código generado hasta el
> incremento 1 de Fase 1, contrastada contra el código real de
> `africa-trip-planning` (phaseMeta, costs, forkRecs, `ACTIVE_PHASES`).
> Fecha: 2026-06-04. Dos decisiones de modelado ya cerradas (ver §4–§5).

## Veredicto

El plan es sólido y el núcleo es genuinamente bueno: **paridad verificada**,
separación limpia, tests verdes. Hay un **desfase real entre el estándar de
calidad declarado y lo que el repo ejecuta hoy**, y dos decisiones de modelado
que se cierran aquí **antes** de migrar el contenido masivo (cambiarlas después
obliga a re-migrar 28 fases + add-ons).

## Verificado y correcto — NO tocar

- **Coste: paridad exacta.** Recalculados los 8 casos del test contra
  `phaseMeta.js` real (watamu mid 1875, lamu mid 1516, safari-ke mid 3050,
  uganda mid 3340, rwanda high 6400…). `cost.ts` replica fielmente `utils/costs.js`
  incluido el `fixedFactor` (1 / 0.5 / 0).
- **Secuencia: paridad exacta** contra `ACTIVE_PHASES` (`useTripState.js:185-203`),
  incluyendo `PHASES=[safari-ke, mafia]` y `PHASES_REST=[victoria, botswana]`
  intercalados entre forks.
- **Forks/recs: migrados verbatim** desde `forkRecs.js` (los 7 forks).
- **`omitWhenSelected` es una mejora real**, no solo migración: sustituye la
  heurística frágil `id.startsWith("skip_")` por dato explícito y modela bien que
  `skip_f1/skip_f2` permanecen (coste de vuelo latente) mientras
  `skip_uganda/skip_westafrica` se omiten.
- **18/18 tests verdes** vía `node --experimental-strip-types`, cero install.
  El engine es realmente agnóstico (test DEMO).

## Problemas por severidad

### 🔴 Alta — el "estándar formal desde día 1" no es ejecutable hoy

1. **`npm run typecheck` no corre** (`tsc: command not found`, sin `node_modules`).
   El núcleo TS nunca ha sido type-chequeado.
2. **`packages/schema/src/validate.ts` es código muerto / no ejercitado.** Importa
   `valibot` (no instalado), no se importa desde ningún sitio, sin tests. Viola
   §1.5 ("sin código muerto") y el DoD ("datos validados en la frontera"): hoy
   *nada* valida un Trip en runtime.
3. **Cobertura ≥90% no se mide** (sin tooling); `validate.ts` al 0%.
4. **Tests de validación de schema prometidos (§3) no existen.**
5. **Lint (Biome) no configurado**; sin CI.

→ Alinear discurso y realidad: cablear el gate, o bajar el claim a "objetivo de Fase 1".

### 🟡 Media

6. **Dos fuentes de verdad para el Trip.** §1.4 + roadmap dicen "Valibot: 1 fuente
   → tipos *y* validación", pero hay interfaces a mano en `types.ts` **y** schema
   Valibot en `validate.ts`. Ya divergen (el validador es más estricto). `InferOutput
   ≡ Trip` no está enforced.
7. **Gaps de validación → NaN silencioso.** No se valida `dailyCost.length ===
   tiers.length`; un Trip "válido" mal formado produce NaN sin error. Agravado por
   `noUncheckedIndexedAccess: false` y por `tierIndex` devolviendo `0` para tiers
   desconocidos (enmascara errores).
8. **Acoplamiento por path relativo, no por workspace.** El engine importa
   `../../schema/src/types.ts` en vez de `@tripcraft/schema`; tests importan
   `../../../trips/africa/...`. Rompe el aislamiento que §1.2 pretende.

### 🟢 Baja

9. **`applyTravelersMultiplier` cambia comportamiento para ≥3 viajeros** sin test
   ni nota (original siempre 1.7×; nuevo cae a ×N lineal). Documentar + test.
10. **Doble config de workspace** (`pnpm-workspace.yaml` + `workspaces`); elegir uno.
11. **Coste latente de skip_f1/skip_f2** nunca se cobra hoy — deuda semántica
    legítima, convertir en issue explícito (no solo comentario).

## §4. DECISIÓN CERRADA — modelo de tiers: **keyed por tier**

Volver al modelo del draft: `dailyCost: { low, mid, high }` (objeto keyed), **no**
array posicional. Auto-documentado y robusto a reordenar `tiers`. Implica tocar
`cost.ts` (indexar por clave, no por índice), `validate.ts` (record por tier) y
re-expresar los costes en `trips/africa`. La validación de longitud (§7) se
reemplaza por "toda fase tiene una entrada por cada tier de `trip.tiers`".

## §5. DECISIÓN CERRADA — modelo de country: **ISO + flag derivado**

`country` pasa a código ISO (`"KE"`), o `string[]` para multi-país
(`["ZM","ZW"]`, `["SN","GM","GH","TG","BJ"]`). `flag` y nombre legible se
**derivan** del ISO (tabla en el engine/UI), no se guardan a mano. Mejora i18n,
agrupación y el customizer por-país de África Occidental. Remodelar los compuestos
actuales (`"Zambia/Zimbabwe"`, `"Senegal · Gambia · …"`).

## §6. Plan de mejora (orden por dependencia)

1. **Hacer ejecutable el gate (cierra 🔴).** Fijar gestor de paquetes (elegir npm
   *o* pnpm, borrar la otra config), instalar deps, cablear `tsc` y verificar
   `typecheck`. Activar `noUncheckedIndexedAccess: true`. Añadir cobertura
   (`--experimental-test-coverage`) y cumplir 90% o bajar el claim.
2. **Resolver `validate.ts` (cierra 🔴 + #6).** Derivar `Trip` desde Valibot
   (`type Trip = v.InferOutput<typeof TripSchema>`), eliminar las interfaces
   duplicadas → una sola fuente. El engine sigue importando solo el `type`
   (Valibot se borra en runtime). Escribir tests de schema (válido/roto/`safeValidateTrip`)
   y llamar `validateTrip(AFRICA_TRIP)` en el borde para ejercitarlo.
3. **Cross-field en `validateReferences` (cierra #7).** Con el modelo keyed (§4):
   toda fase y todo add-on tienen una entrada por cada tier declarado. Test de
   gotcha que pille el NaN.
4. **Aplicar §4 (tiers keyed)** — antes de migrar más contenido.
5. **Aplicar §5 (country ISO)** — antes de migrar más contenido.
6. **Issues explícitos (cierra #9, #11):** coste latente de skip, comportamiento
   ≥3 viajeros, y `companions` (el draft lo dejó abierto como módulo aparte).
7. **Migrar imports a nombres de paquete** (`@tripcraft/schema`) (cierra #8).

> Recomendación de secuencia: 1 → 4 → 5 (re-migrar contenido una sola vez con el
> modelo ya cerrado) → 2 → 3 → 7 → 6.

---

## Resolución (2026-06-04) — review atendida en su totalidad

Decisión: **instalar y cablear el gate, con pnpm** (corepack). Brecha 🔴 cerrada.

| Hallazgo | Estado | Cómo |
|---|---|---|
| 🔴 1 typecheck no corre | ✅ | `tsc` estricto + `noUncheckedIndexedAccess: true`. `pnpm typecheck` verde. |
| 🔴 2 `validate.ts` muerto | ✅ | Ahora es la fuente única (`schema.ts`); `validateTrip` se ejercita en tests. |
| 🔴 3 cobertura no medida | ✅ | `--experimental-test-coverage`: núcleo **99.3% líneas / 92.9% ramas** (≥90%). |
| 🔴 4 sin tests de schema | ✅ | `packages/schema/test/validate.test.ts` (válido / sin tiers / country no-ISO / kind inválido). |
| 🔴 5 sin lint ni CI | ✅ | Biome (`pnpm lint`) + `.github/workflows/ci.yml` (typecheck→lint→test+cobertura). |
| 🟡 6 dos fuentes de verdad | ✅ | `Trip = InferOutput<TripSchema>`; interfaces a mano borradas. |
| 🟡 7 NaN silencioso | ✅ | `validateReferences` exige una entrada por tier (fases y add-ons) + tests anti-NaN. |
| 🟡 8 imports por path | ✅ | engine y tests importan `@tripcraft/schema` (workspace pnpm). |
| 🟢 9 multiplier ≥3 | ✅ | Documentado en `cost.ts` + test del fallback ×N. |
| 🟢 10 doble config workspace | ✅ | Solo pnpm (`pnpm-workspace.yaml` + `packageManager`); borrado el campo `workspaces`. |
| 🟢 11 coste latente de skip | ✅ | Issue explícito en `feature-inventory` + test del comportamiento. |
| §4 tiers keyed | ✅ | `dailyCost/fixedCost: { low,mid,high }`; engine indexa por clave. |
| §5 country ISO + flag derivado | ✅ | `country` ISO (o array); `displayFlag`/`flagFromIso` en el engine (sin tabla). |

Pendiente real para más adelante (no bloquea): `companions` como módulo opcional
(sigue en el draft del schema como decisión abierta) y decidir si el coste de salto
debe dejar de ser latente.
