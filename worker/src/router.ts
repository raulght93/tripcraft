// Router HTTP puro de la API de "mis viajes". No conoce D1 ni el runtime de CF:
// recibe el Request + un contexto (storage, reloj, generador de id, ownerId ya
// resuelto) y devuelve un Response. Testeable con storage en memoria.
import { validateStoredTrip, validateTrip } from "@tripcraft/schema";
import type { TripStorage } from "./storage.ts";

export interface RouterCtx {
  storage: TripStorage;
  /** owner resuelto del token; null = sin autenticar. */
  ownerId: string | null;
  now: () => string;
  newId: () => string;
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "authorization,content-type",
};

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...CORS },
  });

const safeJson = async (req: Request): Promise<Record<string, unknown> | null> => {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
};

// Vista ligera para listar sin volcar el documento entero.
const metaOf = (t: {
  id: string;
  slug: string;
  version: number;
  updatedAt: string;
  doc: { title: string };
}) => ({ id: t.id, slug: t.slug, version: t.version, updatedAt: t.updatedAt, title: t.doc.title });

export async function handleApi(request: Request, ctx: RouterCtx): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  const { pathname } = new URL(request.url);
  const parts = pathname.replace(/^\/+|\/+$/g, "").split("/");
  if (parts[0] !== "api" || parts[1] !== "trips") return json({ error: "no encontrado" }, 404);
  const id = parts[2];

  const { storage, ownerId } = ctx;
  if (!ownerId) return json({ error: "autenticación requerida" }, 401);

  // ── Colección ──
  if (!id) {
    if (request.method === "GET") {
      const list = await storage.list(ownerId);
      return json(list.map(metaOf));
    }
    if (request.method === "POST") {
      const body = await safeJson(request);
      if (!body) return json({ error: "JSON inválido" }, 400);
      let doc: ReturnType<typeof validateTrip>;
      try {
        doc = validateTrip(body.doc);
      } catch {
        return json({ error: "documento de viaje inválido" }, 400);
      }
      const stored = {
        id: ctx.newId(),
        slug: doc.slug,
        ownerId,
        baseTemplateId: typeof body.baseTemplateId === "string" ? body.baseTemplateId : undefined,
        version: 1,
        updatedAt: ctx.now(),
        doc,
        state: body.state,
      };
      let valid: ReturnType<typeof validateStoredTrip>;
      try {
        valid = validateStoredTrip(stored);
      } catch {
        return json({ error: "viaje inválido" }, 400);
      }
      await storage.put(valid);
      return json(valid, 201);
    }
    return json({ error: "método no permitido" }, 405);
  }

  // ── Item (propiedad comprobada) ──
  const existing = await storage.get(id);
  if (!existing || existing.ownerId !== ownerId) return json({ error: "no encontrado" }, 404);

  if (request.method === "GET") return json(existing);

  if (request.method === "PUT") {
    const body = await safeJson(request);
    if (!body) return json({ error: "JSON inválido" }, 400);
    let doc: ReturnType<typeof validateTrip>;
    try {
      doc = validateTrip(body.doc);
    } catch {
      return json({ error: "documento de viaje inválido" }, 400);
    }
    const updated = {
      ...existing,
      slug: doc.slug,
      version: existing.version + 1,
      updatedAt: ctx.now(),
      doc,
      state: body.state ?? existing.state,
    };
    let valid: ReturnType<typeof validateStoredTrip>;
    try {
      valid = validateStoredTrip(updated);
    } catch {
      return json({ error: "viaje inválido" }, 400);
    }
    await storage.put(valid);
    return json(valid);
  }

  if (request.method === "DELETE") {
    await storage.remove(id);
    return json({ ok: true });
  }

  return json({ error: "método no permitido" }, 405);
}

/** Resuelve el owner desde el token de dispositivo (Authorization: Bearer …). MVP. */
export const ownerFromRequest = (request: Request): string | null => {
  const auth = request.headers.get("authorization") ?? "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() ?? null;
};
