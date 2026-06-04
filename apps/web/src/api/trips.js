// Cliente del Worker de "mis viajes" (Fase 2). Habla con el contrato de
// worker/src/router.ts: rutas bajo /api/trips, auth por `Authorization: Bearer`.
//
// La base se puede sobrescribir con VITE_API_URL (Pages → Settings → Env vars);
// por defecto apunta al Worker de producción.
import { validateStoredTrip } from "@tripcraft/schema";

export const API_URL =
  import.meta.env.VITE_API_URL || "https://tripcraft-api.raulght93.workers.dev";

const TOKEN_KEY = "tc_owner_token";

// Token de propietario anónimo: sin login todavía, identificamos al dueño con un
// token aleatorio persistido en el navegador. Cuando exista auth real, este helper
// es el único punto a sustituir.
export function getOwnerToken() {
  try {
    let t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      t = crypto.randomUUID();
      localStorage.setItem(TOKEN_KEY, t);
    }
    return t;
  } catch {
    return "anon"; // localStorage no disponible (SSR/incógnito): degradado
  }
}

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token ?? getOwnerToken()}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error || `API ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

/** GET /api/trips → metadatos de los viajes del propietario. */
export const listTrips = () => api("/api/trips");

/** GET /api/trips/:id → StoredTrip completo y validado. */
export async function getTrip(id) {
  return validateStoredTrip(await api(`/api/trips/${id}`));
}

/** POST /api/trips → crea un viaje a partir de un doc (clona una plantilla). */
export async function createTrip(doc, baseTemplateId) {
  return validateStoredTrip(
    await api("/api/trips", { method: "POST", body: { doc, baseTemplateId } }),
  );
}

/** PUT /api/trips/:id → actualiza el doc (incrementa versión). */
export async function updateTrip(id, doc) {
  return validateStoredTrip(await api(`/api/trips/${id}`, { method: "PUT", body: { doc } }));
}

/** DELETE /api/trips/:id → elimina el viaje. */
export const deleteTrip = (id) => api(`/api/trips/${id}`, { method: "DELETE" });
