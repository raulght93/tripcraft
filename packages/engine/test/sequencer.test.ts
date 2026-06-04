import assert from "node:assert/strict";
// Paridad del sequencer con ACTIVE_PHASES de useTripState.js + integridad.
import { test } from "node:test";
import type { Fork, Phase } from "@tripcraft/schema";
import { AFRICA_TRIP } from "../../../trips/africa/src/index.js";
import { buildActivePhaseIds, recommendForFork, validateReferences } from "../src/index.ts";

const T = AFRICA_TRIP as never;
const forkById = (id: string) => AFRICA_TRIP.forks.find((f: Fork) => f.id === id) as never;

test("ruta por defecto = ACTIVE_PHASES con todos los defaults, sin extensiones", () => {
  assert.deepEqual(buildActivePhaseIds(T), [
    "watamu",
    "safari-ke",
    "mafia",
    "safari-tz-norte",
    "costa-pemba",
    "mozambique",
    "victoria",
    "botswana",
    "namibia",
  ]);
});

test("GOTCHA: skip_uganda/skip_westafrica se OMITEN; skip_f1/skip_f2 PERMANECEN", () => {
  const route = buildActivePhaseIds(T, {
    forkChoice: {
      fork_uganda: "uganda", // no omitido
      fork1: "skip_f1", // permanece (coste-cero, carga vuelo directo)
      fork2: "skip_f2", // permanece
      fork_westafrica: "skip_westafrica", // omitido
    },
    extensions: { ethiopia: false, egypt: true, jordan: true },
  });
  assert.deepEqual(route, [
    "watamu",
    "safari-ke",
    "mafia",
    "uganda",
    "safari-tz-norte",
    "costa-pemba",
    "skip_f1",
    "victoria",
    "botswana",
    "skip_f2",
    "egypt",
    "jordan",
  ]);
});

test("elegir una opción de fork cambia la fase activa", () => {
  assert.deepEqual(
    buildActivePhaseIds(T, { forkChoice: { fork_costa_ke: "lamu", fork_safari: "safari-tz-sur" } }),
    [
      "lamu",
      "safari-ke",
      "mafia",
      "safari-tz-sur",
      "costa-pemba",
      "mozambique",
      "victoria",
      "botswana",
      "namibia",
    ],
  );
});

test("extensiones respetan el orden de members", () => {
  const route = buildActivePhaseIds(T, {
    extensions: { jordan: true, ethiopia: true, egypt: true },
  });
  assert.deepEqual(route.slice(-3), ["ethiopia", "egypt", "jordan"]);
});

test("recomendaciones de fork (ex forkRecs.js)", () => {
  assert.equal(recommendForFork(forkById("fork_costa_ke"), "mid", "culture"), "lamu");
  assert.equal(recommendForFork(forkById("fork_costa_ke"), "low", "adventure"), "diani");
  assert.equal(recommendForFork(forkById("fork_uganda"), "mid", "safari"), "uganda");
  assert.equal(recommendForFork(forkById("fork_uganda"), "high", "trekking"), "rwanda");
  assert.equal(recommendForFork(forkById("fork2"), "mid", "dive"), "sodwana");
  // interés desconocido → cae al default del budget
  assert.equal(recommendForFork(forkById("fork_uganda"), "mid", "xxx"), "skip_uganda");
  assert.equal(recommendForFork(forkById("fork1"), "low", "xxx"), "skip_f1");
});

test("recommendForFork: un fork sin recs cae a su default", () => {
  const fork = { id: "x", label: "X", options: ["a", "b"], default: "a" } as never;
  assert.equal(recommendForFork(fork, "mid", "dive"), "a");
});

test("AFRICA_TRIP pasa la integridad referencial", () => {
  assert.deepEqual(validateReferences(T), []);
});

test("validateReferences detecta clave de contenido huérfana (pois de fase inexistente)", () => {
  const broken = {
    ...AFRICA_TRIP,
    pois: { atlantis: [{ name: "X", lat: 0, lng: 0, type: "city" }] },
  };
  const errors = validateReferences(broken as never);
  assert.ok(
    errors.some((e) => /pois: clave "atlantis"/.test(e)),
    errors.join("; "),
  );
});

test("validateReferences detecta tier faltante en un add-on (anti-NaN)", () => {
  const broken = {
    ...AFRICA_TRIP,
    addons: { watamu: [{ id: "a1", label: "A", cost: { low: 10, mid: 20 } }] },
  };
  const errors = validateReferences(broken as never);
  assert.ok(
    errors.some((e) => /addon "watamu\/a1".*high/.test(e)),
    errors.join("; "),
  );
});

test("validateReferences detecta opción de fork inexistente", () => {
  // Rompe SOLO una cosa (añade una opción fantasma a un fork real); el resto del
  // documento sigue íntegro, así que debe haber exactamente 1 error.
  const broken = {
    ...AFRICA_TRIP,
    forks: AFRICA_TRIP.forks.map((f: Fork) =>
      f.id === "fork_costa_ke" ? { ...f, options: [...f.options, "ghost"] } : f,
    ),
  };
  const errors = validateReferences(broken as never);
  assert.equal(errors.length, 1);
  assert.match(errors[0] ?? "", /ghost/);
});

test("validateReferences detecta valor de recs que no es opción", () => {
  const broken = {
    ...AFRICA_TRIP,
    forks: [
      {
        id: "f",
        label: "F",
        options: ["watamu", "lamu"],
        default: "watamu",
        recs: { mid: { dive: "diani" } },
      },
    ],
  };
  const errors = validateReferences(broken as never);
  assert.ok(
    errors.some((e) => /recs\[mid\]\[dive\]/.test(e)),
    errors.join("; "),
  );
});

test("validateReferences detecta omitWhenSelected fuera de options", () => {
  const broken = {
    ...AFRICA_TRIP,
    forks: [
      { id: "f", label: "F", options: ["watamu"], default: "watamu", omitWhenSelected: ["ghost"] },
    ],
  };
  assert.ok(validateReferences(broken as never).some((e) => /omitWhenSelected/.test(e)));
});

test("validateReferences detecta coste de tier faltante (anti-NaN, issue #7)", () => {
  // watamu sin el tier "high" → phaseCost(...,'high') daría NaN sin esta guarda.
  const broken = {
    ...AFRICA_TRIP,
    phases: AFRICA_TRIP.phases.map((p: Phase) =>
      p.id === "watamu" ? { ...p, dailyCost: { low: 36, mid: 75 } } : p,
    ),
  };
  const errors = validateReferences(broken as never);
  assert.ok(
    errors.some((e) => /watamu.*high/.test(e)),
    errors.join("; "),
  );
});

test("el engine es agnóstico: viaje sin IDs de Africa (tiers/costes propios)", () => {
  const DEMO = {
    id: "demo",
    slug: "demo",
    version: 1,
    title: "Demo",
    lang: "en",
    currency: "USD",
    tiers: ["budget", "comfort"],
    meta: { costMultiplierRule: { type: "flat", factorBy: { "2": 2 } } },
    phases: [
      {
        id: "p1",
        title: "Stop 1",
        daysBase: 3,
        daysMin: 1,
        daysMax: 5,
        dailyCost: { budget: 10, comfort: 50 },
        fixedCost: { budget: 0, comfort: 100 },
      },
    ],
    forks: [],
    sequence: [{ kind: "phase", ref: "p1" }],
  };
  assert.deepEqual(validateReferences(DEMO as never), []);
  assert.deepEqual(buildActivePhaseIds(DEMO as never), ["p1"]);
});
