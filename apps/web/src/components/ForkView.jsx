import { phaseCost } from "@tripcraft/engine";
import { useState } from "react";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { useTrip } from "../trip/TripContext.jsx";
import { PhaseView } from "./PhaseView.jsx";

const fmtEUR = (n) => `${Math.round(n).toLocaleString("es-ES")} €`;

export function ForkView({ forkId, onNavigate }) {
  const { trip, forkChoice, pickFork, tier, phaseById } = useTrip();
  const [ringId, setRingId] = useState(null);
  const fork = trip.forks.find((f) => f.id === forkId);
  if (!fork) return null;
  const chosen = forkChoice[forkId] ?? fork.default;
  const chosenOmitted = (fork.omitWhenSelected ?? []).includes(chosen);

  return (
    <section
      aria-labelledby={`fork-${forkId}-title`}
      style={{ padding: 20, fontFamily: fonts.sans, color: colors.text }}
    >
      <h2
        id={`fork-${forkId}-title`}
        style={{ fontFamily: fonts.serif, fontSize: 28, margin: "0 0 6px" }}
      >
        <span aria-hidden="true">{fork.icon ?? "🔀"}</span> {fork.label}
      </h2>
      <p
        style={{
          margin: "0 0 16px",
          padding: "8px 12px",
          borderRadius: radii.sm,
          background: colors.surfaceAlt,
          border: `1px dashed ${colors.accent}`,
          color: colors.text,
          fontSize: 14,
        }}
      >
        🔀 <strong>Etapa con alternativas.</strong> Elige una opción — el resto del itinerario, las
        fechas y el coste se recalculan según tu elección.
      </p>

      <div
        role="radiogroup"
        aria-labelledby={`fork-${forkId}-title`}
        style={{ display: "grid", gap: 10 }}
      >
        {fork.options.map((optId) => {
          const phase = phaseById[optId];
          const isChosen = optId === chosen;
          const isSkip = (fork.omitWhenSelected ?? []).includes(optId);
          const cost = phase && !isSkip ? phaseCost(trip, optId, phase.daysBase, tier) : 0;
          return (
            <button
              type="button"
              key={optId}
              role="radio"
              aria-checked={isChosen}
              onClick={() => pickFork(forkId, optId)}
              onFocus={() => setRingId(optId)}
              onBlur={() => setRingId(null)}
              style={{
                textAlign: "left",
                padding: "12px 16px",
                borderRadius: radii.md,
                border: `2px solid ${isChosen ? colors.accent : colors.border}`,
                background: colors.surface,
                color: colors.text,
                cursor: "pointer",
                boxShadow: ringId === optId ? shadows.ring : "none",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              {phase?.hero ? (
                <img
                  src={phase.hero}
                  alt=""
                  loading="lazy"
                  style={{
                    width: 72,
                    height: 54,
                    objectFit: "cover",
                    borderRadius: radii.sm,
                    flexShrink: 0,
                  }}
                />
              ) : null}
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontWeight: 600 }}>
                  {phase?.title ?? optId} {isChosen ? "✓" : ""}
                </span>
                <span style={{ display: "block", fontSize: 13, color: colors.muted }}>
                  {isSkip
                    ? "El viaje sigue de largo"
                    : `≈ ${fmtEUR(cost)} · ${phase?.daysBase ?? 0} días`}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {chosenOmitted ? (
        <p style={{ marginTop: 20, color: colors.muted }}>El viaje continúa sin esta parada.</p>
      ) : (
        <div style={{ marginTop: 24, borderTop: `1px solid ${colors.border}` }}>
          <PhaseView phaseId={chosen} onNavigate={onNavigate} />
        </div>
      )}
    </section>
  );
}
