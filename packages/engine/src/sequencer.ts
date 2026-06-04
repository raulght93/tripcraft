// Sequencer — agnóstico al viaje. Reemplaza el ACTIVE_PHASES de Africa
// (que cableaba el orden con seq.push(...) literal) por un recorrido genérico
// de trip.sequence + la elección de forks/extensiones del usuario.
import type { Fork, Trip } from "@tripcraft/schema";

export interface SequencerState {
  /** forkId → optionId elegido. Si falta, se usa el default del fork. */
  forkChoice?: Record<string, string>;
  /** phaseId de extensión → activa o no. */
  extensions?: Record<string, boolean>;
}

export const resolveFork = (fork: Fork, state: SequencerState): string =>
  state.forkChoice?.[fork.id] ?? fork.default;

/** ¿La opción elegida no aporta nada a la ruta? (p.ej. skip_uganda). */
const isOmitted = (fork: Fork, optionId: string): boolean =>
  fork.omitWhenSelected?.includes(optionId) ?? false;

/** Lista ordenada de phaseIds activos para una elección dada. */
export const buildActivePhaseIds = (trip: Trip, state: SequencerState = {}): string[] => {
  const out: string[] = [];
  for (const item of trip.sequence) {
    if (item.kind === "phase") {
      out.push(item.ref);
    } else if (item.kind === "fork") {
      const fork = trip.forks.find((f) => f.id === item.ref);
      if (!fork) continue;
      const opt = resolveFork(fork, state);
      if (!isOmitted(fork, opt)) out.push(opt);
    } else {
      // extensionGroup
      for (const id of item.members) {
        if (state.extensions?.[id]) out.push(id);
      }
    }
  }
  return out;
};

/** Recomienda una opción de fork según presupuesto + interés (ex data/forkRecs.js). */
export const recommendForFork = (fork: Fork, budget: string, interest: string): string => {
  const byBudget = fork.recs?.[budget];
  if (!byBudget) return fork.default;
  return byBudget[interest] ?? byBudget.default ?? fork.default;
};

/**
 * Comprobación de integridad referencial del documento. TODA opción de fork, ref
 * de secuencia, miembro de extensión y valor de recs debe existir como phase /
 * opción válida. Devuelve la lista de errores (vacía = OK). El builder de viajes
 * lo usará para validar antes de persistir.
 */
export const validateReferences = (trip: Trip): string[] => {
  const errors: string[] = [];
  const phaseIds = new Set(trip.phases.map((p) => p.id));

  // Cross-field: toda fase debe declarar un coste para CADA tier del viaje. Sin
  // esto, un coste mal formado produciría NaN silencioso en phaseCost.
  for (const phase of trip.phases) {
    for (const tier of trip.tiers) {
      if (typeof phase.dailyCost[tier] !== "number") {
        errors.push(`phase "${phase.id}": falta dailyCost["${tier}"]`);
      }
      if (typeof phase.fixedCost[tier] !== "number") {
        errors.push(`phase "${phase.id}": falta fixedCost["${tier}"]`);
      }
    }
  }
  for (const [phaseId, list] of Object.entries(trip.addons ?? {})) {
    for (const addon of list) {
      for (const tier of trip.tiers) {
        if (typeof addon.cost[tier] !== "number") {
          errors.push(`addon "${phaseId}/${addon.id}": falta cost["${tier}"]`);
        }
      }
    }
  }

  for (const fork of trip.forks) {
    const optionSet = new Set(fork.options);
    for (const opt of fork.options) {
      if (!phaseIds.has(opt)) {
        errors.push(`fork "${fork.id}": opción "${opt}" no existe como phase`);
      }
    }
    if (!optionSet.has(fork.default)) {
      errors.push(`fork "${fork.id}": default "${fork.default}" no está entre las options`);
    }
    for (const omitted of fork.omitWhenSelected ?? []) {
      if (!optionSet.has(omitted)) {
        errors.push(`fork "${fork.id}": omitWhenSelected "${omitted}" no está entre las options`);
      }
    }
    // Los valores recomendados deben ser opciones válidas del propio fork.
    for (const [budget, byInterest] of Object.entries(fork.recs ?? {})) {
      for (const [interest, optId] of Object.entries(byInterest)) {
        if (!optionSet.has(optId)) {
          errors.push(
            `fork "${fork.id}": recs[${budget}][${interest}] = "${optId}" no es una opción`,
          );
        }
      }
    }
  }

  for (const item of trip.sequence) {
    if (item.kind === "fork" && !trip.forks.some((f) => f.id === item.ref)) {
      errors.push(`sequence: fork "${item.ref}" no existe`);
    }
    if (item.kind === "phase" && !phaseIds.has(item.ref)) {
      errors.push(`sequence: phase "${item.ref}" no existe`);
    }
    if (item.kind === "extensionGroup") {
      for (const id of item.members) {
        if (!phaseIds.has(id))
          errors.push(`extensionGroup "${item.ref}": miembro "${id}" no existe`);
      }
    }
  }

  return errors;
};
