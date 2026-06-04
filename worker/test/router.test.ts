// API de "mis viajes" (router puro + storage en memoria). Sin wrangler ni D1.
import assert from "node:assert/strict";
import { test } from "node:test";
import { AFRICA_TRIP } from "../../trips/africa/src/index.js";
import { handleApi, ownerFromRequest } from "../src/router.ts";
import { type TripStorage, createMemoryStorage } from "../src/storage.ts";

type StoredLike = {
  id: string;
  ownerId: string;
  baseTemplateId?: string;
  slug: string;
  version: number;
  updatedAt: string;
  doc: { id: string; title: string };
};

const ctxFor = (storage: TripStorage, ownerId: string | null) => ({
  storage,
  ownerId,
  now: () => "2026-06-04T00:00:00Z",
  newId: () => "trip_test_1",
});

const req = (method: string, path: string, body?: unknown): Request =>
  new Request(`https://api.local${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

const readStored = async (res: Response) => (await res.json()) as StoredLike;

/** Crea un storage con un viaje (id trip_test_1, owner dev1) vía la propia API. */
const seeded = async (): Promise<TripStorage> => {
  const storage = createMemoryStorage();
  await handleApi(
    req("POST", "/api/trips", { baseTemplateId: "africa-2026", doc: AFRICA_TRIP }),
    ctxFor(storage, "dev1"),
  );
  return storage;
};

test("POST sin autenticación → 401", async () => {
  const res = await handleApi(
    req("POST", "/api/trips", { doc: AFRICA_TRIP }),
    ctxFor(createMemoryStorage(), null),
  );
  assert.equal(res.status, 401);
});

test("POST con owner crea un StoredTrip (clon de plantilla)", async () => {
  const res = await handleApi(
    req("POST", "/api/trips", { baseTemplateId: "africa-2026", doc: AFRICA_TRIP }),
    ctxFor(createMemoryStorage(), "dev1"),
  );
  assert.equal(res.status, 201);
  const stored = await readStored(res);
  assert.equal(stored.id, "trip_test_1");
  assert.equal(stored.ownerId, "dev1");
  assert.equal(stored.baseTemplateId, "africa-2026");
  assert.equal(stored.version, 1);
  assert.equal(stored.doc.id, "africa-2026");
});

test("POST con documento inválido → 400", async () => {
  const res = await handleApi(
    req("POST", "/api/trips", { doc: { not: "a trip" } }),
    ctxFor(createMemoryStorage(), "dev1"),
  );
  assert.equal(res.status, 400);
});

test("GET colección devuelve metadatos (sin el doc completo)", async () => {
  const res = await handleApi(req("GET", "/api/trips"), ctxFor(await seeded(), "dev1"));
  const list = (await res.json()) as Array<{ title: string; doc?: unknown }>;
  assert.equal(list.length, 1);
  assert.equal(list[0]?.title, AFRICA_TRIP.title);
  assert.equal(list[0]?.doc, undefined); // solo metadatos
});

test("GET item devuelve el StoredTrip completo", async () => {
  const res = await handleApi(req("GET", "/api/trips/trip_test_1"), ctxFor(await seeded(), "dev1"));
  const stored = await readStored(res);
  assert.equal(stored.doc.id, "africa-2026");
});

test("aislamiento por owner: otro usuario no ve el viaje → 404", async () => {
  const res = await handleApi(req("GET", "/api/trips/trip_test_1"), ctxFor(await seeded(), "dev2"));
  assert.equal(res.status, 404);
});

test("PUT incrementa la versión y actualiza updatedAt", async () => {
  const res = await handleApi(req("PUT", "/api/trips/trip_test_1", { doc: AFRICA_TRIP }), {
    ...ctxFor(await seeded(), "dev1"),
    now: () => "2026-06-05T00:00:00Z",
  });
  const updated = await readStored(res);
  assert.equal(updated.version, 2);
  assert.equal(updated.updatedAt, "2026-06-05T00:00:00Z");
});

test("DELETE elimina el viaje", async () => {
  const storage = await seeded();
  await handleApi(req("DELETE", "/api/trips/trip_test_1"), ctxFor(storage, "dev1"));
  const res = await handleApi(req("GET", "/api/trips/trip_test_1"), ctxFor(storage, "dev1"));
  assert.equal(res.status, 404);
});

test("OPTIONS responde preflight CORS (204)", async () => {
  const res = await handleApi(req("OPTIONS", "/api/trips"), ctxFor(createMemoryStorage(), null));
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

test("ownerFromRequest extrae el token Bearer", () => {
  assert.equal(
    ownerFromRequest(new Request("https://x", { headers: { authorization: "Bearer abc123" } })),
    "abc123",
  );
  assert.equal(ownerFromRequest(new Request("https://x")), null);
});
