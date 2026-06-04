import { displayFlag, phaseCost, poisFor } from "@tripcraft/engine";
import { colors, fonts, radii } from "../styles/tokens.js";
import { useTrip } from "../trip/TripContext.jsx";
import { SeasonBanner } from "./SeasonBanner.jsx";

const fmtEUR = (n) => `${Math.round(n).toLocaleString("es-ES")} €`;

const POI_ICON = {
  city: "🏙️",
  beach: "🏖️",
  park: "🌿",
  dive: "🤿",
  ruin: "🏛️",
  island: "🏝️",
  lodge: "🏕️",
  viewpoint: "📸",
  town: "🏘️",
  airport: "✈️",
};

function WarningBanner({ text, tone }) {
  const bg = tone === "safety" ? "#9a3b1f" : "#8a6d1f";
  return (
    <div
      role="note"
      style={{
        marginTop: 12,
        padding: "10px 14px",
        borderRadius: radii.md,
        background: bg,
        color: "#fff",
        fontFamily: fonts.sans,
        fontSize: 14,
        lineHeight: 1.45,
      }}
    >
      {text}
    </div>
  );
}

export function PhaseView({ phaseId }) {
  const { trip, tier, phaseById, legByPhase } = useTrip();
  const phase = phaseById[phaseId];
  if (!phase) return null;

  const days = legByPhase[phaseId]?.days || phase.daysBase;
  const cost = phaseCost(trip, phaseId, days, tier);
  const pois = poisFor(trip, phaseId);

  return (
    <section
      aria-labelledby={`phase-${phaseId}-title`}
      style={{ padding: 20, fontFamily: fonts.sans, color: colors.text }}
    >
      {phase.hero ? (
        <img
          src={phase.hero}
          alt={phase.title}
          loading="eager"
          style={{
            width: "100%",
            maxHeight: 260,
            objectFit: "cover",
            borderRadius: radii.lg,
            marginBottom: 16,
          }}
        />
      ) : null}

      <h2
        id={`phase-${phaseId}-title`}
        style={{ fontFamily: fonts.serif, fontSize: 28, margin: "0 0 4px" }}
      >
        <span aria-hidden="true">{displayFlag(phase)}</span> {phase.title}
      </h2>
      <p style={{ color: colors.muted, margin: "0 0 16px" }}>
        {days} días · {phase.daysMin}–{phase.daysMax} ajustable
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
          Coste estimado ({days} días, nivel {tier})
        </div>
        <div style={{ fontSize: 26, fontFamily: fonts.serif, color: colors.accent }}>
          {fmtEUR(cost)}
        </div>
      </div>

      {phase.climateWarning ? <WarningBanner text={phase.climateWarning} tone="climate" /> : null}
      {phase.safetyNote ? <WarningBanner text={phase.safetyNote} tone="safety" /> : null}

      <SeasonBanner phaseId={phaseId} />

      {phase.info && phase.info.length > 0 ? (
        <>
          <h3 style={{ fontFamily: fonts.serif, fontSize: 20, margin: "24px 0 8px" }}>
            Datos prácticos
          </h3>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "max-content 1fr",
              gap: "6px 16px",
              margin: 0,
            }}
          >
            {phase.info.map((item) => (
              <div key={item.label} style={{ display: "contents" }}>
                <dt style={{ color: colors.muted }}>{item.label}</dt>
                <dd style={{ margin: 0 }}>{item.value}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      {pois.length > 0 ? (
        <>
          <h3 style={{ fontFamily: fonts.serif, fontSize: 20, margin: "24px 0 8px" }}>
            Qué ver ({pois.length})
          </h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
            {pois.map((poi) => (
              <li
                key={poi.name}
                style={{
                  padding: "10px 14px",
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  <span aria-hidden="true">{POI_ICON[poi.type] ?? "📍"}</span> {poi.name}
                </div>
                {poi.desc ? (
                  <div style={{ fontSize: 13, color: colors.muted }}>{poi.desc}</div>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
