# Inventario de preservación (paridad de features)

> **Propósito:** que NADA de lo acumulado en `africa-trip-planning` y
> `french-basque-family-trip` se pierda en la generalización, aunque no se
> implemente de inmediato. Cada fila es deuda de producto consciente, no olvido.
> Este documento es también el **checklist de paridad** de las Fases 1–5.
>
> Leyenda origen: **A** = Africa · **B** = Basque · **A+B** = ambos.
> Estado: ✅ portado · 📄 documentado (sin portar) · ⏳ pendiente de decidir.

---

## 1. Estética y sistema de diseño

| Feature | Origen | Detalle a preservar (los "gotchas" importan) | Fase |
|---|---|---|---|
| Tokens de diseño en JS | A+B | `styles/tokens.js`: paletas LIGHT/DARK con **las mismas keys** → `var(--c-<key>)` en `:root` y `[data-theme=dark]`. Si añades una key, defínela en **ambas**. | 1 |
| CSS-in-JS por inline + tokens | A+B | **Deliberado, sin CSS externo.** No introducir Tailwind/styled-components/emotion. Los componentes leen `var(--c-*)`, no hardcodean color. | 1 |
| Paleta por fase | A | `styles/phaseColors.js`: triplete `{tab, accent, light}` por fase, light+dark. → en el schema genérico pasa a ser color por **fase/tema del viaje**, no global. | 1 |
| Identidad cromática | A+B | Africa: "savanna ivory" / "deep cocoa night", acento golden ochre. Basque: limestone cream + pine green + Basque red. → el tema debe ser **parametrizable por viaje/plantilla**. | 1 |
| Tipografía serif+sans | A+B | Cormorant Garamond (titulares) + DM Sans (cuerpo) vía `useGoogleFonts`. Headings serif es parte del carácter. | 1 |
| Contraste AA verificado | A | Acento ≥4.5:1 sobre blanco (light) y sobre `bgDarker` (dark). **Requisito, no nice-to-have** (ver estándar de a11y). | 1 |

## 2. Tema light/dark/auto

| Feature | Origen | Detalle a preservar | Fase |
|---|---|---|---|
| `useTheme` auto/light/dark | A+B | `{theme, resolvedTheme, setTheme, cycleTheme}`, persistido (`rta_theme`/`fbt_*`). `auto` usa `@media (prefers-color-scheme)`; forzado vía `documentElement.dataset.theme`. | 1 |
| **Anti-FOUC** | A | El `<style id="rta-theme-vars">` se inyecta en **module-load**, antes del primer render. Crítico: portarlo igual o habrá flash. | 1 |
| Toggle que cicla | A | `auto → light → dark → auto` desde la ActionsBar. | 1 |
| Componentes no leen el tema | A | Si necesitan el modo (p.ej. imagen distinta), llaman `useTheme().resolvedTheme`. | 1 |

## 3. Accesibilidad (obligatoria — ver engineering-standards §A11y)

| Feature | Origen | Detalle a preservar | Fase |
|---|---|---|---|
| Etiquetado de controles | A | `aria-label` o `<label>` ligado en **todo** control nuevo. | 1 |
| Estados ARIA | A | `aria-pressed` (toggles), `aria-selected` (tabs), `aria-expanded` (acordeones). | 1 |
| Focus ring visible | A | `onFocus/onBlur` con `shadows.ring` (`shadows.ringInverse` en superficies oscuras). | 1 |
| Navegación por teclado | A+B | Tabs, acordeones, steppers, drag-drop deben ser operables por teclado. | 1 |

## 4. Animaciones y microinteracciones

| Feature | Origen | Detalle a preservar | Fase |
|---|---|---|---|
| Indicador "💾 Guardado" | A+B | Parpadea ~1.6s al cambiar algo (`savedTick`). | 1 |
| Reset en dos pasos | A | Botón se vuelve rojo → "⚠️ ¿Seguro?" en 3s. **Sin `confirm()`.** | 1 |
| Undo de fecha inicio | A | Banner "↩ Deshacer" 5s tras cambiar la fecha. | 1 |
| Chevron de acordeón | A | `<details>/<summary>` con chevron ▾ que rota; `::-webkit-details-marker` oculto. | 1 |
| Badge de conteo en acordeones | A | Nº de ítems visible antes de abrir. | 1 |
| Polyline animada (ruta) | A | `pathLength` + `strokeDasharray` — **backlog, no implementado.** | 4+ |
| Fade-in al cambiar de fase | A | View Transitions API (solo Chromium, ~100ms) — **backlog.** | 4+ |

