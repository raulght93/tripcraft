// Spike Fase 0 — ¿"cabe" un viaje real en el Trip Schema y el engine lo consume
// sin pérdida? Ejecuta:  npm run spike   (Node ≥22.6, sin instalar nada)
//
// Criterios de éxito (docs/trip-schema-draft.md):
//  1. watamu + fork_costa_ke expresados en el schema.
//  2. El sequencer genérico reproduce la elección de fork (= ACTIVE_PHASES).
//  3. phaseCost da el MISMO número que la fórmula de Africa.
//  4. El engine no referencia ningún ID literal de Africa (probado con un 2º viaje).

import {
  buildActivePhaseIds,
  recommendForFork,
  validateReferences,
  phaseCost,
  applyTravelersMultiplier,
} from "../packages/engine/src/index.ts";
import { AFRICA_TRIP } from "../trips/africa/src/index.js";

let pass = 0;
let fail = 0;

const eq = (got: unknown, want: unknown): boolean => {
  if (typeof got === "number" && typeof want === "number") return Math.abs(got - want) < 1e-9;
  return JSON.stringify(got) === JSON.stringify(want);
};

const check = (name: string, got: unknown, want: unknown): void => {
  if (eq(got, want)) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ ${name}`);
    console.log(`      esperado: ${JSON.stringify(want)}`);
    console.log(`      obtenido: ${JSON.stringify(got)}`);
  }
};

const section = (t: string): void => console.log(`\n• ${t}`);

console.log("Spike Fase 0 — Trip Schema + engine\n====================================");

// ── 1. Integridad referencial del documento ───────────────────────────────
section("Integridad referencial (criterio 1)");
const refErrors = validateReferences(AFRICA_TRIP);
check("AFRICA_TRIP sin errores de referencia", refErrors, []);

// ── 2. Sequencer = ACTIVE_PHASES (criterio 2) ─────────────────────────────
section("Sequencer reproduce la elección de fork (criterio 2)");
check("default (sin elección) → [watamu, safari-ke]", buildActivePhaseIds(AFRICA_TRIP), ["watamu", "safari-ke"]);
check("fork_costa_ke=lamu → [lamu, safari-ke]", buildActivePhaseIds(AFRICA_TRIP, { forkChoice: { fork_costa_ke: "lamu" } }), ["lamu", "safari-ke"]);
check("fork_costa_ke=diani → [diani, safari-ke]", buildActivePhaseIds(AFRICA_TRIP, { forkChoice: { fork_costa_ke: "diani" } }), ["diani", "safari-ke"]);

section("Recomendaciones de fork (ex forkRecs.js)");
const fork = AFRICA_TRIP.forks[0];
check("mid · culture → lamu", recommendForFork(fork, "mid", "culture"), "lamu");
check("low · adventure → diani", recommendForFork(fork, "low", "adventure"), "diani");
check("high · dive → watamu", recommendForFork(fork, "high", "dive"), "watamu");
check("mid · interés desconocido → default (watamu)", recommendForFork(fork, "mid", "xxx"), "watamu");

// ── 3. Paridad de coste con la fórmula de Africa (criterio 3) ──────────────
// Valores esperados calculados a mano con la fórmula de utils/costs.js:
//   coste = activos·daily + descanso·daily·0.5 + voluntariado·8 + fijo·factor
section("Paridad de coste con utils/costs.js de Africa (criterio 3)");
check("watamu · 25 activos · mid  → 25·75 + 0          = 1875", phaseCost(AFRICA_TRIP, "watamu", 25, "mid"), 1875);
check("watamu · 25 activos · low  → 25·36 + 0          = 900",  phaseCost(AFRICA_TRIP, "watamu", 25, "low"), 900);
check("lamu   · 18 activos · mid  → 18·72 + 220        = 1516", phaseCost(AFRICA_TRIP, "lamu", 18, "mid"), 1516);
check("diani  · 22 activos · high → 22·170 + 100       = 3840", phaseCost(AFRICA_TRIP, "diani", 22, "high"), 3840);
check("watamu · 20 act + 5 desc · mid → 1500+187.5     = 1687.5", phaseCost(AFRICA_TRIP, "watamu", 20, "mid", { restDays: 5 }), 1687.5);
check("safari-ke · 13 activos · mid → 13·230 + 60      = 3050", phaseCost(AFRICA_TRIP, "safari-ke", 13, "mid"), 3050);
check("safari-ke · solo 10 voluntariado · mid → 80 + 60·0.5 = 110", phaseCost(AFRICA_TRIP, "safari-ke", 0, "mid", { volunteerDays: 10 }), 110);
check("add-ons inexistentes no alteran el coste", phaseCost(AFRICA_TRIP, "watamu", 25, "mid", { addons: ["nope"] }), 1875);

section("Multiplicador por viajeros (des-hardcodeado el 1.7×)");
check("1875 · 1 viajero  → 1875", applyTravelersMultiplier(AFRICA_TRIP, 1875, 1), 1875);
check("1875 · 2 viajeros → round(1875·1.7) = 3188", applyTravelersMultiplier(AFRICA_TRIP, 1875, 2), 3188);

// ── 4. El engine es agnóstico (criterio 4) ─────────────────────────────────
// Un viaje totalmente distinto (sin forks, otros tiers, otros ids) → mismo motor.
section("Engine agnóstico: segundo viaje sin IDs de Africa (criterio 4)");
const DEMO_TRIP = {
  id: "demo", slug: "demo", version: 1, title: "Demo", lang: "en", currency: "USD",
  tiers: ["budget", "comfort"],
  meta: { costMultiplierRule: { type: "flat", factorBy: { "2": 2 } } },
  phases: [{ id: "p1", title: "Stop 1", daysBase: 3, daysMin: 1, daysMax: 5, dailyCost: [10, 50], fixedCost: [0, 100] }],
  forks: [],
  sequence: [{ kind: "phase", ref: "p1" }],
} as const;
check("DEMO sin errores de referencia", validateReferences(DEMO_TRIP as never), []);
check("DEMO sequencer → [p1]", buildActivePhaseIds(DEMO_TRIP as never), ["p1"]);
check("DEMO coste p1 · 3 · comfort → 3·50 + 100 = 250", phaseCost(DEMO_TRIP as never, "p1", 3, "comfort"), 250);
check("DEMO multiplicador 250·2 → 500", applyTravelersMultiplier(DEMO_TRIP as never, 250, 2), 500);

// Detección de viaje roto (debe encontrar el error).
section("Detección de documento inválido");
const BROKEN = { ...DEMO_TRIP, forks: [{ id: "bad", label: "Bad", options: ["ghost"], default: "ghost" }] };
const brokenErrors = validateReferences(BROKEN as never);
check("fork con opción inexistente → 1 error detectado", brokenErrors.length, 1);

// ── Resumen ────────────────────────────────────────────────────────────────
console.log(`\n====================================`);
console.log(`Resultado: ${pass} OK, ${fail} fallos`);
if (fail > 0) {
  console.log("❌ El spike encontró discrepancias — el modelo necesita ajuste.");
  process.exit(1);
} else {
  console.log("✅ El spike pasa: Africa cabe en el schema y el engine reproduce la lógica sin pérdida.");
}
