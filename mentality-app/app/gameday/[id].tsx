import React, { useEffect, useMemo, useState } from "react";
import { View, Pressable, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha, pressureColor } from "@/theme/tokens";
import { Button, IconButton } from "@/components/ui/Button";
import { Body, Display, Heading, Label } from "@/components/ui/Text";
import { Well } from "@/components/ui/Card";
import { Dial } from "@/components/primitives/Dial";
import { BodyMap } from "@/components/primitives/BodyMap";
import { Chips } from "@/components/primitives/Chips";
import { Countdown } from "@/features/games/Countdown";
import { IconArrowLeft, IconArrowRight, IconPlay, IconReset, IconCheck } from "@/icons";
import { useGames, useSaveEntry, useGameEntries } from "@/features/games/queries";
import { useSettings } from "@/features/profile/queries";
import { useDefaultRoutine } from "@/features/routines/queries";
import { phaseOf, gameTitle } from "@/features/games/model";
import { CONTROLLABLES, getSport } from "@/data/catalog";
import { useSession } from "@/store/session";
import type { BodyArea } from "@/components/primitives/BodyMap";
import * as haptics from "@/lib/haptics";

type Stage = "hub" | "walkin" | "body" | "controllable" | "done";

/**
 * Gameday mode.
 *
 * When a game is inside four hours the app stops being a set of tabs and
 * becomes one surface with one action on it. Dark ground, bigger type, hit
 * targets over 64pt, no bounce in the motion. Everything here works offline.
 */
