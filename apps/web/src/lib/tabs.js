// Deriva las tabs de la UI desde trip.sequence — NO cableadas (generaliza el
// buildTabs de AfricaGuide.jsx). Forks, fases fijas y grupos de extensión.

/**
 * Mapa phaseId → tabId. Las fases fijas son su propia tab; las opciones de fork
 * apuntan a la tab del fork; los miembros de extensión, a la tab del grupo. Resuelve
 * el bug de "clicar una etapa no navega" (las opciones de fork no son tabs propias).
 */
export function phaseToTab(trip) {
  const map = {};
  for (const item of trip.sequence) {
    if (item.kind === "phase") {
      map[item.ref] = item.ref;
    } else if (item.kind === "fork") {
      const fork = trip.forks.find((f) => f.id === item.ref);
      for (const opt of fork?.options ?? []) map[opt] = item.ref;
    } else if (item.kind === "extensionGroup") {
      for (const m of item.members) map[m] = item.ref;
    }
  }
  return map;
}

/** Set de phaseIds que son "puntos de decisión" (opciones de un fork). */
export function decisionPhases(trip) {
  const set = new Set();
  for (const item of trip.sequence) {
    if (item.kind === "fork") {
      const fork = trip.forks.find((f) => f.id === item.ref);
      for (const opt of fork?.options ?? []) set.add(opt);
    }
  }
  return set;
}

export function buildTabs(trip) {
  const phaseById = Object.fromEntries(trip.phases.map((p) => [p.id, p]));
  const forkById = Object.fromEntries(trip.forks.map((f) => [f.id, f]));
  const tabs = [];
  for (const item of trip.sequence) {
    if (item.kind === "phase") {
      const p = phaseById[item.ref];
      if (p) tabs.push({ id: p.id, kind: "phase", label: p.title });
    } else if (item.kind === "fork") {
      const f = forkById[item.ref];
      if (f) tabs.push({ id: f.id, kind: "fork", label: f.label, icon: f.icon });
    } else if (item.kind === "extensionGroup") {
      tabs.push({ id: item.ref, kind: "ext", label: "Extensiones", members: item.members });
    }
  }
  return tabs;
}
