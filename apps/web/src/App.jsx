import { useMemo, useState } from "react";
import { ForkView } from "./components/ForkView.jsx";
import { Header } from "./components/Header.jsx";
import { MyTripsPanel } from "./components/MyTripsPanel.jsx";
import { PhaseView } from "./components/PhaseView.jsx";
import { SpeciesPanel } from "./components/SpeciesPanel.jsx";
import { TabBar } from "./components/TabBar.jsx";
import { Timeline } from "./components/Timeline.jsx";
import { useTheme } from "./hooks/useTheme.js";
import { buildTabs } from "./lib/tabs.js";
import { colors, fonts } from "./styles/tokens.js";
import { useTrip } from "./trip/TripContext.jsx";

function ExtensionsView({ members }) {
  const { phaseById } = useTrip();
  return (
    <section style={{ padding: 20, fontFamily: fonts.sans, color: colors.text }}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: 28, margin: "0 0 16px" }}>Extensiones</h2>
      <ul style={{ paddingLeft: 18 }}>
        {members.map((id) => (
          <li key={id} style={{ marginBottom: 6 }}>
            {phaseById[id]?.title ?? id}
          </li>
        ))}
      </ul>
    </section>
  );
}

const META_TABS = [
  { id: "itinerary", kind: "meta", label: "Itinerario", icon: "📅" },
  { id: "species", kind: "meta", label: "Fauna", icon: "🦁" },
  { id: "mytrips", kind: "meta", label: "Mis viajes", icon: "💾" },
];

export function App() {
  const { trip } = useTrip();
  const { theme, cycleTheme } = useTheme();
  const tabs = useMemo(() => [...META_TABS, ...buildTabs(trip)], [trip]);
  const [activeTab, setActiveTab] = useState(() => tabs[0]?.id);

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <Header theme={theme} onCycleTheme={cycleTheme} />
      <TabBar tabs={tabs} activeTab={active?.id} onSelect={setActiveTab} />
      <main id="main">
        {active?.id === "itinerary" ? <Timeline onSelectPhase={setActiveTab} /> : null}
        {active?.id === "species" ? <SpeciesPanel /> : null}
        {active?.id === "mytrips" ? <MyTripsPanel onNavigate={setActiveTab} /> : null}
        {active?.kind === "fork" ? <ForkView forkId={active.id} onNavigate={setActiveTab} /> : null}
        {active?.kind === "phase" ? (
          <PhaseView phaseId={active.id} onNavigate={setActiveTab} />
        ) : null}
        {active?.kind === "ext" ? <ExtensionsView members={active.members ?? []} /> : null}
      </main>
    </div>
  );
}
