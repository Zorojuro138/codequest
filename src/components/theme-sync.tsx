"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/use-game-store";

export function ThemeSync() {
  const theme = useGameStore((state) => state.settings.theme);
  const reducedMotion = useGameStore((state) => state.settings.reducedMotion);
  useEffect(() => {
    const sync = () => {
      const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full";
    };
    sync();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [theme, reducedMotion]);
  return null;
}
