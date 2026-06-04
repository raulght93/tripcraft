// Capa de fechas — agnóstica al viaje. Convierte (fecha de inicio + fases activas
// + días por fase) en tramos con fechas concretas. Generaliza el phaseDates de
// useTripState.js: secuencial, cada fase empieza donde acaba la anterior.
import type { Trip } from "@tripcraft/schema";
import { findPhase } from "./cost.ts";
import { addDaysISO } from "./dates.ts";

export interface ItineraryLeg {
  phaseId: string;
  startISO: string;
  endISO: string;
  days: number;
}

/**
 * Tramos datados de un itinerario.
 * @param daysByPhase override de días por fase; si falta, usa phase.daysBase.
 * Las fases de 0 días (saltos) producen un tramo degenerado (start === end, days 0).
 */
export const computeItinerary = (
  trip: Trip,
  startISO: string,
  activePhaseIds: string[],
  daysByPhase: Record<string, number> = {},
): ItineraryLeg[] => {
  const legs: ItineraryLeg[] = [];
  let cursor = startISO;
  for (const phaseId of activePhaseIds) {
    const phase = findPhase(trip, phaseId);
    const days = daysByPhase[phaseId] ?? phase?.daysBase ?? 0;
    if (days <= 0) {
      legs.push({ phaseId, startISO: cursor, endISO: cursor, days: 0 });
      continue;
    }
    const endISO = addDaysISO(cursor, days - 1);
    legs.push({ phaseId, startISO: cursor, endISO, days });
    cursor = addDaysISO(cursor, days);
  }
  return legs;
};

/** Índice por phaseId para lookups rápidos (p.ej. seasonFit por fase). */
export const itineraryByPhase = (legs: ItineraryLeg[]): Record<string, ItineraryLeg> =>
  Object.fromEntries(legs.map((l) => [l.phaseId, l]));
