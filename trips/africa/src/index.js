// Plantilla "Africa" — ESQUELETO COMPLETO (Fase 1, incremento 1).
//
// Todas las fases con sus días/costes EXACTOS de
// africa-trip-planning/src/data/phaseMeta.js + los 7 forks (opciones, default,
// recs) de forkRecs.js + la secuencia completa equivalente a ACTIVE_PHASES de
// useTripState.js (verificado 2026-06-04).
//
// AÚN PENDIENTE (incrementos siguientes): contenido editorial (hero/slides/info),
// POIs, especies, seasonality, add-ons, checklist, connectors, companions.
// El contenido del viaje es JS puro (decisión §0 del roadmap).

const FLAG = { KE: "🇰🇪", TZ: "🇹🇿", MZ: "🇲🇿", KM: "🇰🇲", MG: "🇲🇬", MW: "🇲🇼", ZM: "🇿🇲", BW: "🇧🇼", NA: "🇳🇦", ZA: "🇿🇦", UG: "🇺🇬", RW: "🇷🇼", ET: "🇪🇹", EG: "🇪🇬", JO: "🇯🇴", WA: "🌍", SKIP: "⏭️" };

// Fases de "salto". fixedCost = coste del vuelo directo al saltar la fase.
//
// ⚠️ FIDELIDAD/BACKLOG (heredado de Africa): este fixedCost es LATENTE. Como las
// fases de salto tienen 0 días, el `fixedFactor` de phaseCost se anula y el coste
// NO se cobra en el flujo actual (skip_f1/skip_f2 sólo entran en la ruta si se
// eligen, y entonces aportan 0). Se reproduce tal cual; decidir en Fase 1 si el
// coste de salto debe contarse (probablemente sí). Ver docs/feature-inventory.md.
const skipPhase = (id, title, fixedCost = [0, 0, 0]) => ({
  id, title, flag: FLAG.SKIP, daysBase: 0, daysMin: 0, daysMax: 0,
  dailyCost: [0, 0, 0], fixedCost,
});

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
    costMultiplierRule: { type: "shared-accommodation", factorBy: { "1": 1.0, "2": 1.7 } },
  },

  phases: [
    // ── Costa Kenia (fork) ──
    { id: "watamu", title: "Watamu balance", flag: FLAG.KE, country: "Kenya", daysBase: 25, daysMin: 14, daysMax: 35, dailyCost: [36, 75, 145], fixedCost: [0, 0, 0], interests: ["dive", "nature"] },
    { id: "lamu", title: "Lamu UNESCO", flag: FLAG.KE, country: "Kenya", daysBase: 18, daysMin: 10, daysMax: 28, dailyCost: [32, 72, 145], fixedCost: [130, 220, 420], interests: ["culture", "foodie"] },
    { id: "diani", title: "Diani turismo + kitesurf", flag: FLAG.KE, country: "Kenya", daysBase: 22, daysMin: 14, daysMax: 32, dailyCost: [38, 80, 170], fixedCost: [40, 60, 100], interests: ["adventure", "nature"] },

    // ── Fijas tras Costa Kenia ──
    { id: "safari-ke", title: "Safari Kenya (Masái Mara)", flag: FLAG.KE, country: "Kenya", daysBase: 13, daysMin: 8, daysMax: 18, dailyCost: [125, 230, 400], fixedCost: [40, 60, 100], interests: ["safari", "nature"] },
    { id: "mafia", title: "Mafia · Costa Tanzania", flag: FLAG.TZ, country: "Tanzania", daysBase: 23, daysMin: 14, daysMax: 30, dailyCost: [55, 100, 175], fixedCost: [120, 145, 180], interests: ["dive", "nature"] },

    // ── Uganda / Ruanda (fork opcional) ──
    { id: "uganda", title: "Uganda — Gorilas + Sabana", flag: FLAG.UG, country: "Uganda", daysBase: 14, daysMin: 10, daysMax: 20, dailyCost: [80, 160, 320], fixedCost: [950, 1100, 1350], interests: ["safari", "adventure"] },
    { id: "rwanda", title: "Ruanda — Gorilas + Lago Kivu", flag: FLAG.RW, country: "Ruanda", daysBase: 10, daysMin: 7, daysMax: 14, dailyCost: [100, 200, 420], fixedCost: [1700, 1900, 2200], interests: ["culture", "adventure"] },
    skipPhase("skip_uganda", "Directo a Tanzania"),

    // ── Safari Tanzania (fork) ──
    { id: "safari-tz-norte", title: "Safari Norte clásico", flag: FLAG.TZ, country: "Tanzania", daysBase: 14, daysMin: 10, daysMax: 18, dailyCost: [120, 220, 400], fixedCost: [30, 50, 100], interests: ["safari", "nature"] },
    { id: "safari-tz-sur", title: "Safari Sur salvaje", flag: FLAG.TZ, country: "Tanzania", daysBase: 11, daysMin: 8, daysMax: 16, dailyCost: [150, 280, 500], fixedCost: [220, 470, 920], interests: ["safari", "adventure"] },

    // ── Costa Tanzania (fork) ──
    { id: "costa-pemba", title: "Pemba virgen", flag: FLAG.TZ, country: "Tanzania", daysBase: 20, daysMin: 12, daysMax: 28, dailyCost: [50, 95, 170], fixedCost: [70, 90, 110], interests: ["dive", "nature"] },
    { id: "costa-zanzibar", title: "Zanzíbar cultural", flag: FLAG.TZ, country: "Tanzania", daysBase: 18, daysMin: 10, daysMax: 28, dailyCost: [45, 90, 175], fixedCost: [65, 80, 115], interests: ["culture", "foodie"] },

    // ── Índico profundo (fork) ──
    { id: "mozambique", title: "Quirimbas, Mozambique", flag: FLAG.MZ, country: "Mozambique", daysBase: 18, daysMin: 14, daysMax: 25, dailyCost: [46, 110, 250], fixedCost: [430, 540, 620], interests: ["dive", "nature"] },
    { id: "comoros", title: "Mohéli, Comoras", flag: FLAG.KM, country: "Comoras", daysBase: 18, daysMin: 14, daysMax: 25, dailyCost: [38, 90, 200], fixedCost: [380, 430, 510], interests: ["nature", "adventure"] },
    { id: "madagascar", title: "Madagascar — Nosy Be", flag: FLAG.MG, country: "Madagascar", daysBase: 21, daysMin: 14, daysMax: 35, dailyCost: [45, 95, 215], fixedCost: [310, 430, 580], interests: ["nature", "birding"] },
    { id: "malawi", title: "Malawi — Lago Malawi", flag: FLAG.MW, country: "Malawi", daysBase: 18, daysMin: 12, daysMax: 30, dailyCost: [28, 60, 120], fixedCost: [120, 220, 320], interests: ["dive", "nature"] },
    skipPhase("skip_f1", "Saltar Índico (vuelo directo)", [400, 500, 600]),

    // ── Fijas: África austral ──
    { id: "victoria", title: "Victoria Falls", flag: FLAG.ZM, country: "Zambia/Zimbabwe", daysBase: 12, daysMin: 7, daysMax: 18, dailyCost: [32, 80, 185], fixedCost: [380, 520, 720], interests: ["adventure", "nature"] },
    { id: "botswana", title: "Botswana", flag: FLAG.BW, country: "Botswana", daysBase: 13, daysMin: 8, daysMax: 20, dailyCost: [110, 230, 500], fixedCost: [110, 220, 410], interests: ["safari", "nature"] },

    // ── Final del viaje (fork) ──
    { id: "namibia", title: "Namibia — Roadtrip", flag: FLAG.NA, country: "Namibia", daysBase: 19, daysMin: 12, daysMax: 28, dailyCost: [45, 100, 210], fixedCost: [220, 320, 430], interests: ["adventure", "nature"] },
    { id: "capetown", title: "Ciudad del Cabo", flag: FLAG.ZA, country: "Sudáfrica", daysBase: 15, daysMin: 8, daysMax: 25, dailyCost: [42, 95, 180], fixedCost: [100, 150, 380], interests: ["culture", "foodie"] },
    { id: "sodwana", title: "Sodwana Bay (KZN)", flag: FLAG.ZA, country: "Sudáfrica", daysBase: 17, daysMin: 10, daysMax: 25, dailyCost: [40, 90, 195], fixedCost: [120, 175, 195], interests: ["dive", "nature"] },
    skipPhase("skip_f2", "Saltar Sudáfrica/Namibia", [300, 400, 500]),

    // ── África Occidental (fork opcional) ──
    { id: "westafrica", title: "África Occidental", flag: FLAG.WA, country: "Senegal · Gambia · Ghana · Benín/Togo", daysBase: 22, daysMin: 14, daysMax: 35, dailyCost: [28, 75, 175], fixedCost: [520, 700, 980], interests: ["culture", "foodie"] },
    skipPhase("skip_westafrica", "Saltar África Occidental"),

    // ── Extensiones de cierre (mayo-junio) ──
    { id: "ethiopia", title: "Etiopía", flag: FLAG.ET, country: "Etiopía", daysBase: 18, daysMin: 12, daysMax: 28, dailyCost: [25, 65, 135], fixedCost: [400, 510, 620], interests: ["culture", "adventure"] },
    { id: "egypt", title: "Egipto", flag: FLAG.EG, country: "Egipto", daysBase: 18, daysMin: 12, daysMax: 28, dailyCost: [38, 95, 230], fixedCost: [240, 300, 410], interests: ["culture"] },
    { id: "jordan", title: "Jordania", flag: FLAG.JO, country: "Jordania", daysBase: 14, daysMin: 8, daysMax: 21, dailyCost: [52, 130, 320], fixedCost: [170, 270, 440], interests: ["culture", "adventure"] },
  ],

  forks: [
    {
      id: "fork_costa_ke", label: "Costa Kenia", icon: "🔀",
      options: ["watamu", "lamu", "diani"], default: "watamu",
      recs: {
        low:  { dive: "watamu", culture: "lamu", nature: "watamu", adventure: "diani", foodie: "lamu", birding: "watamu", default: "watamu" },
        mid:  { dive: "watamu", culture: "lamu", nature: "watamu", adventure: "diani", foodie: "lamu", birding: "watamu", default: "watamu" },
        high: { dive: "watamu", culture: "lamu", nature: "watamu", adventure: "diani", foodie: "lamu", birding: "watamu", default: "watamu" },
      },
    },
    {
      id: "fork_uganda", label: "Uganda / Ruanda", icon: "🦍",
      options: ["uganda", "rwanda", "skip_uganda"], default: "skip_uganda",
      omitWhenSelected: ["skip_uganda"],
      recs: {
        low:  { safari: "skip_uganda", nature: "skip_uganda", adventure: "skip_uganda", trekking: "skip_uganda", default: "skip_uganda" },
        mid:  { safari: "uganda", nature: "uganda", adventure: "uganda", trekking: "uganda", culture: "rwanda", default: "skip_uganda" },
        high: { safari: "uganda", nature: "uganda", adventure: "uganda", trekking: "rwanda", culture: "rwanda", default: "uganda" },
      },
    },
    {
      id: "fork_safari", label: "Safari Tanzania", icon: "🔀",
      options: ["safari-tz-norte", "safari-tz-sur"], default: "safari-tz-norte",
      recs: {
        low:  { safari: "safari-tz-norte", nature: "safari-tz-norte", adventure: "safari-tz-sur", birding: "safari-tz-norte", default: "safari-tz-norte" },
        mid:  { safari: "safari-tz-sur", nature: "safari-tz-sur", adventure: "safari-tz-sur", dive: "safari-tz-norte", birding: "safari-tz-sur", foodie: "safari-tz-norte", default: "safari-tz-norte" },
        high: { safari: "safari-tz-sur", nature: "safari-tz-sur", adventure: "safari-tz-sur", birding: "safari-tz-sur", default: "safari-tz-sur" },
      },
    },
    {
      id: "fork_costa", label: "Costa Tanzania", icon: "🔀",
      options: ["costa-pemba", "costa-zanzibar"], default: "costa-pemba",
      recs: {
        low:  { dive: "costa-zanzibar", culture: "costa-zanzibar", nature: "costa-zanzibar", adventure: "costa-zanzibar", foodie: "costa-zanzibar", birding: "costa-zanzibar", default: "costa-zanzibar" },
        mid:  { dive: "costa-pemba", culture: "costa-zanzibar", nature: "costa-pemba", adventure: "costa-pemba", foodie: "costa-zanzibar", birding: "costa-zanzibar", default: "costa-pemba" },
        high: { dive: "costa-pemba", culture: "costa-zanzibar", nature: "costa-pemba", adventure: "costa-pemba", foodie: "costa-zanzibar", birding: "costa-pemba", default: "costa-pemba" },
      },
    },
    {
      id: "fork1", label: "Índico profundo", icon: "🔀",
      options: ["mozambique", "comoros", "madagascar", "malawi", "skip_f1"], default: "mozambique",
      recs: {
        low:  { dive: "malawi", nature: "malawi", culture: "malawi", safari: "skip_f1", adventure: "malawi", foodie: "malawi", birding: "malawi", default: "skip_f1" },
        mid:  { dive: "madagascar", nature: "madagascar", culture: "mozambique", safari: "madagascar", adventure: "comoros", foodie: "mozambique", birding: "madagascar", default: "madagascar" },
        high: { dive: "mozambique", nature: "madagascar", culture: "mozambique", safari: "madagascar", adventure: "comoros", foodie: "mozambique", birding: "madagascar", default: "mozambique" },
      },
    },
    {
      id: "fork2", label: "Final del viaje", icon: "🔀",
      options: ["namibia", "capetown", "sodwana", "skip_f2"], default: "namibia",
      recs: {
        low:  { dive: "sodwana", nature: "capetown", culture: "capetown", safari: "sodwana", adventure: "namibia", foodie: "capetown", birding: "sodwana", default: "capetown" },
        mid:  { dive: "sodwana", nature: "namibia", culture: "capetown", safari: "namibia", adventure: "namibia", foodie: "capetown", birding: "namibia", default: "namibia" },
        high: { dive: "sodwana", nature: "namibia", culture: "capetown", safari: "namibia", adventure: "namibia", foodie: "capetown", birding: "namibia", default: "namibia" },
      },
    },
    {
      id: "fork_westafrica", label: "África Occidental", icon: "🌍",
      options: ["westafrica", "skip_westafrica"], default: "skip_westafrica",
      omitWhenSelected: ["skip_westafrica"],
      recs: {
        low:  { culture: "skip_westafrica", foodie: "skip_westafrica", adventure: "skip_westafrica", birding: "skip_westafrica", nature: "skip_westafrica", default: "skip_westafrica" },
        mid:  { culture: "westafrica", foodie: "westafrica", adventure: "westafrica", birding: "westafrica", nature: "skip_westafrica", default: "skip_westafrica" },
        high: { culture: "westafrica", foodie: "westafrica", adventure: "westafrica", birding: "westafrica", nature: "westafrica", default: "skip_westafrica" },
      },
    },
  ],

  // Equivalente a ACTIVE_PHASES de useTripState.js (orden literal des-hardcodeado).
  sequence: [
    { kind: "fork", ref: "fork_costa_ke" },
    { kind: "phase", ref: "safari-ke" },
    { kind: "phase", ref: "mafia" },
    { kind: "fork", ref: "fork_uganda", optional: true },
    { kind: "fork", ref: "fork_safari" },
    { kind: "fork", ref: "fork_costa" },
    { kind: "fork", ref: "fork1" },
    { kind: "phase", ref: "victoria" },
    { kind: "phase", ref: "botswana" },
    { kind: "fork", ref: "fork2" },
    { kind: "fork", ref: "fork_westafrica", optional: true },
    { kind: "extensionGroup", ref: "extensions", members: ["ethiopia", "egypt", "jordan"], reorderable: true },
  ],
};

export default AFRICA_TRIP;
