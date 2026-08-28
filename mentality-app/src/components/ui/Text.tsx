import React from "react";
import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { font } from "@/theme/tokens";

type Tone = "default" | "muted" | "faint" | "accent" | "calm" | "record" | "danger" | "inverse";

type Props = TextProps & {
  tone?: Tone;
  align?: TextStyle["textAlign"];
  children?: React.ReactNode;
};

function useTone(tone: Tone = "default") {
  const { colors } = useTheme();
  switch (tone) {
    case "muted": return colors.textMuted;
    case "faint": return colors.textFaint;
    case "accent": return colors.accent;
    case "calm": return colors.calm;
    case "record": return colors.record;
    case "danger": return colors.danger;
    case "inverse": return colors.accentText;
    default: return colors.text;
  }
}

/**
 * Display — Barlow Condensed, uppercase, tight. Carries the identity.
 * Used for the wordmark, countdowns, scores, and screen titles on Gameday.
 */
export function Display({ tone, align, style, size = 44, ...rest }: Props & { size?: number }) {
  const color = useTone(tone);
  return (
    <RNText
      {...rest}
      style={[
        {
          color,
          fontFamily: font.display,
          fontSize: size,
          lineHeight: size * 0.94,
          letterSpacing: size > 40 ? -0.5 : 0,
          textTransform: "uppercase",
          textAlign: align,
        },
        style,
      ]}
    />
  );
}

/**
 * Stat — condensed tabular numerals. Every number in the app uses this, which
 * does more for the sport feel than any illustration would.
 */
export function Stat({ tone, align, style, size = 28, ...rest }: Props & { size?: number }) {
  const color = useTone(tone);
  return (
    <RNText
      {...rest}
      style={[
        {
          color,
          fontFamily: font.display,
          fontSize: size,
          lineHeight: size * 1.02,
          fontVariant: ["tabular-nums"],
          textAlign: align,
        },
        style,
      ]}
    />
  );
}

/** Section headings and insight copy. Outfit, sentence case. */
export function Heading({ tone, align, style, size = 22, ...rest }: Props & { size?: number }) {
  const color = useTone(tone);
  return (
    <RNText
      {...rest}
      style={[
        {
          color,
          fontFamily: font.heading,
          fontSize: size,
          lineHeight: size * 1.28,
          letterSpacing: -0.2,
          textAlign: align,
        },
        style,
      ]}
    />
  );
}

/** Uppercase micro-label. Eyebrows, table headers, metadata. */
export function Label({ tone = "faint", align, style, size = 12, ...rest }: Props & { size?: number }) {
  const color = useTone(tone);
  return (
    <RNText
      {...rest}
      style={[
        {
          color,
          fontFamily: font.displayMedium,
          fontSize: size,
          lineHeight: size * 1.3,
          letterSpacing: size * 0.14,
          textTransform: "uppercase",
          textAlign: align,
        },
        style,
      ]}
    />
  );
}

/** Body copy. Inter. */
export function Body({ tone = "muted", align, style, size = 15, weight = "regular", ...rest }: Props & {
  size?: number;
  weight?: "regular" | "medium" | "semi";
}) {
  const color = useTone(tone);
  const family =
    weight === "semi" ? font.bodySemi : weight === "medium" ? font.bodyMedium : font.body;
  return (
    <RNText
      {...rest}
      style={[
        {
          color,
          fontFamily: family,
          fontSize: size,
          lineHeight: size * 1.55,
          textAlign: align,
        },
        style,
      ]}
    />
  );
}

export const textStyles = StyleSheet.create({
  balance: { textAlign: "center" },
});
