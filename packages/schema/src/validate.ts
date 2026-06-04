// Validador runtime del Trip Schema con Valibot.
// (Artefacto: define el contrato + valida documentos de viaje en el límite —
//  carga de plantillas, import de usuario, respuestas del backend.)
//
// Requiere `valibot` instalado. No se ejecuta en el spike (que valida el modelo
// de datos y el engine, no la capa de validación). Una vez cableado el build,
// `Trip` de aquí y los tipos de types.ts deben converger (InferOutput ≡ Trip).
import * as v from "valibot";

const TierCostArray = v.pipe(v.array(v.number()), v.minLength(1));

export const PhaseSchema = v.object({
  id: v.string(),
  title: v.string(),
  country: v.optional(v.string()),
  flag: v.optional(v.string()),
  daysBase: v.number(),
  daysMin: v.number(),
  daysMax: v.number(),
  dailyCost: TierCostArray,
  fixedCost: TierCostArray,
  interests: v.optional(v.array(v.string())),
  hero: v.optional(v.string()),
  slides: v.optional(v.array(v.string())),
  climateWarning: v.optional(v.nullable(v.string())),
  safetyNote: v.optional(v.nullable(v.string())),
});

export const ForkSchema = v.object({
  id: v.string(),
  label: v.string(),
  icon: v.optional(v.string()),
  options: v.pipe(v.array(v.string()), v.minLength(1)),
  default: v.string(),
  omitWhenSelected: v.optional(v.array(v.string())),
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
  cost: TierCostArray,
  days: v.optional(v.number()),
});

export const TripSchema = v.object({
  id: v.string(),
  slug: v.string(),
  version: v.number(),
  title: v.string(),
  lang: v.string(),
  currency: v.string(),
  tiers: v.pipe(v.array(v.string()), v.minLength(1)),
  meta: v.object({
    dateWindowDefault: v.optional(
      v.object({ start: v.string(), targetEnd: v.optional(v.string()) }),
    ),
    travelersDefault: v.optional(v.number()),
    costMultiplierRule: v.optional(
      v.object({ type: v.string(), factorBy: v.record(v.string(), v.number()) }),
    ),
  }),
  phases: v.array(PhaseSchema),
  forks: v.array(ForkSchema),
  sequence: v.array(SequenceItemSchema),
  addons: v.optional(v.record(v.string(), v.array(AddonSchema))),
});

/** Tipo derivado del validador — debe ser estructuralmente equivalente a types.Trip. */
export type ValidatedTrip = v.InferOutput<typeof TripSchema>;

/** Lanza en caso de viaje inválido. Úsalo en el límite de confianza. */
export function validateTrip(data: unknown): ValidatedTrip {
  return v.parse(TripSchema, data);
}

/** Variante que no lanza: { success, output | issues }. */
export function safeValidateTrip(data: unknown) {
  return v.safeParse(TripSchema, data);
}
