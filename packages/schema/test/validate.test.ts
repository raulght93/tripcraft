import assert from "node:assert/strict";
// Validación del Trip Schema en la frontera (§6.2 de la review). Ejercita Valibot:
// la plantilla real valida, y los documentos mal formados se rechazan.
import { test } from "node:test";
import { AFRICA_TRIP } from "../../../trips/africa/src/index.js";
import { safeValidateTrip, validateTrip } from "../src/index.ts";

test("AFRICA_TRIP es un Trip válido", () => {
  const trip = validateTrip(AFRICA_TRIP);
  assert.equal(trip.id, "africa-2026");
  assert.equal(trip.phases.length, AFRICA_TRIP.phases.length);
  assert.equal(trip.forks.length, 7);
});

test("rechaza un viaje sin tiers", () => {
  assert.equal(safeValidateTrip({ ...AFRICA_TRIP, tiers: [] }).success, false);
});

test("rechaza country que no es ISO alpha-2", () => {
  const bad = {
    ...AFRICA_TRIP,
    phases: [{ ...AFRICA_TRIP.phases[0], country: "Kenya" }, ...AFRICA_TRIP.phases.slice(1)],
  };
  assert.equal(safeValidateTrip(bad).success, false);
});

test("rechaza un sequence item con kind desconocido", () => {
  const bad = { ...AFRICA_TRIP, sequence: [{ kind: "teleport", ref: "watamu" }] };
  assert.equal(safeValidateTrip(bad).success, false);
});
