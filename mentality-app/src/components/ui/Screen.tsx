import React from "react";
import { View, ScrollView, StyleSheet, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/theme/ThemeProvider";
import { Display, Label } from "./Text";
import { IconButton } from "./Button";
import { IconArrowLeft, IconClose } from "@/icons";
import { useRouter } from "expo-router";

type Props = {
  children: React.ReactNode;
  /** Scrolls by default. Turn off for full-bleed screens like the runner. */
  scroll?: boolean;
  title?: string;
  eyebrow?: string;
  /** `back` shows an arrow, `close` an X, `none` neither. */
  nav?: "back" | "close" | "none";
  onNav?: () => void;
  right?: React.ReactNode;
  /** Sticks to the bottom above the safe area. Buttons live here. */
  footer?: React.ReactNode;
  padded?: boolean;
  style?: ViewStyle;
  /** Overrides the theme ground — used by the reset screen. */
  background?: string;
};

export function Screen({
  children,
  scroll = true,
  title,
  eyebrow,
  nav = "none",
  onNav,
  right,
  footer,
  padded = true,
  style,
  background,
}: Props) {
  const { colors, space, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const ground = background ?? colors.ground;
  const showHeader = nav !== "none" || !!title || !!eyebrow || !!right;

  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? {
        contentContainerStyle: {
          paddingHorizontal: padded ? space.lg : 0,
          paddingBottom: footer ? space["3xl"] : insets.bottom + space["2xl"],
          gap: space.base,
        },
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: "handled" as const,
      }
    : {
        style: {
          flex: 1,
          paddingHorizontal: padded ? space.lg : 0,
        },
      };

  return (
    <View style={[styles.root, { backgroundColor: ground }, style]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {showHeader && (
        <View
          style={{
            paddingTop: insets.top + space.sm,
            paddingHorizontal: space.lg,
            paddingBottom: space.base,
            gap: space.md,
          }}
        >
          {(nav !== "none" || right) && (
            <View style={styles.headerRow}>
              {nav !== "none" ? (
                <IconButton
                  label={nav === "back" ? "Go back" : "Close"}
                  variant="ghost"
                  size={42}
                  onPress={onNav ?? (() => router.back())}
                >
                  {nav === "back" ? (
                    <IconArrowLeft size={20} color={colors.text} />
                  ) : (
                    <IconClose size={20} color={colors.text} />
                  )}
                </IconButton>
              ) : (
                <View style={{ width: 42 }} />
              )}
              <View style={{ flex: 1 }} />
              {right}
            </View>
          )}

          {(eyebrow || title) && (
            <Animated.View entering={FadeIn.duration(240)} style={{ gap: 6 }}>
              {eyebrow && <Label tone="accent">{eyebrow}</Label>}
              {title && <Display size={38}>{title}</Display>}
            </Animated.View>
          )}
        </View>
      )}

      {!showHeader && <View style={{ height: insets.top + space.sm }} />}

      <Body {...(bodyProps as any)}>{children}</Body>

      {footer && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(160)}
          style={{
            paddingHorizontal: space.lg,
            paddingTop: space.md,
            paddingBottom: insets.bottom + space.md,
            backgroundColor: ground,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.borderSoft,
            gap: space.sm,
          }}
        >
          {footer}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
});