## 5. Responsive

| Feature | Origen | Detalle a preservar | Fase |
|---|---|---|---|
| `useResponsive` 3 breakpoints | A+B | `{isMobile, isTablet, isDesktop, width}`. Nunca comparar `window.innerWidth` a mano. | 1 |
| Grids adaptativas | A | 1 / auto-fit / 3 columnas; thumbnails 44/54/64 px. | 1 |
| Timeline en móvil | A | Segmentos <6% inutilizables → **backlog**: drag-to-resize o lista colapsable si `totalDays>200`. | 3+ |

## 6. Mapas

| Feature | Origen | Detalle a preservar | Fase |
|---|---|---|---|
| Mapa global de ruta | A | `RouteMap`: d3-geo + topojson + world-atlas (Natural Earth 110m), proyección `geoNaturalEarth1`. **Lazy-loaded** (code-split). | 3 |
| Mapa regional por fase | A | `PhaseRegionMap`: Leaflet + CARTO (Voyager light / Dark Matter dark). `fitExtent` automático. Lazy. | 3 |
| **Atribución obligatoria** | A | OSM + CARTO en el pie del mapa. No quitar (términos de uso). | 3 |
| **Touch en móvil** | A | Contenedor con `stopPropagation` en touchStart/Move/End + `touch-action:none` para que el pinch-zoom no dispare el swipe de fase. Gotcha real. | 3 |
| **ResizeObserver** | A | `invalidateSize()` al colapsar/expandir `<details>` que contiene el mapa. | 3 |
| ErrorBoundary en mapas | A | Envuelve el chunk lazy → mensaje + "Reintentar" si falla la carga. | 3 |
| Markers numerados + polyline | A | Ruta dibujada con orden; reactivo a la selección. | 3 |
| Routing real (días) | B | OSRM para rutas día-a-día; fallback a línea discontinua si falla el fetch. | 4+ |
| Regla Wikimedia 500px | A | **CRÍTICO:** anchos restringidos a whitelist desde 2025. Usar `500px` (o 960/1280/1920…). Otros (320/480/640/800/1024) → HTTP 400. | 1 |

## 7. Persistencia, compartir e impresión

| Feature | Origen | Detalle a preservar | Fase |
|---|---|---|---|
| `useLocalStorage` quota-safe | A+B | Prefijo por app. → en el genérico, **nestear por `tripId`** (lección del refactor). | 1 |
| Share por URL | A+B | `?s=base64` con preferencias/forks/días/extensiones/add-ons. **Las notas NO se comparten** (privadas). | 2 |
| Migraciones de estado | B | `appliedMigrations` para compatibilidad hacia atrás (p.ej. bump de fecha por defecto). | 2 |
| Modo impresión | A | `usePrintMode`: `@media print`, `data-print="hide"/"expand"`. `triggerPrint()` deja un tick para expandir acordeones, luego `window.print()`. | 3 |
| PrintView PDF completo | A | Tabla resumen + todas las fases activas, A4, page-breaks, color-preserve. | 3 |
| **Imágenes en print** | A | Hero/comida como `<img loading="eager">` directos (no dentro de `<button>`, que el CSS print oculta). Gotcha real. | 3 |

## 8. Integraciones externas

| Integración | Origen | Detalle a preservar | Fase |
|---|---|---|---|
| Wikimedia Commons (imágenes) | A | Hotlink, **500px** (ver §6). Esquiva la cláusula "no media" de Cloudflare. | 1 |
| YouTube nocookie (vídeos) | A | `PhaseVideo`: iframe **solo se monta al desplegar**, sin autoplay, 16:9, `data-print="hide"`. Degrada con gracia si el vídeo desaparece. | 4+ |
| CARTO raster tiles | A | Hot-linkable sin API key (tráfico bajo/medio). | 3 |
| Google Fonts | A+B | Inyección vía `useGoogleFonts`. | 1 |
| Cloudflare Worker + KV | B | `/api/state?trip=…`, sync 60s + on-focus, debounce 500ms, locks 3s. → evoluciona a Workers+D1. | 2/4 |

## 9. Sistemas de contenido (motor de planificación)

