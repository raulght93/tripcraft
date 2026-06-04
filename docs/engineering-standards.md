# Estándar de ingeniería — calidad y clean code

> Este proyecto se construye con **más foco de calidad** que sus predecesores.
> Africa/Basque fueron exploratorios (un archivo monolítico, sin tests, lógica
> mezclada en `useTripState`). Tripcraft no repite eso. Estas reglas son el
> contrato; el código que no las cumple no entra.

## 1. Principios rectores

1. **Núcleo puro, bordes finos.** Toda la lógica de dominio (coste, secuencia,
   seasonality, validación) vive en `packages/engine` como **funciones puras sin
   dependencias, sin React, sin I/O**. Es testeable en aislamiento y reutilizable
   por web, worker y CLI.
2. **Dependencias hacia dentro.** `web` y `worker` dependen de `engine`/`schema`;
   **nunca al revés**. El engine no sabe que existe React ni Cloudflare. (Arquitectura
   tipo puertos/adaptadores: dominio en el centro, delivery e infra fuera.)
3. **Los datos se validan en el borde.** Todo `Trip` que entra (plantilla, import de
   usuario, respuesta del backend) pasa por `validateTrip()` **una vez, en la
   frontera**. Dentro del núcleo, el tipo es de fiar.
4. **Una fuente de verdad por concepto.** Tipos del schema = una fuente (Valibot →
   tipos). Estado del viaje = un hook. Nada de duplicar la forma del dato.
5. **Borrar > comentar.** Sin código muerto, sin `// TODO` huérfanos. Lo aplazado
   va al [inventario](feature-inventory.md) o a un issue, no a un comentario.

## 2. Lenguajes y tipado

- **`packages/schema` y `packages/engine`: TypeScript estricto** (`strict: true`).
  Sintaxis **borrable** (interfaces, type aliases, `as`) para correr con
  `node --experimental-strip-types` sin build. Nada de `enum`/`namespace`/decoradores.
- **`trips/*`: JS** con `/** @type {import("@tripcraft/schema").Trip} */` y validado
  en runtime. El contenido editorial no lleva TS (decisión §0 del roadmap).
- **`apps/web`: JS/JSX** (la UI hereda el estilo de Africa) **consumiendo tipos** del
  engine vía JSDoc. Si la UI crece en complejidad, se reevalúa TS por módulo.
- **Prohibido `any`** en schema/engine. En la frontera, `unknown` + validación.

## 3. Tests (no opcional)

- **Runner del núcleo: `node:test`** (cero dependencias, corre con
  `node --experimental-strip-types`, sin install). La suite vive en
  [`packages/engine/test/*.test.ts`](../packages/engine/test/) y nació del spike de
  Fase 0 (ya graduado). **Vitest + Testing Library** se adopta en `apps/web` para
  componentes y a11y (necesita jsdom). `npm test` corre la suite del núcleo.
- **Cobertura mínima del núcleo (`engine` + `schema`): 90% líneas/ramas.** Es código
  puro: no hay excusa.
- **Tests de paridad** contra los números reales de Africa/Basque: cada vez que se
  migra una fórmula, un test fija el resultado esperado (regresión-proof).
- **Tests de gotcha:** cada "gotcha" del [inventario](feature-inventory.md) que se
  porte estrena un test que impida su regresión (p.ej. "las notas no entran en la
  share URL", "el sequencer salta opciones `skip_*`").
- **Validación del schema:** tests de documentos válidos e inválidos (`safeValidateTrip`).
- **UI:** Testing Library para componentes con lógica; los puramente presentacionales
  no necesitan test, pero sí un check de a11y (axe).

## 4. Lint, formato y CI

- **Biome** (lint + formato en una herramienta, rápido, baja config) como base.
  Alternativa si falta regla: ESLint + `eslint-plugin-jsx-a11y`.
- **A11y como gate de CI:** `jsx-a11y` + axe en los tests de componentes. Un fallo
  de accesibilidad **rompe el build**, no es un aviso (ver §6).
- **Pipeline CI** (GitHub Actions): `typecheck` → `lint` → `test` → `build` →
  `size-limit`. Verde obligatorio para merge.
- **Hooks de pre-commit** ligeros (lint-staged + format) — sin ralentizar.

## 5. Convenciones de código

- **Funciones pequeñas y nombradas.** Límite blando ~40 líneas; si crece, extraer
  helper con nombre (como `buildBreakdown`/`computeFit` hicieron en companions).
- **Complejidad ciclomática acotada** (regla de lint). Preferir tablas/datos a
  cadenas de `if`. (El sequencer ya sustituyó `seq.push(...)` literal por datos.)
- **Nombres en el dominio:** `phaseCost`, `buildActivePhaseIds`, `seasonFit` — no
  `doStuff`/`handle2`. Inglés en código; español en UI y contenido.
- **Sin números/strings mágicos:** el `1.7×` vive en `costMultiplierRule`, los días
  en el schema, los textos en i18n. Nada hardcodeado en componentes.
- **Inmutabilidad:** los datos del viaje son inmutables; el estado se deriva. No
  mutar props ni el documento `Trip`.
- **Commits convencionales** (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`) y PRs
  pequeños y revisables. Refactors invasivos → plan antes (regla heredada).

## 6. Accesibilidad — requisito, no extra

Hereda y endurece las reglas de Africa (ver [inventario §3](feature-inventory.md)):

- Todo control: `aria-label`/`<label>`; `aria-pressed`/`aria-selected`/`aria-expanded`
  según corresponda; focus ring visible (`shadows.ring`).
- Operable por teclado de principio a fin (tabs, acordeones, steppers, drag-drop).
- Contraste **AA ≥4.5:1** verificado en light y dark para cualquier acento nuevo.
- `prefers-reduced-motion` respetado por las animaciones (las micro-interacciones
  del inventario §4 deben degradar).
- **CI falla** si axe detecta violaciones en un componente con test.

## 7. Estilo y temas

- Sin CSS externo, sin librerías de estilos (Tailwind/styled/emotion) — **deliberado**.
- Color/tipografía **solo** vía tokens (`var(--c-*)`). Color de fase vía el tema del
  viaje, no hardcodeado.
- Tema parametrizable por plantilla; anti-FOUC preservado (inyección en module-load).

## 8. Rendimiento

- **Budget de bundle:** el `main` de Africa quedó en ~770 kB. Objetivo Tripcraft:
  **< 250 kB** el shell inicial; mapas, vídeos, summary, companions en **chunks lazy**
  con `Suspense` + ErrorBoundary (patrón ya probado en Africa).
- `size-limit` en CI vigila el presupuesto; superarlo rompe el build.
- Imágenes: Wikimedia 500px (regla §6 del inventario); a futuro proxy/caché R2.

## 9. Definition of Done (toda PR)

- [ ] Typecheck + lint + tests en verde; cobertura de núcleo ≥90%.
- [ ] A11y: roles/labels/teclado/contraste; axe sin violaciones.
- [ ] Sin código muerto, sin `any`, sin magic numbers/strings.
- [ ] Si toca el núcleo: test de paridad/gotcha añadido.
- [ ] Si porta una feature del [inventario](feature-inventory.md): fila marcada ✅ + gotcha test.
- [ ] Bundle dentro de presupuesto.
- [ ] Datos validados en la frontera (`validateTrip`).
