// Plantilla "Africa" — ESQUELETO COMPLETO (Fase 1).
//
// Todas las fases con sus días/costes EXACTOS de
// africa-trip-planning/src/data/phaseMeta.js + los 7 forks (opciones, default,
// recs) de forkRecs.js + la secuencia completa equivalente a ACTIVE_PHASES de
// useTripState.js (verificado 2026-06-04).
//
// Modelo: coste KEYED por tier ({ low, mid, high }); país = ISO 3166-1 alpha-2
// (o array multi-país); la bandera se DERIVA del ISO (engine: displayFlag).
//
// AÚN PENDIENTE (incrementos siguientes): contenido editorial (hero/slides/info),
// POIs, especies, seasonality, add-ons, checklist, connectors, companions.
// El contenido del viaje es JS puro (decisión §0 del roadmap).

// Coste por tier. Helper para no repetir las claves en cada fase.
const cost = (low, mid, high) => ({ low, mid, high });

// Fases de "salto". fixedCost = coste del vuelo directo al saltar la fase.
//
// ⚠️ FIDELIDAD/BACKLOG (heredado de Africa): este fixedCost es LATENTE. Como las
// fases de salto tienen 0 días, el `fixedFactor` de phaseCost se anula y el coste
// NO se cobra en el flujo actual. Se reproduce tal cual; decidir en Fase 1 si el
// coste de salto debe contarse (probablemente sí). Ver docs/feature-inventory.md.
// `flag: "⏭️"` es un override: una transición no es un país, no tiene bandera ISO.
const skipPhase = (id, title, fixedCost = cost(0, 0, 0)) => ({
  id, title, flag: "⏭️", daysBase: 0, daysMin: 0, daysMax: 0,
  dailyCost: cost(0, 0, 0), fixedCost,
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
    {
      id: "watamu", title: "Watamu balance", country: "KE",
      daysBase: 25, daysMin: 14, daysMax: 35, dailyCost: cost(36, 75, 145), fixedCost: cost(0, 0, 0),
      interests: ["dive", "nature"],
      hero: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Watamu_Beach%2C_Kenya.JPG/500px-Watamu_Beach%2C_Kenya.JPG",
      climateWarning: "🌧️ Lluvias cortas de noviembre: la costa keniata tiene lluvias cortas (oct–nov) que normalmente terminan a mediados-finales de noviembre. Las primeras 1–2 semanas pueden tener lluvias de tarde (1–3h); el snorkel y la playa son buenos el resto del día. Hacia diciembre mejora sensiblemente.",
      info: [
        { label: "Visado", value: "eTA Kenya $30 + admin (~$39 total). Online 3 días antes." },
        { label: "Moneda", value: "Shilling (KES) · 1€ ≈ 150 KES" },
        { label: "Idioma", value: "Suajili (oficial; inglés en turismo)" },
        { label: "Mejor época", value: "Nov-Mar seco. Abr-May lluvias largas." },
        { label: "Enchufe", value: "Tipo G (UK), 240V" },
        { label: "Consejos", value: "~10% propina en restaurantes. Negociad el tuk-tuk." },
      ],
    },
    {
      id: "lamu", title: "Lamu UNESCO", country: "KE",
      daysBase: 18, daysMin: 10, daysMax: 28, dailyCost: cost(32, 72, 145), fixedCost: cost(130, 220, 420),
      interests: ["culture", "foodie"],
      hero: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Lamu_Old_Town.jpg/500px-Lamu_Old_Town.jpg",
      climateWarning: "🌧️ Noviembre es el final de las lluvias cortas en la costa norte. Las primeras semanas pueden tener lluvias diarias de tarde; Lamu es más húmedo que Watamu o Diani por su posición norte. La brisa del océano hace los días calurosos (32°C) llevaderos.",
      info: [
        { label: "Visado", value: "eTA Kenya $30 (~$39 con tasas)" },
        { label: "Moneda", value: "Shilling (KES)" },
        { label: "Idioma", value: "Suajili predominante. Inglés en hoteles." },
        { label: "Mejor época", value: "Nov-Feb. Maulidi (marzo-abril, variable)." },
        { label: "Enchufe", value: "Tipo G (UK), 240V" },
        { label: "Consejos", value: "Sin coches: solo asnos y dhows. Vestid modestos (zona musulmana practicante)." },
      ],
    },
    {
      id: "diani", title: "Diani turismo + kitesurf", country: "KE",
      daysBase: 22, daysMin: 14, daysMax: 32, dailyCost: cost(38, 80, 170), fixedCost: cost(40, 60, 100),
      interests: ["adventure", "nature"],
      hero: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Diani_Beach_Ukunda.jpg/500px-Diani_Beach_Ukunda.jpg",
      info: [
        { label: "Visado", value: "eTA Kenya $30 (~$39 con tasas)" },
        { label: "Moneda", value: "Shilling (KES)" },
        { label: "Idioma", value: "Suajili (inglés en turismo)" },
        { label: "Mejor época", value: "Dic-Mar y Jun-Sep para kitesurf." },
        { label: "Enchufe", value: "Tipo G (UK), 240V" },
        { label: "Consejos", value: "Resorts negociables fuera de temporada. Tuk-tuk barato dentro de Diani." },
      ],
    },

    // ── Fijas tras Costa Kenia ──
    {
      id: "safari-ke", title: "Safari Kenya (Masái Mara)", country: "KE",
      daysBase: 13, daysMin: 8, daysMax: 18, dailyCost: cost(125, 230, 400), fixedCost: cost(40, 60, 100),
      interests: ["safari", "nature"],
      hero: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Masai_Mara_at_Sunset.jpg/500px-Masai_Mara_at_Sunset.jpg",
      info: [
        { label: "Visado", value: "eTA Kenya $30 (~$39 con tasas)" },
        { label: "Moneda", value: "Shilling (KES)" },
        { label: "Idioma", value: "Suajili + maa (maasai); inglés con guías" },
        { label: "Mejor época", value: "Dic-Feb seco (verde), Jul-Oct migración." },
        { label: "Enchufe", value: "Tipo G (UK), 240V" },
        { label: "Consejos", value: "Tasas del parque Mara: $80/día. Llevad USD cash, casi todo se paga así." },
      ],
    },
    {
      id: "mafia", title: "Mafia · Costa Tanzania", country: "TZ",
      daysBase: 23, daysMin: 14, daysMax: 30, dailyCost: cost(55, 100, 175), fixedCost: cost(120, 145, 180),
      interests: ["dive", "nature"],
      hero: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mafia_Island_%2851554991378%29.jpg/500px-Mafia_Island_%2851554991378%29.jpg",
      info: [
        { label: "Visado", value: "eVisa Tanzania $50 online" },
        { label: "Moneda", value: "Shilling tanzano (TZS) · 1€ ≈ 3.000 TZS" },
        { label: "Idioma", value: "Suajili + inglés" },
        { label: "Mejor época", value: "Oct-Mar (tiburón ballena Oct-Mar, pico dic-ene)." },
        { label: "Enchufe", value: "Tipo D/G, 230V" },
        { label: "Consejos", value: "Mafia está separada de Zanzíbar. Ferry MV Kilindoni 2-3x/semana, ~20$." },
      ],
    },

    // ── Uganda / Ruanda (fork opcional) ──
    { id: "uganda", title: "Uganda — Gorilas + Sabana", country: "UG", daysBase: 14, daysMin: 10, daysMax: 20, dailyCost: cost(80, 160, 320), fixedCost: cost(950, 1100, 1350), interests: ["safari", "adventure"] },
    { id: "rwanda", title: "Ruanda — Gorilas + Lago Kivu", country: "RW", daysBase: 10, daysMin: 7, daysMax: 14, dailyCost: cost(100, 200, 420), fixedCost: cost(1700, 1900, 2200), interests: ["culture", "adventure"] },
    skipPhase("skip_uganda", "Directo a Tanzania"),

    // ── Safari Tanzania (fork) ──
    { id: "safari-tz-norte", title: "Safari Norte clásico", country: "TZ", daysBase: 14, daysMin: 10, daysMax: 18, dailyCost: cost(120, 220, 400), fixedCost: cost(30, 50, 100), interests: ["safari", "nature"] },
    { id: "safari-tz-sur", title: "Safari Sur salvaje", country: "TZ", daysBase: 11, daysMin: 8, daysMax: 16, dailyCost: cost(150, 280, 500), fixedCost: cost(220, 470, 920), interests: ["safari", "adventure"] },

    // ── Costa Tanzania (fork) ──
    { id: "costa-pemba", title: "Pemba virgen", country: "TZ", daysBase: 20, daysMin: 12, daysMax: 28, dailyCost: cost(50, 95, 170), fixedCost: cost(70, 90, 110), interests: ["dive", "nature"] },
    { id: "costa-zanzibar", title: "Zanzíbar cultural", country: "TZ", daysBase: 18, daysMin: 10, daysMax: 28, dailyCost: cost(45, 90, 175), fixedCost: cost(65, 80, 115), interests: ["culture", "foodie"] },

    // ── Índico profundo (fork) ──
    { id: "mozambique", title: "Quirimbas, Mozambique", country: "MZ", daysBase: 18, daysMin: 14, daysMax: 25, dailyCost: cost(46, 110, 250), fixedCost: cost(430, 540, 620), interests: ["dive", "nature"] },
    { id: "comoros", title: "Mohéli, Comoras", country: "KM", daysBase: 18, daysMin: 14, daysMax: 25, dailyCost: cost(38, 90, 200), fixedCost: cost(380, 430, 510), interests: ["nature", "adventure"] },
    { id: "madagascar", title: "Madagascar — Nosy Be", country: "MG", daysBase: 21, daysMin: 14, daysMax: 35, dailyCost: cost(45, 95, 215), fixedCost: cost(310, 430, 580), interests: ["nature", "birding"] },
    { id: "malawi", title: "Malawi — Lago Malawi", country: "MW", daysBase: 18, daysMin: 12, daysMax: 30, dailyCost: cost(28, 60, 120), fixedCost: cost(120, 220, 320), interests: ["dive", "nature"] },
    skipPhase("skip_f1", "Saltar Índico (vuelo directo)", cost(400, 500, 600)),

    // ── Fijas: África austral ──
    { id: "victoria", title: "Victoria Falls", country: ["ZM", "ZW"], daysBase: 12, daysMin: 7, daysMax: 18, dailyCost: cost(32, 80, 185), fixedCost: cost(380, 520, 720), interests: ["adventure", "nature"] },
    { id: "botswana", title: "Botswana", country: "BW", daysBase: 13, daysMin: 8, daysMax: 20, dailyCost: cost(110, 230, 500), fixedCost: cost(110, 220, 410), interests: ["safari", "nature"] },

    // ── Final del viaje (fork) ──
    { id: "namibia", title: "Namibia — Roadtrip", country: "NA", daysBase: 19, daysMin: 12, daysMax: 28, dailyCost: cost(45, 100, 210), fixedCost: cost(220, 320, 430), interests: ["adventure", "nature"] },
    { id: "capetown", title: "Ciudad del Cabo", country: "ZA", daysBase: 15, daysMin: 8, daysMax: 25, dailyCost: cost(42, 95, 180), fixedCost: cost(100, 150, 380), interests: ["culture", "foodie"] },
    { id: "sodwana", title: "Sodwana Bay (KZN)", country: "ZA", daysBase: 17, daysMin: 10, daysMax: 25, dailyCost: cost(40, 90, 195), fixedCost: cost(120, 175, 195), interests: ["dive", "nature"] },
    skipPhase("skip_f2", "Saltar Sudáfrica/Namibia", cost(300, 400, 500)),

    // ── África Occidental (fork opcional) ──
    { id: "westafrica", title: "África Occidental", country: ["SN", "GM", "GH", "TG", "BJ"], daysBase: 22, daysMin: 14, daysMax: 35, dailyCost: cost(28, 75, 175), fixedCost: cost(520, 700, 980), interests: ["culture", "foodie"] },
    skipPhase("skip_westafrica", "Saltar África Occidental"),

    // ── Extensiones de cierre (mayo-junio) ──
    { id: "ethiopia", title: "Etiopía", country: "ET", daysBase: 18, daysMin: 12, daysMax: 28, dailyCost: cost(25, 65, 135), fixedCost: cost(400, 510, 620), interests: ["culture", "adventure"] },
    { id: "egypt", title: "Egipto", country: "EG", daysBase: 18, daysMin: 12, daysMax: 28, dailyCost: cost(38, 95, 230), fixedCost: cost(240, 300, 410), interests: ["culture"] },
    { id: "jordan", title: "Jordania", country: "JO", daysBase: 14, daysMin: 8, daysMax: 21, dailyCost: cost(52, 130, 320), fixedCost: cost(170, 270, 440), interests: ["culture", "adventure"] },
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

  // Estacionalidad por fase (óptimo/evitar/eventos). Migrado verbatim de
  // africa-trip-planning/src/data/seasonality.js. Eventos: `months` (ventana ancha)
  // o `dates` MM-DD (festival con fecha). Lo cruza el engine con seasonFit.
  seasonality: {
    watamu: { optimal: [11, 12, 1, 2, 3], avoid: { months: [4, 5], reason: "lluvias largas" }, events: [] },
    lamu: {
      optimal: [11, 12, 1, 2], avoid: { months: [4, 5], reason: "lluvias largas" },
      events: [
        { name: "Festival Maulidi", months: [3, 4], peak: [], desc: "Nacimiento del Profeta; fecha varía con el calendario lunar islámico." },
        { name: "Lamu Cultural Festival", dates: { start: "11-21", end: "11-24" }, kind: "festival", desc: "Carreras de dhows + bailes + poesía swahili en Stone Town de Lamu." },
      ],
    },
    diani: {
      optimal: [12, 1, 2, 3, 6, 7, 8, 9], avoid: { months: [4, 5], reason: "lluvias largas" },
      events: [{ name: "Temporada de kitesurf", months: [12, 1, 2, 3, 6, 7, 8, 9], peak: [1, 2, 7, 8] }],
    },
    "safari-ke": {
      optimal: [12, 1, 2, 7, 8, 9, 10], avoid: { months: [4, 5], reason: "lluvias largas" },
      events: [{ name: "Gran Migración (Masai Mara)", months: [7, 8, 9, 10], peak: [8, 9] }],
    },
    mafia: {
      optimal: [10, 11, 12, 1, 2, 3], avoid: { months: [4, 5], reason: "lluvias largas" },
      events: [{ name: "Tiburón ballena", months: [10, 11, 12, 1, 2, 3], peak: [12, 1] }],
    },
    "safari-tz-norte": {
      optimal: [1, 2, 6, 7, 8, 9, 10], avoid: { months: [4, 5], reason: "lluvias largas" },
      events: [
        { name: "Partos de ñus (Ndutu)", months: [1, 2], peak: [2] },
        { name: "Migración (Serengeti → Mara)", months: [6, 7, 8, 9, 10], peak: [8, 9] },
      ],
    },
    "safari-tz-sur": {
      optimal: [7, 8, 9, 10], avoid: { months: [3, 4, 5], reason: "lluvias largas (Selous parcialmente cerrado)" }, events: [],
    },
    "costa-pemba": {
      optimal: [7, 8, 9, 10, 12, 1, 2], avoid: { months: [3, 4, 5], reason: "lluvias largas" },
      events: [{ name: "Mejor visibilidad de buceo", months: [7, 8, 9, 10], peak: [9, 10] }],
    },
    "costa-zanzibar": {
      optimal: [6, 7, 8, 9, 10, 12, 1, 2], avoid: { months: [4, 5], reason: "lluvias largas" },
      events: [
        { name: "Sauti za Busara", dates: { start: "02-08", end: "02-11" }, kind: "festival", desc: "Festival de música del África Oriental en Stone Town · 4 noches." },
        { name: "Zanzibar International Film Festival (ZIFF)", dates: { start: "07-08", end: "07-16" }, kind: "festival", desc: "Cine africano + talleres + conciertos al aire libre." },
      ],
    },
    mozambique: {
      optimal: [5, 6, 7, 8, 9, 10, 11], avoid: { months: [1, 2, 3], reason: "temporada de ciclones" },
      events: [{ name: "Buceo en Quirimbas", months: [6, 7, 8, 9, 10], peak: [8, 9] }],
    },
    comoros: { optimal: [5, 6, 7, 8, 9, 10], avoid: { months: [12, 1, 2, 3], reason: "lluvias y ciclones" }, events: [] },
    madagascar: {
      optimal: [4, 5, 6, 7, 8, 9, 10], avoid: { months: [1, 2, 3], reason: "temporada de ciclones" },
      events: [
        { name: "Buceo en Nosy Be", months: [6, 7, 8, 9], peak: [8] },
        { name: "Ballenas jorobadas (Sainte-Marie)", months: [7, 8, 9], peak: [8] },
      ],
    },
    malawi: {
      optimal: [5, 6, 7, 8, 9, 10], avoid: null,
      events: [{ name: "Lake of Stars Festival", dates: { start: "09-26", end: "09-28" }, kind: "festival", desc: "3 días de música frente al lago Malawi (Mangochi)." }],
    },
    victoria: {
      optimal: [3, 4, 5, 6, 7, 8, 9, 10], avoid: null,
      events: [
        { name: "Pico de caudal de las cataratas", months: [3, 4, 5], peak: [3, 4] },
        { name: "Devil's Pool (aguas bajas)", months: [9, 10, 11, 12, 1], peak: [10, 11] },
      ],
    },
    botswana: {
      optimal: [5, 6, 7, 8, 9, 10], avoid: null,
      events: [{ name: "Inundación del delta (Okavango)", months: [6, 7, 8, 9], peak: [7, 8] }],
    },
    namibia: { optimal: [5, 6, 7, 8, 9, 10], avoid: { months: [1, 2, 3], reason: "lluvias en el norte + calor" }, events: [] },
    capetown: {
      optimal: [11, 12, 1, 2, 3, 4], avoid: { months: [6, 7], reason: "invierno húmedo y frío" },
      events: [
        { name: "Ballena franca austral (Hermanus)", months: [6, 7, 8, 9, 10], peak: [8, 9] },
        { name: "Cape Town International Jazz Festival", dates: { start: "03-28", end: "03-29" }, kind: "festival", desc: "Mayor festival de jazz del hemisferio sur · CTICC." },
      ],
    },
    sodwana: {
      optimal: [3, 4, 5, 6, 11, 12, 1, 2], avoid: null,
      events: [
        { name: "Anidación de tortugas", months: [11, 12, 1, 2], peak: [12, 1] },
        { name: "Migración de ballenas jorobadas", months: [6, 7, 8, 9, 10, 11], peak: [8, 9] },
      ],
    },
    uganda: {
      optimal: [6, 7, 8, 9, 12, 1, 2], avoid: { months: [3, 4, 5], reason: "lluvias largas (senderos resbaladizos)" },
      events: [{ name: "Trekking de gorilas (todo el año)", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], peak: [6, 7, 8, 9] }],
    },
    rwanda: {
      optimal: [6, 7, 8, 9, 12, 1, 2], avoid: { months: [3, 4, 5], reason: "lluvias largas (senderos resbaladizos)" },
      events: [
        { name: "Trekking de gorilas (todo el año)", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], peak: [6, 7, 8, 9] },
        { name: "Kwita Izina (bautizo de gorilas)", dates: { start: "09-05", end: "09-05" }, kind: "festival", desc: "Nombran a los bebés gorila del año (Volcanoes NP)." },
      ],
    },
    ethiopia: {
      optimal: [10, 11, 12, 1, 2, 3], avoid: { months: [6, 7, 8, 9], reason: "lluvias largas (junio el peor)" },
      events: [
        { name: "Timkat (Epifanía ortodoxa)", dates: { start: "01-19", end: "01-20" }, kind: "religious", desc: "Procesión del Tabot en Gondar/Lalibela." },
        { name: "Meskel", dates: { start: "09-27", end: "09-27" }, kind: "religious", desc: "Hallazgo de la Vera Cruz · grandes hogueras." },
        { name: "Genna (Navidad ortodoxa)", dates: { start: "01-07", end: "01-07" }, kind: "religious", desc: "Misa solemne en Lalibela al amanecer." },
      ],
    },
    egypt: {
      optimal: [10, 11, 12, 1, 2, 3, 4], avoid: { months: [6, 7, 8], reason: "calor extremo (Luxor/Asuán)" },
      events: [
        { name: "Abu Simbel Sun Festival", dates: { start: "02-22", end: "02-22" }, kind: "natural", desc: "El sol ilumina las estatuas internas del templo de Ramsés II (también 22 oct)." },
        { name: "Abu Simbel Sun Festival (otoño)", dates: { start: "10-22", end: "10-22" }, kind: "natural", desc: "Segunda fecha del fenómeno solar." },
      ],
    },
    jordan: { optimal: [3, 4, 5, 9, 10, 11], avoid: { months: [7, 8], reason: "calor extremo" }, events: [] },
    westafrica: {
      optimal: [11, 12, 1, 2, 3, 4], avoid: { months: [6, 7, 8, 9], reason: "monzón de África Occidental (lluvias + humedad)" },
      events: [
        { name: "Harmattan (polvo del Sáhara)", months: [12, 1, 2], peak: [1, 2], kind: "natural", desc: "Viento del Sáhara · cielos lechosos, visibilidad aérea reducida." },
        { name: "Fiesta Nacional del Vudú (Ouidah)", dates: { start: "01-10", end: "01-10" }, kind: "religious", desc: "Capital mundial del vudú (Benín)." },
        { name: "Saint-Louis Jazz Festival", dates: { start: "05-13", end: "05-17" }, kind: "festival", desc: "Festival africano de jazz más antiguo (Senegal)." },
      ],
    },
  },

  // Puntos de interés por fase (migración parcial: fases de entrada KE/TZ).
  // Migrado verbatim de phaseLocations.js. type ∈ city|beach|park|dive|ruin|
  // island|lodge|viewpoint|town|airport. img: Wikimedia 500px (regla del inventario).
  // PENDIENTE: resto de fases (~120 POIs) en incrementos siguientes.
  pois: {
    watamu: [
      { name: "Mombasa", lat: -4.043, lng: 39.668, type: "city", desc: "Hub de la costa · llegada por tren desde NBO. Fort Jesus, Old Town, Nyali Beach.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Mombasa_Island.jpg/500px-Mombasa_Island.jpg" },
      { name: "Watamu", lat: -3.357, lng: 40.022, type: "town", desc: "Base principal · pueblo costero.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Watamu_Beach%2C_Kenya.JPG/500px-Watamu_Beach%2C_Kenya.JPG" },
      { name: "Watamu Marine NP", lat: -3.38, lng: 40.02, type: "park", desc: "Reserva marina · snorkel + delfines." },
      { name: "Mida Creek", lat: -3.345, lng: 39.974, type: "viewpoint", desc: "Manglares · kayak + cangrejos al atardecer." },
      { name: "Malindi", lat: -3.218, lng: 40.117, type: "city", desc: "Ciudad histórica · cabotaje, mercado.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Pillar_of_Vasco_da_Gama.jpg/500px-Pillar_of_Vasco_da_Gama.jpg" },
      { name: "Gede Ruins", lat: -3.31, lng: 40.02, type: "ruin", desc: "Ciudad swahili abandonada s. XIII.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Great_Mosque_of_Gede.jpg/500px-Great_Mosque_of_Gede.jpg" },
      { name: "Arabuko-Sokoke", lat: -3.33, lng: 39.88, type: "park", desc: "Bosque costero · monos colobos, aves endémicas." },
      { name: "Marafa Hell's Kitchen", lat: -3.044, lng: 39.946, type: "viewpoint", desc: "Cañón de arenisca · paseo al atardecer." },
      { name: "Watamu Turtle Watch", lat: -3.35, lng: 40.025, type: "park", desc: "Local Ocean Conservation · ver tortugas anidando." },
    ],
    lamu: [
      { name: "Lamu Old Town", lat: -2.269, lng: 40.902, type: "city", desc: "UNESCO s. XIV · callejuelas sin coches, casas con puertas talladas, mezquita Riyadha.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Lamu_Old_Town.jpg/500px-Lamu_Old_Town.jpg" },
      { name: "Shela Beach", lat: -2.31, lng: 40.925, type: "beach", desc: "Playa larga blanca · 12 km." },
      { name: "Manda Island", lat: -2.25, lng: 40.91, type: "island", desc: "Aeropuerto + ruinas de Takwa.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/TakwaArch.jpg/500px-TakwaArch.jpg" },
      { name: "Kizingo (sur Lamu)", lat: -2.38, lng: 40.91, type: "lodge", desc: "Eco-lodge remoto · vacío total." },
      { name: "Manda Airport", lat: -2.252, lng: 40.913, type: "airport", desc: "Llegada desde Wilson NBO." },
      { name: "Pate Island", lat: -2.1, lng: 41.05, type: "island", desc: "Norte del archipiélago · ruinas medievales remotas.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Pate_town_narrow_streets.jpg/500px-Pate_town_narrow_streets.jpg" },
      { name: "Matondoni village", lat: -2.235, lng: 40.83, type: "town", desc: "Pueblo constructor de dhows · taller artesanal." },
    ],
    diani: [
      { name: "Ukunda / Mombasa", lat: -4.22, lng: 39.57, type: "city", desc: "Llegada por Moi Intl Airport (MBA). Ferry a Likoni." },
      { name: "Diani Beach", lat: -4.31, lng: 39.575, type: "beach", desc: "Playa #1 de África · 17 km de arena blanca.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Diani_Beach_Ukunda.jpg/500px-Diani_Beach_Ukunda.jpg" },
      { name: "Kongo River mouth", lat: -4.247, lng: 39.582, type: "viewpoint", desc: "Estuario norte · jet ski + kitesurf." },
      { name: "Galu Beach", lat: -4.385, lng: 39.555, type: "beach", desc: "Extremo sur · más tranquilo." },
      { name: "Shimba Hills NR", lat: -4.23, lng: 39.42, type: "park", desc: "Reserva colina · elefantes + sable antelope.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Elephants_at_shimba.jpg/500px-Elephants_at_shimba.jpg" },
      { name: "Wasini Island", lat: -4.66, lng: 39.385, type: "dive", desc: "Day trip · snorkel con delfines.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Shimoni_%26_Wasini.jpg/500px-Shimoni_%26_Wasini.jpg" },
      { name: "Funzi Island", lat: -4.567, lng: 39.42, type: "island", desc: "Day trip al sur · cocodrilos del estuario." },
      { name: "Mwaluganje Sanctuary", lat: -4.26, lng: 39.38, type: "park", desc: "Santuario comunitario de elefantes." },
    ],
    "safari-ke": [
      { name: "Nairobi", lat: -1.286, lng: 36.817, type: "city", desc: "Hub de llegada · 1-2 días aclimatación.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Nairobi_skyline_from_Gem_Hotel.jpg/500px-Nairobi_skyline_from_Gem_Hotel.jpg" },
      { name: "Wilson Airport", lat: -1.322, lng: 36.814, type: "airport", desc: "Vuelos charter a Mara, Amboseli, Samburu (~45 min)." },
      { name: "Nairobi NP", lat: -1.37, lng: 36.85, type: "park", desc: "Safaris con skyline de fondo · leones, rinocerontes.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Lions_of_Kenya_02.jpg/500px-Lions_of_Kenya_02.jpg" },
      { name: "Maasai Mara NR", lat: -1.527, lng: 35.144, type: "park", desc: "La gran reserva · big 5 + migración (jul-oct).", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Masai_Mara_at_Sunset.jpg/500px-Masai_Mara_at_Sunset.jpg" },
      { name: "Sekenani Gate", lat: -1.523, lng: 35.276, type: "viewpoint", desc: "Entrada principal este." },
      { name: "Talek River", lat: -1.43, lng: 35.207, type: "lodge", desc: "Concentración de campamentos mid-range." },
      { name: "Mara Triangle", lat: -1.42, lng: 35, type: "park", desc: "Sector NW · menos turismo, fees aparte." },
      { name: "Lake Nakuru NP", lat: -0.367, lng: 36.083, type: "park", desc: "Flamencos + rinocerontes blancos.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Lake-Nakuru-Baboon-Hill-View.JPG/500px-Lake-Nakuru-Baboon-Hill-View.JPG" },
      { name: "Amboseli NP", lat: -2.652, lng: 37.26, type: "park", desc: "Vista del Kilimanjaro + elefantes." },
      { name: "Samburu NR", lat: 0.575, lng: 37.49, type: "park", desc: "Norte árido · cebra Grevy, jirafa reticulada, gerenuk.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Samburu_National_Reserve%2C_Kenya-26December2012.jpg/500px-Samburu_National_Reserve%2C_Kenya-26December2012.jpg" },
      { name: "Tsavo East NP", lat: -2.55, lng: 38.5, type: "park", desc: "El mayor de Kenia · elefantes rojos por el polvo." },
    ],
    mafia: [
      { name: "Arusha", lat: -3.387, lng: 36.683, type: "city", desc: "Tránsito desde Kenia · mercado maasai + cafetal.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Arusha_City_view.jpg/500px-Arusha_City_view.jpg" },
      { name: "Dar es Salaam", lat: -6.792, lng: 39.208, type: "city", desc: "Capital económica · Kariakoo + Kivukoni Fish Market." },
      { name: "Bagamoyo", lat: -6.443, lng: 38.901, type: "ruin", desc: "Antigua puerta del esclavismo · arquitectura suajili." },
      { name: "Kilwa Kisiwani", lat: -8.961, lng: 39.516, type: "ruin", desc: "UNESCO · ciudad comercial s. VII-XVI · Gran Mezquita.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Great_Mosque_at_Kilwa.jpg/500px-Great_Mosque_at_Kilwa.jpg" },
      { name: "Kilindoni", lat: -7.911, lng: 39.66, type: "town", desc: "Pueblo principal de Mafia + aeropuerto." },
      { name: "Chole Bay", lat: -7.951, lng: 39.829, type: "dive", desc: "Bahía marina · principal zona de buceo." },
      { name: "Utende Beach", lat: -7.94, lng: 39.84, type: "beach", desc: "Playa de los lodges premium." },
      { name: "Mafia Island Marine Park", lat: -7.95, lng: 39.83, type: "park", desc: "Tiburones ballena oct-feb.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Mafia_Island_%2851554991378%29.jpg/500px-Mafia_Island_%2851554991378%29.jpg" },
      { name: "Juani Island", lat: -8, lng: 39.86, type: "island", desc: "Tortugas verdes + ruinas." },
      { name: "Kua Ruins", lat: -8.024, lng: 39.872, type: "ruin", desc: "Ruinas de la ciudad swahili abandonada s. XVIII en Juani." },
    ],
    "safari-tz-norte": [
      { name: "Arusha", lat: -3.387, lng: 36.683, type: "city", desc: "Punto de partida del circuito.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Arusha_City_view.jpg/500px-Arusha_City_view.jpg" },
      { name: "Lake Manyara NP", lat: -3.583, lng: 35.842, type: "park", desc: "Leones trepadores + flamencos.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Lake_Manyara_Wildlife.jpg/500px-Lake_Manyara_Wildlife.jpg" },
      { name: "Ngorongoro Crater", lat: -3.165, lng: 35.56, type: "park", desc: "Cráter · big 5 todo el año.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Ngorongoro-1001-2.jpg/500px-Ngorongoro-1001-2.jpg" },
      { name: "Ndutu", lat: -2.94, lng: 34.82, type: "park", desc: "Parto de ñus (ene-feb) · sur Serengeti." },
      { name: "Serengeti Central", lat: -2.333, lng: 34.834, type: "park", desc: "Seronera Valley · base safari.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Serengeti-Landscape-2012.JPG/500px-Serengeti-Landscape-2012.JPG" },
      { name: "Tarangire NP", lat: -3.84, lng: 36.02, type: "park", desc: "Baobabs gigantes + manadas de elefantes.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Tarangine_%2862%29.jpg/500px-Tarangine_%2862%29.jpg" },
      { name: "Karatu", lat: -3.34, lng: 35.65, type: "town", desc: "Pueblo base entre Manyara y Ngorongoro.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Karatu%2C_Tanzania_%2851491750533%29.jpg/500px-Karatu%2C_Tanzania_%2851491750533%29.jpg" },
      { name: "Mto wa Mbu", lat: -3.36, lng: 35.85, type: "town", desc: "Mercado multi-tribu · 120 lenguas · cocina local." },
      { name: "Kilimanjaro", lat: -3.066, lng: 37.359, type: "viewpoint", desc: "El techo de África (5.895 m), telón de fondo de los safaris del norte.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Kilimanjaro_from_Amboseli.jpg/500px-Kilimanjaro_from_Amboseli.jpg" },
    ],
    "safari-tz-sur": [
      { name: "Dar es Salaam", lat: -6.792, lng: 39.208, type: "city", desc: "Ciudad costera · 1-2 días entre safari y playa.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/St_Joseph%27s_Catholic_Cathedral_%2834895613805%29.jpg/500px-St_Joseph%27s_Catholic_Cathedral_%2834895613805%29.jpg" },
      { name: "Selous / Nyerere NP", lat: -7.917, lng: 38.275, type: "park", desc: "Mayor parque de África · río Rufiji.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/ElefantenAmRufiji.jpg/500px-ElefantenAmRufiji.jpg" },
      { name: "Rufiji River", lat: -7.85, lng: 38.4, type: "viewpoint", desc: "Boat safari · cocodrilos + hipopótamos.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/SelousSandRivers.jpg/500px-SelousSandRivers.jpg" },
      { name: "Beho Beho", lat: -7.7, lng: 37.95, type: "lodge", desc: "Lodges premium del norte del parque." },
      { name: "Ruaha NP", lat: -7.7, lng: 34.87, type: "park", desc: "Lejano oeste · licaones, sin turismo.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Purple_On_The_River.jpg/500px-Purple_On_The_River.jpg" },
      { name: "Julius Nyerere Intl", lat: -6.878, lng: 39.202, type: "airport", desc: "Light aircraft RT a Selous + conexiones." },
      { name: "Stiegler's Gorge", lat: -7.67, lng: 38.78, type: "viewpoint", desc: "Cañón del Rufiji · paseo en barco entre paredes." },
      { name: "Mikumi NP", lat: -7.397, lng: 37.0, type: "park", desc: "Mini-Serengeti accesible · 4-5h por carretera desde Dar.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Mikumi_NP_Tanzania_2017_2.jpg/500px-Mikumi_NP_Tanzania_2017_2.jpg" },
    ],
    "costa-pemba": [
      { name: "Chake Chake", lat: -5.245, lng: 39.77, type: "town", desc: "Capital de Pemba · centro logístico." },
      { name: "Misali Island", lat: -5.234, lng: 39.582, type: "dive", desc: "Top buceo de Pemba · paredes." },
      { name: "Manta Resort", lat: -4.94, lng: 39.7, type: "dive", desc: "Buceo con mantarrayas · Ngezi.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Ngezi_forest.jpg/500px-Ngezi_forest.jpg" },
      { name: "Wete", lat: -5.063, lng: 39.722, type: "town", desc: "Pueblo norte · ferry desde Tanga.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Pemba_Wete_city_map1a.jpg/500px-Pemba_Wete_city_map1a.jpg" },
      { name: "Mkoani Port", lat: -5.366, lng: 39.658, type: "town", desc: "Ferry a Stone Town · ~6h." },
      { name: "Vumawimbi Beach", lat: -4.93, lng: 39.78, type: "beach", desc: "Playa virgen del norte · arena fina, nadie.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Vumawimbi_Beach%2C_Pemba_Island.jpg/500px-Vumawimbi_Beach%2C_Pemba_Island.jpg" },
      { name: "Ras Mkumbuu Ruins", lat: -5.13, lng: 39.65, type: "ruin", desc: "Ciudad swahili s. XIV en la costa oeste · solo por barco." },
      { name: "Ngezi Forest Reserve", lat: -4.92, lng: 39.69, type: "park", desc: "Único bosque tropical primario de Pemba · zorros voladores + endemismos." },
      { name: "Stone Town", lat: -6.165, lng: 39.199, type: "city", desc: "Stopover desde Pemba · UNESCO swahili-omaní.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Zanzibar_sultan_palace.jpg/500px-Zanzibar_sultan_palace.jpg" },
    ],
  },

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
