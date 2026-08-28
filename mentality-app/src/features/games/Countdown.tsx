import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop, G, Line } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { differenceInSeconds } from "date-fns";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha } from "@/theme/tokens";
import { Display, Label, Stat } from "@/components/ui/Text";
import { IconAway, IconHome } from "@/icons";
import { countdown, gameTitle, gameWhen, venueLabel, type Game } from "./model";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * The countdown.
 *
 * The ring fills over the last 72 hours rather than an arbitrary window, so
 * "it's getting close" is something you can see rather than read. Inside the
 * final hour it switches to a live clock and the accent takes over — that
 * shift is the app telling you the mode has changed.
 */
export function Countdown({ game, size = 250 }: { game: Game; size?: number }) {
  const { colors, space } = useTheme();
  const [now, setNow] = useState(() => new Date());

  const secs = differenceInSeconds(new Date(game.starts_at), now);
  const urgent = secs < 3600 && secs > -60;

  // Tick every second inside the last hour, every 30 otherwise. No reason to
  // wake the JS thread sixty times a minute three days out.
  useEffect(() => {
    const period = urgent ? 1000 : 30_000;
    const t = setInterval(() => setNow(new Date()), period);
    return () => clearInterval(t);
  }, [urgent]);

  const WINDOW = 72 * 3600;
  const progress = Math.max(0, Math.min(1, 1 - secs / WINDOW));

  const R = size / 2 - 16;
  const C = 2 * Math.PI * R;

  const fill = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(progress, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress, fill]);

  useEffect(() => {
    pulse.value = 0;
    if (!urgent) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [urgent, pulse]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: C - C * fill.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.08 + pulse.value * 0.16,
    transform: [{ scale: 0.92 + pulse.value * 0.12 }],
  }));

  const tint = urgent ? colors.accent : colors.calm;
  const c = countdown(game, now);

  const clock = useMemo(() => {
    if (secs <= 0) return null;
    if (secs >= 3600) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [secs]);

  return (
    <View style={{ alignItems: "center", gap: space.base }}>
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            glowStyle,
            { borderRadius: size / 2, backgroundColor: tint },
          ]}
        />

        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="cd" x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0" stopColor={tint} stopOpacity={0.4} />
              <Stop offset="1" stopColor={tint} stopOpacity={1} />
            </LinearGradient>
          </Defs>

          <Circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            stroke={colors.borderSoft}
            strokeWidth={5}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={R}
            stroke="url(#cd)"
            strokeWidth={5}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${C} ${C}`}
            animatedProps={ringProps}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />

          {/* Hour marks across the 72-hour window, one per 12 hours */}
          <G opacity={0.5}>
            {Array.from({ length: 6 }).map((_, i) => {
              const a = ((i / 6) * 360 - 90) * (Math.PI / 180);
              return (
                <Line
                  key={i}
                  x1={size / 2 + Math.cos(a) * (R - 12)}
                  y1={size / 2 + Math.sin(a) * (R - 12)}
                  x2={size / 2 + Math.cos(a) * (R - 6)}
                  y2={size / 2 + Math.sin(a) * (R - 6)}
                  stroke={colors.textFaint}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              );
            })}
          </G>
        </Svg>

        <View style={{ alignItems: "center", gap: 2 }}>
          {clock ? (
            <>
              <Stat size={64} style={{ color: tint, lineHeight: 66 }}>
                {clock}
              </Stat>
              <Label size={10} style={{ color: withAlpha(tint, 0.9) }}>
                Until tip
              </Label>
            </>
          ) : (
            <>
              <Stat size={80} style={{ color: tint, lineHeight: 80 }}>
                {c.value}
              </Stat>
              <Label size={11} style={{ color: withAlpha(tint, 0.9) }}>
                {c.unit || "Now"}
              </Label>
            </>
          )}
        </View>
      </View>

      <View style={{ alignItems: "center", gap: 5 }}>
        <Display size={30} align="center">
          {gameTitle(game)}
        </Display>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {game.venue === "home" && <IconHome size={14} color={colors.textFaint} />}
          {game.venue === "away" && <IconAway size={14} color={colors.textFaint} />}
          <Label size={10} tone="faint">
            {[venueLabel(game.venue), gameWhen(game, now)].filter(Boolean).join(" · ")}
          </Label>
        </View>
      </View>
    </View>
  );
}
