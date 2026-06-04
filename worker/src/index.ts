// Cloudflare Worker: API de "mis viajes" (Fase 2). Solo cableado — toda la lógica
// vive en router.ts (pura) y storage.ts (adaptadores). El runtime de CF aporta
// `crypto` global y el binding D1 `env.DB`.
import { handleApi, ownerFromRequest } from "./router.ts";
import { type D1Like, createD1Storage } from "./storage.ts";

interface Env {
  DB: D1Like;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleApi(request, {
      storage: createD1Storage(env.DB),
      ownerId: ownerFromRequest(request),
      now: () => new Date().toISOString(),
      newId: () => crypto.randomUUID(),
    });
  },
};
