import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format } from "date-fns";
import { useTheme } from "@/theme/ThemeProvider";
import { pressureColor } from "@/theme/tokens";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Card, Well } from "@/components/ui/Card";
import { Body, Heading, Label, Stat } from "@/components/ui/Text";
import { ChipList } from "@/components/primitives/Chips";
import { BodyPulse } from "@/components/primitives/BodyMap";
import { IconAway, IconHome, IconCheck, IconClose } from "@/icons";
import {
  useGames,
  useDebriefs,
  useGameEntries,
  useDeleteGame,
} from "@/features/games/queries";
import { gameTitle, gameWhen, venueLabel, estimatedEnd } from "@/features/games/model";
import type { BodyArea } from "@/components/primitives/BodyMap";
import { confirmDestructive } from "@/lib/confirm";

/**
 * One game, start to finish.
 *
 * This is the row in the log opened up: what the athlete walked in with, what
 * they walked out saying, and how the two line up. Seeing those side by side
 * is where the pattern-recognition actually happens.
 */
export default function GameDetail() {
  const { colors, space } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  const { data: games = [] } = useGames();
  const { data: debriefs = [] } = useDebriefs();
  const { data: entries = [] } = useGameEntries(params.id);
  const deleteGame = useDeleteGame();

  const game = games.find((g) => g.id === params.id) ?? null;
  const debrief = debriefs.find((d) => d.game_id === params.id) ?? null;
  const walkIn = entries.find((e) => e.phase === "walk_in") ?? null;

  const played = game ? estimatedEnd(game).getTime() <= Date.now() : false;

  const confirmDelete = async () => {
    const ok = await confirmDestructive({
      title: "Delete this game?",
      message: "The check-in and debrief go with it.",
      confirmLabel: "Delete",
    });
    if (!ok) return;

    await deleteGame.mutateAsync(params.id);
    router.back();
  };

  if (!game) {
    return (
      <Screen nav="back" title="Gone">
        <Body tone="faint">That game isn't here any more.</Body>
      </Screen>
    );
  }

  const tint = debrief ? pressureColor(debrief.performance, colors) : colors.textFaint;

  return (
    <Screen
      nav="back"
      eyebrow={gameWhen(game)}
      title={gameTitle(game)}
      footer={
        !debrief && played ? (
          <Button label="Debrief it" onPress={() => router.push(`/debrief/${game.id}`)} />
        ) : undefined
      }
    >
      {/* Header facts */}
      <Animated.View entering={FadeInDown.duration(360)}>
        <Card flat>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
            {game.venue === "home" && <IconHome size={17} color={colors.textFaint} />}
            {game.venue === "away" && <IconAway size={17} color={colors.textFaint} />}
            <Label size={10} tone="faint" style={{ flex: 1 }}>
              {[venueLabel(game.venue), format(new Date(game.starts_at), "EEE, MMM d · h:mm a")]
                .filter(Boolean)
                .join("  ·  ")}
            </Label>
            {debrief?.routine_followed === true && (
              <View
                style={{
                  backgroundColor: colors.calmSoft,
                  borderRadius: 999,
                  paddingHorizontal: 9,
                  paddingVertical: 3,
                }}
              >
                <Label size={8.5} tone="calm">
                  Routine run
                </Label>
              </View>
            )}
          </View>
        </Card>
      </Animated.View>

      {/* The two readings, side by side */}
      {(walkIn || debrief) && (
        <Animated.View entering={FadeIn.delay(80).duration(400)}>
          <Card>
            <View style={{ gap: space.base }}>
              <Label>Before and after</Label>

              <View style={{ flexDirection: "row", alignItems: "center", gap: space.base }}>
                <Reading
                  label="Walked in at"
                  value={walkIn?.pressure ?? null}
                  caption="Pressure"
                />
                <View
                  style={{
                    width: StyleSheet.hairlineWidth,
                    height: 54,
                    backgroundColor: colors.border,
                  }}
                />
                <Reading
                  label="Played at"
                  value={debrief?.performance ?? null}
                  caption="Performance"
                  tone={tint}
                />
              </View>

              {walkIn?.controllable && (
                <Well tone="calm">
                  <Label size={9.5} tone="calm">
                    The one thing you picked
                  </Label>
                  <Body size={15} weight="medium" style={{ color: colors.text }}>
                    {walkIn.controllable}
                  </Body>
                </Well>
              )}
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Where it sat */}
      {!!walkIn?.body_areas?.length && (
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.lg }}>
            <BodyPulse area={walkIn.body_areas[0] as BodyArea} size={72} />
            <View style={{ flex: 1, gap: 5 }}>
              <Label>Where it sat</Label>
              <ChipList items={walkIn.body_areas.map(cap)} />
            </View>
          </View>
        </Card>
      )}

      {/* The debrief */}
      {debrief ? (
        <Animated.View entering={FadeIn.delay(160).duration(400)} style={{ gap: space.md }}>
          {!!debrief.worked?.length && (
            <Card accent="calm">
              <View style={{ gap: space.sm }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <IconCheck size={15} color={colors.calm} strokeWidth={3} />
                  <Label tone="calm">What worked</Label>
                </View>
                <ChipList items={debrief.worked} tone="calm" />
              </View>
            </Card>
          )}

          {!!debrief.didnt?.length && (
            <Card accent="accent">
              <View style={{ gap: space.sm }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <IconClose size={15} color={colors.accent} strokeWidth={2.4} />
                  <Label tone="accent">What didn't</Label>
                </View>
                <ChipList items={debrief.didnt} />
              </View>
            </Card>
          )}

          {debrief.letting_go && (
            <Card>
              <View style={{ gap: 5 }}>
                <Label>You put this down</Label>
                <Heading size={19}>{debrief.letting_go}</Heading>
              </View>
            </Card>
          )}

          {debrief.transcript && (
            <Card>
              <View style={{ gap: space.sm }}>
                <Label>In your words</Label>
                <Body size={15} style={{ color: colors.text }}>
                  {debrief.transcript}
                </Body>
                {debrief.reflection_id && (
                  <Label size={9} tone="calm">
                    Shared with your mentor
                  </Label>
                )}
              </View>
            </Card>
          )}
        </Animated.View>
      ) : played ? (
        <Card accent="accent">
          <View style={{ gap: space.sm }}>
            <Label tone="accent">Not debriefed</Label>
            <Body size={14}>
              Ninety seconds while it's still fresh. This is the part that actually changes
              the next game.
            </Body>
          </View>
        </Card>
      ) : null}

      <Button
        label="Delete this game"
        variant="ghost"
        size="sm"
        onPress={() => void confirmDelete()}
      />
    </Screen>
  );
}

function Reading({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: number | null;
  caption: string;
  tone?: string;
}) {
  const { colors } = useTheme();
  const color = tone ?? (value ? pressureColor(value, colors) : colors.textFaint);

  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Label size={9} tone="faint">
        {label}
      </Label>
      <Stat size={44} style={{ color, lineHeight: 46 }}>
        {value ?? "—"}
      </Stat>
      <Label size={8.5} tone="faint">
        {caption}
      </Label>
    </View>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
