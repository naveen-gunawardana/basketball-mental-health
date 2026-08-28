import React, { useMemo, useState } from "react";
import { View, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { addDays, format, isSameDay, setHours, setMinutes, startOfDay } from "date-fns";
import { useTheme } from "@/theme/ThemeProvider";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Body, Label, Stat } from "@/components/ui/Text";
import { IconAway, IconHome, IconBall } from "@/icons";
import { useAddGame } from "@/features/games/queries";
import { useSettings } from "@/features/profile/queries";
import { getSport } from "@/data/catalog";
import type { GameKind, Venue } from "@/features/games/model";
import * as haptics from "@/lib/haptics";

/**
 * Add a game.
 *
 * Ten seconds, and no calendar modal. Days come as a scrollable strip because
 * almost every game an athlete adds is inside the next two weeks, and times
 * come as a strip of the hours games actually start.
 */
export default function NewGame() {
  const { colors, space, radius } = useTheme();
  const router = useRouter();
  const { data: settings } = useSettings();
  const addGame = useAddGame();

  const sport = getSport(settings?.primary_sport);

  const [opponent, setOpponent] = useState("");
  const [day, setDay] = useState(() => addDays(startOfDay(new Date()), 1));
  const [hour, setHour] = useState(19);
  const [minute, setMinute] = useState(0);
  const [venue, setVenue] = useState<Venue>("home");
  const [kind, setKind] = useState<GameKind>("game");

  const days = useMemo(
    () => Array.from({ length: 21 }).map((_, i) => addDays(startOfDay(new Date()), i)),
    [],
  );

  const startsAt = useMemo(
    () => setMinutes(setHours(day, hour), minute),
    [day, hour, minute],
  );

  const inPast = startsAt.getTime() < Date.now();

  const save = async () => {
    haptics.commit();
    await addGame.mutateAsync({
      sport: sport.id,
      kind,
      opponent: opponent.trim() || null,
      starts_at: startsAt.toISOString(),
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      venue,
    });
    router.back();
  };

  return (
    <Screen
      nav="close"
      eyebrow={`New ${sport.eventWord.toLowerCase()}`}
      title="Load it in"
      footer={
        <>
          <Button
            label={inPast ? "That's in the past" : `Add ${sport.eventWord.toLowerCase()}`}
            onPress={save}
            disabled={inPast}
            loading={addGame.isPending}
          />
          <Body size={11.5} tone="faint" align="center">
            {format(startsAt, "EEEE, MMMM d 'at' h:mm a")}
          </Body>
        </>
      }
    >
      {/* Opponent */}
      <View style={{ gap: 8 }}>
        <Label size={10}>Who are you playing?</Label>
        <TextInput
          value={opponent}
          onChangeText={setOpponent}
          placeholder="Optional — leave it blank if you don't know"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="words"
          maxLength={48}
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: space.base,
            paddingVertical: 15,
            color: colors.text,
            fontFamily: "Inter_500Medium",
            fontSize: 16,
          }}
        />
      </View>

      {/* Kind */}
      <View style={{ gap: 8 }}>
        <Label size={10}>What is it?</Label>
        <View style={styles.row}>
          {(["game", "scrimmage", "practice", "tryout"] as GameKind[]).map((k) => (
            <Seg
              key={k}
              label={k === "game" ? sport.eventWord : cap(k)}
              active={kind === k}
              onPress={() => setKind(k)}
            />
          ))}
        </View>
      </View>

      {/* Day strip */}
      <View style={{ gap: 8 }}>
        <Label size={10}>When</Label>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: space.lg }}
          style={{ marginHorizontal: -space.lg, paddingHorizontal: space.lg }}
        >
          {days.map((d, i) => {
            const active = isSameDay(d, day);
            return (
              <Pressable
                key={d.toISOString()}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={format(d, "EEEE MMMM d")}
                onPress={() => {
                  haptics.step();
                  setDay(d);
                }}
                style={{
                  width: 58,
                  paddingVertical: 12,
                  borderRadius: radius.md,
                  alignItems: "center",
                  gap: 2,
                  borderWidth: 1,
                  borderColor: active ? colors.accent : colors.border,
                  backgroundColor: active ? colors.accentSoft : colors.surface,
                }}
              >
                <Label size={9} style={{ color: active ? colors.accent : colors.textFaint }}>
                  {i === 0 ? "Today" : i === 1 ? "Tmrw" : format(d, "EEE")}
                </Label>
                <Stat size={24} style={{ color: active ? colors.accent : colors.text }}>
                  {format(d, "d")}
                </Stat>
                <Label size={8} style={{ color: active ? colors.accent : colors.textFaint }}>
                  {format(d, "MMM")}
                </Label>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Time strip */}
      <View style={{ gap: 8 }}>
        <Label size={10}>Start time</Label>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: space.lg }}
          style={{ marginHorizontal: -space.lg, paddingHorizontal: space.lg }}
        >
          {TIMES.map((t) => {
            const active = hour === t.h && minute === t.m;
            return (
              <Pressable
                key={`${t.h}:${t.m}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  haptics.step();
                  setHour(t.h);
                  setMinute(t.m);
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: active ? colors.accent : colors.border,
                  backgroundColor: active ? colors.accentSoft : colors.surface,
                }}
              >
                <Stat size={17} style={{ color: active ? colors.accent : colors.textMuted }}>
                  {t.label}
                </Stat>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Venue */}
      <View style={{ gap: 8 }}>
        <Label size={10}>Where</Label>
        <View style={styles.row}>
          {(
            [
              { id: "home" as Venue, label: "Home", Icon: IconHome },
              { id: "away" as Venue, label: "Away", Icon: IconAway },
              { id: "neutral" as Venue, label: "Neutral", Icon: IconBall },
            ]
          ).map(({ id, label, Icon }) => {
            const active = venue === id;
            return (
              <Pressable
                key={id}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  haptics.step();
                  setVenue(id);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: radius.md,
                  alignItems: "center",
                  gap: 6,
                  borderWidth: 1,
                  borderColor: active ? colors.accent : colors.border,
                  backgroundColor: active ? colors.accentSoft : colors.surface,
                }}
              >
                <Icon size={19} color={active ? colors.accent : colors.textFaint} />
                <Label size={9.5} style={{ color: active ? colors.accent : colors.textFaint }}>
                  {label}
                </Label>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Animated.View entering={FadeIn.delay(200).duration(400)}>
        <Body size={12.5} tone="faint">
          Adding this schedules three things: a wind-down the night before, your warmup 75
          minutes out, and the debrief ninety minutes after. Nothing else.
        </Body>
      </Animated.View>
    </Screen>
  );
}

const TIMES = [
  { h: 15, m: 30, label: "3:30" },
  { h: 16, m: 0, label: "4:00" },
  { h: 16, m: 30, label: "4:30" },
  { h: 17, m: 0, label: "5:00" },
  { h: 17, m: 30, label: "5:30" },
  { h: 18, m: 0, label: "6:00" },
  { h: 18, m: 30, label: "6:30" },
  { h: 19, m: 0, label: "7:00" },
  { h: 19, m: 30, label: "7:30" },
  { h: 20, m: 0, label: "8:00" },
  { h: 10, m: 0, label: "10 AM" },
  { h: 11, m: 30, label: "11:30 AM" },
  { h: 13, m: 0, label: "1:00" },
] as const;

function Seg({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={() => {
        haptics.step();
        onPress();
      }}
      style={{
        flex: 1,
        paddingVertical: 11,
        borderRadius: radius.md,
        alignItems: "center",
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.border,
        backgroundColor: active ? colors.accentSoft : colors.surface,
      }}
    >
      <Body
        size={13}
        weight={active ? "semi" : "medium"}
        style={{ color: active ? colors.accent : colors.textFaint }}
      >
        {label}
      </Body>
    </Pressable>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
});
