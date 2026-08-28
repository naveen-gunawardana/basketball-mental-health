import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { palettes, type Palette, space, radius, font, motion } from "./tokens";

/**
 * Surface mode. `gameday` is not a user preference — it's a state the app
 * enters on its own when a game is inside four hours, and leaves when the
 * debrief is filed. That takeover is the moment a kid shows a teammate.
 */
export type Surface = "training" | "gameday";

type ThemeValue = {
  surface: Surface;
  colors: Palette;
  isGameday: boolean;
  isDark: boolean;
  space: typeof space;
  radius: typeof radius;
  font: typeof font;
  motion: typeof motion;
  enterGameday: () => void;
  exitGameday: () => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [surface, setSurface] = useState<Surface>("training");

  const enterGameday = useCallback(() => setSurface("gameday"), []);
  const exitGameday = useCallback(() => setSurface("training"), []);

  const value = useMemo<ThemeValue>(() => {
    const isDark = scheme === "dark";
    const colors =
      surface === "gameday"
        ? palettes.gameday
        : isDark
          ? palettes.trainingDark
          : palettes.training;

    return {
      surface,
      colors,
      isGameday: surface === "gameday",
      // Gameday is dark regardless of what the device prefers.
      isDark: surface === "gameday" || isDark,
      space,
      radius,
      font,
      motion,
      enterGameday,
      exitGameday,
    };
  }, [scheme, surface, enterGameday, exitGameday]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

/** Shorthand for the common case of only needing colors. */
export function useColors(): Palette {
  return useTheme().colors;
}
