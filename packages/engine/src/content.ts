// Accesores de contenido por fase — agnósticos al viaje.
import type { Addon, Poi, Species, Trip } from "@tripcraft/schema";

export const poisFor = (trip: Trip, phaseId: string): Poi[] => trip.pois?.[phaseId] ?? [];

export const addonsFor = (trip: Trip, phaseId: string): Addon[] => trip.addons?.[phaseId] ?? [];

/** Especies avistables en una fase (las que la listan en `phases`). */
export const speciesForPhase = (trip: Trip, phaseId: string): Species[] =>
  (trip.species ?? []).filter((s) => s.phases.includes(phaseId));
