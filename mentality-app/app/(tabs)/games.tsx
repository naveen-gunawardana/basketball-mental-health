import React, { useMemo } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useTheme } from "@/theme/ThemeProvider";
import { pressureColor, withAlpha } from "@/theme/tokens";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/Button";
import { Body, Heading, Label, Stat } from "@/components/ui/Text";
import { IconAway, IconHome, IconPlus, IconLog } from "@/icons";
import { useGames, useDebriefs } from "@/features/games/queries";
import {
  gameTitle,
  gameWhen,
  venueLabel,
  estimatedEnd,
  type Game,
  type Debrief,
} from "@/features/games/model";

/**
 * Games — the schedule up top, the log underneath.
 *
 * The log is the retention engine. Not streaks: a record of the athlete's own
 * mind across a season, which nobody else gives them.
 */
export default function Games() {
  const { colors, space } = useTheme();
  const router = useRouter();
  const { data: games = [], isLoading } = useGames();
  const { data: debriefs = [] } = useDebriefs();

  const now = Date.now();
  const { upcoming, played } = useMemo(() => {
    const live = games.filter((g) => g.status !== "skipped");
    return {
      upcoming: live
        .filter((g) => estimatedEnd(g).getTime() > now)
        .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)),
      played: live
        .filter((g) => estimatedEnd(g).getTime() <= now)
        .sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at)),
    };
  }, [games, now]);

  const byGame = useMemo(() => {
    const m = new Map<string, Debrief>();
    debriefs.forEach((d) => m.set(d.game_id, d));
    return m;
  }, [debriefs]);

  return (
    <Screen
      eyebrow="Your season"
      title="Games"
      right={
        <IconButton label="Add a game" variant="primary" size={44} onPress={() => router.push("/game/new")}>
          <IconPlus size={21} color={colors.accentText} strokeWidth={2.2} />
        </IconButton>
      }
    >
      {upcoming.length > 0 && (
        <View style={{ gap: space.md }}>
          <Label>Coming up</Label>
          {upcoming.map((g, i) => (
            <Animated.View key={g.id} entering={FadeInDown.delay(i * 50).duration(360)}>
              <UpcomingRow game={g} onPress={() => router.push(`/game/${g.id}`)} />
            </Animated.View>
          ))}
        </View>
      )}

      <View style={{ gap: space.md, marginTop: upcoming.length ? space.lg : 0 }}>
        <View style={styles.head}>
          <Label>The log</Label>
          {played.length > 0 && (
            <Label size={10} tone="faint">
              {played.length} {played.length === 1 ? "game" : "games"}
            </Label>
          )}
        </View>

        {played.length === 0 ? (
          <EmptyLog loading={isLoading} onAdd={() => router.push("/game/new")} />
        ) : (
          played.map((g, i) => (
            <Animated.View key={g.id} entering={FadeInDown.delay(i * 40).duration(340)}>
              <LogRow
                game={g}
                debrief={byGame.get(g.id)}
                onPress={() =>
                  byGame.has(g.id)
                    ? router.push(`/game/${g.id}`)
                    : router.push(`/debrief/${g.id}`)
                }
              />
            </Animated.View>
          ))
        )}
      </View>

      {played.length >= 3 && (
        <Animated.View entering={FadeIn.duration(400)} style={{ marginTop: space.lg }}>
          <PressureTrend debriefs={debriefs} games={played} />
        </Animated.View>
      )}
    </Screen>
  );
}

function UpcomingRow({ game, onPress }: { game: Game; onPress: () => void }) {
  const { colors, space } = useTheme();
  const d = new Date(game.starts_at);

  return (
    <Card onPress={onPress} accent="accent">
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.base }}>
        <View style={{ alignItems: "center", width: 46 }}>
          <Label size={9} tone="faint">
            {format(d, "MMM")}
          </Label>
          <Stat size={28} tone="accent">
            {format(d, "d")}
          </Stat>
        </View>

        <View style={{ width: StyleSheet.hairlineWidth, alignSelf: "stretch", backgroundColor: colors.border }} />

        <View style={{ flex: 1, gap: 3 }}>
          <Heading size={18}>{gameTitle(game)}</Heading>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {game.venue === "home" && <IconHome size={12} color={colors.textFaint} />}
            {game.venue === "away" && <IconAway size={12} color={colors.textFaint} />}
            <Label size={9.5} tone="faint">
              {[venueLabel(game.venue), format(d, "EEE · h:mm a")].filter(Boolean).join(" · ")}
            </Label>
          </View>
        </View>
      </View>
    </Card>
  );
}

