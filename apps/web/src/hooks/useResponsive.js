import { useEffect, useState } from "react";

const width = () => (typeof window === "undefined" ? 1024 : window.innerWidth);

/** Tres breakpoints. Nunca comparar window.innerWidth a mano en componentes. */
export function useResponsive() {
  const [w, setW] = useState(width);
  useEffect(() => {
    const onResize = () => setW(width());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return { width: w, isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024 };
}
