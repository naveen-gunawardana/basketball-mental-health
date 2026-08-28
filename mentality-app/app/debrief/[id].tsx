import React, { useState } from "react";
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Linking,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Circle, Path } from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { pressureColor, withAlpha } from "@/theme/tokens";
import { Button, IconButton } from "@/components/ui/Button";
import { Body, Display, Heading, Label, Stat } from "@/components/ui/Text";
import { Dial } from "@/components/primitives/Dial";
import { Chips } from "@/components/primitives/Chips";
import { VoiceNote, type VoiceResult } from "@/components/primitives/VoiceNote";
import { Progress } from "@/features/onboarding/Progress";
import { IconArrowLeft, IconCheck, IconMentor } from "@/icons";
import { useGames, useSaveDebrief } from "@/features/games/queries";
import { useMentorMatch } from "@/features/profile/queries";
import { gameTitle } from "@/features/games/model";
import { WORKED, DIDNT_WORK, LETTING_GO, CRISIS } from "@/data/catalog";
import { safety } from "@/lib/api";
import * as haptics from "@/lib/haptics";

const PERFORMANCE_LABELS = [
  "Nothing there",
  "Off",
  "Flat",
  "Patchy",
  "Fine",
  "Solid",
  "Good",
  "Really good",
  "One of my best",
  "Everything worked",
] as const;

/**
 * The debrief.
 *
 * The highest-leverage ninety seconds in the product, and the one nobody else
 * builds — it doesn't demo well and it isn't fun to design. Athletes replay a
 * bad game for three days; a structured pass at it before sleep consolidates
 * the rumination is the actual intervention.
 *
 * The rating is of the *performance*, never the result. That separation is the
 * whole skill being trained here.
 */
export default function Debrief() {
  const { colors, space } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  const { data: games = [] } = useGames();
  const { data: match } = useMentorMatch();
  const saveDebrief = useSaveDebrief();

  const game = games.find((g) => g.id === params.id) ?? null;

  const [step, setStep] = useState(0);
  const [performance, setPerformance] = useState(6);
  const [routineFollowed, setRoutineFollowed] = useState<boolean | null>(null);
  const [worked, setWorked] = useState<string[]>([]);
  const [didnt, setDidnt] = useState<string[]>([]);
  const [lettingGo, setLettingGo] = useState<string[]>([]);
  const [note, setNote] = useState<VoiceResult>({ text: "" });
  const [share, setShare] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const steps = [
    {
      key: "performance",
      title: "How did you play?",
      body: "The performance, not the scoreline. You can play well and lose.",
      valid: true,
    },
    {
      key: "routine",
      title: "Did you run your warmup?",
      body: "Honestly. This one turns into the most useful thing the app ever tells you.",
      valid: routineFollowed !== null,
    },
    {
      key: "worked",
      title: "What worked?",
      body: "Start here. It's the half everyone skips.",
      valid: true,
    },
    {
      key: "didnt",
      title: "What didn't?",
      body: "Name it once, properly, so it stops rattling around.",
      valid: true,
    },
    {
      key: "letgo",
      title: "What are you putting down?",
      body: "Whatever you'd still be carrying at midnight.",
      valid: true,
    },
    { key: "close", title: "Close it out", body: "", valid: true },
  ] as const;

  const current = steps[step];
  const last = step === steps.length - 1;

  const next = async () => {
    if (last) return;
    haptics.step();
    setStep((s) => s + 1);
  };

  const finish = async () => {
    haptics.commit();

    const text = note.text.trim();
    await saveDebrief.mutateAsync({
      game_id: params.id,
      performance,
      effort: null,
      mindset: null,
      routine_followed: routineFollowed,
      worked,
      didnt,
      letting_go: lettingGo[0] ?? null,
      voice_path: note.uri ?? null,
      transcript: text || null,
      shareWithMentor: share,
    });

    // The safety scan runs after the write, never before — nothing an athlete
    // types is ever blocked or delayed by it, and nobody else is notified.
    if (text.length > 12) {
      safety
        .scan(text, "debrief")
        .then((r) => r.surfaceSupport && setShowSupport(true))
        .catch(() => {});
    }

    router.replace(`/game/${params.id}`);
  };

  if (!game) {
    return (
      <View style={[styles.root, { backgroundColor: colors.ground, justifyContent: "center" }]}>
        <Body align="center" tone="faint">
          That game isn't here any more.
        </Body>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.ground }]}>
      <StatusBar style={colors.ground === "#F6F3EC" ? "dark" : "light"} />

      <View style={{ paddingTop: insets.top + space.sm, gap: space.md }}>
        <View style={styles.head}>
          <IconButton
            label={step === 0 ? "Leave" : "Back"}
            variant="ghost"
            size={42}
            onPress={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
          >
            <IconArrowLeft size={19} color={colors.textMuted} />
          </IconButton>

          <View style={{ flex: 1, alignItems: "center", gap: 1 }}>
            <Label size={9} tone="faint">
              Debrief
            </Label>
            <Display size={16}>{gameTitle(game)}</Display>
          </View>

          <View style={{ width: 42 }} />
        </View>

        <Progress step={step} total={steps.length} />
      </View>

      <Animated.View
        key={current.key}
        entering={SlideInRight.duration(320).springify().damping(22)}
        exiting={SlideOutLeft.duration(180)}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: space.lg,
            paddingTop: space.xl,
            paddingBottom: space.xl,
            gap: space.xl,
            justifyContent: current.key === "performance" ? "center" : "flex-start",
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {current.key !== "close" && (
            <Animated.View entering={FadeInDown.duration(380)} style={{ gap: 8 }}>
              <Display size={32}>{current.title}</Display>
              <Body size={15} style={{ maxWidth: 340 }}>
                {current.body}
              </Body>
            </Animated.View>
          )}

          {current.key === "performance" && (
            <Dial
              value={performance}
              onChange={setPerformance}
              labels={PERFORMANCE_LABELS}
              size={280}
            />
          )}

          {current.key === "routine" && (
            <View style={{ gap: space.md }}>
              <YesNo
                yes="I ran it"
                no="I didn't"
                value={routineFollowed}
                onChange={setRoutineFollowed}
              />
              <Body size={13} tone="faint">
                Once there are a handful of each, the app can tell you what your routine is
                actually worth — in your own numbers, not a study's.
              </Body>
            </View>
          )}

          {current.key === "worked" && (
            <Chips
              options={WORKED}
              value={worked}
              onChange={setWorked}
              allowCustom
              max={3}
              tone="calm"
            />
          )}

          {current.key === "didnt" && (
            <Chips options={DIDNT_WORK} value={didnt} onChange={setDidnt} allowCustom max={3} />
          )}

          {current.key === "letgo" && (
            <View style={{ gap: space.xl }}>
              <Chips
                options={LETTING_GO}
                value={lettingGo}
                onChange={setLettingGo}
                allowCustom
                single
              />

              <VoiceNote
                value={note}
                onChange={setNote}
                caption="Anything else? Say it out loud — it's faster and it lands better than typing."
                prompt="Thirty seconds is plenty."
                placeholder="Or type it"
              />

              {match && (note.text.trim() || lettingGo.length > 0) && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <ShareToggle
                    on={share}
                    onToggle={() => {
                      haptics.step();
                      setShare((s) => !s);
                    }}
                    mentorName={match.profiles?.name ?? "your mentor"}
                  />
                </Animated.View>
              )}
            </View>
          )}

          {current.key === "close" && (
            <CloseOut
              performance={performance}
              onDone={finish}
              saving={saveDebrief.isPending}
            />
          )}
        </ScrollView>
      </Animated.View>

      {!last && (
        <View style={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.base }}>
          <Button label="Next" onPress={next} disabled={!current.valid} />
        </View>
      )}

      {showSupport && <SupportSheet onClose={() => setShowSupport(false)} />}
    </View>
  );
}

