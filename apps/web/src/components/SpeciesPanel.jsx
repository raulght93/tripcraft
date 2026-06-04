import { useState } from "react";
import { colors, fonts, radii } from "../styles/tokens.js";
import { useTrip } from "../trip/TripContext.jsx";

const KIND_LABEL = {
  mammal: "Mamíferos",
  primate: "Primates",
  gorilla: "Grandes simios",
  bird: "Aves",
  marine: "Marinos",
  reptile: "Reptiles",
  plant: "Flora",
};

export function SpeciesPanel() {
  const { trip, phaseById } = useTrip();
  const species = trip.species ?? [];
  const kinds = [...new Set(species.map((s) => s.kind))];
  const [kind, setKind] = useState("all");
  const shown = kind === "all" ? species : species.filter((s) => s.kind === kind);

  const filterBtn = (value, label) => {
    const active = kind === value;
    return (
      <button
        type="button"
        key={value}
        aria-pressed={active}
        onClick={() => setKind(value)}
        style={{
          fontFamily: fonts.sans,
          fontSize: 13,
          padding: "6px 12px",
          borderRadius: radii.sm,
          border: `1px solid ${active ? colors.accent : colors.border}`,
          background: active ? colors.accent : colors.surface,
          color: active ? colors.accentText : colors.text,
          cursor: "pointer",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <section style={{ padding: 20, fontFamily: fonts.sans, color: colors.text }}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: 28, margin: "0 0 12px" }}>
        Fauna y flora ({species.length})
      </h2>

      <div
        role="group"
        aria-label="Filtrar por tipo"
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}
      >
        {filterBtn("all", "Todas")}
        {kinds.map((k) => filterBtn(k, KIND_LABEL[k] ?? k))}
      </div>

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {shown.map((s) => (
          <li
            key={s.id}
            style={{
              borderRadius: radii.md,
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              overflow: "hidden",
            }}
          >
            {s.img ? (
              <img
                src={s.img}
                alt={s.name}
                loading="lazy"
                style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }}
              />
            ) : null}
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              {s.scientific ? (
                <div style={{ fontStyle: "italic", fontSize: 12, color: colors.muted }}>
                  {s.scientific}
                </div>
              ) : null}
              {s.desc ? (
                <div style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>{s.desc}</div>
              ) : null}
              <div style={{ marginTop: 6, fontSize: 12, color: colors.muted }}>
                {s.phases.map((ph) => phaseById[ph]?.title ?? ph).join(" · ")}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