| Sistema | Origen | Detalle a preservar | Fase |
|---|---|---|---|
| Modelo de coste por tier | A | Días activos/descanso(×0.5)/voluntariado(×8€) + fijo·factor + add-ons; multiplicador viajeros. ✅ **ya en `engine` (spike).** | ✅1 |
| Forks (bifurcaciones) | A | 7 forks con opciones, default, `skip_*`, recs por budget×interés. ✅ **ya en `engine`/`schema`.** | ✅1 |
| Extensiones reordenables | A | `extensionGroup` en `sequence`. ✅ **resuelto en spike.** | ✅1 |
| Add-ons por fase | A | `{id,icon,label,desc,cost[tier],days?}`. En `schema` como `addons`. | 1 |
| Catálogo de especies | A | 71 especies: kind, activities, phases, favoritos (★), filtro "solo en mi viaje", tooltips de fechas. | 3 |
| Motor de estacionalidad | A | `seasonality.js` + `seasonFit(phaseId, range)`: optimal/avoid/events (migración ñus, ciclones, tortugas, gorilas, festivales…). `SeasonBanner`. | 3 |
| Checklist | A+B | Auto-items por fase + custom, deadlines con countdown, categorías, filtro persistido, progress bar. | 2 |
| Perfiles rápidos | A+B | Presets que fijan varias prefs de golpe. | 2 |
| Intereses | A | 6 (dive/safari/nature/culture/foodie/adventure) → fork recs. Backlog: filtrar checklist, destacar POIs, sugerir add-ons. | 2 |
| Conectores entre fases | A | `connectors["from->to"]={mode,cost,hours,label,alt}` (vuelos/ferries/overland con alternativas). | 3 |
| Extras derivados reactivos | A | `visaCosts`, `vaccineZones`, `derivedExtras` (visa/vacunas/vuelos según fases activas + país de salida). Chips "🤖 Auto". | 3 |
| TripSummary + SeasonTimeline | A | Panel resumen (países/días/UNESCO/coste/salud) + matriz 12-mes × fases. Lazy chunks. | 3 |
| Alertas + TripStatus | A | `computeTripAlerts` (seasonFit, exceso de días, vacunas, malaria), `AlertsPill`, tile de estado (faltan N días / día N / volvisteis). | 3 |
| Companions (acompañantes) | A | Vista META enorme: ventana compartida, vuelos, reparto safari/costa, presupuesto itemizado, mapa+itinerario propios. ⏳ **candidato a módulo opcional, no núcleo del schema.** | ⏳1 |
| Customizer por país (W. Africa) | A | Tagging por `country` en POIs/addons/secciones; filtros `locationsFor/addonsFor({countries})`. → patrón genérico de "sub-regiones de una fase". | 3 |

## 10. Colaboración multi-usuario (la mitad fuerte de Basque)

| Feature | Origen | Detalle a preservar | Fase |
|---|---|---|---|
| Roster + identidad | B | Picker de miembro al entrar (bloquea UI), persistido. → en el genérico: cuentas/invitados. | 4 |
| Votos por miembro | B | `votes: {activityId: [memberIds]}`, atribución, merge (los míos locales, los demás sobrescriben). | 4 |
| Comentarios por ítem | B | Thread por actividad/fase, uno por persona. | 4 |
| Presencia online | B | Last-seen por miembro (puntos verdes). | 4 |
| Log de actividad | B | Ring buffer últimos 50 eventos, sincronizado. | 4 |
| Modo simulación | B | Sandbox de cambios (base/itinerario) sin push; "Compartir" o "Descartar". Patrón muy útil. | 4 |
| Last-write-wins + locks | B | Timestamps por campo + lock 3s anti-concurrencia. | 4 |

## 11. Backlog explícito heredado (no perder)

- **Imágenes de comida duplicadas** (A): 11 IDs Unsplash en 90+ platos; reemplazar gradualmente por Wikimedia específicos. Imágenes `null`: `uganda.matoke`, `rwanda.isombe`.
- **Slides ≤2** en algunas fases (A): victoria/sodwana/etc. ampliar a 3+.
- **Fases saltadas poco descubribles** (A): señal visual sutil en TabsBar → badge "Restaurar"/tooltip.
- **Avisos clima/seguridad se pierden al scroll** (A): pin/sticky.
- **Calidad de datos a verificar antes de viajar** (A): Madagascar flights, Mara fees, Jordan Pass (no es código, es contenido).
- **PWA/offline** (A): `vite-plugin-pwa` — el contenido es estático, funcionaría casi al 100% tras el primer load.
- **Export CSV/texto del desglose de costes** (A).

---

> **Cómo usar este doc:** al cerrar cada fase, marca las filas portadas (✅) y
> mueve los gotchas a tests del estándar de calidad para que no puedan regresar.
