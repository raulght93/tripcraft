import { buildActivePhaseIds, computeItinerary, itineraryByPhase } from "@tripcraft/engine";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { colors, fonts } from "../styles/tokens.js";
import { loadTrip } from "./loadTrip.js";
import { DEFAULT_TRIP_SLUG } from "./registry.js";

const TripCtx = createContext(null);

const lsKey = (tripId, k) => `tc_${tripId}_${k}`;
const loadLS = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const saveLS = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible */
  }
};

/**
 * Estado del viaje, con el documento YA validado (lo valida loadTrip en la
 * frontera). El estado del usuario (forks, tier, fecha) se persiste por tripId.
 */
function TripState({ trip, children }) {
  const forkDefaults = useMemo(
    () => Object.fromEntries(trip.forks.map((f) => [f.id, f.default])),
    [trip],
  );
  const [forkChoice, setForkChoice] = useState(() => loadLS(lsKey(trip.id, "forks"), forkDefaults));
  const [tier, setTierState] = useState(() =>
    loadLS(lsKey(trip.id, "tier"), trip.tiers[Math.min(1, trip.tiers.length - 1)]),
  );
  const [startDate, setStartDateState] = useState(() =>
    loadLS(lsKey(trip.id, "start"), trip.meta.dateWindowDefault?.start ?? "2026-01-01"),
  );

  const pickFork = useCallback(
    (forkId, optionId) =>
      setForkChoice((prev) => {
        const next = { ...prev, [forkId]: optionId };
        saveLS(lsKey(trip.id, "forks"), next);
        return next;
      }),
    [trip.id],
  );
  const setTier = useCallback(
    (t) => {
      setTierState(t);
      saveLS(lsKey(trip.id, "tier"), t);
    },
    [trip.id],
  );
  const setStartDate = useCallback(
    (d) => {
      setStartDateState(d);
      saveLS(lsKey(trip.id, "start"), d);
    },
    [trip.id],
  );

  const activePhaseIds = useMemo(
    () => buildActivePhaseIds(trip, { forkChoice }),
    [trip, forkChoice],
  );
  const phaseById = useMemo(() => Object.fromEntries(trip.phases.map((p) => [p.id, p])), [trip]);
  const itinerary = useMemo(
    () => computeItinerary(trip, startDate, activePhaseIds),
    [trip, startDate, activePhaseIds],
  );
  const legByPhase = useMemo(() => itineraryByPhase(itinerary), [itinerary]);

  const value = useMemo(
    () => ({
      trip,
      forkChoice,
      pickFork,
      tier,
      setTier,
      startDate,
      setStartDate,
      activePhaseIds,
      phaseById,
      itinerary,
      legByPhase,
    }),
    [
      trip,
      forkChoice,
      pickFork,
      tier,
      setTier,
      startDate,
      setStartDate,
      activePhaseIds,
      phaseById,
      itinerary,
      legByPhase,
    ],
  );

  return <TripCtx.Provider value={value}>{children}</TripCtx.Provider>;
}

const notice = (msg, busy) => (
  <div
    role={busy ? "status" : "alert"}
    aria-busy={busy || undefined}
    style={{ padding: 40, fontFamily: fonts.sans, color: colors.muted, background: colors.bg }}
  >
    {msg}
  </div>
);

/** Carga el viaje (por slug) de forma asíncrona; el origen es intercambiable (loadTrip). */
export function TripProvider({ slug = DEFAULT_TRIP_SLUG, children }) {
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setTrip(null);
    setError(null);
    loadTrip(slug)
      .then((t) => alive && setTrip(t))
      .catch((e) => alive && setError(e));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (error) return notice("No se pudo cargar el viaje.", false);
  if (!trip) return notice("Cargando viaje…", true);
  return <TripState trip={trip}>{children}</TripState>;
}

export function useTrip() {
  const ctx = useContext(TripCtx);
  if (!ctx) throw new Error("useTrip debe usarse dentro de <TripProvider>");
  return ctx;
}