export default function GamedayScreen() {
  const { colors, space, enterGameday, exitGameday } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; step?: string }>();

  const { data: games = [] } = useGames();
  const { data: settings } = useSettings();
  const { routine: warmup } = useDefaultRoutine("warmup");
  const { data: entries = [] } = useGameEntries(params.id);
  const saveEntry = useSaveEntry();
  const leaveGameday = useSession((s) => s.leaveGameday);
  const clearLeftGameday = useSession((s) => s.clearLeftGameday);

  const game = games.find((g) => g.id === params.id) ?? null;

  const [stage, setStage] = useState<Stage>(params.step === "walkin" ? "walkin" : "hub");
  const [pressure, setPressure] = useState(settings?.baseline_pressure ?? 6);
  const [body, setBody] = useState<BodyArea[]>([]);
  const [controllable, setControllable] = useState<string[]>([]);

  useEffect(() => {
    enterGameday();
    // Arriving here deliberately re-arms the takeover, so a later trip back to
    // NOW behaves the way it did the first time.
    if (params.id) clearLeftGameday(params.id);
    return () => exitGameday();
  }, [enterGameday, exitGameday, clearLeftGameday, params.id]);

  const exitToTabs = () => {
    if (params.id) leaveGameday(params.id);
    router.replace("/(tabs)");
  };

  const alreadyCheckedIn = useMemo(
    () => entries.some((e) => e.phase === "walk_in"),
    [entries],
  );

  const sport = getSport(settings?.primary_sport);
  const phase = game ? phaseOf(game, false) : "none";
  const live = phase === "live";

  if (!game) {
    return (
      <View style={[styles.root, { backgroundColor: colors.ground, justifyContent: "center" }]}>
        <Body align="center" tone="faint">
          That game isn't here any more.
        </Body>
        <Pressable onPress={() => router.replace("/(tabs)")} style={{ padding: 20 }}>
          <Label size={11} tone="accent" align="center">
            Back to Gameday
          </Label>
        </Pressable>
      </View>
    );
  }

  const finishCheckIn = async () => {
    haptics.commit();
    await saveEntry.mutateAsync({
      game_id: game.id,
      phase: "walk_in",
      pressure,
      energy: null,
      valence: null,
      arousal: null,
      sleep_hours: null,
      body_areas: body,
      controllable: controllable[0] ?? null,
      payload: {},
    });
    setStage("done");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.ground }]}>
      <StatusBar style="light" />

      {/* Ambient wash — the only decoration on the whole surface */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View
          style={{
            position: "absolute",
            top: -140,
            left: -60,
            right: -60,
            height: 380,
            borderRadius: 200,
            backgroundColor: withAlpha(live ? colors.accent : colors.calm, 0.09),
          }}
        />
      </View>

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + space.sm,
          paddingHorizontal: space.lg,
          flexDirection: "row",
          alignItems: "center",
          gap: space.md,
        }}
      >
        <IconButton
          label={stage === "hub" ? "Leave gameday" : "Back"}
          variant="ghost"
          size={42}
          onPress={() => (stage === "hub" ? exitToTabs() : setStage("hub"))}
        >
          <IconArrowLeft size={19} color={colors.textMuted} />
        </IconButton>
        <View style={{ flex: 1, alignItems: "center", gap: 2 }}>
          <Label size={9.5} tone="accent">
            {live ? "Live" : "Game day"}
          </Label>
          <Display size={17}>{gameTitle(game)}</Display>
        </View>
        <View style={{ width: 42 }} />
      </View>

      {/* Stage */}
      <Animated.View
        key={stage}
        entering={SlideInRight.duration(320).springify().damping(24)}
        exiting={SlideOutLeft.duration(180)}
        style={{ flex: 1 }}
      >
        {stage === "hub" && (
          <Hub
            game={game}
            live={live}
            checkedIn={alreadyCheckedIn}
            breakWord={sport.breakWord}
            onCheckIn={() => setStage("walkin")}
            onWarmup={() => warmup && router.push(`/run/${warmup.id}`)}
            onReset={() => router.push("/reset")}
            onDebrief={() => router.push(`/debrief/${game.id}`)}
            hasWarmup={!!warmup}
          />
        )}

        {stage === "walkin" && (
          <StageWrap
            title="How are you walking in?"
            body="No wrong answer. This is just the reading."
            cta="Next"
            onNext={() => setStage("body")}
          >
            <Dial value={pressure} onChange={setPressure} size={274} />
          </StageWrap>
        )}

        {stage === "body" && (
          <StageWrap
            title="Where is it sitting?"
            body="Tap anywhere you feel it. Skip if you don't."
            cta="Next"
            onNext={() => setStage("controllable")}
          >
            <BodyMap value={body} onChange={setBody} />
          </StageWrap>
        )}

        {stage === "controllable" && (
          <StageWrap
            title="One thing you control"
            body="Not the result. Not your minutes. One thing that's actually yours tonight."
            cta="Lock it in"
            disabled={controllable.length === 0}
            onNext={finishCheckIn}
          >
            <Chips
              options={CONTROLLABLES}
              value={controllable}
              onChange={setControllable}
              allowCustom
              single
            />
          </StageWrap>
        )}

        {stage === "done" && (
          <CheckedIn
            controllable={controllable[0] ?? ""}
            pressure={pressure}
            anchor={settings?.anchor_word ?? null}
            onWarmup={() => warmup && router.push(`/run/${warmup.id}`)}
            onBack={() => setStage("hub")}
            hasWarmup={!!warmup}
          />
        )}
      </Animated.View>
    </View>
  );
}

/* ── The hub ────────────────────────────────────────────────────────────── */

