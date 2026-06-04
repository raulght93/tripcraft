// Plantilla "Africa" — MIGRACIÓN PARCIAL (spike Fase 0).
//
// Sólo el fragmento necesario para validar el modelo: el fork de costa de Kenia
// (watamu/lamu/diani) + la fase fija safari-ke. Números EXACTOS portados de
// africa-trip-planning/src/data/phaseMeta.js y forkRecs.js (verificados 2026-06-04).
//
// La migración completa (resto de fases, forks, POIs, especies, seasonality,
// add-ons, checklist…) es trabajo de la Fase 1. Este archivo es JS puro: el
// contenido del viaje no lleva TypeScript (decisión §0 del roadmap).

/** @type {import("@tripcraft/schema").Trip} */
export const AFRICA_TRIP = {
  id: "africa-2026",
  slug: "africa-oriental-austral",
  version: 1,
  title: "África Oriental, Austral y Norte",
  lang: "es",
  currency: "EUR",
  tiers: ["low", "mid", "high"],

  meta: {
    dateWindowDefault: { start: "2026-11-10", targetEnd: "2027-06-30" },
    travelersDefault: 2,
    // Des-hardcodea el "1.7× para 2 personas" de utils/costs.js.
    costMultiplierRule: {
      type: "shared-accommodation",
      factorBy: { "1": 1.0, "2": 1.7 },
    },
  },

  phases: [
    {
      id: "watamu",
      title: "Watamu",
      country: "KE",
      flag: "🇰🇪",
      daysBase: 25, daysMin: 14, daysMax: 35,
      dailyCost: [36, 75, 145], fixedCost: [0, 0, 0],
      interests: ["dive", "nature"],
    },
    {
      id: "lamu",
      title: "Lamu",
      country: "KE",
      flag: "🇰🇪",
      daysBase: 18, daysMin: 10, daysMax: 28,
      dailyCost: [32, 72, 145], fixedCost: [130, 220, 420],
      interests: ["culture", "foodie"],
    },
    {
      id: "diani",
      title: "Diani",
      country: "KE",
      flag: "🇰🇪",
      daysBase: 22, daysMin: 14, daysMax: 32,
      dailyCost: [38, 80, 170], fixedCost: [40, 60, 100],
      interests: ["adventure", "nature"],
    },
    {
      id: "safari-ke",
      title: "Safari Kenia (Masái Mara)",
      country: "KE",
      flag: "🇰🇪",
      daysBase: 13, daysMin: 8, daysMax: 18,
      dailyCost: [125, 230, 400], fixedCost: [40, 60, 100],
      interests: ["safari", "nature"],
    },
  ],

  forks: [
    {
      id: "fork_costa_ke",
      label: "Costa Kenia",
      icon: "🔀",
      options: ["watamu", "lamu", "diani"],
      default: "watamu",
      // budget → interest → optionId (idéntico en los tres tiers, como en Africa).
      recs: {
        low:  { dive: "watamu", culture: "lamu", nature: "watamu", adventure: "diani", foodie: "lamu", birding: "watamu", default: "watamu" },
        mid:  { dive: "watamu", culture: "lamu", nature: "watamu", adventure: "diani", foodie: "lamu", birding: "watamu", default: "watamu" },
        high: { dive: "watamu", culture: "lamu", nature: "watamu", adventure: "diani", foodie: "lamu", birding: "watamu", default: "watamu" },
      },
    },
  ],

  sequence: [
    { kind: "fork", ref: "fork_costa_ke" },
    { kind: "phase", ref: "safari-ke" },
  ],
};

export default AFRICA_TRIP;
