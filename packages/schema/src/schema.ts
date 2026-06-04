// Trip Schema — FUENTE ÚNICA. Los validadores Valibot definen la forma; los tipos
// se DERIVAN con InferOutput (no hay interfaces duplicadas). El engine importa solo
// los `type` (Valibot se borra en runtime, así que el motor no depende de él).
//
// Modelo de coste: KEYED por tier ({ low, mid, high }), no array posicional —
// autodocumentado y robusto a reordenar `tiers`. La regla "toda fase tiene una
// entrada por cada tier" es cross-field → la valida el engine (validateReferences).
//
// Modelo de país: código ISO 3166-1 alpha-2 (o array para multi-país). La bandera
// y el nombre legible se DERIVAN del ISO (no se almacenan). `flag` queda como
// override manual sólo para transiciones/saltos que no son un país.
import * as v from "valibot";

const IsoCode = v.pipe(v.string(), v.regex(/^[A-Z]{2}$/, "código ISO 3166-1 alpha-2 (p.ej. KE)"));
const Country = v.union([IsoCode, v.array(IsoCode)]);

/** Coste por tier: { [tierId]: € }. La cobertura de todos los tiers la valida el engine. */
const TierCost = v.record(v.string(), v.number());

export const PhaseSchema = v.object({
  id: v.string(),
  title: v.string(),
  country: v.optional(Country),
  /** Override manual de bandera/icono (transiciones sin país). Normalmente se deriva del ISO. */
  flag: v.optional(v.string()),
  daysBase: v.number(),
  daysMin: v.number(),
  daysMax: v.number(),
  dailyCost: TierCost,
  fixedCost: TierCost,
  interests: v.optional(v.array(v.string())),
  hero: v.optional(v.string()),
  slides: v.optional(v.array(v.string())),
  /** Datos prácticos autodescriptivos (label→value), p.ej. Visado / Moneda / Enchufe. */
  info: v.optional(v.array(v.object({ label: v.string(), value: v.string() }))),
  /** Platos típicos de la fase. */
  food: v.optional(
    v.array(
      v.object({
        name: v.string(),
        desc: v.optional(v.string()),
        price: v.optional(v.string()),
        img: v.optional(v.string()),
        veg: v.optional(v.boolean()),
      }),
    ),
  ),
  climateWarning: v.optional(v.nullable(v.string())),
  safetyNote: v.optional(v.nullable(v.string())),
});

export const ForkSchema = v.object({
  id: v.string(),
  label: v.string(),
  icon: v.optional(v.string()),
  options: v.pipe(v.array(v.string()), v.minLength(1)),
  default: v.string(),
  /** Opciones que, al elegirse, no añaden nada a la ruta (p.ej. skip_uganda). */
  omitWhenSelected: v.optional(v.array(v.string())),
  /** budget → interest → optionId. */
  recs: v.optional(v.record(v.string(), v.record(v.string(), v.string()))),
});

export const SequenceItemSchema = v.variant("kind", [
  v.object({ kind: v.literal("phase"), ref: v.string(), optional: v.optional(v.boolean()) }),
  v.object({ kind: v.literal("fork"), ref: v.string(), optional: v.optional(v.boolean()) }),
  v.object({
    kind: v.literal("extensionGroup"),
    ref: v.string(),
    members: v.array(v.string()),
    reorderable: v.optional(v.boolean()),
  }),
]);

export const AddonSchema = v.object({
  id: v.string(),
  icon: v.optional(v.string()),
  label: v.string(),
  desc: v.optional(v.string()),
  cost: TierCost,
  days: v.optional(v.number()),
});

export const SeasonEventSchema = v.object({
  name: v.string(),
  /** Meses (1-12) en que ocurre (evento recurrente "ancho"). */
  months: v.optional(v.array(v.number())),
  /** Ventana MM-DD concreta (festival con fecha). Alternativa a `months`. */
  dates: v.optional(v.object({ start: v.string(), end: v.string() })),
  peak: v.optional(v.array(v.number())),
  kind: v.optional(v.string()),
  desc: v.optional(v.string()),
});

export const PhaseSeasonalitySchema = v.object({
  /** Meses (1-12) óptimos para visitar la fase. */
  optimal: v.array(v.number()),
  avoid: v.optional(v.nullable(v.object({ months: v.array(v.number()), reason: v.string() }))),
  events: v.optional(v.array(SeasonEventSchema)),
});

