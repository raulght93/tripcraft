// Motor de estacionalidad — agnóstico al viaje. Cruza la seasonality de una fase
// contra el rango de fechas calculado. Portado fiel de utils/seasonality.js de Africa.
import type { Trip } from "@tripcraft/schema";
import { type DateRange, monthsInRange, occurrencesInRange } from "./dates.ts";

export const MONTHS_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** [11, 12] → "nov, dic". */
export const monthNames = (nums: number[]): string =>
  nums
    .map((m) => MONTHS_ES[m - 1])
    .filter(Boolean)
    .join(", ");

export type SeasonStatus = "optimal" | "good" | "mixed" | "suboptimal";

export interface SeasonFit {
  status: SeasonStatus;
  months: number[];
  inOptimal: number[];
  inAvoid: number[];
  avoidReason: string | null;
  activeEvents: Array<{ name: string; atPeak: boolean }>;
}

/**
 * Veredicto de encaje estacional de una fase para un rango de fechas.
 * Devuelve null si no hay datos o el rango es inválido.
 *   suboptimal: toca algún mes a evitar
 *   optimal:    todos los meses cubiertos son óptimos
 *   good:       algún mes óptimo (pero no todos)
 *   mixed:      ni óptimo ni a evitar
 */
export const seasonFit = (trip: Trip, phaseId: string, range: DateRange): SeasonFit | null => {
  const s = trip.seasonality?.[phaseId];
  if (!s || !range?.start || !range?.end || (range.days ?? 0) <= 0) return null;

  const months = monthsInRange(range.start, range.end);
  if (months.length === 0) return null;

  const optimal = new Set(s.optimal ?? []);
  const avoidMonths = new Set(s.avoid?.months ?? []);
  const inOptimal = months.filter((m) => optimal.has(m));
  const inAvoid = months.filter((m) => avoidMonths.has(m));

  const activeEvents = (s.events ?? [])
    .filter((e) => {
      if (e.dates) return occurrencesInRange(e.dates, range).length > 0;
      if (Array.isArray(e.months)) return e.months.some((m) => months.includes(m));
      return false;
    })
    .map((e) => ({
      name: e.name,
      atPeak: (e.peak ?? []).some((m) => months.includes(m)),
    }));

  let status: SeasonStatus;
  if (inAvoid.length > 0) status = "suboptimal";
  else if (months.every((m) => optimal.has(m))) status = "optimal";
  else if (inOptimal.length > 0) status = "good";
  else status = "mixed";

  return { status, months, inOptimal, inAvoid, avoidReason: s.avoid?.reason ?? null, activeEvents };
};
