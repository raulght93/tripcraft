// Motor de coste — agnóstico al viaje. Lee del documento Trip (no de constantes
// de módulo). Réplica fiel de la fórmula de utils/costs.js de Africa, pero el
// multiplicador por viajeros sale de trip.meta.costMultiplierRule (des-hardcodea
// el 1.7×) y el coste por tier se lee KEYED por clave (des-hardcodea low/mid/high
// y elimina la clase de bug de índices/longitudes).
import type { Phase, Trip } from "@tripcraft/schema";

/**
 * Coste de un tier dado. Devuelve 0 si la fase no declara ese tier; esto es una
 * red de seguridad — el guardián real es validateReferences (sequencer.ts), que
 * exige una entrada por cada tier de trip.tiers antes de persistir el viaje.
 */
const tierCost = (byTier: Record<string, number>, tier: string): number => byTier[tier] ?? 0;

export const findPhase = (trip: Trip, phaseId: string): Phase | undefined =>
  trip.phases.find((p) => p.id === phaseId);

export interface CostOpts {
  restDays?: number;
  volunteerDays?: number;
  addons?: string[];
}

/**
 * Coste de una fase = activeDays·daily + restDays·daily·0.5 + volunteerDays·8 +
 * fixed·factor (factor: 1 si hay activos/descanso, 0.5 si solo voluntariado, 0 si nada)
 * + suma de add-ons seleccionados.
 */
export const phaseCost = (
  trip: Trip,
  phaseId: string,
  activeDays: number,
  tier: string,
  opts: CostOpts = {},
): number => {
  const m = findPhase(trip, phaseId);
  if (!m) return 0;
  const daily = tierCost(m.dailyCost, tier);
  const fixed = tierCost(m.fixedCost, tier);
  const rest = opts.restDays ?? 0;
  const volunteer = opts.volunteerDays ?? 0;

  let fixedFactor: number;
  if (activeDays + rest > 0) fixedFactor = 1;
  else if (volunteer > 0) fixedFactor = 0.5;
  else fixedFactor = 0;

  const base = activeDays * daily + rest * daily * 0.5 + volunteer * 8 + fixed * fixedFactor;
  return base + addonsCostFor(trip, phaseId, opts.addons, tier);
};

export const addonsCostFor = (
  trip: Trip,
  phaseId: string,
  selected: string[] | undefined,
  tier: string,
): number => {
  if (!selected || selected.length === 0) return 0;
  const list = trip.addons?.[phaseId];
  if (!list) return 0;
  const ids = new Set(selected);
  let total = 0;
  for (const a of list) if (ids.has(a.id)) total += tierCost(a.cost, tier);
  return total;
};

export const addonsDaysFor = (
  trip: Trip,
  phaseId: string,
  selected: string[] | undefined,
): number => {
  if (!selected || selected.length === 0) return 0;
  const list = trip.addons?.[phaseId];
  if (!list) return 0;
  const ids = new Set(selected);
  let total = 0;
  for (const a of list) if (ids.has(a.id)) total += a.days ?? 0;
  return total;
};

export interface TripTotals {
  totalDays: number;
  /** Coste total por persona sumando las fases activas (días activos por fase). */
  perPerson: number;
}

/** Totales del viaje: días y coste por persona sobre las fases activas. */
export const tripTotals = (
  trip: Trip,
  activePhaseIds: string[],
  tier: string,
  daysByPhase: Record<string, number> = {},
): TripTotals => {
  let totalDays = 0;
  let perPerson = 0;
  for (const id of activePhaseIds) {
    const phase = findPhase(trip, id);
    const days = daysByPhase[id] ?? phase?.daysBase ?? 0;
    totalDays += days;
    perPerson += phaseCost(trip, id, days, tier);
  }
  return { totalDays, perPerson };
};

/**
 * Aplica el multiplicador por nº de viajeros definido en el viaje.
 *
 * ⚠️ Comportamiento del fallback (issue #9 de la review): si `factorBy` no lista
 * el tamaño de grupo, se asume escalado lineal ×N. Africa aplicaba 1.7× a CUALQUIER
 * grupo ≥2 (probablemente un bug); aquí el dato manda — para soportar 3+ viajeros,
 * añade su factor a `factorBy`. Cubierto por test explícito.
 */
export const applyTravelersMultiplier = (
  trip: Trip,
  perPersonCost: number,
  travelers: number,
): number => {
  const factor = trip.meta.costMultiplierRule?.factorBy[String(travelers)];
  if (factor == null) {
    return travelers <= 1 ? perPersonCost : Math.round(perPersonCost * travelers);
  }
  return Math.round(perPersonCost * factor);
};
