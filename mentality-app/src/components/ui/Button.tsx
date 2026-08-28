import React from "react";
import { Pressable, View, ActivityIndicator, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha } from "@/theme/tokens";
import { Display, Body } from "./Text";
import * as haptics from "@/lib/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = "primary" | "secondary" | "ghost" | "quiet";
type Size = "lg" | "md" | "sm";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  /** Skip the haptic — used where the caller fires a more specific one. */
  silent?: boolean;
};

/**
 * The one button. Presses respond with a weighted scale, not a bounce — on
 * Gameday everything is slow and heavy on purpose, and a springy button would
 * fight that.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  icon,
  iconRight,
  disabled,
  loading,
  full = true,
  silent,
}: Props) {
  const { colors, radius, space, motion, isGameday } = useTheme();
  const pressed = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 - pressed.value * 0.025, motion.spring) }],
    opacity: withTiming(1 - pressed.value * 0.12, { duration: motion.fast }),
  }));

  const height = size === "lg" ? (isGameday ? 68 : 58) : size === "md" ? 50 : 40;
  const textSize = size === "lg" ? (isGameday ? 24 : 20) : size === "md" ? 18 : 15;

  const bg =
    variant === "primary"
      ? colors.accent
      : variant === "secondary"
        ? colors.surfaceAlt
        : "transparent";

  const fg =
    variant === "primary"
      ? colors.accentText
      : variant === "quiet"
        ? colors.textFaint
        : colors.text;

  const border =
    variant === "secondary"
      ? colors.border
      : variant === "ghost"
        ? withAlpha(colors.text, 0.22)
        : "transparent";

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPressIn={() => {
        pressed.value = 1;
        if (!silent) haptics.step();
      }}
      onPressOut={() => (pressed.value = 0)}
      onPress={onPress}
      style={[
        style,
        {
          height,
          borderRadius: variant === "quiet" ? radius.md : radius.lg,
          backgroundColor: bg,
          borderWidth: variant === "secondary" || variant === "ghost" ? 1 : 0,
          borderColor: border,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: space.sm + 2,
          paddingHorizontal: space.xl,
          alignSelf: full ? "stretch" : "flex-start",
          opacity: isDisabled ? 0.45 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon}
          {variant === "quiet" ? (
            <Body size={15} weight="medium" style={{ color: fg }}>
              {label}
            </Body>
          ) : (
            <Display size={textSize} style={{ color: fg, letterSpacing: 0.4 }}>
              {label}
            </Display>
          )}
          {iconRight}
        </>
      )}
    </AnimatedPressable>
  );
}

/**
 * A circular action. Used for the floating reset button and anywhere a label
 * would be noise.
 */
export function IconButton({
  children,
  onPress,
  size = 48,
  variant = "secondary",
  label,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  size?: number;
  variant?: "primary" | "secondary" | "ghost";
  label: string;
}) {
  const { colors } = useTheme();
  const pressed = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 - pressed.value * 0.08) }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={() => {
        pressed.value = 1;
        haptics.step();
      }}
      onPressOut={() => (pressed.value = 0)}
      onPress={onPress}
      style={[
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            variant === "primary"
              ? colors.accent
              : variant === "secondary"
                ? colors.surfaceAlt
                : "transparent",
          borderWidth: variant === "ghost" ? 1 : 0,
          borderColor: withAlpha(colors.text, 0.18),
        },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

export const buttonStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
});

export { View };
