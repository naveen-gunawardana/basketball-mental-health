/**
 * Gameday design tokens.
 *
 * Two surfaces, one system:
 *   Training  — the calm, light, everyday app.
 *   Gameday   — dark, high-contrast, one action per screen. Takes over when a
 *               game is inside four hours and stays until the debrief is done.
 *
 * The six brand colors are lifted straight from the Mentality Sports Tailwind
 * config so the app and the website read as one product. Color is semantic
 * here, never decorative: sage always means down-regulated, terracotta always
 * means intensity or action, gold is rationed to genuine records.
 */

export const brand = {
  navy: "#14213D",
  navy900: "#091327",
  navy800: "#0E1C38",
  navy700: "#122649",
  navy600: "#162F5E",
  navy100: "#C8D8EE",
  navy50: "#E8EFF8",

  terracotta: "#C4633A",
  terracotta400: "#DB845B",
  terracotta300: "#E4A384",
  terracotta100: "#F6E0D6",
  terracotta700: "#773B22",

  sage: "#6B957F",
  sage400: "#8FAF9F",
  sage300: "#ABC3B7",
  sage100: "#E3EBE7",
  sage700: "#40594C",

  gold: "#C9973A",
  gold300: "#DDB452",
  gold100: "#F0DFB8",
  gold700: "#8F6A20",

  offWhite: "#F6F3EC",
  offWhite100: "#FAF8F4",
  offWhite300: "#EDE8DB",
  offWhite400: "#E3DCCA",

  charcoal: "#2C3140",
  blush: "#F0EAE2",
} as const;

export type Palette = {
  /** Page background. */
  ground: string;
  /** Raised card / sheet. */
  surface: string;
  /** Second-level raised surface, inputs. */
  surfaceAlt: string;
  /** Pressed / hovered surface. */
  surfacePress: string;
  border: string;
  borderSoft: string;

  text: string;
  textMuted: string;
  textFaint: string;

  /** Primary action, intensity, high pressure. */
  accent: string;
  accentText: string;
  accentSoft: string;

  /** Calm, recovery, breathing, "settled". */
  calm: string;
  calmSoft: string;

  /** Records and season milestones only. */
  record: string;
  recordSoft: string;

  danger: string;
  overlay: string;
  /** Colors read directly by charts and the pressure ramp. */
  scale: readonly string[];
};

const training: Palette = {
  ground: brand.offWhite,
  surface: "#FFFFFF",
  surfaceAlt: brand.offWhite100,
  surfacePress: brand.offWhite300,
  border: "#E1D9C9",
  borderSoft: "#EDE8DB",

  text: brand.navy,
  textMuted: "#4A5878",
  textFaint: "#8592AE",

  accent: "#B4522C",
  accentText: "#FFFFFF",
  accentSoft: brand.terracotta100,

  calm: brand.sage700,
  calmSoft: brand.sage100,

  record: "#9A7226",
  recordSoft: brand.gold100,

  danger: "#A32D2D",
  overlay: "rgba(9, 19, 39, 0.45)",
  scale: [brand.sage, brand.sage400, brand.gold300, brand.gold, brand.terracotta400, brand.terracotta],
};

const gameday: Palette = {
  ground: brand.navy900,
  surface: "#101B33",
  surfaceAlt: "#16243F",
  surfacePress: "#1D2E4D",
  border: "#22355A",
  borderSoft: "#182741",

  text: brand.offWhite,
  textMuted: "#B9C7DD",
  textFaint: "#7D8FAF",

  accent: "#D97548",
  accentText: brand.navy900,
  accentSoft: "#38221A",

  calm: "#8FBCA3",
  calmSoft: "#1B3028",

  record: "#DFAE52",
  recordSoft: "#33280F",

  danger: "#E0685F",
  overlay: "rgba(4, 9, 20, 0.72)",
  scale: [brand.sage400, "#9FBFAE", brand.gold300, brand.gold, brand.terracotta400, "#E4855C"],
};

/** Training mode rendered on a device set to dark. Still calm, just dimmed. */
const trainingDark: Palette = {
  ...gameday,
  ground: "#0B1526",
  surface: "#131F38",
  surfaceAlt: "#182746",
};

export const palettes = { training, trainingDark, gameday } as const;
export type PaletteName = keyof typeof palettes;

/** 4pt base grid. Everything in the app lands on one of these. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 56,
  "5xl": 72,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
} as const;

export const font = {
  /** Display, numerals, labels. Uppercase, tight, scoreboard energy. */
  display: "BarlowCondensed_700Bold",
  displayMedium: "BarlowCondensed_600SemiBold",
  displayRegular: "BarlowCondensed_500Medium",
  /** Headings and insight copy. */
  heading: "Outfit_600SemiBold",
  headingBold: "Outfit_700Bold",
  headingRegular: "Outfit_400Regular",
  /** Body, UI, forms. */
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
} as const;

/** Motion. Training is springy; Gameday is slow and weighted, never bouncy. */
export const motion = {
  fast: 160,
  base: 260,
  slow: 420,
  breath: 4000,
  spring: { damping: 18, stiffness: 190, mass: 0.9 },
  springSoft: { damping: 22, stiffness: 120, mass: 1 },
  gamedaySpring: { damping: 28, stiffness: 110, mass: 1.2 },
} as const;

/**
 * The pressure ramp. A 1–10 value maps onto sage → gold → terracotta, which is
 * the same language the whole app uses: green is settled, orange is lit up.
 * Neither end is "bad" — high pressure before a big game is information, not a
 * problem, and the copy around this never treats it as one.
 */
export function pressureColor(value: number, p: Palette): string {
  const v = Math.max(1, Math.min(10, value));
  const t = (v - 1) / 9;
  const idx = t * (p.scale.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(p.scale.length - 1, lo + 1);
  return mix(p.scale[lo], p.scale[hi], idx - lo);
}

/** Linear RGB blend. Small enough to keep here rather than pull a dependency. */
export function mix(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function toHex(n: number) {
  return Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
}
