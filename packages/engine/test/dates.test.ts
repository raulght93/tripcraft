// Utilidades de fecha puras (ramas de wrap-around y entradas inválidas).
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDate, monthsInRange, occurrencesInRange } from "../src/index.ts";

test("occurrencesInRange maneja una ventana que cruza el fin de año", () => {
  const occ = occurrencesInRange(
    { start: "12-28", end: "01-03" },
    { start: "2026-12-01", end: "2027-01-31" },
  );
  assert.ok(occ.length >= 1);
  assert.equal(occ[0]?.end.getMonth(), 0); // termina en enero (mes 0)
});

test("occurrencesInRange sin datos válidos → []", () => {
  assert.deepEqual(
    occurrencesInRange({ start: "", end: "" }, { start: "2026-01-01", end: "2026-02-01" }),
    [],
  );
});

test("buildDate con MM-DD mal formado → null", () => {
  assert.equal(buildDate(2026, "no-fecha"), null);
  assert.equal(buildDate(2026, ""), null);
});

test("monthsInRange con fecha inválida → []", () => {
  assert.deepEqual(monthsInRange("nope", "2026-01-01"), []);
});
