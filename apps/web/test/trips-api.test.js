import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getOwnerToken, listTrips } from "../src/api/trips.js";

describe("trips API client", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  afterEach(() => vi.restoreAllMocks());

  it("genera y persiste un token de propietario", () => {
    const a = getOwnerToken();
    const b = getOwnerToken();
    expect(a).toBeTruthy();
    expect(a).toBe(b); // estable entre llamadas
    expect(localStorage.getItem("tc_owner_token")).toBe(a);
  });

  it("listTrips envía el header Authorization: Bearer", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ id: "1", slug: "x", version: 1, updatedAt: "t", title: "X" }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const out = await listTrips();
    expect(out).toHaveLength(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/trips$/);
    expect(opts.headers.authorization).toMatch(/^Bearer .+/);
  });

  it("propaga el mensaje de error del backend en respuestas no-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: "autenticación requerida" }),
      }),
    );
    await expect(listTrips()).rejects.toThrow("autenticación requerida");
  });
});
