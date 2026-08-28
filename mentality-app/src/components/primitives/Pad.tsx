import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect, Line, Circle } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { mix } from "@/theme/tokens";
import { Body, Label } from "@/components/ui/Text";
import * as haptics from "@/lib/haptics";

export type PadValue = { valence: number; arousal: number };

type Props = {
  value: PadValue;
  onChange: (v: PadValue) => void;
  size?: number;
  caption?: string;
};

/**
 * Pad — primitive 02.
 *
 * Two questions, one drag. The horizontal axis is valence (rough → good), the
 * vertical is arousal (calm → activated). That's the circumplex model, which
 * is real affect science, and it collapses two sliders into a single gesture
 * nobody has to read.
 *
 * The corner words appear as you enter each quadrant rather than sitting there
 * as labels, so the athlete discovers the vocabulary instead of picking from a
 * menu of feelings.
 */

type Quadrant = { x: number; y: number; word: string; hint: string };

const QUADRANTS: readonly Quadrant[] = [
  { x: 0, y: 0, word: "Rattled", hint: "wound up and not in a good way" },
  { x: 1, y: 0, word: "Fired up", hint: "lit, and it's working for you" },
  { x: 0, y: 1, word: "Flat", hint: "nothing in the tank" },
  { x: 1, y: 1, word: "Locked in", hint: "calm and completely on it" },
] as const;

