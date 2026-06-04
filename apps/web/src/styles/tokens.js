// Sistema de diseño por tokens (CSS-in-JS, sin CSS externo — decisión §0).
// Dos paletas con LAS MISMAS keys → var(--c-<key>) en :root y [data-theme=dark].
// GOTCHA preservado: el <style> se inyecta en module-load (antes del primer
// render) para evitar FOUC al cambiar de tema.

const LIGHT = {
  bg: "#F4F1E8",
  surface: "#FFFFFF",
  surfaceAlt: "#FBF8F0",
  text: "#2A2520",
  muted: "#6B6358",
  accent: "#9A6B1F",
  accentText: "#FFFFFF",
  border: "#E3DBCB",
  ring: "#9A6B1F",
};

const DARK = {
  bg: "#161210",
  surface: "#211B17",
  surfaceAlt: "#1A1511",
  text: "#EDE6D8",
  muted: "#A89C88",
  accent: "#D9A93E",
  accentText: "#161210",
  border: "#3A3128",
  ring: "#D9A93E",
};

const toVars = (palette) =>
  Object.entries(palette)
    .map(([k, v]) => `--c-${k}:${v}`)
    .join(";");

if (typeof document !== "undefined" && !document.getElementById("tc-theme-vars")) {
  const el = document.createElement("style");
  el.id = "tc-theme-vars";
  // Variables de tema + base reset + accesibilidad (foco visible por teclado en
  // TODO control, sin robar el outline al ratón; respeto de prefers-reduced-motion).
  el.textContent = `
:root{${toVars(LIGHT)}}
[data-theme="dark"]{${toVars(DARK)}}
@media (prefers-color-scheme:dark){:root:not([data-theme]){${toVars(DARK)}}}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0}
:focus-visible{outline:2px solid var(--c-ring);outline-offset:2px;border-radius:4px}
@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}`;
  document.head.appendChild(el);
}

/** colors.accent → "var(--c-accent)" (se resuelve en runtime según el tema). */
export const colors = new Proxy({}, { get: (_t, key) => `var(--c-${String(key)})` });

export const fonts = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'DM Sans', system-ui, sans-serif",
};

export const radii = { sm: 6, md: 12, lg: 20 };

export const shadows = {
  ring: "0 0 0 3px color-mix(in srgb, var(--c-ring) 45%, transparent)",
};
