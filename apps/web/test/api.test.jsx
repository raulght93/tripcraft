import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { myTrips, saveTrip } from "../src/trip/api.js";

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "https://api.test");
  try {
    localStorage.clear();
  } catch {
    /* noop */
  }
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test("saveTrip hace POST con auth Bearer y el body esperado", async () => {
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ id: "t1", version: 1 }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchMock);

  const out = await saveTrip({
    baseTemplateId: "africa-2026",
    doc: { x: 1 },
    state: { tier: "mid" },
  });
  expect(out.id).toBe("t1");

  const [url, opts] = fetchMock.mock.calls[0];
  expect(url).toBe("https://api.test/api/trips");
  expect(opts.method).toBe("POST");
  expect(opts.headers.authorization).toMatch(/^Bearer .+/);
  const body = JSON.parse(opts.body);
  expect(body.baseTemplateId).toBe("africa-2026");
  expect(body.state.tier).toBe("mid");
});

test("myTrips lanza cuando la respuesta no es ok", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("error", { status: 500 })),
  );
  await expect(myTrips()).rejects.toThrow();
});
