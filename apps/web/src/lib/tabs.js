// Deriva las tabs de la UI desde trip.sequence — NO cableadas (generaliza el
// buildTabs de AfricaGuide.jsx). Forks, fases fijas y grupos de extensión.

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