export const PoiSchema = v.object({
  name: v.string(),
  lat: v.number(),
  lng: v.number(),
  /** "city"|"beach"|"park"|"dive"|"ruin"|"island"|"lodge"|"viewpoint"|"town"|"airport" */
  type: v.string(),
  desc: v.optional(v.string()),
  img: v.optional(v.string()),
});

export const SpeciesSchema = v.object({
  id: v.string(),
  name: v.string(),
  scientific: v.optional(v.string()),
  /** "mammal"|"primate"|"bird"|"marine"|"reptile"|"plant"|"gorilla" */
  kind: v.string(),
  img: v.optional(v.string()),
  desc: v.optional(v.string()),
  /** phaseIds donde se puede ver. */
  phases: v.array(v.string()),
  /** "safari"|"snorkel"|"diving"|"boat"|"trekking"|"birding" */
  activities: v.optional(v.array(v.string())),
});

export const CostMultiplierRuleSchema = v.object({
  type: v.string(),
  /** nº de viajeros (string) → factor sobre el subtotal por persona. */
  factorBy: v.record(v.string(), v.number()),
});

export const TripSchema = v.object({
  id: v.string(),
  slug: v.string(),
  version: v.number(),
  title: v.string(),
  lang: v.string(),
  currency: v.string(),
  /** Orden y conjunto de tiers; las claves de dailyCost/fixedCost/cost deben cubrirlos. */
  tiers: v.pipe(v.array(v.string()), v.minLength(1)),
  meta: v.object({
    dateWindowDefault: v.optional(
      v.object({ start: v.string(), targetEnd: v.optional(v.string()) }),
    ),
    travelersDefault: v.optional(v.number()),
    costMultiplierRule: v.optional(CostMultiplierRuleSchema),
  }),
  phases: v.array(PhaseSchema),
  forks: v.array(ForkSchema),
  sequence: v.array(SequenceItemSchema),
  addons: v.optional(v.record(v.string(), v.array(AddonSchema))),
  seasonality: v.optional(v.record(v.string(), PhaseSeasonalitySchema)),
  pois: v.optional(v.record(v.string(), v.array(PoiSchema))),
  species: v.optional(v.array(SpeciesSchema)),
});

/**
 * Envelope de persistencia (contrato del backend, Fase 2). Un viaje almacenado =
 * el documento `doc` (validado) + metadatos. Modelo de storage: **documento JSON
 * único** (un blob por viaje en D1/KV), no normalizado. `baseTemplateId` enlaza un
 * clon con la plantilla de la que salió; `ownerId` ausente = plantilla del catálogo.
 */
export const StoredTripSchema = v.object({
  id: v.string(),
  slug: v.string(),
  ownerId: v.optional(v.string()),
  baseTemplateId: v.optional(v.string()),
  version: v.number(),
  updatedAt: v.string(),
  doc: TripSchema,
});

// ── Tipos derivados (fuente única) ────────────────────────────────────────────
export type Trip = v.InferOutput<typeof TripSchema>;
export type StoredTrip = v.InferOutput<typeof StoredTripSchema>;
export type Phase = v.InferOutput<typeof PhaseSchema>;
export type Fork = v.InferOutput<typeof ForkSchema>;
export type SequenceItem = v.InferOutput<typeof SequenceItemSchema>;
export type Addon = v.InferOutput<typeof AddonSchema>;
export type CostMultiplierRule = v.InferOutput<typeof CostMultiplierRuleSchema>;
export type PhaseSeasonality = v.InferOutput<typeof PhaseSeasonalitySchema>;
export type SeasonEvent = v.InferOutput<typeof SeasonEventSchema>;
export type Poi = v.InferOutput<typeof PoiSchema>;
export type Species = v.InferOutput<typeof SpeciesSchema>;
export type ForkRecs = NonNullable<Fork["recs"]>;
export type Country = v.InferOutput<typeof Country>;

// ── Validación en la frontera de confianza ────────────────────────────────────
/** Lanza si el viaje es inválido. Úsalo al cargar plantillas / import / respuestas del backend. */
export function validateTrip(data: unknown): Trip {
  return v.parse(TripSchema, data);
}

/** Variante que no lanza: { success, output | issues }. */
export function safeValidateTrip(data: unknown) {
  return v.safeParse(TripSchema, data);
}

/** Valida un viaje almacenado (envelope + doc). Úsalo al leer/escribir en el backend. */
export function validateStoredTrip(data: unknown): StoredTrip {
  return v.parse(StoredTripSchema, data);
}