function Hub({
  game,
  live,
  checkedIn,
  breakWord,
  onCheckIn,
  onWarmup,
  onReset,
  onDebrief,
  hasWarmup,
}: {
  game: Parameters<typeof gameTitle>[0];
  live: boolean;
  checkedIn: boolean;
  breakWord: string | null;
  onCheckIn: () => void;
  onWarmup: () => void;
  onReset: () => void;
  onDebrief: () => void;
  hasWarmup: boolean;
}) {
  const { colors, space } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: space.lg,
        paddingTop: space.xl,
        paddingBottom: insets.bottom + space.xl,
        gap: space["2xl"],
        justifyContent: "center",
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(500)}>
        <Countdown game={game as never} size={230} />
      </Animated.View>

      <View style={{ gap: space.md }}>
        {live ? (
          <>
            <BigAction
              label={breakWord ? `${breakWord} reset` : "Reset"}
              note="Thirty seconds. Nothing gets logged."
              icon={<IconReset size={24} color={colors.accentText} />}
              onPress={onReset}
              primary
            />
            <BigAction
              label="It's over"
              note="Go straight to the debrief."
              icon={<IconCheck size={22} color={colors.text} strokeWidth={2.4} />}
              onPress={onDebrief}
            />
          </>
        ) : (
          <>
            {!checkedIn && (
              <BigAction
                label="Walk-in check"
                note="Thirty seconds, then pick your one thing."
                icon={<IconArrowRight size={22} color={colors.accentText} strokeWidth={2.2} />}
                onPress={onCheckIn}
                primary
              />
            )}

            {hasWarmup && (
              <BigAction
                label="Run your warmup"
                note="Headphones in. It runs itself."
                icon={<IconPlay size={20} color={checkedIn ? colors.accentText : colors.text} />}
                onPress={onWarmup}
                primary={checkedIn}
              />
            )}

            <BigAction
              label="Reset"
              note="Any time you need it."
              icon={<IconReset size={22} color={colors.text} />}
              onPress={onReset}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

function BigAction({
  label,
  note,
  icon,
  onPress,
  primary,
}: {
  label: string;
  note: string;
  icon: React.ReactNode;
  onPress: () => void;
  primary?: boolean;
}) {
  const { colors, space, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${note}`}
      onPress={() => {
        haptics.step();
        onPress();
      }}
      style={{
        minHeight: 76,
        flexDirection: "row",
        alignItems: "center",
        gap: space.base,
        paddingHorizontal: space.lg,
        paddingVertical: space.base,
        borderRadius: radius.lg,
        backgroundColor: primary ? colors.accent : colors.surface,
        borderWidth: primary ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flex: 1, gap: 3 }}>
        <Display size={23} style={{ color: primary ? colors.accentText : colors.text }}>
          {label}
        </Display>
        <Body
          size={13}
          style={{ color: primary ? withAlpha(colors.accentText, 0.75) : colors.textFaint }}
        >
          {note}
        </Body>
      </View>
      {icon}
    </Pressable>
  );
}

/* ── Check-in stages ────────────────────────────────────────────────────── */

function StageWrap({
  title,
  body,
  cta,
  onNext,
  disabled,
  children,
}: {
  title: string;
  body: string;
  cta: string;
  onNext: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const { space } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: space.lg,
          paddingTop: space.xl,
          paddingBottom: space.xl,
          gap: space.xl,
          justifyContent: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(380)} style={{ gap: 8 }}>
          <Display size={32} align="center">
            {title}
          </Display>
          <Body size={15} align="center" tone="faint" style={{ maxWidth: 320, alignSelf: "center" }}>
            {body}
          </Body>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(120).duration(400)}>{children}</Animated.View>
      </ScrollView>

      <View style={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.base }}>
        <Button label={cta} onPress={onNext} disabled={disabled} />
      </View>
    </View>
  );
}

function CheckedIn({
  controllable,
  pressure,
  anchor,
  onWarmup,
  onBack,
  hasWarmup,
}: {
  controllable: string;
  pressure: number;
  anchor: string | null;
  onWarmup: () => void;
  onBack: () => void;
  hasWarmup: boolean;
}) {
  const { colors, space } = useTheme();
  const insets = useSafeAreaInsets();
  const tint = pressureColor(pressure, colors);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: space.lg,
          gap: space.xl,
          justifyContent: "center",
        }}
      >
        <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: "center", gap: space.base }}>
          <Label tone="calm">Locked in</Label>
          <Display size={26} align="center" tone="faint">
            Tonight, this is yours
          </Display>
          <View
            style={{
              paddingHorizontal: space.xl,
              paddingVertical: space.lg,
              borderRadius: 22,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: withAlpha(tint, 0.4),
            }}
          >
            <Heading size={24} align="center" style={{ color: colors.text }}>
              {controllable}
            </Heading>
          </View>
        </Animated.View>

        {anchor && (
          <Animated.View entering={FadeIn.delay(300).duration(400)}>
            <Well tone="calm">
              <Label size={10} tone="calm">
                And when it goes wrong
              </Label>
              <Display size={30} align="center" style={{ color: colors.calm }}>
                {anchor}
              </Display>
            </Well>
          </Animated.View>
        )}
      </View>

      <View style={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.base, gap: space.sm }}>
        {hasWarmup && <Button label="Run your warmup" onPress={onWarmup} />}
        <Button label="Not yet" variant="ghost" size="md" onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
