// Utilidades de fecha puras (sin estado, sin I/O). Portadas de utils/seasonality.js
// de Africa. Las usa el motor de estacionalidad y la capa web.

export interface DateRange {
  start: string | Date;
  end: string | Date;
  days?: number;
}

const toDate = (d: string | Date): Date => (d instanceof Date ? d : new Date(d));

/** Construye una fecha desde `year` + "MM-DD". null si está mal formada. */
export const buildDate = (year: number, md: string): Date | null => {
  if (!md) return null;
  const parts = md.split("-").map((s) => Number.parseInt(s, 10));
  const [m, d] = parts;
  if (!Number.isFinite(m) || !Number.isFinite(d)) return null;
  return new Date(year, (m as number) - 1, d);
};

/** Todos los meses (1-12) que toca un rango [start, end]. */
export const monthsInRange = (start: string | Date, end: string | Date): number[] => {
  const s = toDate(start);
  const e = toDate(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return [];
  const out = new Set<number>();
  const cursor = new Date(s.getFullYear(), s.getMonth(), 1);
  while (cursor <= e) {
    out.add(cursor.getMonth() + 1);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  out.add(s.getMonth() + 1);
  out.add(e.getMonth() + 1);
  return [...out].sort((a, b) => a - b);
};

/**
 * Para una ventana anual recurrente `dates: {start,end}` (MM-DD, sin año) y un
 * rango real, devuelve las ocurrencias que intersectan. Maneja viajes multi-año
 * y ventanas que cruzan el fin de año (dic→ene).
 */
export const occurrencesInRange = (
  dates: { start: string; end: string },
  range: DateRange,
): Array<{ start: Date; end: Date }> => {
  if (!dates?.start || !dates?.end || !range?.start || !range?.end) return [];
  const rangeStart = toDate(range.start);
  const rangeEnd = toDate(range.end);
  if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) return [];
  const out: Array<{ start: Date; end: Date }> = [];
  for (let y = rangeStart.getFullYear(); y <= rangeEnd.getFullYear(); y += 1) {
    const evStart = buildDate(y, dates.start);
    let evEnd = buildDate(y, dates.end);
    if (!evStart || !evEnd) continue;
    if (evEnd < evStart) evEnd = buildDate(y + 1, dates.end); // cruce de año
    if (!evEnd) continue;
    if (evEnd >= rangeStart && evStart <= rangeEnd) out.push({ start: evStart, end: evEnd });
  }
  return out;
};
