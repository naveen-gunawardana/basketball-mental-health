import React, { useEffect, useMemo } from "react";
import { View, Pressable, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop, Path } from "react-native-svg";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha, pressureColor } from "@/theme/tokens";
import { Body, Display, Heading, Label, Stat } from "@/components/ui/Text";
import { Card, Well } from "@/components/ui/Card";
import { Chips } from "@/components/primitives/Chips";
import { Dial } from "@/components/primitives/Dial";
import { BodyMap } from "@/components/primitives/BodyMap";
import { GamedayMark, IconCheck, IconBreath, IconRecord, IconNow } from "@/icons";
import { SportGlyph } from "@/icons/sports";
import {
  SPORTS,
  LEVELS,
  FOCUS_AREAS,
  ANCHOR_WORDS,
  ROUTINE_TEMPLATES,
  getSport,
  type FocusId,
} from "@/data/catalog";
import { useOnboarding } from "@/store/onboarding";
import * as haptics from "@/lib/haptics";

/* ── Shared frame ───────────────────────────────────────────────────────── */

function StepFrame({
  eyebrow,
  title,
  subtitle,
  children,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  center?: boolean;
}) {
  const { space } = useTheme();
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: space.lg,
        paddingTop: space.lg,
        paddingBottom: space["3xl"],
        gap: space.xl,
        flexGrow: 1,
        justifyContent: center ? "center" : "flex-start",
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View entering={FadeInDown.duration(420).springify().damping(20)} style={{ gap: 8 }}>
        {eyebrow && <Label tone="accent">{eyebrow}</Label>}
        <Display size={36}>{title}</Display>
        {subtitle && (
          <Body size={15.5} style={{ maxWidth: 340 }}>
            {subtitle}
          </Body>
        )}
      </Animated.View>

      <Animated.View entering={FadeIn.delay(140).duration(420)} style={{ gap: space.lg }}>
        {children}
      </Animated.View>
    </ScrollView>
  );
}

/* ── 01 · Hero ──────────────────────────────────────────────────────────── */

export function StepHero() {
  const { colors, space } = useTheme();
  const { width } = useWindowDimensions();

  const sweep = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    // The mark's ring draws itself once, then the glow breathes underneath.
    sweep.value = withDelay(240, withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) }));
    glow.value = withDelay(
      900,
      withRepeat(withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
  }, [sweep, glow]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.75 + sweep.value * 0.25 }],
    opacity: sweep.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + glow.value * 0.25 }],
    opacity: 0.16 + glow.value * 0.18,
  }));

  return (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: space.lg, gap: space["2xl"] }}>
      <View style={{ alignItems: "center", height: 220, justifyContent: "center" }}>
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 260,
              height: 260,
              borderRadius: 130,
              backgroundColor: colors.accent,
            },
            glowStyle,
          ]}
        />
        <Animated.View style={markStyle}>
          <GamedayMark size={132} color={colors.accent} ring={colors.text} progress={0.78} />
        </Animated.View>
      </View>

      <View style={{ gap: space.base, alignItems: "center" }}>
        <Animated.View entering={FadeInUp.delay(500).duration(600)}>
          <Display size={Math.min(76, width * 0.19)} align="center">
            Gameday
          </Display>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).duration(600)}>
          <Label size={11} tone="faint" align="center">
            By Mentality Sports
          </Label>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(880).duration(600)} style={{ marginTop: space.base }}>
          <Heading size={21} align="center" style={{ maxWidth: 320 }}>
            The mental side of your sport, built around the games you actually play.
          </Heading>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(1080).duration(600)}>
          <Body size={14} align="center" tone="faint" style={{ maxWidth: 300 }}>
            Eight quick questions. No account until the end.
          </Body>
        </Animated.View>
      </View>
    </View>
  );
}

/* ── 02 · Sport ─────────────────────────────────────────────────────────── */

