// Cliente de la API de "mis viajes" (worker Fase 2). Auth ligera: un token de
// dispositivo anónimo persistido en localStorage (cero fricción; "reclama tu cuenta"
// con email queda para más adelante). La base sale de VITE_API_URL (el Worker vive
// en otro dominio que el de Pages → CORS ya abierto en el worker).

const TOKEN_KEY = "tc_device";

export function deviceToken() {
  try {
    let t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      t = crypto.randomUUID();
      localStorage.setItem(TOKEN_KEY, t);
    }
    return t;
  } catch {
    return "anon";
  }
}

const base = () => (import.meta.env?.VITE_API_URL ?? "").replace(/\/$/, "");

/** ¿Hay backend configurado? Si no, la UI esconde las funciones de guardado. */
export const apiEnabled = () => Boolean(import.meta.env?.VITE_API_URL);

async function req(method, path, body) {
  const res = await fetch(`${base()}${path}`, {
    method,
    headers: { "content-type": "application/json", authorization: `Bearer ${deviceToken()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export const myTrips = () => req("GET", "/api/trips");
export const getMyTrip = (id) => req("GET", `/api/trips/${encodeURIComponent(id)}`);
export const saveTrip = ({ baseTemplateId, doc, state }) =>
  req("POST", "/api/trips", { baseTemplateId, doc, state });
export const updateTrip = (id, { doc, state }) =>
  req("PUT", `/api/trips/${encodeURIComponent(id)}`, { doc, state });
export const deleteTrip = (id) => req("DELETE", `/api/trips/${encodeURIComponent(id)}`);
