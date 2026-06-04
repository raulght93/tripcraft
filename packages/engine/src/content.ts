// Accesores de contenido por fase — agnósticos al viaje.
import type { Addon, Poi, Trip } from "@tripcraft/schema";

export const poisFor = (trip: Trip, phaseId: string): Poi[] => trip.pois?.[phaseId] ?? [];

export const addonsFor = (trip: Trip, phaseId: string): Addon[] => trip.addons?.[phaseId] ?? [];