function LogRow({
  game,
  debrief,
  onPress,
}: {
  game: Game;
  debrief?: Debrief;
  onPress: () => void;
}) {
  const { colors, space, radius } = useTheme();
  const tint = debrief ? pressureColor(debrief.performance, colors) : colors.textFaint;

  return (
    <Card onPress={onPress} flat>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.base }}>
        {/* The rating, as a filled disc — readable at a glance down a long list */}
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: debrief ? withAlpha(tint, 0.16) : "transparent",
            borderWidth: debrief ? 0 : 1,
            borderStyle: debrief ? "solid" : "dashed",
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {debrief ? (
            <Stat size={22} style={{ color: tint }}>
              {debrief.performance}
            </Stat>
          ) : (
            <IconLog size={18} color={colors.textFaint} />
          )}
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Heading size={17} style={{ flexShrink: 1 }}>
              {gameTitle(game)}
            </Heading>
            {debrief?.routine_followed && (
              <View
                style={{
                  backgroundColor: colors.calmSoft,
                  borderRadius: 999,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                }}
              >
                <Label size={8} tone="calm">
                  Routine
                </Label>
              </View>
            )}
          </View>
          <Label size={9.5} tone="faint">
            {[venueLabel(game.venue), gameWhen(game)].filter(Boolean).join(" · ")}
          </Label>
        </View>

        {!debrief && (
          <View
            style={{
              backgroundColor: colors.accentSoft,
              borderRadius: radius.pill,
              paddingHorizontal: 11,
              paddingVertical: 5,
            }}
          >
            <Label size={9} tone="accent">
              Debrief
            </Label>
          </View>
        )}
      </View>
    </Card>
  );
}

/**
 * The season's performance line. Deliberately sparse — a full chart library
 * would be heavier than the insight is worth at ten data points.
 */
function PressureTrend({ debriefs, games }: { debriefs: Debrief[]; games: Game[] }) {
  const { colors, space } = useTheme();

  const points = useMemo(() => {
    const byGame = new Map(debriefs.map((d) => [d.game_id, d]));
    return games
      .slice(0, 12)
      .reverse()
      .map((g) => byGame.get(g.id)?.performance ?? null)
      .filter((v): v is number => v !== null);
  }, [debriefs, games]);

  if (points.length < 3) return null;

  const max = 10;
  const best = Math.max(...points);

  return (
    <Card>
      <View style={{ gap: space.md }}>
        <View style={styles.head}>
          <Label>How you've rated yourself</Label>
          <Label size={9.5} tone="faint">
            Last {points.length}
          </Label>
        </View>

        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 5, height: 92 }}>
          {points.map((p, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: `${(p / max) * 100}%`,
                minHeight: 6,
                borderRadius: 4,
                backgroundColor:
                  p === best ? pressureColor(p, colors) : withAlpha(pressureColor(p, colors), 0.45),
              }}
            />
          ))}
        </View>

        <View style={styles.head}>
          <Label size={9} tone="faint">
            Oldest
          </Label>
          <Label size={9} tone="record">
            Best: {best}
          </Label>
          <Label size={9} tone="faint">
            Latest
          </Label>
        </View>
      </View>
    </Card>
  );
}

function EmptyLog({ loading, onAdd }: { loading: boolean; onAdd: () => void }) {
  const { colors, space } = useTheme();
  return (
    <Card>
      <View style={{ alignItems: "center", gap: space.md, paddingVertical: space.base }}>
        <IconLog size={34} color={colors.textFaint} />
        <Body size={14} align="center" tone="faint" style={{ maxWidth: 260 }}>
          {loading
            ? "Loading your season…"
            : "Nothing logged yet. Add a game, play it, then spend ninety seconds on the debrief — that's the whole loop."}
        </Body>
        {!loading && (
          <Pressable onPress={onAdd} hitSlop={8} style={{ paddingVertical: 6 }}>
            <Label size={10} tone="accent">
              Add your first game
            </Label>
          </Pressable>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
});
