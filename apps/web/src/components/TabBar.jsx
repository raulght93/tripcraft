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
        padding: "10px 20px",
        overflowX: "auto",
        background: colors.surfaceAlt,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeTab;
        const icon =
          tab.kind === "phase" ? displayFlag(phaseById[tab.id] ?? {}) : (tab.icon ?? "•");
        return (
          <button
            type="button"
            key={tab.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(tab.id)}
            style={{
              fontFamily: fonts.sans,
              fontSize: 14,
              whiteSpace: "nowrap",
              padding: "8px 14px",
              borderRadius: radii.sm,
              border: `1px solid ${selected ? colors.accent : colors.border}`,
              background: selected ? colors.accent : colors.surface,
              color: selected ? colors.accentText : colors.text,
              cursor: "pointer",
            }}
          >
            <span aria-hidden="true">{icon}</span> {tab.label}
          </button>
        );
      })}
    </div>
  );
}
