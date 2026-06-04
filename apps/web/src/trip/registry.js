// Catálogo de plantillas: slug → thunk que carga el documento del viaje.
//
// Hoy cada thunk hace un import DINÁMICO → Vite lo separa en su propio chunk, así
// que el contenido del viaje NO entra en el bundle principal (clave a medida que
// crece). En Fase 2 el thunk pasará a `fetch('/api/trips/<slug>')` sin tocar nada
// más: loadTrip mantiene el mismo contrato async + validación en la frontera.

export const TRIP_REGISTRY = {
  "africa-oriental-austral": () => import("@tripcraft/trip-africa").then((m) => m.AFRICA_TRIP),
};

export const DEFAULT_TRIP_SLUG = "africa-oriental-austral";

export const TEMPLATE_LIST = Object.keys(TRIP_REGISTRY);
