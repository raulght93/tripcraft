// Sequencer — agnóstico al viaje. Reemplaza el ACTIVE_PHASES de Africa
// (que cableaba el orden con seq.push(...) literal) por un recorrido genérico
// de trip.sequence + la elección de forks/extensiones del usuario.
import type { Trip, Fork } from "../../schema/src/types.ts";

export interface SequencerState {
  /** forkId → optionId elegido. Si falta, se usa el default del fork. */
  forkChoice?: Record<string, string>;
  /** phaseId de extensión → activa o no. */
  extensions?: Record<string, boolean>;
}

const isSkip = (optionId: string): boolean => optionId.startsWith("skip_");

export const resolveFork = (fork: Fork, state: SequencerState): string =>
  state.forkChoice?.[fork.id] ?? fork.default;

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
      if (!isSkip(opt)) out.push(opt);
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
 * Comprobación de integridad referencial del documento: cada opción de fork y
 * cada ref de la secuencia debe existir como phase (salvo "skip_*"). Devuelve la
 * lista de errores (vacía = OK). El builder de viajes lo usará para validar.
 */
export const validateReferences = (trip: Trip): string[] => {
  const errors: string[] = [];
  const phaseIds = new Set(trip.phases.map((p) => p.id));

  for (const fork of trip.forks) {
    for (const opt of fork.options) {
      if (!isSkip(opt) && !phaseIds.has(opt)) {
        errors.push(`fork "${fork.id}": opción "${opt}" no existe como phase`);
      }
    }
    if (!fork.options.includes(fork.default)) {
      errors.push(`fork "${fork.id}": default "${fork.default}" no está entre las options`);
    }
  }

  for (const item of trip.sequence) {
    if (item.kind === "fork" && !trip.forks.some((f) => f.id === item.ref)) {
      errors.push(`sequence: fork "${item.ref}" no existe`);
    }
    if (item.kind === "phase" && !isSkip(item.ref) && !phaseIds.has(item.ref)) {
      errors.push(`sequence: phase "${item.ref}" no existe`);
    }
    if (item.kind === "extensionGroup") {
      for (const id of item.members) {
        if (!phaseIds.has(id)) errors.push(`extensionGroup "${item.ref}": miembro "${id}" no existe`);
      }
    }
  }

  return errors;
};
