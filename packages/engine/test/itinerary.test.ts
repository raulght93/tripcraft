// Capa de fechas: computeItinerary (generaliza phaseDates de useTripState.js).
import assert from "node:assert/strict";
import { test } from "node:test";
import { AFRICA_TRIP } from "../../../trips/africa/src/index.js";
import {
  addDaysISO,
  addonsFor,
  buildActivePhaseIds,
  computeItinerary,
  itineraryByPhase,
  poisFor,
} from "../src/index.ts";

const T = AFRICA_TRIP as never;

test("addDaysISO suma días con aritmética de calendario", () => {
  assert.equal(addDaysISO("2026-11-10", 24), "2026-12-04"); // watamu (25 días)
  assert.equal(addDaysISO("2026-12-04", 1), "2026-12-05");
});

test("computeItinerary encadena fases secuencialmente desde la fecha de inicio", () => {
  const ids = buildActivePhaseIds(T); // ruta por defecto
  const legs = computeItinerary(T, "2026-11-10", ids);
  assert.equal(legs[0]?.phaseId, "watamu");
  assert.equal(legs[0]?.startISO, "2026-11-10");
  assert.equal(legs[0]?.endISO, "2026-12-04"); // 25 días
  assert.equal(legs[1]?.phaseId, "safari-ke");
  assert.equal(legs[1]?.startISO, "2026-12-05"); // empieza donde acabó watamu + 1
  assert.equal(legs[1]?.days, 13);
});

test("daysByPhase override cambia la duración y desplaza el resto", () => {
  const legs = computeItinerary(T, "2026-11-10", ["watamu", "safari-ke"], { watamu: 10 });
  assert.equal(legs[0]?.endISO, "2026-11-19"); // 10 días
  assert.equal(legs[1]?.startISO, "2026-11-20");
});

test("una fase de salto (0 días) no avanza el calendario", () => {
  const legs = computeItinerary(T, "2026-11-10", ["skip_f1", "watamu"]);
  assert.equal(legs[0]?.days, 0);
  assert.equal(legs[0]?.startISO, legs[0]?.endISO);
  assert.equal(legs[1]?.startISO, "2026-11-10"); // watamu sigue empezando el día 1
});

test("poisFor devuelve los POIs migrados de una fase (y [] si no hay)", () => {
  assert.equal(poisFor(T, "watamu").length, 9);
  assert.equal(poisFor(T, "safari-ke")[0]?.name, "Nairobi");
  assert.deepEqual(poisFor(T, "egypt"), []); // aún sin migrar
});

test("itineraryByPhase indexa los tramos por phaseId", () => {
  const legs = computeItinerary(T, "2026-11-10", ["watamu", "safari-ke"]);
  assert.equal(itineraryByPhase(legs)["safari-ke"]?.startISO, "2026-12-05");
});

test("addonsFor devuelve [] cuando la fase no declara add-ons", () => {
  assert.deepEqual(addonsFor(T, "watamu"), []);
});
