import { validateTrip } from "@tripcraft/schema";
import { TRIP_REGISTRY } from "./registry.js";

/**
 * Carga un viaje por slug y lo valida en la frontera (sea cual sea el origen:
 * import dinámico hoy, API del backend en Fase 2). Devuelve un Trip de fiar.
 */
export async function loadTrip(slug) {
  const thunk = TRIP_REGISTRY[slug];
  if (!thunk) throw new Error(`Trip desconocido: ${slug}`);
  const raw = await thunk();
  return validateTrip(raw);
}
