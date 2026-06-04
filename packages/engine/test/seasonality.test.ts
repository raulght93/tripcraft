// Paridad del motor de estacionalidad con utils/seasonality.js de Africa.
import assert from "node:assert/strict";
import { test } from "node:test";
import { AFRICA_TRIP } from "../../../trips/africa/src/index.js";
import { monthNames, monthsInRange, seasonFit } from "../src/index.ts";

const T = AFRICA_TRIP as never;

test("monthsInRange devuelve los meses tocados por el rango", () => {
  assert.deepEqual(monthsInRange("2026-11-10", "2026-12-05"), [11, 12]);
  assert.deepEqual(monthsInRange("2027-01-20", "2027-01-25"), [1]);
});

test("monthNames traduce a abreviaturas ES", () => {
  assert.equal(monthNames([11, 12, 1]), "nov, dic, ene");
});

test("watamu en noviembre → óptimo (todos los meses son óptimos)", () => {
  const fit = seasonFit(T, "watamu", { start: "2026-11-10", end: "2026-11-25", days: 16 });
  assert.equal(fit?.status, "optimal");
});

test("watamu en abril (lluvias largas) → suboptimal con motivo", () => {
  const fit = seasonFit(T, "watamu", { start: "2027-04-05", end: "2027-04-15", days: 11 });
  assert.equal(fit?.status, "suboptimal");
  assert.deepEqual(fit?.inAvoid, [4]);
  assert.equal(fit?.avoidReason, "lluvias largas");
});

test("safari-ke en agosto → óptimo + evento de migración en su pico", () => {
  const fit = seasonFit(T, "safari-ke", { start: "2026-08-01", end: "2026-08-12", days: 12 });
  assert.equal(fit?.status, "optimal");
  const migration = fit?.activeEvents.find((e) => e.name.includes("Migración"));
  assert.ok(migration, "debería detectar la Gran Migración");
  assert.equal(migration?.atPeak, true);
});

test("evento con fecha MM-DD (Sauti za Busara) se detecta dentro del rango", () => {
  const fit = seasonFit(T, "costa-zanzibar", { start: "2027-02-01", end: "2027-02-15", days: 15 });
  assert.ok(fit?.activeEvents.some((e) => e.name.includes("Sauti za Busara")));
});

test("evento MM-DD fuera del rango NO se detecta", () => {
  const fit = seasonFit(T, "costa-zanzibar", { start: "2026-12-01", end: "2026-12-10", days: 10 });
  assert.ok(!fit?.activeEvents.some((e) => e.name.includes("Sauti za Busara")));
});

test("evento por meses con peak vacío → presente pero atPeak false (lamu/Maulidi)", () => {
  // marzo no es óptimo ni a evitar para lamu → status mixed; el evento Maulidi
  // (months [3,4], peak []) se detecta pero no está en pico.
  const fit = seasonFit(T, "lamu", { start: "2027-03-10", end: "2027-03-20", days: 11 });
  assert.equal(fit?.status, "mixed");
  const maulidi = fit?.activeEvents.find((e) => e.name.includes("Maulidi"));
  assert.ok(maulidi);
  assert.equal(maulidi?.atPeak, false);
});

test("fase sin datos de estacionalidad → null", () => {
  const fit = seasonFit(T, "skip_f1", { start: "2026-11-10", end: "2026-11-20", days: 11 });
  assert.equal(fit, null);
});

test("rango inválido (0 días) → null", () => {
  assert.equal(seasonFit(T, "watamu", { start: "2026-11-10", end: "2026-11-10", days: 0 }), null);
});
