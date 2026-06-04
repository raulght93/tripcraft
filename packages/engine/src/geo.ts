// Derivación de bandera desde código ISO 3166-1 alpha-2 — sin tabla de mantenimiento.
// La bandera emoji = los dos indicadores regionales Unicode del código.
import type { Phase } from "@tripcraft/schema";

/** "KE" → "🇰🇪". Devuelve "" si el código no es válido. */
export const flagFromIso = (code: string): string => {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  const cc = code.toUpperCase();
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
};

/**
 * Bandera a mostrar para una fase: el override manual `flag` si existe (saltos /
 * transiciones sin país), si no la derivada del país (concatenada para multi-país).
 */
export const displayFlag = (phase: Pick<Phase, "flag" | "country">): string => {
  if (phase.flag) return phase.flag;
  const c = phase.country;
  if (!c) return "";
  const list = Array.isArray(c) ? c : [c];
  return list.map(flagFromIso).join("");
};
