import { render, screen, within } from "@testing-library/react";
import { cleanup, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, expect, test } from "vitest";
import { App } from "../src/App.jsx";
import { TripProvider } from "../src/trip/TripContext.jsx";

afterEach(cleanup);

const renderApp = () =>
  render(
    <TripProvider>
      <App />
    </TripProvider>,
  );

test("las tabs se derivan de trip.sequence (forks + fases + extensiones)", () => {
  renderApp();
  const tablist = screen.getByRole("tablist");
  // Forks y fases fijas de Africa deben aparecer como tabs.
  expect(within(tablist).getByRole("tab", { name: /Costa Kenia/ })).toBeInTheDocument();
  expect(within(tablist).getByRole("tab", { name: /Safari Kenya/ })).toBeInTheDocument();
  expect(within(tablist).getByRole("tab", { name: /Extensiones/ })).toBeInTheDocument();
});

test("el primer tab (fork Costa Kenia) muestra sus opciones con coste", () => {
  renderApp();
  const radios = screen.getAllByRole("radio");
  expect(radios.length).toBeGreaterThanOrEqual(3); // watamu / lamu / diani
  expect(screen.getByText(/Watamu/)).toBeInTheDocument();
  // El coste se calcula con el engine → aparece un importe en €.
  expect(screen.getAllByText(/€/).length).toBeGreaterThan(0);
});

test("seleccionar una fase fija muestra su coste calculado por el engine", () => {
  renderApp();
  fireEvent.click(screen.getByRole("tab", { name: /Safari Kenya/ }));
  // safari-ke, 13 días, mid (220/día) + 60 fijo = 3050 €.
  expect(screen.getByText(/3050|3\.050/)).toBeInTheDocument();
});

test("el shell no tiene violaciones de accesibilidad (axe)", async () => {
  const { container } = renderApp();
  expect(await axe(container)).toHaveNoViolations();
});
