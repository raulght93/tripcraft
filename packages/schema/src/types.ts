// Trip Schema — tipos puros (sin dependencias). Fuente única de la forma de un
// viaje. El validador runtime (validate.ts, con Valibot) referencia estos tipos.
// El engine importa SOLO estos tipos (import type → se borran en runtime), por lo
// que el motor nunca depende de Valibot ni de ningún viaje concreto.

export type TierId = string;

export interface CostMultiplierRule {
  /** Identificador de la regla (p.ej. "shared-accommodation"). */
  type: string;
  /** nº de viajeros (como string) → factor sobre el subtotal por persona. */
  factorBy: Record<string, number>;
}

export interface DateWindow {
  start: string;
  targetEnd?: string;
}

export interface TripMeta {
  dateWindowDefault?: DateWindow;
  travelersDefault?: number;
  costMultiplierRule?: CostMultiplierRule;
}

export interface Phase {
  id: string;
  title: string;
  country?: string;
  flag?: string;
  daysBase: number;
  daysMin: number;
  daysMax: number;
  /** Coste diario por tier, alineado con trip.tiers (p.ej. [low, mid, high]). */
  dailyCost: number[];
  /** Coste fijo de transición por tier. */
  fixedCost: number[];
  interests?: string[];
  hero?: string;
  slides?: string[];
  climateWarning?: string | null;
  safetyNote?: string | null;
}

/** budget → interest → optionId. Generaliza data/forkRecs.js de Africa. */
export type ForkRecs = Record<string, Record<string, string>>;

export interface Fork {
  id: string;
  label: string;
  icon?: string;
  /** phaseIds candidatos. TODA opción debe existir como phase. */
  options: string[];
  default: string;
  /**
   * Opciones que, al elegirse, NO añaden nada a la ruta (el viaje sigue de largo).
   * Modela el matiz de Africa: fork_uganda/fork_westafrica omiten su "skip", pero
   * skip_f1/skip_f2 NO están aquí → permanecen como fases de coste-cero que cargan
   * el coste del vuelo directo. Sustituye la frágil heurística de prefijo "skip_".
   */
  omitWhenSelected?: string[];
  recs?: ForkRecs;
}

export type SequenceItem =
  | { kind: "phase"; ref: string; optional?: boolean }
  | { kind: "fork"; ref: string; optional?: boolean }
  | { kind: "extensionGroup"; ref: string; members: string[]; reorderable?: boolean };

export interface Addon {
  id: string;
  icon?: string;
  label: string;
  desc?: string;
  cost: number[];
  days?: number;
}

export interface Trip {
  id: string;
  slug: string;
  version: number;
  title: string;
  lang: string;
  currency: string;
  /** Orden de los tiers; el índice se usa para indexar dailyCost/fixedCost/cost. */
  tiers: TierId[];
  meta: TripMeta;
  phases: Phase[];
  forks: Fork[];
  sequence: SequenceItem[];
  addons?: Record<string, Addon[]>;
}
