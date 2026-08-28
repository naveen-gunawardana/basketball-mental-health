import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop, G } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha } from "@/theme/tokens";
import { Display, Label, Stat } from "@/components/ui/Text";
import * as haptics from "@/lib/haptics";

/** Seconds per phase. `box` is 4-4-4-4; `settle` is the long-exhale pattern. */
export type BreathPattern = {
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
};

export const PATTERNS = {
  box: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  settle: { inhale: 4, holdIn: 1, exhale: 7, holdOut: 1 },
  reset: { inhale: 3, holdIn: 0, exhale: 6, holdOut: 0 },
  charge: { inhale: 2, holdIn: 0, exhale: 2, holdOut: 0 },
} as const satisfies Record<string, BreathPattern>;

type Phase = "inhale" | "holdIn" | "exhale" | "holdOut";

const COPY: Record<Phase, string> = {
  inhale: "In",
  holdIn: "Hold",
  exhale: "Out",
  holdOut: "Hold",
};

type Props = {
  pattern?: BreathPattern;
  /** Stops after this many complete cycles. Omit to run until unmounted. */
  cycles?: number;
  onDone?: () => void;
  size?: number;
  /** Silence the haptics — used when several drills chain back to back. */
  quiet?: boolean;
  color?: string;
};

/**
 * The breath engine.
 *
 * The visual is secondary. What matters is that the turns are *felt* — a
 * medium impact on the inhale, a lighter one on the exhale — because an
 * athlete on the bench can run this with the phone face-down in their lap and
 * never look at it. That's the actual use case, not the pretty circle.
 */
export function Breath({
  pattern = PATTERNS.box,
  cycles,
  onDone,
  size = 260,
  quiet,
  color,
}: Props) {
  const { colors, space } = useTheme();
  const tint = color ?? colors.calm;

  const [phase, setPhase] = useState<Phase>("inhale");
  const [count, setCount] = useState(pattern.inhale);
  const [cycle, setCycle] = useState(0);

  const scale = useSharedValue(0.55);
  const glow = useSharedValue(0.2);
  const shimmer = useSharedValue(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelled = useRef(false);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [shimmer]);

  useEffect(() => {
    cancelled.current = false;
    const clearAll = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };

    const order: Phase[] = ["inhale", "holdIn", "exhale", "holdOut"];

    const runPhase = (index: number, completed: number) => {
      if (cancelled.current) return;

      const p = order[index];
      const seconds = pattern[p];

      // Zero-length phases are skipped without a frame of flicker.
      if (seconds <= 0) {
        const nextIndex = (index + 1) % order.length;
        const nextCompleted = nextIndex === 0 ? completed + 1 : completed;
        if (cycles && nextIndex === 0 && nextCompleted >= cycles) {
          finish();
          return;
        }
        runPhase(nextIndex, nextCompleted);
        return;
      }

      setPhase(p);
      setCount(seconds);

      const ms = seconds * 1000;
      const ease = Easing.inOut(Easing.cubic);

      if (p === "inhale") {
        if (!quiet) haptics.breathIn();
        scale.value = withTiming(1, { duration: ms, easing: ease });
        glow.value = withTiming(0.55, { duration: ms, easing: ease });
      } else if (p === "exhale") {
        if (!quiet) haptics.breathOut();
        scale.value = withTiming(0.55, { duration: ms, easing: ease });
        glow.value = withTiming(0.2, { duration: ms, easing: ease });
      } else if (!quiet) {
        haptics.tick();
      }

      // Countdown ticks, one per second.
      for (let s = 1; s < seconds; s++) {
        timers.current.push(
          setTimeout(() => !cancelled.current && setCount(seconds - s), s * 1000),
        );
      }

      timers.current.push(
        setTimeout(() => {
          if (cancelled.current) return;
          const nextIndex = (index + 1) % order.length;
          const nextCompleted = nextIndex === 0 ? completed + 1 : completed;
          if (nextIndex === 0) setCycle(nextCompleted);
          if (cycles && nextIndex === 0 && nextCompleted >= cycles) {
            finish();
            return;
          }
          runPhase(nextIndex, nextCompleted);
        }, ms),
      );
    };

    const finish = () => {
      cancelled.current = true;
      clearAll();
      scale.value = withTiming(0.72, { duration: 600 });
      if (!quiet) haptics.commit();
      onDone?.();
    };

    runPhase(0, 0);

    return () => {
      cancelled.current = true;
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern.inhale, pattern.holdIn, pattern.exhale, pattern.holdOut, cycles]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + scale.value * 0.55 }],
    opacity: glow.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.95 + shimmer.value * 0.06 }],
    opacity: 0.16 + shimmer.value * 0.12,
  }));

  return (
    <View style={{ alignItems: "center", gap: space.lg }}>
      <View
        style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
        accessible
        accessibilityLabel={`Breathing. ${COPY[phase]} for ${count} seconds.`}
        accessibilityLiveRegion="polite"
      >
        {/* Outer shimmer — ambient, never tied to the breath itself */}
        <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 2}
              stroke={tint}
              strokeWidth={1}
              fill="none"
            />
          </Svg>
        </Animated.View>

        {/* Glow */}
        <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id="breath-glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={tint} stopOpacity={0.5} />
                <Stop offset="0.6" stopColor={tint} stopOpacity={0.12} />
                <Stop offset="1" stopColor={tint} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#breath-glow)" />
          </Svg>
        </Animated.View>

        {/* The orb */}
        <Animated.View style={orbStyle}>
          <Svg width={size * 0.82} height={size * 0.82}>
            <Defs>
              <RadialGradient id="breath-orb" cx="38%" cy="32%" r="72%">
                <Stop offset="0" stopColor={tint} stopOpacity={0.42} />
                <Stop offset="1" stopColor={tint} stopOpacity={0.14} />
              </RadialGradient>
            </Defs>
            <G>
              <Circle
                cx={(size * 0.82) / 2}
                cy={(size * 0.82) / 2}
                r={(size * 0.82) / 2 - 3}
                fill="url(#breath-orb)"
                stroke={withAlpha(tint, 0.75)}
                strokeWidth={2}
              />
            </G>
          </Svg>
        </Animated.View>

        {/* Readout */}
        <View pointerEvents="none" style={styles.readout}>
          <Display size={34} style={{ color: tint }}>
            {COPY[phase]}
          </Display>
          <Stat size={40} style={{ color: withAlpha(tint, 0.55) }}>
            {count}
          </Stat>
        </View>
      </View>

      {cycles ? (
        <Label size={11} tone="faint">
          {Math.min(cycle + 1, cycles)} of {cycles}
        </Label>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  readout: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
});
