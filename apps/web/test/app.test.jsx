import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

test("las tabs se derivan de trip.sequence (meta + forks + fases + extensiones)", () => {
  renderApp();
  const tablist = screen.getByRole("tablist");
  expect(within(tablist).getByRole("tab", { name: /Itinerario/ })).toBeInTheDocument();
  expect(within(tablist).getByRole("tab", { name: /Costa Kenia/ })).toBeInTheDocument();
  expect(within(tablist).getByRole("tab", { name: /Safari Kenya/ })).toBeInTheDocument();
  expect(within(tablist).getByRole("tab", { name: /Extensiones/ })).toBeInTheDocument();
});

test("el tab por defecto (Itinerario) muestra la línea temporal datada", () => {
  renderApp();
  // El Timeline lista las fases activas con fechas derivadas de la fecha de inicio.
  expect(screen.getByText(/Watamu balance/)).toBeInTheDocument();
  expect(screen.getByText(/Fecha de inicio/)).toBeInTheDocument();
});

test("el fork Costa Kenia muestra sus opciones con coste por el engine", () => {
  renderApp();
  fireEvent.click(screen.getByRole("tab", { name: /Costa Kenia/ }));
  const radios = screen.getAllByRole("radio");
  expect(radios.length).toBeGreaterThanOrEqual(3); // watamu / lamu / diani
  expect(screen.getAllByText(/€/).length).toBeGreaterThan(0);
});

test("una fase fija muestra coste calculado, banner de temporada y POIs", () => {
  renderApp();
  fireEvent.click(screen.getByRole("tab", { name: /Safari Kenya/ }));
  // safari-ke 13 días mid = 3050 €.
  expect(screen.getByText(/3050|3\.050/)).toBeInTheDocument();
  // Con inicio 2026-11-10, safari-ke cae en diciembre → temporada óptima (Track B+D).
  expect(screen.getByText(/Temporada óptima/)).toBeInTheDocument();
  // POIs migrados.
  expect(screen.getAllByText(/Nairobi/).length).toBeGreaterThan(0);
  expect(screen.getByText(/Maasai Mara NR/)).toBeInTheDocument();
});

test("el shell no tiene violaciones de accesibilidad (axe)", async () => {
  const { container } = renderApp();
  expect(await axe(container)).toHaveNoViolations();
});
