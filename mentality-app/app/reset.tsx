import React, { useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { brand, withAlpha } from "@/theme/tokens";
import { Body, Display, Label } from "@/components/ui/Text";
import { Breath, PATTERNS } from "@/components/primitives/Breath";
import { IconClose } from "@/icons";
import { useSettings } from "@/features/profile/queries";
import * as haptics from "@/lib/haptics";

type Stage = "breathe" | "word" | "adjust" | "go";

/**
 * The reset.
 *
 * Thirty seconds, reachable from anywhere, and it logs nothing.
 *
 * This screen deliberately ignores the theme and paints its own near-
 * monochrome world. It is the one place in the app that gets *quieter* when
 * things are hardest: no numbers, no inputs, no data collection, nothing to
 * decide. Bench, timeout, halftime, or the parking lot afterwards — it works
 * the same and it works with no signal.
 */
export default function Reset() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: settings } = useSettings();

  const [stage, setStage] = useState<Stage>("breathe");
  const fade = useSharedValue(0);

  useEffect(() => {
    fade.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) });
  }, [fade]);

  const wrapStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const anchor = settings?.anchor_word ?? "Next";

  const leave = () => {
    haptics.step();
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: GROUND }]}>
      <StatusBar style="light" />

      {/* Exit is small and quiet. Nothing here should feel like a demand. */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, alignItems: "flex-end" }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Leave the reset"
          onPress={leave}
          hitSlop={14}
          style={{ padding: 10 }}
        >
          <IconClose size={20} color={withAlpha(INK, 0.4)} />
        </Pressable>
      </View>

      <Animated.View style={[styles.stage, wrapStyle]}>
        {stage === "breathe" && (
          <Animated.View entering={FadeIn.duration(500)} exiting={FadeOut.duration(300)} style={styles.center}>
            <Breath
              pattern={PATTERNS.reset}
              cycles={4}
              size={280}
              color={CALM}
              onDone={() => setStage("word")}
            />
            <Body size={14} align="center" style={{ color: withAlpha(INK, 0.45), maxWidth: 260 }}>
              Four of these. Nothing else to do.
            </Body>
          </Animated.View>
        )}

        {stage === "word" && (
          <Animated.View
            entering={FadeIn.duration(700)}
            exiting={FadeOut.duration(300)}
            style={styles.center}
          >
            <Label size={10} style={{ color: withAlpha(INK, 0.4) }}>
              Your word
            </Label>
            <Display size={62} align="center" style={{ color: CALM }}>
              {anchor}
            </Display>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                haptics.step();
                setStage("adjust");
              }}
              style={styles.tapArea}
            >
              <Label size={10} style={{ color: withAlpha(INK, 0.35) }}>
                Tap when you've said it
              </Label>
            </Pressable>
          </Animated.View>
        )}

        {stage === "adjust" && (
          <Animated.View
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(300)}
            style={styles.center}
          >
            <Display size={34} align="center" style={{ color: INK, maxWidth: 300 }}>
              One thing for the rest of it
            </Display>
            <Body size={15} align="center" style={{ color: withAlpha(INK, 0.5), maxWidth: 280 }}>
              Don't type it. Just decide it, and hold it in your head for a second.
            </Body>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                haptics.commit();
                setStage("go");
              }}
              style={styles.tapArea}
            >
              <Label size={10} style={{ color: withAlpha(INK, 0.35) }}>
                Got it
              </Label>
            </Pressable>
          </Animated.View>
        )}

        {stage === "go" && (
          <Animated.View entering={FadeIn.duration(700)} style={styles.center}>
            <Display size={72} align="center" style={{ color: CALM }}>
              Go
            </Display>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={leave}
              style={styles.tapArea}
            >
              <Label size={10} style={{ color: withAlpha(INK, 0.35) }}>
                Close
              </Label>
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>

      <View style={{ paddingBottom: insets.bottom + 20, alignItems: "center" }}>
        <Label size={8.5} style={{ color: withAlpha(INK, 0.22) }}>
          Nothing here is saved
        </Label>
      </View>
    </View>
  );
}

/**
 * Fixed palette. The reset does not follow the device theme or the Gameday
 * surface — it's always this, so it looks identical every single time an
 * athlete reaches for it under pressure.
 */
const GROUND = brand.navy900;
const INK = brand.offWhite;
const CALM = "#8FBCA3";

const styles = StyleSheet.create({
  root: { flex: 1 },
  stage: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  center: { alignItems: "center", gap: 20 },
  tapArea: { paddingVertical: 18, paddingHorizontal: 30 },
});
