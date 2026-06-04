import { buildActivePhaseIds } from "@tripcraft/engine";
import { validateTrip } from "@tripcraft/schema";
import { AFRICA_TRIP } from "@tripcraft/trip-africa";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

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
 * Fuente única del estado del viaje. El documento Trip se valida UNA vez en la
 * frontera (validateTrip) — dentro del árbol, el dato es de fiar. El estado del
 * usuario (forks, tier) se persiste en localStorage nesteado por tripId.
 */
export function TripProvider({ children, rawTrip = AFRICA_TRIP }) {
  const trip = useMemo(() => validateTrip(rawTrip), [rawTrip]);

  const forkDefaults = useMemo(
    () => Object.fromEntries(trip.forks.map((f) => [f.id, f.default])),
    [trip],
  );
  const [forkChoice, setForkChoice] = useState(() => loadLS(lsKey(trip.id, "forks"), forkDefaults));
  const [tier, setTierState] = useState(() =>
    loadLS(lsKey(trip.id, "tier"), trip.tiers[Math.min(1, trip.tiers.length - 1)]),
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

  const activePhaseIds = useMemo(
    () => buildActivePhaseIds(trip, { forkChoice }),
    [trip, forkChoice],
  );
  const phaseById = useMemo(() => Object.fromEntries(trip.phases.map((p) => [p.id, p])), [trip]);

  const value = useMemo(
    () => ({ trip, forkChoice, pickFork, tier, setTier, activePhaseIds, phaseById }),
    [trip, forkChoice, pickFork, tier, setTier, activePhaseIds, phaseById],
  );

  return <TripCtx.Provider value={value}>{children}</TripCtx.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripCtx);
  if (!ctx) throw new Error("useTrip debe usarse dentro de <TripProvider>");
  return ctx;
}
