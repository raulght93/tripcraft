import { displayFlag, monthNames, phaseCost } from "@tripcraft/engine";
import { colors, fonts, radii } from "../styles/tokens.js";
import { useTrip } from "../trip/TripContext.jsx";

const fmtEUR = (n) => `${Math.round(n).toLocaleString("es-ES")} €`;

export function PhaseView({ phaseId }) {
  const { trip, tier, phaseById } = useTrip();
  const phase = phaseById[phaseId];
  if (!phase) return null;

  const cost = phaseCost(trip, phaseId, phase.daysBase, tier);
  const season = trip.seasonality?.[phaseId];

  return (
    <section
      aria-labelledby={`phase-${phaseId}-title`}
      style={{ padding: 20, fontFamily: fonts.sans, color: colors.text }}
    >
      <h2
        id={`phase-${phaseId}-title`}
        style={{ fontFamily: fonts.serif, fontSize: 28, margin: "0 0 4px" }}
      >
        <span aria-hidden="true">{displayFlag(phase)}</span> {phase.title}
      </h2>
      <p style={{ color: colors.muted, margin: "0 0 16px" }}>
        {phase.daysBase} días sugeridos · {phase.daysMin}–{phase.daysMax} ajustable
      </p>

      <div
        style={{
          display: "inline-block",
          padding: "12px 16px",
          borderRadius: radii.md,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
        }}
      >
        <div style={{ fontSize: 13, color: colors.muted }}>
          Coste estimado ({phase.daysBase} días, nivel {tier})
        </div>
        <div style={{ fontSize: 26, fontFamily: fonts.serif, color: colors.accent }}>
          {fmtEUR(cost)}
        </div>
      </div>

      {season ? (
        <p style={{ marginTop: 16, color: colors.muted }}>
          🗓️ Mejor temporada:{" "}
          <strong style={{ color: colors.text }}>{monthNames(season.optimal)}</strong>
          {season.avoid
            ? ` · evitar ${monthNames(season.avoid.months)} (${season.avoid.reason})`
            : ""}
        </p>
      ) : null}
    </section>
  );
}
