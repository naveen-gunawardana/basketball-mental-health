import React from "react";
import { View, Pressable, StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha } from "@/theme/tokens";
import { Body, Heading, Label } from "./Text";
import * as haptics from "@/lib/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Accent = "none" | "accent" | "calm" | "record";

type Props = {
  children?: React.ReactNode;
  onPress?: () => void;
  /** A 3pt rail on the left. Semantic — see the color rules in tokens.ts. */
  accent?: Accent;
  padded?: boolean;
  style?: ViewStyle;
  /** Flat cards drop the shadow; used inside lists where depth would stack. */
  flat?: boolean;
};

export function Card({
  children,
  onPress,
  accent = "none",
  padded = true,
  style,
  flat,
}: Props) {
  const { colors, radius, space } = useTheme();
  const pressed = useSharedValue(0);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 - pressed.value * 0.015) }],
  }));

  const railColor =
    accent === "accent"
      ? colors.accent
      : accent === "calm"
        ? colors.calm
        : accent === "record"
          ? colors.record
          : undefined;

  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderLeftWidth: railColor ? 3 : StyleSheet.hairlineWidth,
    borderLeftColor: railColor ?? colors.border,
    padding: padded ? space.base + 2 : 0,
    overflow: "hidden",
    ...(flat
      ? {}
      : {
          shadowColor: "#04091A",
          shadowOpacity: 0.1,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 2,
        }),
  };

  if (!onPress) return <View style={[base, style]}>{children}</View>;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPressIn={() => {
        pressed.value = 1;
        haptics.step();
      }}
      onPressOut={() => (pressed.value = 0)}
      onPress={onPress}
      style={[base, aStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

/** Card with the standard eyebrow / title / body stack already laid out. */
export function InfoCard({
  eyebrow,
  title,
  body,
  accent = "none",
  right,
  onPress,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  accent?: Accent;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const { space } = useTheme();
  return (
    <Card accent={accent} onPress={onPress}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: space.md }}>
        <View style={{ flex: 1, gap: 5 }}>
          {eyebrow && (
            <Label
              tone={
                accent === "calm" ? "calm" : accent === "record" ? "record" : "accent"
              }
            >
              {eyebrow}
            </Label>
          )}
          <Heading size={18}>{title}</Heading>
          {body && <Body size={14}>{body}</Body>}
        </View>
        {right}
      </View>
    </Card>
  );
}

/** A single number with its label. The unit the trends screen is built from. */
export function StatTile({
  value,
  label,
  tone = "default",
  sub,
}: {
  value: string;
  label: string;
  tone?: "default" | "accent" | "calm" | "record";
  sub?: string;
}) {
  const { colors, space, radius } = useTheme();
  const color =
    tone === "accent"
      ? colors.accent
      : tone === "calm"
        ? colors.calm
        : tone === "record"
          ? colors.record
          : colors.text;

  return (
    <View
      style={{
        flex: 1,
        minWidth: 96,
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.borderSoft,
        paddingVertical: space.md,
        paddingHorizontal: space.base,
        gap: 2,
      }}
    >
      <Body
        size={30}
        weight="semi"
        style={{
          color,
          fontVariant: ["tabular-nums"],
          lineHeight: 34,
          letterSpacing: -1,
        }}
      >
        {value}
      </Body>
      <Label size={10}>{label}</Label>
      {sub && (
        <Body size={12} tone="faint" style={{ marginTop: 2 }}>
          {sub}
        </Body>
      )}
    </View>
  );
}

/** Thin horizontal rule that matches the card borders. */
export function Divider({ inset = 0 }: { inset?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginLeft: inset,
      }}
    />
  );
}

/** Soft tinted well — used behind quotes, prompts, and safety copy. */
export function Well({
  children,
  tone = "calm",
}: {
  children: React.ReactNode;
  tone?: "calm" | "accent" | "record";
}) {
  const { colors, radius, space } = useTheme();
  const bg =
    tone === "accent"
      ? colors.accentSoft
      : tone === "record"
        ? colors.recordSoft
        : colors.calmSoft;
  const edge =
    tone === "accent" ? colors.accent : tone === "record" ? colors.record : colors.calm;

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: radius.md,
        borderLeftWidth: 3,
        borderLeftColor: withAlpha(edge, 0.7),
        padding: space.base,
        gap: space.sm,
      }}
    >
      {children}
    </View>
  );
}
