import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop, G, Line } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  runOnJS,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { pressureColor, withAlpha } from "@/theme/tokens";
import { Body, Label, Stat } from "@/components/ui/Text";
import * as haptics from "@/lib/haptics";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** The face is a 280° arc opening at the bottom, so the gap reads as a base. */
const SWEEP = 280 / 360;
const START = -230; // degrees, rotated so the arc opens downward

type Props = {
  value: number;
  onChange: (v: number) => void;
  /** Shown under the number. Changes as the value moves. */
  labels?: readonly string[];
  min?: number;
  max?: number;
  size?: number;
  /** Copy above the dial. */
  caption?: string;
  /** Color ramp follows the pressure scale by default. */
  colorFor?: (v: number) => string;
};

const DEFAULT_LABELS = [
  "Flat",
  "Loose",
  "Settled",
  "Ready",
  "Switched on",
  "Buzzing",
  "Wired",
  "Tight",
  "Racing",
  "Overloaded",
] as const;

/**
 * Dial — primitive 01.
 *
 * Drag anywhere on the face to set a 1–10 value. Three things move together:
 * the arc fills, the hue runs sage → gold → terracotta, and an inner ring
 * breathes faster as the number climbs. The input *is* the feedback, which is
 * the whole point — nobody has to read a scale to know what an 8 feels like.
 *
 * One haptic tick per unit, never on the same unit twice.
 */
export function Dial({
  value,
  onChange,
  labels = DEFAULT_LABELS,
  min = 1,
  max = 10,
  size = 260,
  caption,
  colorFor,
}: Props) {
  const { colors, space } = useTheme();
  const [display, setDisplay] = useState(value);

  const R = size / 2 - 26;
  const C = 2 * Math.PI * R;

  const progress = useSharedValue((value - min) / (max - min));
  const pulse = useSharedValue(0);
  const grabbed = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring((value - min) / (max - min), {
      damping: 20,
      stiffness: 160,
    });
    setDisplay(value);
  }, [value, min, max, progress]);

  // Breathing ring: 3.4s at rest, 1.1s at maximum. The body reads the tempo
  // before the eye reads the number.
  useEffect(() => {
    const t = (display - min) / (max - min);
    const duration = 3400 - t * 2300;
    pulse.value = 0;
    pulse.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [display, min, max, pulse]);

  const commit = useCallback(
    (next: number) => {
      if (next === value) return;
      haptics.tick();
      onChange(next);
    },
    [onChange, value],
  );

  const setFromPoint = useCallback(
    (x: number, y: number) => {
      "worklet";
      const cx = size / 2;
      const cy = size / 2;
      let angle = (Math.atan2(y - cy, x - cx) * 180) / Math.PI; // -180..180
      // Rotate into the arc's own frame, where 0 is the start of the sweep.
      let a = angle - START;
      while (a < 0) a += 360;
      while (a >= 360) a -= 360;
      const span = SWEEP * 360;
      if (a > span) {
        // In the dead zone at the bottom — snap to whichever end is closer.
        a = a - span < (360 - a) ? span : 0;
      }
      const t = a / span;
      progress.value = t;
      const next = Math.round(min + t * (max - min));
      runOnJS(commit)(next);
    },
    [commit, max, min, size, progress],
  );

  const pan = Gesture.Pan()
    .onBegin((e) => {
      grabbed.value = withSpring(1);
      setFromPoint(e.x, e.y);
    })
    .onUpdate((e) => setFromPoint(e.x, e.y))
    .onFinalize(() => {
      grabbed.value = withSpring(0);
    });

  const tap = Gesture.Tap().onEnd((e) => setFromPoint(e.x, e.y));
  const gesture = Gesture.Simultaneous(pan, tap);

  const tint = (colorFor ?? ((v: number) => pressureColor(v, colors)))(display);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: C - C * SWEEP * progress.value,
  }));

  const breathProps = useAnimatedProps(() => ({
    r: R * (0.44 + pulse.value * 0.1),
    strokeOpacity: 0.16 + pulse.value * 0.2,
  }));

  const knobStyle = useAnimatedStyle(() => {
    const a = ((START + progress.value * SWEEP * 360) * Math.PI) / 180;
    return {
      transform: [
        { translateX: Math.cos(a) * R },
        { translateY: Math.sin(a) * R },
        { scale: withSpring(1 + grabbed.value * 0.22) },
      ],
    };
  });

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 + grabbed.value * 0.015) }],
  }));

  const label = labels[Math.min(labels.length - 1, Math.max(0, display - min))];

  return (
    <View style={{ alignItems: "center", gap: space.base }}>
      {caption && (
        <Body size={15} align="center" style={{ maxWidth: 280 }}>
          {caption}
        </Body>
      )}

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[{ width: size, height: size }, faceStyle]}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={caption ?? "Rating"}
          accessibilityValue={{ min, max, now: display, text: label }}
          accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
          onAccessibilityAction={(e) => {
            const d = e.nativeEvent.actionName === "increment" ? 1 : -1;
            const next = Math.max(min, Math.min(max, value + d));
            commit(next);
          }}
        >
          <Svg width={size} height={size}>
            <Defs>
              <LinearGradient id="dial-arc" x1="0" y1="1" x2="1" y2="0">
                <Stop offset="0" stopColor={tint} stopOpacity={0.55} />
                <Stop offset="1" stopColor={tint} stopOpacity={1} />
              </LinearGradient>
            </Defs>

            <G rotation={START + 90} origin={`${size / 2}, ${size / 2}`}>
              {/* Track */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={R}
                stroke={colors.borderSoft}
                strokeWidth={14}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${C * SWEEP} ${C}`}
              />
              {/* Fill */}
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={R}
                stroke="url(#dial-arc)"
                strokeWidth={14}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${C * SWEEP} ${C}`}
                animatedProps={arcProps}
              />
            </G>

            {/* Tick marks — one per unit, so the scale is legible without numbers */}
            <G>
              {Array.from({ length: max - min + 1 }).map((_, i) => {
                const t = i / (max - min);
                const a = ((START + t * SWEEP * 360) * Math.PI) / 180;
                const inner = R - 26;
                const outer = R - 21;
                const active = i <= display - min;
                return (
                  <Line
                    key={i}
                    x1={size / 2 + Math.cos(a) * inner}
                    y1={size / 2 + Math.sin(a) * inner}
                    x2={size / 2 + Math.cos(a) * outer}
                    y2={size / 2 + Math.sin(a) * outer}
                    stroke={active ? tint : colors.borderSoft}
                    strokeOpacity={active ? 0.8 : 1}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                );
              })}
            </G>

            {/* Breathing ring — tempo carries the intensity */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              stroke={tint}
              strokeWidth={1.5}
              fill="none"
              animatedProps={breathProps}
            />
          </Svg>

          {/* Knob */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.knob,
              knobStyle,
              {
                backgroundColor: colors.ground,
                borderColor: tint,
                shadowColor: tint,
              },
            ]}
          >
            <View
              style={{
                width: 9,
                height: 9,
                borderRadius: 5,
                backgroundColor: tint,
              }}
            />
          </Animated.View>

          {/* Readout */}
          <View pointerEvents="none" style={styles.readout}>
            <Stat size={76} style={{ color: tint, lineHeight: 78 }}>
              {display}
            </Stat>
            <Label size={12} style={{ color: withAlpha(tint, 0.85) }}>
              {label}
            </Label>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  knob: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
    borderRadius: 15,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  readout: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
