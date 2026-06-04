import { useMemo, useState } from "react";
import { ForkView } from "./components/ForkView.jsx";
import { Header } from "./components/Header.jsx";
import { PhaseView } from "./components/PhaseView.jsx";
import { TabBar } from "./components/TabBar.jsx";
import { useTheme } from "./hooks/useTheme.js";
import { buildTabs } from "./lib/tabs.js";
import { colors, fonts } from "./styles/tokens.js";
import { useTrip } from "./trip/TripContext.jsx";

function ExtensionsView({ members }) {
  const { trip, tier, phaseById } = useTrip();
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

export function App() {
  const { trip } = useTrip();
  const { theme, cycleTheme } = useTheme();
  const tabs = useMemo(() => buildTabs(trip), [trip]);
  const [activeTab, setActiveTab] = useState(() => tabs[0]?.id);

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <Header theme={theme} onCycleTheme={cycleTheme} />
      <TabBar tabs={tabs} activeTab={active?.id} onSelect={setActiveTab} />
      <main id="main">
        {active?.kind === "fork" ? <ForkView forkId={active.id} /> : null}
        {active?.kind === "phase" ? <PhaseView phaseId={active.id} /> : null}
        {active?.kind === "ext" ? <ExtensionsView members={active.members ?? []} /> : null}
      </main>
    </div>
  );
}
