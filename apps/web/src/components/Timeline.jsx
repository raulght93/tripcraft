import { displayFlag, seasonFit } from "@tripcraft/engine";
import { useMemo } from "react";
import { useResponsive } from "../hooks/useResponsive.js";
import { decisionPhases, phaseToTab } from "../lib/tabs.js";
import { colors, fonts, radii } from "../styles/tokens.js";
import { useTrip } from "../trip/TripContext.jsx";

const fmtDate = (iso) =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(
    new Date(`${iso}T00:00:00`),
  );

const DOT = { optimal: "#1f7a3f", good: "#3f7a1f", mixed: "#8a6d1f", suboptimal: "#9a3b1f" };

export function Timeline({ onSelectPhase }) {
  const { trip, startDate, setStartDate, itinerary, phaseById } = useTrip();
  const { isMobile } = useResponsive();
  const tabOf = useMemo(() => phaseToTab(trip), [trip]);
  const decisions = useMemo(() => decisionPhases(trip), [trip]);
  const end = itinerary.at(-1)?.endISO;

  return (
    <section style={{ padding: isMobile ? 14 : 20, fontFamily: fonts.sans, color: colors.text }}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: isMobile ? 24 : 28, margin: "0 0 8px" }}>
        Tu itinerario
      </h2>
      <p style={{ color: colors.muted, margin: "0 0 16px", lineHeight: 1.5, maxWidth: 640 }}>
        Tu ruta se compone de etapas. Las marcadas con <strong>🔀 elige</strong> tienen alternativas
        entre las que decidir; el resto son fijas. Toca cualquier etapa para ver su detalle, ajusta
        el <strong>nivel</strong> y la <strong>fecha de inicio</strong>, y las fechas se recalculan
        solas.
      </p>

      <label
        style={{
          display: "inline-flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: colors.muted }}>Fecha de inicio</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            fontFamily: fonts.sans,
            fontSize: 16,
            padding: "8px 10px",
            borderRadius: radii.sm,
            border: `1px solid ${colors.border}`,
            background: colors.surfaceAlt,
            color: colors.text,
          }}
        />
        {end ? <span style={{ color: colors.muted }}>→ vuelta {fmtDate(end)}</span> : null}
      </label>

      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
        {itinerary.map((leg, i) => {
          const phase = phaseById[leg.phaseId];
          const fit = seasonFit(trip, leg.phaseId, {
            start: leg.startISO,
            end: leg.endISO,
            days: leg.days,
          });
          const dot = fit ? DOT[fit.status] : colors.border;
          const isDecision = decisions.has(leg.phaseId);
          return (
            <li key={leg.phaseId}>
              <button
                type="button"
                onClick={() => onSelectPhase?.(tabOf[leg.phaseId] ?? leg.phaseId)}
                aria-label={`Etapa ${i + 1}: ${phase?.title ?? leg.phaseId}${isDecision ? " (con alternativas)" : ""}`}
                style={{
                  width: "100%",
                  minHeight: 56,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                  color: colors.text,
                  cursor: "pointer",
                }}
              >
                <span
                  aria-hidden="true"
                  title={fit ? `Temporada: ${fit.status}` : ""}
                  style={{ width: 10, height: 10, borderRadius: 5, background: dot, flexShrink: 0 }}
                />
                <span aria-hidden="true" style={{ fontSize: 18 }}>
                  {displayFlag(phase ?? {})}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 600 }}>
                    {i + 1}. {phase?.title ?? leg.phaseId}
                  </span>
                  {isDecision ? (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        padding: "2px 7px",
                        borderRadius: 999,
                        background: colors.accent,
                        color: colors.accentText,
                        whiteSpace: "nowrap",
                      }}
                    >
                      🔀 elige
                    </span>
                  ) : null}
                  <span style={{ display: "block", fontSize: 13, color: colors.muted }}>
                    {leg.days > 0
                      ? `${fmtDate(leg.startISO)} – ${fmtDate(leg.endISO)} · ${leg.days} días`
                      : "—"}
                  </span>
                </span>
                <span aria-hidden="true" style={{ color: colors.muted, flexShrink: 0 }}>
                  ›
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
