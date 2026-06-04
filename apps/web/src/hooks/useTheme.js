import { useCallback, useEffect, useState } from "react";

const KEY = "tc_theme";
const read = () => {
  try {
    return localStorage.getItem(KEY) || "auto";
  } catch {
    return "auto";
  }
};

/** Tema auto/light/dark con persistencia y override por prefers-color-scheme. */
export function useTheme() {
  const [theme, setTheme] = useState(read);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") delete root.dataset.theme;
    else root.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [theme]);

  const cycleTheme = useCallback(
    () => setTheme((t) => (t === "auto" ? "light" : t === "light" ? "dark" : "auto")),
    [],
  );

  const prefersDark =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme:dark)").matches;
  const resolvedTheme = theme === "auto" ? (prefersDark ? "dark" : "light") : theme;

  return { theme, resolvedTheme, setTheme, cycleTheme };
}
