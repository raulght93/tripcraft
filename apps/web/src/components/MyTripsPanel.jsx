import { useCallback, useEffect, useState } from "react";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { useTrip } from "../trip/TripContext.jsx";
import { apiEnabled, getMyTrip, myTrips, saveTrip } from "../trip/api.js";

const fmtDate = (iso) => {
  try {
    return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
};

export function MyTripsPanel({ onNavigate }) {
  const { trip, selection, applyState } = useTrip();
  const [list, setList] = useState(null); // null = cargando
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(() => {
    setError(null);
    myTrips()
      .then(setList)
      .catch(() => {
        setList([]);
        setError("No se pudo conectar con el backend.");
      });
  }, []);

  useEffect(() => {
    if (apiEnabled()) refresh();
    else setList([]);
  }, [refresh]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveTrip({ baseTemplateId: trip.id, doc: trip, state: selection });
      refresh();
    } catch {
      setError("No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const load = async (id) => {
    try {
      const stored = await getMyTrip(id);
      applyState(stored.state);
      onNavigate?.("itinerary");
    } catch {
      setError("No se pudo cargar el viaje.");
    }
  };

  return (
    <section style={{ padding: 20, fontFamily: fonts.sans, color: colors.text }}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: 28, margin: "0 0 12px" }}>Mis viajes</h2>

      {!apiEnabled() ? (
        <p style={{ color: colors.muted }}>
          Configura <code>VITE_API_URL</code> con la URL del Worker para guardar tus viajes en la
          nube.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            style={{
              fontFamily: fonts.sans,
              fontSize: 14,
              padding: "8px 16px",
              borderRadius: radii.sm,
              border: `1px solid ${colors.accent}`,
              background: colors.accent,
              color: colors.accentText,
              cursor: saving ? "default" : "pointer",
              boxShadow: shadows.ring,
              marginBottom: 16,
            }}
          >
            {saving ? "Guardando…" : "💾 Guardar viaje actual"}
          </button>

          {error ? (
            <p role="alert" style={{ color: "#9a3b1f" }}>
              {error}
            </p>
          ) : null}

          {list === null ? (
            <p style={{ color: colors.muted }}>Cargando…</p>
          ) : list.length === 0 ? (
            <p style={{ color: colors.muted }}>Aún no has guardado viajes.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
              {list.map((t) => (
                <li
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: radii.md,
                    border: `1px solid ${colors.border}`,
                    background: colors.surface,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    <div style={{ fontSize: 13, color: colors.muted }}>
                      v{t.version} · {fmtDate(t.updatedAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => load(t.id)}
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
                    Cargar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
