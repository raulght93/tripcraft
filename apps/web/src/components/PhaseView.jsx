import { displayFlag, phaseCost, poisFor, speciesForPhase } from "@tripcraft/engine";
import { useResponsive } from "../hooks/useResponsive.js";
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

const stepBtn = (label, onClick, disabled) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    style={{
      width: 34,
      height: 34,
      borderRadius: radii.sm,
      border: `1px solid ${colors.border}`,
      background: colors.surfaceAlt,
      color: colors.text,
      fontSize: 18,
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.4 : 1,
    }}
  >
    {label === "Quitar un día" ? "−" : "+"}
  </button>
);

export function PhaseView({ phaseId, onNavigate }) {
  const { trip, tier, phaseById, daysByPhase, setDays } = useTrip();
  const { isMobile } = useResponsive();
  const phase = phaseById[phaseId];
  if (!phase) return null;

  const days = daysByPhase[phaseId] ?? phase.daysBase;
  const cost = phaseCost(trip, phaseId, days, tier);
  const pois = poisFor(trip, phaseId);
  const species = speciesForPhase(trip, phaseId);
  const adjustable = phase.daysMax > phase.daysMin;

  return (
    <section
      aria-labelledby={`phase-${phaseId}-title`}
      style={{ padding: isMobile ? 14 : 20, fontFamily: fonts.sans, color: colors.text }}
    >
      {phase.hero ? (
        <img
          src={phase.hero}
          alt={phase.title}
          loading="eager"
          style={{
            width: "100%",
            maxHeight: isMobile ? 180 : 260,
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
      {adjustable ? (
        <div
          role="group"
          aria-label="Días en esta etapa"
          style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 16px" }}
        >
          {stepBtn("Quitar un día", () => setDays(phaseId, days - 1), days <= phase.daysMin)}
          <span style={{ fontWeight: 600, minWidth: 64, textAlign: "center" }}>{days} días</span>
          {stepBtn("Añadir un día", () => setDays(phaseId, days + 1), days >= phase.daysMax)}
          <span style={{ fontSize: 13, color: colors.muted }}>
            ({phase.daysMin}–{phase.daysMax})
          </span>
        </div>
      ) : (
        <p style={{ color: colors.muted, margin: "0 0 16px" }}>{days} días</p>
      )}

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

      {phase.food && phase.food.length > 0 ? (
        <>
          <h3 style={{ fontFamily: fonts.serif, fontSize: 20, margin: "24px 0 8px" }}>
            Gastronomía ({phase.food.length})
          </h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
            {phase.food.map((dish) => (
              <li
                key={dish.name}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: radii.md,
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                }}
              >
                {dish.img ? (
                  <img
                    src={dish.img}
                    alt=""
                    loading="lazy"
                    style={{
                      width: 64,
                      height: 48,
                      objectFit: "cover",
                      borderRadius: radii.sm,
                      flexShrink: 0,
                    }}
                  />
                ) : null}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {dish.name}{" "}
                    {dish.veg ? (
                      <span role="img" aria-label="vegetariano">
                        🌱
                      </span>
                    ) : null}
                  </div>
                  {dish.desc ? (
                    <div style={{ fontSize: 13, color: colors.muted }}>{dish.desc}</div>
                  ) : null}
                  {dish.price ? (
                    <div style={{ fontSize: 13, color: colors.accent }}>{dish.price}</div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
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

      {species.length > 0 ? (
        <>
          <h3 style={{ fontFamily: fonts.serif, fontSize: 20, margin: "24px 0 8px" }}>
            Fauna que verás ({species.length})
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {species.slice(0, 8).map((s) => (
              <span
                key={s.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px 4px 4px",
                  borderRadius: 999,
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                  fontSize: 13,
                }}
              >
                {s.img ? (
                  <img
                    src={s.img}
                    alt=""
                    loading="lazy"
                    style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : null}
                {s.name}
              </span>
            ))}
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate("species")}
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  padding: "6px 12px",
                  borderRadius: radii.sm,
                  border: `1px solid ${colors.accent}`,
                  background: "transparent",
                  color: colors.accent,
                  cursor: "pointer",
                }}
              >
                Ver catálogo →
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
