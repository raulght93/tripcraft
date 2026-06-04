import { monthNames, seasonFit } from "@tripcraft/engine";
import { colors, fonts, radii } from "../styles/tokens.js";
import { useTrip } from "../trip/TripContext.jsx";

const STYLE = {
  optimal: { bg: "#1f7a3f", label: "🌟 Temporada óptima" },
  good: { bg: "#3f7a1f", label: "✓ Buena temporada" },
  mixed: { bg: "#8a6d1f", label: "· Temporada mixta" },
  suboptimal: { bg: "#9a3b1f", label: "⚠️ Temporada poco favorable" },
};

/** Veredicto de encaje estacional para la fase, usando las fechas reales del tramo. */
export function SeasonBanner({ phaseId }) {
  const { trip, legByPhase } = useTrip();
  const leg = legByPhase[phaseId];
  if (!leg) return null;
  const fit = seasonFit(trip, phaseId, { start: leg.startISO, end: leg.endISO, days: leg.days });
  if (!fit) return null;

  const s = STYLE[fit.status];
  return (
    <div
      style={{
        marginTop: 16,
        padding: "10px 14px",
        borderRadius: radii.md,
        background: s.bg,
        color: "#fff",
        fontFamily: fonts.sans,
        fontSize: 14,
      }}
    >
      <strong>{s.label}</strong> · {monthNames(fit.months)}
      {fit.status === "suboptimal" && fit.avoidReason ? ` — ${fit.avoidReason}` : ""}
      {fit.activeEvents.length > 0 ? (
        <div style={{ marginTop: 4, opacity: 0.95 }}>
          🎯 Coincide con:{" "}
          {fit.activeEvents.map((e) => e.name + (e.atPeak ? " (pico)" : "")).join(" · ")}
        </div>
      ) : null}
    </div>
  );
}
