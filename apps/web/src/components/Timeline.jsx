import { displayFlag, seasonFit } from "@tripcraft/engine";
import { colors, fonts, radii } from "../styles/tokens.js";
import { useTrip } from "../trip/TripContext.jsx";

const fmtDate = (iso) =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(
    new Date(`${iso}T00:00:00`),
  );

const DOT = { optimal: "#1f7a3f", good: "#3f7a1f", mixed: "#8a6d1f", suboptimal: "#9a3b1f" };

export function Timeline({ onSelectPhase }) {
  const { trip, startDate, setStartDate, itinerary, phaseById } = useTrip();
  const end = itinerary.at(-1)?.endISO;

  return (
    <section style={{ padding: 20, fontFamily: fonts.sans, color: colors.text }}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: 28, margin: "0 0 12px" }}>Itinerario</h2>

      <label style={{ display: "inline-flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <span style={{ color: colors.muted }}>Fecha de inicio</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            fontFamily: fonts.sans,
            padding: "6px 10px",
            borderRadius: radii.sm,
            border: `1px solid ${colors.border}`,
            background: colors.surfaceAlt,
            color: colors.text,
          }}
        />
        {end ? <span style={{ color: colors.muted }}>→ fin {fmtDate(end)}</span> : null}
      </label>

      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
        {itinerary.map((leg) => {
          const phase = phaseById[leg.phaseId];
          const fit = seasonFit(trip, leg.phaseId, {
            start: leg.startISO,
            end: leg.endISO,
            days: leg.days,
          });
          const dot = fit ? DOT[fit.status] : colors.border;
          return (
            <li key={leg.phaseId}>
              <button
                type="button"
                onClick={() => onSelectPhase?.(leg.phaseId)}
                style={{
                  width: "100%",
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
                  style={{ width: 10, height: 10, borderRadius: 5, background: dot, flexShrink: 0 }}
                />
                <span aria-hidden="true">{displayFlag(phase ?? {})}</span>
                <span style={{ fontWeight: 600, flex: 1 }}>{phase?.title ?? leg.phaseId}</span>
                <span style={{ color: colors.muted, fontSize: 13 }}>
                  {leg.days > 0
                    ? `${fmtDate(leg.startISO)} – ${fmtDate(leg.endISO)} · ${leg.days}d`
                    : "—"}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