/* ── Close-out gesture ──────────────────────────────────────────────────── */

/**
 * The game is closed with a deliberate swipe rather than a button.
 *
 * That physicality is the point: it's a small ritual that marks the game as
 * over, and it's the difference between filing a form and actually putting
 * something down.
 */
function CloseOut({
  performance,
  onDone,
  saving,
}: {
  performance: number;
  onDone: () => void;
  saving: boolean;
}) {
  const { colors, space, radius } = useTheme();
  const { width } = useWindowDimensions();
  const [done, setDone] = useState(false);

  const TRACK = width - 40 - 16;
  const KNOB = 62;
  const MAX = TRACK - KNOB - 8;

  const x = useSharedValue(0);
  const tint = pressureColor(performance, colors);

  const complete = () => {
    if (done) return;
    setDone(true);
    haptics.record();
    onDone();
  };

  const pan = Gesture.Pan()
    .enabled(!done && !saving)
    .onUpdate((e) => {
      x.value = Math.max(0, Math.min(MAX, e.translationX));
    })
    .onEnd(() => {
      if (x.value > MAX * 0.75) {
        x.value = withSpring(MAX, { damping: 20 });
        runOnJS(complete)();
      } else {
        x.value = withSpring(0, { damping: 18 });
      }
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: x.value + KNOB,
    opacity: 0.18 + (x.value / MAX) * 0.3,
  }));

  const hintStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1 - (x.value / MAX) * 1.4, { duration: 80 }),
  }));

  return (
    <View style={{ gap: space["2xl"], paddingTop: space.xl }}>
      <View style={{ alignItems: "center", gap: space.base }}>
        <Svg width={140} height={140} viewBox="0 0 140 140">
          <Circle cx={70} cy={70} r={62} stroke={colors.borderSoft} strokeWidth={3} fill="none" />
          <Circle
            cx={70}
            cy={70}
            r={62}
            stroke={tint}
            strokeWidth={5}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 62 * (performance / 10)} ${2 * Math.PI * 62}`}
            transform="rotate(-90 70 70)"
          />
        </Svg>
        <View style={{ position: "absolute", top: 34, alignItems: "center" }}>
          <Stat size={56} style={{ color: tint, lineHeight: 58 }}>
            {performance}
          </Stat>
          <Label size={9} style={{ color: withAlpha(tint, 0.85) }}>
            {PERFORMANCE_LABELS[performance - 1]}
          </Label>
        </View>
      </View>

      <View style={{ gap: space.sm, alignItems: "center" }}>
        <Display size={30} align="center">
          That's the game
        </Display>
        <Body size={15} align="center" tone="faint" style={{ maxWidth: 300 }}>
          It's logged and it's finished. Whatever's left of it isn't yours to carry to
          practice tomorrow.
        </Body>
      </View>

      <GestureDetector gesture={pan}>
        <View
          style={{
            height: KNOB + 8,
            borderRadius: radius.pill,
            backgroundColor: colors.surfaceAlt,
            borderWidth: 1,
            borderColor: colors.border,
            justifyContent: "center",
            overflow: "hidden",
          }}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Swipe to close the game"
          accessibilityHint="Double tap to close it instead"
          onAccessibilityTap={complete}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              fillStyle,
              { backgroundColor: tint, borderRadius: radius.pill },
            ]}
          />

          <Animated.View style={[hintStyle, { alignItems: "center" }]}>
            <Label size={11} tone="faint">
              Swipe to close it
            </Label>
          </Animated.View>

          <Animated.View
            style={[
              knobStyle,
              {
                position: "absolute",
                left: 4,
                width: KNOB,
                height: KNOB,
                borderRadius: KNOB / 2,
                backgroundColor: done ? tint : colors.surface,
                borderWidth: 1,
                borderColor: tint,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
          >
            {done ? (
              <IconCheck size={26} color={colors.ground} strokeWidth={3} />
            ) : (
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path
                  d="M5 12h13M13 6.5l5.5 5.5L13 17.5"
                  stroke={tint}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            )}
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

/* ── Bits ───────────────────────────────────────────────────────────────── */

function YesNo({
  yes,
  no,
  value,
  onChange,
}: {
  yes: string;
  no: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  const { colors, space, radius } = useTheme();

  const Option = ({ label, on, v }: { label: string; on: boolean; v: boolean }) => (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      onPress={() => {
        haptics.step();
        onChange(v);
      }}
      style={{
        flex: 1,
        paddingVertical: space.lg,
        borderRadius: radius.lg,
        alignItems: "center",
        borderWidth: on ? 2 : 1,
        borderColor: on ? (v ? colors.calm : colors.accent) : colors.border,
        backgroundColor: on ? (v ? colors.calmSoft : colors.accentSoft) : colors.surface,
      }}
    >
      <Display
        size={22}
        style={{ color: on ? (v ? colors.calm : colors.accent) : colors.textMuted }}
      >
        {label}
      </Display>
    </Pressable>
  );

  return (
    <View style={{ flexDirection: "row", gap: space.md }}>
      <Option label={yes} on={value === true} v={true} />
      <Option label={no} on={value === false} v={false} />
    </View>
  );
}

function ShareToggle({
  on,
  onToggle,
  mentorName,
}: {
  on: boolean;
  onToggle: () => void;
  mentorName: string;
}) {
  const { colors, space, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      onPress={onToggle}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.md,
        padding: space.base,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: on ? colors.calm : colors.border,
        backgroundColor: on ? colors.calmSoft : "transparent",
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          borderWidth: on ? 0 : 1.5,
          borderColor: colors.border,
          backgroundColor: on ? colors.calm : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {on && <IconCheck size={14} color={colors.ground} strokeWidth={3} />}
      </View>
      <IconMentor size={18} color={on ? colors.calm : colors.textFaint} />
      <Body size={13.5} style={{ flex: 1, color: on ? colors.text : colors.textFaint }}>
        Share just this one with {mentorName}
      </Body>
    </Pressable>
  );
}

function SupportSheet({ onClose }: { onClose: () => void }) {
  const { colors, space } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.overlay, justifyContent: "flex-end" }]}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: space.lg,
          paddingBottom: insets.bottom + space.lg,
          gap: space.base,
        }}
      >
        <Heading size={22}>That sounded heavy</Heading>
        <Body size={15}>
          Nothing about what you wrote gets sent anywhere, and nobody was told. But if it's
          bigger than a game, these people talk to athletes your age all day.
        </Body>
        <Button
          label={`Call ${CRISIS.line}`}
          variant="secondary"
          size="md"
          onPress={() => Linking.openURL(`tel:${CRISIS.line}`)}
        />
        <Button
          label={CRISIS.text}
          variant="secondary"
          size="md"
          onPress={() => Linking.openURL("sms:741741&body=HOME")}
        />
        <Button label="I'm alright" variant="ghost" size="md" onPress={onClose} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 12 },
});
