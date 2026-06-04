// Motor de coste — agnóstico al viaje. Lee del documento Trip (no de constantes
// de módulo). Réplica fiel de la fórmula de utils/costs.js de Africa, pero el
// multiplicador por viajeros sale de trip.meta.costMultiplierRule (des-hardcodea
// el 1.7×) y el índice de tier sale de trip.tiers (des-hardcodea low/mid/high).
import type { Trip, Phase } from "../../schema/src/types.ts";

const tierIndex = (trip: Trip, tier: string): number => {
  const i = trip.tiers.indexOf(tier);
  return i === -1 ? 0 : i;
};

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
  const ti = tierIndex(trip, tier);
  const rest = opts.restDays ?? 0;
  const volunteer = opts.volunteerDays ?? 0;

  let fixedFactor: number;
  if (activeDays + rest > 0) fixedFactor = 1;
  else if (volunteer > 0) fixedFactor = 0.5;
  else fixedFactor = 0;

  const base =
    activeDays * m.dailyCost[ti] +
    rest * m.dailyCost[ti] * 0.5 +
    volunteer * 8 +
    m.fixedCost[ti] * fixedFactor;

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
  const ti = tierIndex(trip, tier);
  const ids = new Set(selected);
  let total = 0;
  for (const a of list) if (ids.has(a.id)) total += a.cost[ti];
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

/** Aplica el multiplicador por nº de viajeros definido en el viaje. */
export const applyTravelersMultiplier = (
  trip: Trip,
  perPersonCost: number,
  travelers: number,
): number => {
  const rule = trip.meta.costMultiplierRule;
  const factor = rule?.factorBy[String(travelers)];
  if (factor == null) {
    return travelers <= 1 ? perPersonCost : Math.round(perPersonCost * travelers);
  }
  return Math.round(perPersonCost * factor);
};
