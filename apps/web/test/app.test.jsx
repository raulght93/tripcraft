import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, expect, test } from "vitest";
import { App } from "../src/App.jsx";
import { TripProvider } from "../src/trip/TripContext.jsx";

afterEach(cleanup);

// El viaje se carga de forma asíncrona (loadTrip → import dinámico + validateTrip),
// así que esperamos a que aparezca la tablist antes de aseverar.
const renderApp = async () => {
  const utils = render(
    <TripProvider>
      <App />
    </TripProvider>,
  );
  await screen.findByRole("tablist");
  return utils;
};

test("las tabs se derivan de trip.sequence (meta + forks + fases + extensiones)", async () => {
  await renderApp();
  const tablist = screen.getByRole("tablist");
  expect(within(tablist).getByRole("tab", { name: /Itinerario/ })).toBeInTheDocument();
  expect(within(tablist).getByRole("tab", { name: /Costa Kenia/ })).toBeInTheDocument();
  expect(within(tablist).getByRole("tab", { name: /Safari Kenya/ })).toBeInTheDocument();
  expect(within(tablist).getByRole("tab", { name: /Extensiones/ })).toBeInTheDocument();
});

test("el tab por defecto (Itinerario) muestra la línea temporal datada", async () => {
  await renderApp();
  expect(screen.getByText(/Watamu balance/)).toBeInTheDocument();
  expect(screen.getByText(/Fecha de inicio/)).toBeInTheDocument();
});

test("clic en una etapa de fork del itinerario navega a su tab de decisión", async () => {
  await renderApp();
  // En la ruta por defecto, "Watamu" es una opción del fork "Costa Kenia": el paso
  // del itinerario debe llevar a la tab del fork (antes no navegaba a ningún sitio).
  fireEvent.click(screen.getByRole("button", { name: /Etapa 1: Watamu balance/ }));
  expect(screen.getByText(/Etapa con alternativas/)).toBeInTheDocument();
});

test("el fork Costa Kenia muestra sus opciones con coste por el engine", async () => {
  await renderApp();
  fireEvent.click(screen.getByRole("tab", { name: /Costa Kenia/ }));
  expect(screen.getAllByRole("radio").length).toBeGreaterThanOrEqual(3);
  expect(screen.getAllByText(/€/).length).toBeGreaterThan(0);
});

test("una fase fija muestra hero, coste, datos prácticos, temporada y POIs", async () => {
  await renderApp();
  fireEvent.click(screen.getByRole("tab", { name: /Safari Kenya/ }));
  expect(screen.getByText(/3050|3\.050/)).toBeInTheDocument(); // 13·230 + 60
  expect(screen.getByText(/Temporada óptima/)).toBeInTheDocument(); // Track B+D
  // Profundidad editorial nueva: hero (con alt) + datos prácticos.
  expect(screen.getByRole("img", { name: /Safari Kenya/ })).toBeInTheDocument();
  expect(screen.getByText(/Datos prácticos/)).toBeInTheDocument();
  expect(screen.getByText(/Visado/)).toBeInTheDocument();
  // Gastronomía (food curado con Wikimedia).
  expect(screen.getByText(/Gastronomía/)).toBeInTheDocument();
  expect(screen.getByText(/Nyama choma/)).toBeInTheDocument();
  // POIs migrados.
  expect(screen.getAllByText(/Nairobi/).length).toBeGreaterThan(0);
  expect(screen.getByText(/Maasai Mara NR/)).toBeInTheDocument();
});

test("elegir una opción de fork muestra su detalle completo (avisos de seguridad)", async () => {
  await renderApp();
  fireEvent.click(screen.getByRole("tab", { name: /Final del viaje/ }));
  // Detalle de la opción por defecto (Namibia) con su aviso de seguridad.
  expect(screen.getByText(/más seguros de África/)).toBeInTheDocument();
  // Cambiar a Ciudad del Cabo → su aviso de criminalidad (contenido migrado).
  fireEvent.click(screen.getByRole("radio", { name: /Ciudad del Cabo/ }));
  expect(screen.getByText(/criminalidad más altas del mundo/)).toBeInTheDocument();
});

test("el tab Fauna lista el catálogo de especies con filtro por tipo", async () => {
  await renderApp();
  fireEvent.click(screen.getByRole("tab", { name: /Fauna/ }));
  expect(screen.getByText(/Fauna y flora/)).toBeInTheDocument();
  expect(screen.getByText(/León africano/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Mamíferos/ })).toBeInTheDocument();
});

test("cross-link: desde una fase, 'Ver catálogo' navega a Fauna", async () => {
  await renderApp();
  fireEvent.click(screen.getByRole("tab", { name: /Safari Kenya/ }));
  expect(screen.getByText(/Fauna que verás/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Ver catálogo/ }));
  expect(screen.getByText(/Fauna y flora/)).toBeInTheDocument(); // ya en el catálogo
});

test("el shell no tiene violaciones de accesibilidad (axe)", async () => {
  const { container } = await renderApp();
  expect(await axe(container)).toHaveNoViolations();
});
