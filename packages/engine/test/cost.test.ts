import assert from "node:assert/strict";
// Paridad de coste con utils/costs.js de Africa. Valores calculados a mano con la
// fórmula: activos·daily + descanso·daily·0.5 + voluntariado·8 + fijo·factor.
import { test } from "node:test";
import { AFRICA_TRIP } from "../../../trips/africa/src/index.js";
import {
  addonsCostFor,
  addonsDaysFor,
  applyTravelersMultiplier,
  phaseCost,
  tripTotals,
} from "../src/index.ts";

const T = AFRICA_TRIP as never;

test("coste por días activos · tier mid/low/high", () => {
  assert.equal(phaseCost(T, "watamu", 25, "mid"), 1875); // 25·75 + 0
  assert.equal(phaseCost(T, "watamu", 25, "low"), 900); // 25·36 + 0
  assert.equal(phaseCost(T, "lamu", 18, "mid"), 1516); // 18·72 + 220
  assert.equal(phaseCost(T, "diani", 22, "high"), 3840); // 22·170 + 100
  assert.equal(phaseCost(T, "safari-ke", 13, "mid"), 3050); // 13·230 + 60
});

test("días de descanso cuentan al 50% del daily", () => {
  // 20·75 + 5·75·0.5 + 0 = 1500 + 187.5
  assert.equal(phaseCost(T, "watamu", 20, "mid", { restDays: 5 }), 1687.5);
});

test("solo voluntariado: 8€/día + fijo al 50%", () => {
  // 10·8 + 60·0.5 = 80 + 30
  assert.equal(phaseCost(T, "safari-ke", 0, "mid", { volunteerDays: 10 }), 110);
});

test("permisos de gorila dominan el fijo (uganda/rwanda)", () => {
  assert.equal(phaseCost(T, "uganda", 14, "mid"), 3340); // 14·160 + 1100
  assert.equal(phaseCost(T, "rwanda", 10, "high"), 6400); // 10·420 + 2200
});

test("fase desconocida → 0", () => {
  assert.equal(phaseCost(T, "atlantis", 10, "mid"), 0);
});

test("GOTCHA heredado: el fixedCost de skip_f1 es latente (0 días → factor 0)", () => {
  // Reproduce el comportamiento actual de Africa: sin días, el coste de salto
  // (vuelo directo) NO se cobra, aunque el dato exista.
  assert.equal(phaseCost(T, "skip_f1", 0, "mid"), 0);
  // Pero SÍ aplicaría si la fase de salto tuviera días asignados (factor 1).
  assert.equal(phaseCost(T, "skip_f1", 2, "mid"), 500); // 2·0 + 500·1
});

test("add-ons inexistentes no alteran el coste", () => {
  assert.equal(phaseCost(T, "watamu", 25, "mid", { addons: ["nope"] }), 1875);
  assert.equal(addonsCostFor(T, "watamu", ["nope"], "mid"), 0);
});

test("add-ons: coste y días extra de los seleccionados", () => {
  const trip = {
    tiers: ["low", "mid", "high"],
    meta: {},
    phases: [
      {
        id: "watamu",
        title: "W",
        daysBase: 0,
        daysMin: 0,
        daysMax: 0,
        dailyCost: { low: 0, mid: 0, high: 0 },
        fixedCost: { low: 0, mid: 0, high: 0 },
      },
    ],
    forks: [],
    sequence: [],
    addons: {
      watamu: [
        { id: "balloon", label: "Globo", cost: { low: 380, mid: 450, high: 550 }, days: 1 },
        { id: "spice", label: "Especias", cost: { low: 20, mid: 25, high: 30 } },
      ],
    },
  } as never;
  assert.equal(addonsCostFor(trip, "watamu", ["balloon"], "mid"), 450);
  assert.equal(addonsCostFor(trip, "watamu", ["balloon", "spice"], "high"), 580); // 550 + 30
  assert.equal(addonsDaysFor(trip, "watamu", ["balloon", "spice"]), 1); // solo balloon aporta días
  assert.equal(addonsDaysFor(trip, "watamu", ["spice"]), 0);
  // phaseCost suma el add-on al coste base.
  assert.equal(phaseCost(trip, "watamu", 2, "mid", { addons: ["spice"] }), 25);
});

test("multiplicador por viajeros sale de costMultiplierRule (no hardcode)", () => {
  assert.equal(applyTravelersMultiplier(T, 1875, 1), 1875);
  assert.equal(applyTravelersMultiplier(T, 1875, 2), 3188); // round(1875·1.7)
});

test("tripTotals suma días y coste por persona de las fases activas", () => {
  const ids = ["watamu", "safari-ke"];
  const t = tripTotals(T, ids, "mid"); // 25·75 + (13·230+60) = 1875 + 3050
  assert.equal(t.totalDays, 38);
  assert.equal(t.perPerson, 4925);
  // Con override de días en watamu (10): 10·75 + 3050.
  const t2 = tripTotals(T, ids, "mid", { watamu: 10 });
  assert.equal(t2.totalDays, 23);
  assert.equal(t2.perPerson, 3800);
});

test("multiplicador: grupo no listado en factorBy → fallback lineal ×N (issue #9)", () => {
  // factorBy de Africa solo define 1 y 2. Para 3 viajeros NO hay dato → fallback ×3
  // (Africa daba 1.7× a cualquier grupo; aquí el dato manda). Documentado en cost.ts.
  assert.equal(applyTravelersMultiplier(T, 1000, 3), 3000);
});
