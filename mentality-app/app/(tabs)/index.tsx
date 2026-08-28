import React, { useEffect, useMemo, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha } from "@/theme/tokens";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Card, StatTile } from "@/components/ui/Card";
import { Body, Display, Heading, Label, Stat } from "@/components/ui/Text";
import {
  IconArrowRight,
  IconBreath,
  IconPlus,
  IconReset,
  IconSupport,
  GamedayMark,
} from "@/icons";
import { Countdown } from "@/features/games/Countdown";
import { useCurrentGame, useDebriefs } from "@/features/games/queries";
import { useSettings, useFirstName } from "@/features/profile/queries";
import { useDefaultRoutine } from "@/features/routines/queries";
import { useSession } from "@/store/session";
import { phaseOf, isGamedaySurface, PHASE_COPY } from "@/features/games/model";
import { DRILLS, getSport } from "@/data/catalog";

/**
 * NOW — the adaptive home screen.
 *
 * One screen that shows exactly one thing, chosen by where the athlete is in
 * the arc of their next game. This is what keeps the app from turning into a
 * dashboard: there is never a list of six things to maybe do.
 */
export default function Now() {
  const { colors, space, enterGameday, exitGameday } = useTheme();
  const router = useRouter();

  const { game } = useCurrentGame();
  const { data: debriefs = [] } = useDebriefs();
  const { data: settings } = useSettings();
  const firstName = useFirstName();
  const leftGameday = useSession((s) => s.leftGameday);
  const { routine: windDown } = useDefaultRoutine("wind_down");

  // The arc is a function of the clock, so the clock has to be state. A
  // minute is fine: every boundary in phaseOf() is hours or days wide except
  // the start of the game itself, and the countdown ticks that on its own.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const hasDebrief = useMemo(
    () => (game ? debriefs.some((d) => d.game_id === game.id) : false),
    [debriefs, game],
  );

  const phase = phaseOf(game, hasDebrief, now);
  const sport = getSport(settings?.primary_sport);
  const copy = PHASE_COPY[phase];

  // The surface takeover. Entering Gameday is a state the app decides on its
  // own, not a preference — it's the moment a kid shows their teammate.
  useEffect(() => {
    if (isGamedaySurface(phase)) enterGameday();
    else exitGameday();
  }, [phase, enterGameday, exitGameday]);

  // Inside four hours the whole screen belongs to the game — but only until
  // the athlete backs out of it once. Redirecting unconditionally would trap
  // them: leaving the takeover lands here, which sends them straight back.
  useEffect(() => {
    if (phase === "gameday" && game && !leftGameday[game.id]) {
      router.replace(`/gameday/${game.id}`);
    }
  }, [phase, game, leftGameday, router]);

  const todaysDrill = useMemo(() => {
    const focus = settings?.focus_areas ?? [];
    const matching = DRILLS.filter((d) => focus.includes(d.category));
    const pool = matching.length ? matching : DRILLS;
    // Rotates by day so "today's rep" is genuinely different tomorrow without
    // needing any server-side scheduling.
    const day = Math.floor(Date.now() / 86_400_000);
    return pool[day % pool.length];
  }, [settings?.focus_areas]);

  const primaryAction = () => {
    switch (phase) {
      case "none":
      case "settled":
        return router.push("/game/new");
      case "night_before":
        return windDown
          ? router.push(`/run/${windDown.id}`)
          : router.push(`/drill/${todaysDrill.slug}`);
      case "morning":
        return game ? router.push(`/gameday/${game.id}?step=walkin`) : undefined;
      case "gameday":
        return game ? router.push(`/gameday/${game.id}`) : undefined;
      case "live":
        return router.push("/reset");
      case "debrief":
        return game ? router.push(`/debrief/${game.id}`) : undefined;
      default:
        return router.push(`/drill/${todaysDrill.slug}`);
    }
  };

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: space.lg, gap: space.xl }}>
        {/* Greeting */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={{ flex: 1, gap: 2 }}>
            <Label size={10} tone="faint">
              {greeting()}
            </Label>
            <Display size={30}>{firstName}</Display>
          </View>
          <GamedayMark size={40} color={colors.accent} ring={colors.text} progress={0.78} />
        </Animated.View>

        {/* The one thing */}
        {game && phase !== "none" && phase !== "settled" ? (
          <Animated.View entering={FadeIn.delay(80).duration(500)}>
            <Countdown game={game} size={244} />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.delay(80).duration(500)}>
            <EmptyState sportWord={sport.eventWord} />
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(160).duration(450)}>
          <Card accent={phase === "debrief" ? "accent" : "calm"}>
            <View style={{ gap: space.md }}>
              <View style={{ gap: 4 }}>
                <Label tone={phase === "debrief" ? "accent" : "calm"}>{copy.eyebrow}</Label>
                <Heading size={21}>{copy.title}</Heading>
                <Body size={14.5}>{copy.body}</Body>
              </View>

              {copy.cta && (
                <Button
                  label={copy.cta}
                  onPress={primaryAction}
                  size="md"
                  iconRight={
                    <IconArrowRight size={17} color={colors.accentText} strokeWidth={2.2} />
                  }
                />
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Today's rep — always available, never nagged about */}
        {(phase === "far" || phase === "near" || phase === "settled" || phase === "none") && (
          <Animated.View entering={FadeInUp.delay(240).duration(450)} style={{ gap: space.md }}>
            <Label>Today's rep</Label>
            <Card onPress={() => router.push(`/drill/${todaysDrill.slug}`)}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.base }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: colors.calmSoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconBreath size={24} color={colors.calm} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Heading size={17}>{todaysDrill.title}</Heading>
                  <Body size={13} tone="faint">
                    {todaysDrill.blurb}
                  </Body>
                </View>
                <Stat size={19} tone="faint">
                  {Math.round(todaysDrill.seconds / 60)}′
                </Stat>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Season strip — the log, condensed */}
        <Animated.View entering={FadeInUp.delay(320).duration(450)} style={{ gap: space.md }}>
          <View style={styles.header}>
            <Label>This season</Label>
            <Pressable onPress={() => router.push("/(tabs)/games")} hitSlop={8}>
              <Label size={10} tone="accent">
                See all
              </Label>
            </Pressable>
          </View>
          <SeasonStrip />
        </Animated.View>

        {/* Support, always two taps away */}
        <Animated.View entering={FadeIn.delay(400).duration(400)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get support"
            onPress={() => router.push("/(tabs)/me?support=1")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: space.md,
              paddingVertical: space.md,
              paddingHorizontal: space.base,
              borderRadius: 14,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.borderSoft,
            }}
          >
            <IconSupport size={19} color={colors.textFaint} />
            <Body size={13} tone="faint" style={{ flex: 1 }}>
              Struggling with something bigger than a game?
            </Body>
            <IconArrowRight size={15} color={colors.textFaint} />
          </Pressable>
        </Animated.View>
      </View>

      {/* Reset is reachable from everywhere. It's the one thing that has to be. */}
      <ResetButton onPress={() => router.push("/reset")} />
    </Screen>
  );
}

function SeasonStrip() {
  const { data: debriefs = [] } = useDebriefs();
  const { games } = useCurrentGame();
  const { space } = useTheme();

  const played = games.filter((g) => g.status === "complete").length;
  const avg =
    debriefs.length > 0
      ? debriefs.reduce((s, d) => s + d.performance, 0) / debriefs.length
      : null;
  const best = debriefs.reduce<number | null>(
    (m, d) => (m === null || d.performance > m ? d.performance : m),
    null,
  );

  return (
    <View style={{ flexDirection: "row", gap: space.sm }}>
      <StatTile value={String(played)} label="Games logged" />
      <StatTile
        value={avg ? avg.toFixed(1) : "—"}
        label="Avg performance"
        tone={avg ? "accent" : "default"}
      />
      <StatTile
        value={best ? String(best) : "—"}
        label="Best"
        tone={best ? "record" : "default"}
      />
    </View>
  );
}

function EmptyState({ sportWord }: { sportWord: string }) {
  const { colors, space } = useTheme();
  return (
    <View style={{ alignItems: "center", gap: space.base, paddingVertical: space.xl }}>
      <View
        style={{
          width: 108,
          height: 108,
          borderRadius: 54,
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconPlus size={34} color={colors.textFaint} strokeWidth={1.8} />
      </View>
      <Body size={14} tone="faint" align="center" style={{ maxWidth: 250 }}>
        No {sportWord.toLowerCase()} loaded. That's the one thing the whole app hangs off.
      </Body>
    </View>
  );
}

function ResetButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.delay(600).duration(400)} style={styles.fab}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reset — thirty seconds, nothing logged"
        onPress={onPress}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: withAlpha(colors.calm, 0.5),
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#04091A",
          shadowOpacity: 0.22,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 5,
        }}
      >
        <IconReset size={24} color={colors.calm} />
      </Pressable>
    </Animated.View>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 21) return "Evening";
  return "Late one";
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  fab: { position: "absolute", right: 18, bottom: 18 },
});