export function Pad({ value, onChange, size = 300, caption }: Props) {
  const { colors, space, radius } = useTheme();
  const [live, setLive] = useState(value);

  const PAD = 18;
  const inner = size - PAD * 2;

  const toPos = (v: PadValue) => ({
    x: PAD + ((v.valence - 1) / 9) * inner,
    // arousal 10 = most activated, drawn at the top
    y: PAD + ((10 - v.arousal) / 9) * inner,
  });

  const start = toPos(value);
  const px = useSharedValue(start.x);
  const py = useSharedValue(start.y);
  const grabbed = useSharedValue(0);
  const halo = useSharedValue(0);

  useEffect(() => {
    const p = toPos(value);
    px.value = withSpring(p.x, { damping: 18, stiffness: 170 });
    py.value = withSpring(p.y, { damping: 18, stiffness: 170 });
    setLive(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.valence, value.arousal]);

  useEffect(() => {
    halo.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [halo]);

  const commit = useCallback(
    (valence: number, arousal: number) => {
      if (valence === value.valence && arousal === value.arousal) return;
      haptics.tick();
      onChange({ valence, arousal });
    },
    [onChange, value.arousal, value.valence],
  );

  const setFromPoint = useCallback(
    (x: number, y: number) => {
      "worklet";
      const cx = Math.max(PAD, Math.min(size - PAD, x));
      const cy = Math.max(PAD, Math.min(size - PAD, y));
      px.value = cx;
      py.value = cy;
      const valence = Math.round(1 + ((cx - PAD) / inner) * 9);
      const arousal = Math.round(10 - ((cy - PAD) / inner) * 9);
      runOnJS(commit)(valence, arousal);
    },
    [commit, inner, px, py, size],
  );

  const pan = Gesture.Pan()
    .onBegin((e) => {
      grabbed.value = withSpring(1);
      setFromPoint(e.x, e.y);
    })
    .onUpdate((e) => setFromPoint(e.x, e.y))
    .onFinalize(() => (grabbed.value = withSpring(0)));

  const tap = Gesture.Tap().onEnd((e) => setFromPoint(e.x, e.y));

  const puckStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: px.value - 22 },
      { translateY: py.value - 22 },
      { scale: withSpring(1 + grabbed.value * 0.16) },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: px.value - 46 },
      { translateY: py.value - 46 },
      { scale: 0.85 + halo.value * 0.25 },
    ],
    opacity: 0.22 - halo.value * 0.12 + grabbed.value * 0.14,
  }));

  // Hue: good-and-calm lands on sage, rough-and-activated on terracotta.
  const t = (live.valence - 1) / 9;
  const a = (live.arousal - 1) / 9;
  const tint = mix(
    mix(colors.scale[0], colors.scale[5], 1 - t),
    mix(colors.scale[2], colors.scale[4], a),
    0.42,
  );

  const nearest = QUADRANTS.reduce<{ q: Quadrant; d: number }>(
    (best, q) => {
      const d = Math.hypot(q.x - t, q.y - (1 - a));
      return d < best.d ? { q, d } : best;
    },
    { q: QUADRANTS[0], d: Infinity },
  );
  const strength = Math.max(0, 1 - nearest.d / 0.75);

  return (
    <View style={{ alignItems: "center", gap: space.base }}>
      {caption && (
        <Body size={15} align="center" style={{ maxWidth: 290 }}>
          {caption}
        </Body>
      )}

      <GestureDetector gesture={Gesture.Simultaneous(pan, tap)}>
        <View
          style={{ width: size, height: size }}
          accessible
          accessibilityLabel={caption ?? "How you feel"}
          accessibilityValue={{ text: `${nearest.q.word}, ${nearest.q.hint}` }}
        >
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id="pad-glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={tint} stopOpacity={0.24} />
                <Stop offset="1" stopColor={tint} stopOpacity={0} />
              </RadialGradient>
            </Defs>

            <Rect
              x={1}
              y={1}
              width={size - 2}
              height={size - 2}
              rx={radius.xl}
              fill={colors.surfaceAlt}
              stroke={colors.border}
              strokeWidth={1}
            />
            <Rect
              x={1}
              y={1}
              width={size - 2}
              height={size - 2}
              rx={radius.xl}
              fill="url(#pad-glow)"
            />

            {/* Grid — quiet, just enough to read position against */}
            {[0.25, 0.5, 0.75].map((f) => (
              <React.Fragment key={f}>
                <Line
                  x1={PAD + inner * f}
                  y1={PAD}
                  x2={PAD + inner * f}
                  y2={size - PAD}
                  stroke={colors.border}
                  strokeWidth={f === 0.5 ? 1 : 0.5}
                  strokeOpacity={f === 0.5 ? 0.9 : 0.5}
                />
                <Line
                  x1={PAD}
                  y1={PAD + inner * f}
                  x2={size - PAD}
                  y2={PAD + inner * f}
                  stroke={colors.border}
                  strokeWidth={f === 0.5 ? 1 : 0.5}
                  strokeOpacity={f === 0.5 ? 0.9 : 0.5}
                />
              </React.Fragment>
            ))}

            {/* Quadrant anchors */}
            {QUADRANTS.map((q, i) => (
              <Circle
                key={i}
                cx={PAD + q.x * inner}
                cy={PAD + q.y * inner}
                r={3}
                fill={colors.textFaint}
                fillOpacity={0.35}
              />
            ))}
          </Svg>

          {/* Axis labels sit outside the play area so they never fight the puck */}
          <Label size={9} style={[styles.axis, { top: 6, alignSelf: "center", color: colors.textFaint }]}>
            Activated
          </Label>
          <Label size={9} style={[styles.axis, { bottom: 6, alignSelf: "center", color: colors.textFaint }]}>
            Calm
          </Label>
          <Label size={9} style={[styles.axisV, { left: -22, color: colors.textFaint }]}>
            Rough
          </Label>
          <Label size={9} style={[styles.axisV, { right: -22, color: colors.textFaint }]}>
            Good
          </Label>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.halo,
              haloStyle,
              { backgroundColor: tint },
            ]}
          />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.puck,
              puckStyle,
              { backgroundColor: tint, shadowColor: tint, borderColor: colors.ground },
            ]}
          />
        </View>
      </GestureDetector>

      {/* The word, revealed rather than chosen */}
      <View style={{ alignItems: "center", gap: 2, height: 52 }}>
        <Body
          size={22}
          weight="semi"
          style={{
            color: tint,
            opacity: 0.35 + strength * 0.65,
            letterSpacing: -0.3,
          }}
        >
          {nearest.q.word}
        </Body>
        <Body size={13} tone="faint" align="center" style={{ opacity: strength }}>
          {nearest.q.hint}
        </Body>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  puck: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  halo: {
    position: "absolute",
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  axis: { position: "absolute", left: 0, right: 0, textAlign: "center" },
  axisV: {
    position: "absolute",
    top: "50%",
    width: 60,
    textAlign: "center",
    transform: [{ rotate: "-90deg" }],
  },
});
