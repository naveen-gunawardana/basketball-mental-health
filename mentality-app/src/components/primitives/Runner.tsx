import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha } from "@/theme/tokens";
import { Body, Display, Label, Stat } from "@/components/ui/Text";
import { IconButton } from "@/components/ui/Button";
import {
  IconBreath,
  IconClose,
  IconCue,
  IconMovement,
  IconMusic,
  IconPause,
  IconPlay,
  IconSilence,
  IconVisualize,
  IconArrowRight,
} from "@/icons";
import { Breath, PATTERNS, type BreathPattern } from "./Breath";
import * as haptics from "@/lib/haptics";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type StepKind =
  | "breath"
  | "visualize"
  | "cue"
  | "movement"
  | "music"
  | "silence"
  | "custom";

export type RunStep = {
  id: string;
  kind: StepKind;
  label: string;
  seconds: number;
  /** Longer instruction shown under the label. */
  detail?: string;
  /** breath steps only */
  pattern?: BreathPattern;
};

type Props = {
  steps: RunStep[];
  title: string;
  onDone: () => void;
  onExit: () => void;
  /** Shown on the finish card. */
  doneLabel?: string;
};

const ICONS: Record<StepKind, React.ComponentType<{ size?: number; color?: string }>> = {
  breath: IconBreath,
  visualize: IconVisualize,
  cue: IconCue,
  movement: IconMovement,
  music: IconMusic,
  silence: IconSilence,
  custom: IconCue,
};

/**
 * Runner — primitive 06.
 *
 * One step at a time, full screen, advancing on its own. The athlete never taps
 * "next" unless they want to skip ahead, which is the difference between a tool
 * and a checklist.
 *
 * Constraints this is built against: gloves on, one thumb, no signal, phone in
 * a pocket with the screen locked. Nothing here awaits the network and nothing
 * requires precision.
 */
