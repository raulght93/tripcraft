import { useState } from "react";
import { useResponsive } from "../hooks/useResponsive.js";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { useTrip } from "../trip/TripContext.jsx";

const TIER_LABEL = { low: "Mochilero", mid: "Equilibrado", high: "Lujo" };

export function Header({ theme, onCycleTheme }) {
  const { trip, tier, setTier } = useTrip();
  const { isMobile } = useResponsive();
  const [ring, setRing] = useState(false);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: isMobile ? "10px 14px" : "14px 20px",
        background: colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        flexWrap: "wrap",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: fonts.serif,
          fontSize: isMobile ? 20 : 24,
          color: colors.text,
          flex: 1,
          minWidth: isMobile ? 140 : 200,
        }}
      >
        {trip.title}
      </h1>

      <label style={{ display: "flex", alignItems: "center", gap: 6, color: colors.muted }}>
        <span style={{ fontFamily: fonts.sans, fontSize: 13 }}>Nivel</span>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          aria-label="Nivel de presupuesto"
          style={{
            fontFamily: fonts.sans,
            padding: "6px 10px",
            borderRadius: radii.sm,
            border: `1px solid ${colors.border}`,
            background: colors.surfaceAlt,
            color: colors.text,
          }}
        >
          {trip.tiers.map((t) => (
            <option key={t} value={t}>
              {TIER_LABEL[t] ?? t}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={onCycleTheme}
        onFocus={() => setRing(true)}
        onBlur={() => setRing(false)}
        aria-label={`Tema: ${theme}. Cambiar.`}
        style={{
          fontFamily: fonts.sans,
          fontSize: 14,
          padding: "6px 12px",
          borderRadius: radii.sm,
          border: `1px solid ${colors.border}`,
          background: colors.surfaceAlt,
          color: colors.text,
          cursor: "pointer",
          boxShadow: ring ? shadows.ring : "none",
        }}
      >
        {theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🌗"} {theme}
      </button>
    </header>
  );
}
