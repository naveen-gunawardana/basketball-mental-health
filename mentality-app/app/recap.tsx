import React, { useMemo } from "react";
import { View, Share, StyleSheet, useWindowDimensions } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
  Line,
} from "react-native-svg";
import { format } from "date-fns";
import { useTheme } from "@/theme/ThemeProvider";
import { brand, withAlpha } from "@/theme/tokens";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Body, Display, Heading, Label, Stat } from "@/components/ui/Text";
import { GamedayMark, IconRecord } from "@/icons";
import { useDebriefs, useGames } from "@/features/games/queries";
import { useProfile, useSettings } from "@/features/profile/queries";
import { gameTitle, estimatedEnd } from "@/features/games/model";
import { getSport } from "@/data/catalog";

/**
 * Season recap.
 *
 * The growth loop. Streaks make people feel watched; a recap of a season they
 * actually lived makes them feel seen, and that's the one that gets posted.
 *
 * Everything here is computed from what's already on the device, so it works
 * offline and can't fail on a slow endpoint at the exact moment someone wants
 * to share it.
 */
export default function Recap() {
  const { space } = useTheme();
  const { width } = useWindowDimensions();

  const { data: games = [] } = useGames();
  const { data: debriefs = [] } = useDebriefs();
  const { data: profile } = useProfile();
  const { data: settings } = useSettings();

  const sport = getSport(settings?.primary_sport);

  const stats = useMemo(() => {
    const played = games
      .filter((g) => g.status !== "skipped" && estimatedEnd(g).getTime() <= Date.now())
      .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));

    const byGame = new Map(debriefs.map((d) => [d.game_id, d]));
    const series = played
      .map((g) => ({ game: g, debrief: byGame.get(g.id) }))
      .filter((x) => !!x.debrief)
      .map((x) => ({
        date: new Date(x.game.starts_at),
        performance: x.debrief!.performance,
        routine: x.debrief!.routine_followed,
        opponent: gameTitle(x.game),
        id: x.game.id,
      }));

    if (series.length === 0) return null;

    const avg = series.reduce((s, x) => s + x.performance, 0) / series.length;
    const best = series.reduce((m, x) => (x.performance > m.performance ? x : m), series[0]);

    const withRoutine = series.filter((x) => x.routine === true);
    const without = series.filter((x) => x.routine === false);
    const lift =
      withRoutine.length >= 2 && without.length >= 2
        ? withRoutine.reduce((s, x) => s + x.performance, 0) / withRoutine.length -
          without.reduce((s, x) => s + x.performance, 0) / without.length
        : null;

    // First third vs last third — the honest version of "you improved".
    const third = Math.max(1, Math.floor(series.length / 3));
    const early = series.slice(0, third);
    const late = series.slice(-third);
    const shift =
      series.length >= 6
        ? late.reduce((s, x) => s + x.performance, 0) / late.length -
          early.reduce((s, x) => s + x.performance, 0) / early.length
        : null;

    return { series, avg, best, lift, shift, played: played.length };
  }, [games, debriefs]);

  const share = async () => {
    if (!stats) return;
    try {
      await shareRecap();
    } catch {
      // Browsers without a share sheet reject, and the athlete cancelling
      // also rejects. Neither is worth an error message.
    }
  };

  const shareRecap = async () => {
    if (!stats) return;
    await Share.share({
      message:
        `My season on Gameday: ${stats.played} games logged, ` +
        `${stats.avg.toFixed(1)} average` +
        (stats.shift && stats.shift > 0.4
          ? `, up ${stats.shift.toFixed(1)} from where I started.`
          : ".") +
        "\n\nmentalitysports.org",
    });
  };

  if (!stats) {
    return (
      <Screen nav="back" eyebrow="Season" title="Not yet">
        <Body size={15}>
          Log and debrief a few games and this fills in. Right now there isn't enough here
          to say anything true.
        </Body>
      </Screen>
    );
  }

  return (
    <Screen nav="back" eyebrow={`${sport.name} · ${new Date().getFullYear()}`} title="Your season">
      {/* The card */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <View
          style={{
            borderRadius: 26,
            overflow: "hidden",
            backgroundColor: brand.navy900,
            padding: space.lg,
            gap: space.lg,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
            <GamedayMark size={38} color={brand.terracotta} ring={brand.offWhite} />
            <View style={{ flex: 1 }}>
              <Label size={9} style={{ color: withAlpha(brand.offWhite, 0.5) }}>
                Gameday
              </Label>
              <Display size={20} style={{ color: brand.offWhite }}>
                {profile?.name ?? "Your season"}
              </Display>
            </View>
            <IconRecord size={20} color={brand.gold} />
          </View>

          <PerformanceChart
            points={stats.series.map((s) => s.performance)}
            routine={stats.series.map((s) => s.routine)}
            width={width - 40 - 40}
          />

          <View style={{ flexDirection: "row", gap: space.base }}>
            <CardStat value={String(stats.played)} label="Games" />
            <CardStat value={stats.avg.toFixed(1)} label="Average" />
            <CardStat
              value={
                stats.shift === null
                  ? "—"
                  : `${stats.shift > 0 ? "+" : ""}${stats.shift.toFixed(1)}`
              }
              label="Change"
              tone={stats.shift && stats.shift > 0 ? brand.sage400 : brand.offWhite}
            />
          </View>
        </View>
      </Animated.View>

      {/* Findings */}
      <Animated.View entering={FadeInUp.delay(160).duration(450)} style={{ gap: space.md }}>
        <Label>What it says</Label>

        <Card accent="record">
          <View style={{ gap: 5 }}>
            <Label tone="record">Your best night</Label>
            <Heading size={20}>{stats.best.opponent}</Heading>
            <Body size={13.5} tone="faint">
              {format(stats.best.date, "MMMM d")} · rated {stats.best.performance}
            </Body>
          </View>
        </Card>

        {stats.lift !== null && Math.abs(stats.lift) >= 0.5 && (
          <Card accent="accent">
            <View style={{ gap: 5 }}>
              <Label tone="accent">Your routine is worth this much</Label>
              <Heading size={20}>
                {stats.lift > 0 ? "+" : ""}
                {stats.lift.toFixed(1)} points a game
              </Heading>
              <Body size={13.5} tone="faint">
                That's the gap between the games you ran it and the ones you didn't. In your
                numbers, not a study's.
              </Body>
            </View>
          </Card>
        )}

        {stats.shift !== null && (
          <Card accent="calm">
            <View style={{ gap: 5 }}>
              <Label tone="calm">Start of season to now</Label>
              <Heading size={20}>
                {stats.shift > 0.4
                  ? `Up ${stats.shift.toFixed(1)}`
                  : stats.shift < -0.4
                    ? `Down ${Math.abs(stats.shift).toFixed(1)}`
                    : "About level"}
              </Heading>
              <Body size={13.5} tone="faint">
                {stats.shift > 0.4
                  ? "You're rating your own performances higher than you were. That's not the scoreboard talking."
                  : stats.shift < -0.4
                    ? "Tougher stretch lately. Worth looking at what changed — the log will tell you."
                    : "Steady. Consistency across a season is harder than a good night."}
              </Body>
            </View>
          </Card>
        )}
      </Animated.View>

      <Button label="Share it" onPress={share} />

      <Body size={11.5} tone="faint" align="center" style={{ paddingBottom: space.lg }}>
        Nothing is shared until you tap that, and it only sends the numbers above.
      </Body>
    </Screen>
  );
}

/**
 * The season line. Hand-drawn rather than pulled from a chart library — at
 * twenty points a library would weigh more than the whole feature.
 */
function PerformanceChart({
  points,
  routine,
  width,
}: {
  points: number[];
  routine: (boolean | null)[];
  width: number;
}) {
  const H = 110;
  const PAD = 6;
  const w = Math.max(120, width);

  if (points.length < 2) return null;

  const x = (i: number) => PAD + (i / (points.length - 1)) * (w - PAD * 2);
  const y = (v: number) => PAD + (1 - (v - 1) / 9) * (H - PAD * 2);

  // Catmull-Rom style smoothing, kept simple.
  const d = points
    .map((p, i) => {
      const px = x(i);
      const py = y(p);
      if (i === 0) return `M${px},${py}`;
      const prevX = x(i - 1);
      const cx = (prevX + px) / 2;
      return `C${cx},${y(points[i - 1])} ${cx},${py} ${px},${py}`;
    })
    .join(" ");

  const area = `${d} L${x(points.length - 1)},${H - PAD} L${x(0)},${H - PAD} Z`;

  return (
    <View style={{ height: H }}>
      <Svg width={w} height={H}>
        <Defs>
          <LinearGradient id="recap-fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={brand.terracotta} stopOpacity={0.34} />
            <Stop offset="1" stopColor={brand.terracotta} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Midline at 5 — the "fine" line */}
        <Line
          x1={PAD}
          y1={y(5)}
          x2={w - PAD}
          y2={y(5)}
          stroke={withAlpha(brand.offWhite, 0.12)}
          strokeWidth={1}
          strokeDasharray="3 4"
        />

        <Path d={area} fill="url(#recap-fill)" />
        <Path
          d={d}
          stroke={brand.terracotta400}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* A dot per game; filled where the routine was run */}
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={x(i)}
            cy={y(p)}
            r={routine[i] ? 4 : 2.5}
            fill={routine[i] ? brand.sage400 : brand.navy900}
            stroke={routine[i] ? brand.sage400 : brand.terracotta400}
            strokeWidth={1.5}
          />
        ))}
      </Svg>

      <View style={styles.legend}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: brand.sage400 }} />
          <Label size={8} style={{ color: withAlpha(brand.offWhite, 0.45) }}>
            Routine run
          </Label>
        </View>
      </View>
    </View>
  );
}

function CardStat({ value, label, tone }: { value: string; label: string; tone?: string }) {
  return (
    <View style={{ flex: 1, gap: 1 }}>
      <Stat size={30} style={{ color: tone ?? brand.offWhite, lineHeight: 32 }}>
        {value}
      </Stat>
      <Label size={8.5} style={{ color: withAlpha(brand.offWhite, 0.45) }}>
        {label}
      </Label>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { position: "absolute", right: 0, bottom: -2, flexDirection: "row", gap: 12 },
});