export function StepSport() {
  const { colors, radius } = useTheme();
  const { draft, set } = useOnboarding();

  return (
    <StepFrame
      eyebrow="Step 1"
      title="What do you play?"
      subtitle="This changes the words the app uses and which drills come first."
    >
      <View style={styles.grid}>
        {SPORTS.map((sport, i) => {
          const selected = draft.sport === sport.id;
          return (
            <Animated.View
              key={sport.id}
              entering={FadeInDown.delay(i * 34).duration(360).springify().damping(18)}
              style={{ width: "31.5%" }}
            >
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={sport.name}
                onPress={() => {
                  haptics.step();
                  set("sport", sport.id);
                  if (draft.position && !sport.positions.includes(draft.position)) {
                    set("position", null);
                  }
                }}
                style={{
                  aspectRatio: 0.92,
                  borderRadius: radius.lg,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? colors.accent : colors.border,
                  backgroundColor: selected ? colors.accentSoft : colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingHorizontal: 6,
                }}
              >
                <SportGlyph
                  sport={sport.id}
                  size={34}
                  color={selected ? colors.accent : colors.textMuted}
                  strokeWidth={selected ? 1.9 : 1.5}
                />
                <Body
                  size={11.5}
                  align="center"
                  weight={selected ? "semi" : "medium"}
                  style={{ color: selected ? colors.accent : colors.textMuted, lineHeight: 14 }}
                >
                  {sport.name}
                </Body>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </StepFrame>
  );
}

/* ── 03 · Level and position ────────────────────────────────────────────── */

export function StepLevel() {
  const { space } = useTheme();
  const { draft, set } = useOnboarding();
  const sport = getSport(draft.sport ?? undefined);

  return (
    <StepFrame
      eyebrow="Step 2"
      title="Where are you at?"
      subtitle="Nobody sees this but you. It only shapes what the app suggests."
    >
      <View style={{ gap: space.xl }}>
        <Chips
          caption="Level"
          options={LEVELS}
          value={draft.level ? [draft.level] : []}
          onChange={(v) => set("level", v[0] ?? null)}
          single
        />

        {sport.positions.length > 0 && (
          <Animated.View entering={FadeIn.duration(300)}>
            <Chips
              caption={`Position${sport.id === "track" || sport.id === "swimming" ? " / event" : ""}`}
              options={sport.positions}
              value={draft.position ? [draft.position] : []}
              onChange={(v) => set("position", v[0] ?? null)}
              allowCustom
              single
            />
          </Animated.View>
        )}
      </View>
    </StepFrame>
  );
}

/* ── 04 · Focus areas ───────────────────────────────────────────────────── */

export function StepFocus() {
  const { colors, space, radius } = useTheme();
  const { draft, set } = useOnboarding();

  const toggle = (id: FocusId) => {
    const on = draft.focus.includes(id);
    if (!on && draft.focus.length >= 3) {
      haptics.warn();
      return;
    }
    haptics.step();
    set("focus", on ? draft.focus.filter((f) => f !== id) : [...draft.focus, id]);
  };

  return (
    <StepFrame
      eyebrow="Step 3"
      title="What's actually hard?"
      subtitle="Pick up to three. Be honest — this is the whole reason the app knows what to give you."
    >
      <View style={{ gap: space.sm }}>
        {FOCUS_AREAS.map((f, i) => {
          const selected = draft.focus.includes(f.id);
          const order = draft.focus.indexOf(f.id);
          return (
            <Animated.View
              key={f.id}
              entering={FadeInDown.delay(i * 30).duration(340).springify().damping(18)}
            >
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${f.label}. ${f.detail}`}
                onPress={() => toggle(f.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: space.base,
                  padding: space.base,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: selected ? colors.accent : colors.border,
                  backgroundColor: selected ? colors.accentSoft : colors.surface,
                  opacity: !selected && draft.focus.length >= 3 ? 0.45 : 1,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: selected ? 0 : 1.5,
                    borderColor: colors.border,
                    backgroundColor: selected ? colors.accent : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selected && (
                    <Stat size={14} style={{ color: colors.accentText }}>
                      {order + 1}
                    </Stat>
                  )}
                </View>

                <View style={{ flex: 1, gap: 1 }}>
                  <Body
                    size={15.5}
                    weight="semi"
                    style={{ color: selected ? colors.accent : colors.text }}
                  >
                    {f.label}
                  </Body>
                  <Body size={13} tone="faint">
                    {f.detail}
                  </Body>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </StepFrame>
  );
}

/* ── 05 · Pressure baseline ─────────────────────────────────────────────── */

export function StepBaseline() {
  const { draft, set } = useOnboarding();
  const sport = getSport(draft.sport ?? undefined);

  return (
    <StepFrame
      eyebrow="Step 4"
      title="Before a big one"
      subtitle={`Drag the dial to where you usually sit an hour before a big ${sport.eventWord.toLowerCase()}.`}
    >
      <Dial
        value={draft.baselinePressure}
        onChange={(v) => set("baselinePressure", v)}
        size={280}
      />

      <Well tone={draft.baselinePressure >= 7 ? "accent" : "calm"}>
        <Label size={10} tone={draft.baselinePressure >= 7 ? "accent" : "calm"}>
          Worth knowing
        </Label>
        <Body size={14}>
          {draft.baselinePressure >= 7
            ? "High isn't bad. Plenty of athletes play their best sitting up here — the work is learning to use it instead of fighting it."
            : draft.baselinePressure <= 3
              ? "Sitting low is fine, but flat is a real thing too. Some of the drills in here are about getting the engine going, not calming it down."
              : "Right in the middle. The useful question isn't where you sit — it's whether where you sit matches what the game needs."}
        </Body>
      </Well>
    </StepFrame>
  );
}

/* ── 06 · Where you feel it ─────────────────────────────────────────────── */

export function StepBody() {
  const { draft, set } = useOnboarding();
  return (
    <StepFrame
      eyebrow="Step 5"
      title="Where does it live?"
      subtitle="Nerves show up somewhere physical. Noticing where is the first real skill — and it's the fastest way to catch yourself mid-game."
    >
      <BodyMap value={draft.baselineBody} onChange={(v) => set("baselineBody", v)} />
    </StepFrame>
  );
}

/* ── 07 · Anchor word ───────────────────────────────────────────────────── */

export function StepAnchor() {
  const { colors, space } = useTheme();
  const { draft, set } = useOnboarding();

  return (
    <StepFrame
      eyebrow="Step 6"
      title="Pick your word"
      subtitle="One word you come back to after a mistake. It has to tell you what to do, not what to stop — your head can't act on “don't panic.”"
    >
      <Chips
        options={ANCHOR_WORDS}
        value={draft.anchorWord ? [draft.anchorWord] : []}
        onChange={(v) => set("anchorWord", v[0] ?? null)}
        allowCustom
        single
      />

      {draft.anchorWord && (
        <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: "center", gap: space.sm }}>
          <View
            style={{
              paddingHorizontal: space["2xl"],
              paddingVertical: space.lg,
              borderRadius: 20,
              backgroundColor: colors.accentSoft,
              borderWidth: 1,
              borderColor: withAlpha(colors.accent, 0.4),
            }}
          >
            <Display size={44} align="center" style={{ color: colors.accent }}>
              {draft.anchorWord}
            </Display>
          </View>
          <Body size={13} tone="faint" align="center">
            You'll hear this at halftime and after every mistake.
          </Body>
        </Animated.View>
      )}
    </StepFrame>
  );
}

/* ── 08 · First routine ─────────────────────────────────────────────────── */

export function StepRoutine() {
  const { colors, space, radius } = useTheme();
  const { draft, set } = useOnboarding();

  // Suggest the template that matches what they said is hard.
  const suggested = useMemo(() => {
    if (draft.focus.includes("motivation")) return "charge";
    if (draft.focus.includes("focus")) return "focus";
    return "settle";
  }, [draft.focus]);

  const warmups = ROUTINE_TEMPLATES.filter((t) => t.kind === "warmup");

  useEffect(() => {
    if (!draft.routineTemplateId) set("routineTemplateId", suggested);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StepFrame
      eyebrow="Step 7"
      title="Your warmup"
      subtitle="The hour before is where most of this gets won. Start with one of these — you can rebuild it however you want later."
    >
      <View style={{ gap: space.md }}>
        {warmups.map((t, i) => {
          const selected = draft.routineTemplateId === t.id;
          return (
            <Animated.View
              key={t.id}
              entering={FadeInDown.delay(i * 60).duration(400).springify().damping(18)}
            >
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${t.name}. ${t.tagline}. ${t.minutes} minutes.`}
                onPress={() => {
                  haptics.step();
                  set("routineTemplateId", t.id);
                }}
                style={{
                  borderRadius: radius.lg,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? colors.accent : colors.border,
                  backgroundColor: selected ? colors.accentSoft : colors.surface,
                  padding: space.base + 2,
                  gap: space.md,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Heading size={19} style={{ color: selected ? colors.accent : colors.text }}>
                        {t.name}
                      </Heading>
                      {t.id === suggested && (
                        <View
                          style={{
                            backgroundColor: selected ? colors.accent : colors.surfaceAlt,
                            borderRadius: 999,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}
                        >
                          <Label size={8.5} style={{ color: selected ? colors.accentText : colors.textFaint }}>
                            Suits you
                          </Label>
                        </View>
                      )}
                    </View>
                    <Body size={13.5} tone="faint">
                      {t.tagline}
                    </Body>
                  </View>
                  <Stat size={22} tone={selected ? "accent" : "faint"}>
                    {t.minutes}′
                  </Stat>
                </View>

                {/* Step strip — shows the shape of the routine at a glance */}
                <View style={{ flexDirection: "row", gap: 3, height: 5 }}>
                  {t.steps.map((s, si) => (
                    <View
                      key={si}
                      style={{
                        flex: s.seconds,
                        borderRadius: 3,
                        backgroundColor: selected
                          ? withAlpha(colors.accent, 0.35 + (si % 3) * 0.22)
                          : colors.borderSoft,
                      }}
                    />
                  ))}
                </View>

                {selected && (
                  <Animated.View entering={FadeIn.duration(260)} style={{ gap: 6 }}>
                    {t.steps.map((s, si) => (
                      <View key={si} style={{ flexDirection: "row", gap: space.sm, alignItems: "center" }}>
                        <Stat size={12} tone="faint" style={{ width: 30 }}>
                          {formatSec(s.seconds)}
                        </Stat>
                        <Body size={13} weight="medium" style={{ color: colors.text }}>
                          {s.label}
                        </Body>
                      </View>
                    ))}
                  </Animated.View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </StepFrame>
  );
}

/* ── 09 · Notifications ─────────────────────────────────────────────────── */

export function StepNotifications() {
  const { colors, space } = useTheme();
  const { draft, set } = useOnboarding();

  const moments = [
    { when: "The night before", what: "Put the game down so you can sleep", icon: IconBreath },
    { when: "75 minutes out", what: "Time to run your warmup", icon: IconNow },
    { when: "90 minutes after", what: "Debrief it before you sleep on it", icon: IconRecord },
  ];

  return (
    <StepFrame
      eyebrow="Step 8"
      title="Three per game"
      subtitle="That's the cap, and it's enforced in the code. Every one is tied to a moment — there's no “we miss you” in here."
    >
      <View style={{ gap: space.sm }}>
        {moments.map((m, i) => (
          <Animated.View
            key={m.when}
            entering={FadeInDown.delay(i * 70).duration(400).springify().damping(18)}
          >
            <Card flat>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.base }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: colors.calmSoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <m.icon size={20} color={colors.calm} />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Label size={9.5} tone="calm">
                    {m.when}
                  </Label>
                  <Body size={14.5} weight="medium" style={{ color: colors.text }}>
                    {m.what}
                  </Body>
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: draft.notificationsOptIn }}
        onPress={() => {
          haptics.step();
          set("notificationsOptIn", !draft.notificationsOptIn);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: space.md,
          padding: space.base,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: draft.notificationsOptIn ? colors.accent : colors.border,
          backgroundColor: draft.notificationsOptIn ? colors.accentSoft : "transparent",
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            borderWidth: draft.notificationsOptIn ? 0 : 1.5,
            borderColor: colors.border,
            backgroundColor: draft.notificationsOptIn ? colors.accent : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {draft.notificationsOptIn && (
            <IconCheck size={15} color={colors.accentText} strokeWidth={3} />
          )}
        </View>
        <Body size={15} weight="medium" style={{ flex: 1, color: colors.text }}>
          Yes, remind me at those three moments
        </Body>
      </Pressable>

      <Body size={12.5} tone="faint">
        You can change this any time, and turning it off doesn't lock anything.
      </Body>
    </StepFrame>
  );
}

/* ── 10 · Done ──────────────────────────────────────────────────────────── */

export function StepDone() {
  const { colors, space } = useTheme();
  const { draft } = useOnboarding();
  const sport = getSport(draft.sport ?? undefined);
  const pulse = useSharedValue(0);

  useEffect(() => {
    haptics.record();
    pulse.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);

  const glow = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + pulse.value * 0.2 }],
    opacity: 0.14 + pulse.value * 0.14,
  }));

  const tint = pressureColor(draft.baselinePressure, colors);

  return (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: space.lg, gap: space.xl }}>
      <View style={{ alignItems: "center", height: 180, justifyContent: "center" }}>
        <Animated.View
          style={[
            { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: tint },
            glow,
          ]}
        />
        <Animated.View entering={FadeIn.duration(600)}>
          <Svg width={150} height={150} viewBox="0 0 150 150">
            <Defs>
              <RadialGradient id="done-glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={tint} stopOpacity={0.3} />
                <Stop offset="1" stopColor={tint} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={75} cy={75} r={75} fill="url(#done-glow)" />
            <Circle cx={75} cy={75} r={54} stroke={tint} strokeWidth={2} fill="none" strokeOpacity={0.5} />
            <Path
              d="M50 76 l17 17 l34 -38"
              stroke={tint}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(240).duration(500)} style={{ gap: space.md, alignItems: "center" }}>
        <Display size={44} align="center">
          You're set
        </Display>
        <Body size={16} align="center" style={{ maxWidth: 320 }}>
          Load your next {sport.eventWord.toLowerCase()} and the app starts working. Everything
          else follows from that one thing.
        </Body>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(420).duration(500)}>
        <Card accent="calm">
          <View style={{ gap: space.sm }}>
            <Label tone="calm">What you told us</Label>
            <Row label="Sport" value={sport.name} />
            {draft.level && <Row label="Level" value={draft.level} />}
            <Row
              label="Working on"
              value={draft.focus
                .map((f) => FOCUS_AREAS.find((x) => x.id === f)?.label)
                .filter(Boolean)
                .join(" · ")}
            />
            {draft.anchorWord && <Row label="Your word" value={draft.anchorWord} />}
          </View>
        </Card>
      </Animated.View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  if (!value) return null;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
      <Label size={9.5} style={{ width: 80, color: colors.textFaint, paddingTop: 3 }}>
        {label}
      </Label>
      <Body size={14} weight="medium" style={{ flex: 1, color: colors.text }}>
        {value}
      </Body>
    </View>
  );
}

function formatSec(s: number) {
  return s >= 60 ? `${Math.round(s / 60)}m` : `${s}s`;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "2.75%",
    rowGap: 12,
  },
});