export function Runner({ steps, title, onDone, onExit, doneLabel = "Done" }: Props) {
  const { colors, space, motion } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(steps[0]?.seconds ?? 0);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const step = steps[index];

  const total = useMemo(() => steps.reduce((s, x) => s + x.seconds, 0), [steps]);
  const elapsedBefore = useMemo(
    () => steps.slice(0, index).reduce((s, x) => s + x.seconds, 0),
    [steps, index],
  );

  const stepProgress = useSharedValue(0);
  const wholeProgress = useSharedValue(0);

  const advance = useCallback(() => {
    const next = index + 1;
    if (next >= steps.length) {
      setFinished(true);
      haptics.commit();
      return;
    }
    haptics.step();
    setIndex(next);
    setRemaining(steps[next].seconds);
  }, [index, steps]);

  // The clock. One interval, restarted whenever the step or the pause state
  // changes. `remaining` is read but deliberately not a dependency — putting
  // it there would tear down and rebuild the ring animation every second.
  useEffect(() => {
    if (finished || paused || !step) return;

    // Resume picks the ring up where it left off rather than snapping to empty.
    stepProgress.value = Math.max(0, Math.min(1, 1 - remaining / step.seconds));
    stepProgress.value = withTiming(1, {
      duration: remaining * 1000,
      easing: Easing.linear,
    });

    tickRef.current = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, finished]);

  // Advancing lives in its own effect so it never runs inside a state updater,
  // where React is free to call it twice.
  useEffect(() => {
    if (finished || paused || !step) return;
    if (remaining <= 0) advance();
  }, [remaining, finished, paused, step, advance]);

  useEffect(() => {
    const done = elapsedBefore + (step ? step.seconds - remaining : 0);
    wholeProgress.value = withTiming(total ? done / total : 0, { duration: 400 });
  }, [elapsedBefore, remaining, step, total, wholeProgress]);

  const skip = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    advance();
  }, [advance]);

  const back = useCallback(() => {
    if (index === 0) return;
    haptics.step();
    setIndex(index - 1);
    setRemaining(steps[index - 1].seconds);
  }, [index, steps]);

  // Swipe left to skip ahead, right to go back. Big, forgiving thresholds.
  const swipe = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .onEnd((e) => {
      if (e.translationX < -60) runOnJS(skip)();
      else if (e.translationX > 60) runOnJS(back)();
    });

  const R = width * 0.42;
  const C = 2 * Math.PI * R;
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: C - C * stepProgress.value,
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${wholeProgress.value * 100}%`,
  }));

  const pulse = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(paused ? 0.97 : 1, motion.gamedaySpring) }],
    opacity: withTiming(paused ? 0.55 : 1, { duration: motion.base }),
  }));

  if (finished) {
    return (
      <FinishCard
        title={title}
        label={doneLabel}
        onDone={onDone}
        seconds={total}
        stepCount={steps.length}
      />
    );
  }

  if (!step) return null;

  const Icon = ICONS[step.kind];

  return (
    <View style={[styles.root, { backgroundColor: colors.ground }]}>
      {/* Whole-routine progress. The only chrome on the screen. */}
      <View style={{ paddingTop: insets.top + space.sm, paddingHorizontal: space.lg }}>
        <View style={styles.topRow}>
          <IconButton label="Leave" variant="ghost" size={40} onPress={onExit}>
            <IconClose size={18} color={colors.textFaint} />
          </IconButton>
          <View style={{ flex: 1, gap: 6 }}>
            <Label size={10} tone="faint" align="center">
              {title}
            </Label>
            <View style={[styles.track, { backgroundColor: colors.borderSoft }]}>
              <Animated.View
                style={[styles.fill, barStyle, { backgroundColor: colors.accent }]}
              />
            </View>
          </View>
          <View style={{ width: 40, alignItems: "flex-end" }}>
            <Stat size={15} tone="faint">
              {index + 1}/{steps.length}
            </Stat>
          </View>
        </View>
      </View>

      <GestureDetector gesture={swipe}>
        <Animated.View style={[styles.stage, pulse]}>
          {step.kind === "breath" ? (
            <Animated.View
              key={step.id}
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(200)}
              style={{ alignItems: "center", gap: 28 }}
            >
              <Breath
                pattern={step.pattern ?? PATTERNS.box}
                size={R * 2}
                color={colors.calm}
              />
              <View style={{ alignItems: "center", gap: 6, paddingHorizontal: 32 }}>
                <Display size={26}>{step.label}</Display>
                {step.detail && (
                  <Body size={14} align="center" tone="faint">
                    {step.detail}
                  </Body>
                )}
              </View>
            </Animated.View>
          ) : (
            <Animated.View
              key={step.id}
              entering={SlideInRight.duration(320).springify().damping(20)}
              exiting={SlideOutLeft.duration(220)}
              style={{ alignItems: "center", gap: 30 }}
            >
              <View style={{ width: R * 2, height: R * 2, alignItems: "center", justifyContent: "center" }}>
                <Svg width={R * 2} height={R * 2} style={StyleSheet.absoluteFill}>
                  <Circle
                    cx={R}
                    cy={R}
                    r={R - 8}
                    stroke={colors.borderSoft}
                    strokeWidth={4}
                    fill="none"
                  />
                  <AnimatedCircle
                    cx={R}
                    cy={R}
                    r={R - 8}
                    stroke={colors.accent}
                    strokeWidth={4}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${C} ${C}`}
                    animatedProps={ringProps}
                    transform={`rotate(-90 ${R} ${R})`}
                  />
                </Svg>

                <View style={{ alignItems: "center", gap: 14 }}>
                  <Icon size={38} color={colors.accent} />
                  <Stat size={68} style={{ lineHeight: 70 }}>
                    {formatClock(remaining)}
                  </Stat>
                </View>
              </View>

              <View style={{ alignItems: "center", gap: 8, paddingHorizontal: 32 }}>
                <Display size={30} align="center">
                  {step.label}
                </Display>
                {step.detail && (
                  <Body size={15} align="center" style={{ maxWidth: 300 }}>
                    {step.detail}
                  </Body>
                )}
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>

      {/* Controls. Deliberately sparse — the routine runs itself. */}
      <View
        style={{
          paddingBottom: insets.bottom + space.lg,
          paddingHorizontal: space.lg,
          gap: space.md,
        }}
      >
        <View style={styles.controls}>
          <IconButton label="Previous step" variant="ghost" size={54} onPress={back}>
            <View style={{ transform: [{ rotate: "180deg" }] }}>
              <IconArrowRight size={20} color={index === 0 ? colors.borderSoft : colors.textMuted} />
            </View>
          </IconButton>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={paused ? "Resume" : "Pause"}
            onPress={() => {
              haptics.step();
              setPaused((p) => !p);
            }}
            style={{
              width: 78,
              height: 78,
              borderRadius: 39,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.accent,
              shadowOpacity: 0.4,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
          >
            {paused ? (
              <IconPlay size={30} color={colors.accentText} />
            ) : (
              <IconPause size={28} color={colors.accentText} />
            )}
          </Pressable>

          <IconButton label="Skip step" variant="ghost" size={54} onPress={skip}>
            <IconArrowRight size={20} color={colors.textMuted} />
          </IconButton>
        </View>

        <Label size={9} tone="faint" align="center">
          Swipe to move between steps
        </Label>
      </View>
    </View>
  );
}

function FinishCard({
  title,
  label,
  onDone,
  seconds,
  stepCount,
}: {
  title: string;
  label: string;
  onDone: () => void;
  seconds: number;
  stepCount: number;
}) {
  const { colors, space } = useTheme();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(0.85);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 140 });
  }, [scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={[styles.root, { backgroundColor: colors.ground, justifyContent: "center" }]}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[{ alignItems: "center", gap: space.lg, paddingHorizontal: space.xl }, style]}
      >
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.calmSoft,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: withAlpha(colors.calm, 0.5),
          }}
        >
          <IconBreath size={54} color={colors.calm} />
        </View>

        <View style={{ alignItems: "center", gap: 6 }}>
          <Label tone="calm">{title}</Label>
          <Display size={44} align="center">
            {label}
          </Display>
          <Body size={14} align="center" tone="faint">
            {stepCount} steps · {Math.round(seconds / 60)} min
          </Body>
        </View>
      </Animated.View>

      <View style={{ position: "absolute", left: space.lg, right: space.lg, bottom: insets.bottom + space.lg }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onDone}
          style={{
            height: 62,
            borderRadius: 18,
            backgroundColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Display size={22} style={{ color: colors.accentText }}>
            Close
          </Display>
        </Pressable>
      </View>
    </View>
  );
}

function formatClock(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${String(r).padStart(2, "0")}` : String(r);
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  track: { height: 3, borderRadius: 2, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2 },
  stage: { flex: 1, alignItems: "center", justifyContent: "center" },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },
});
