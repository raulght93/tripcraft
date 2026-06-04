import { displayFlag } from "@tripcraft/engine";
import { colors, fonts, radii } from "../styles/tokens.js";
import { useTrip } from "../trip/TripContext.jsx";

export function TabBar({ tabs, activeTab, onSelect }) {
  const { phaseById } = useTrip();
  return (
    <div
      role="tablist"
      aria-label="Secciones del viaje"
      style={{
        display: "flex",
        gap: 6,
        padding: "10px 16px",
        overflowX: "auto",
        scrollSnapType: "x proximity",
        WebkitOverflowScrolling: "touch",
        background: colors.surfaceAlt,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeTab;
        const isFork = tab.kind === "fork";
        const icon =
          tab.kind === "phase" ? displayFlag(phaseById[tab.id] ?? {}) : (tab.icon ?? "•");
        return (
          <button
            type="button"
            key={tab.id}
            role="tab"
            aria-selected={selected}
            aria-label={isFork ? `${tab.label} (etapa con alternativas, elige)` : tab.label}
            onClick={() => onSelect(tab.id)}
            style={{
              fontFamily: fonts.sans,
              fontSize: 14,
              minHeight: 40,
              whiteSpace: "nowrap",
              scrollSnapAlign: "start",
              padding: "8px 14px",
              borderRadius: radii.sm,
              // Los forks llevan borde discontinuo: señal de "aquí decides".
              border: selected
                ? `1px solid ${colors.accent}`
                : isFork
                  ? `1px dashed ${colors.accent}`
                  : `1px solid ${colors.border}`,
              background: selected ? colors.accent : colors.surface,
              color: selected ? colors.accentText : colors.text,
              cursor: "pointer",
            }}
          >
            <span aria-hidden="true">{icon}</span> {tab.label}
            {isFork && !selected ? (
              <span aria-hidden="true" style={{ color: colors.accent, fontWeight: 700 }}>
                {" "}
                ·elige
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
