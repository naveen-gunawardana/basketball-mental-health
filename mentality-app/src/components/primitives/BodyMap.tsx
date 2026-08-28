import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Svg, { Path, Circle, Ellipse, G, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha } from "@/theme/tokens";
import { Body, Label } from "@/components/ui/Text";
import * as haptics from "@/lib/haptics";

export type BodyArea =
  | "head"
  | "throat"
  | "chest"
  | "stomach"
  | "shoulders"
  | "hands"
  | "legs";

type Props = {
  value: BodyArea[];
  onChange: (v: BodyArea[]) => void;
  caption?: string;
};

/**
 * Body map — primitive 03.
 *
 * "Where do you feel it?" is a better question than "how anxious are you", and
 * it needs no emotional vocabulary at all — you just tap the place. Somatic
 * awareness is the first skill in almost every arousal-regulation protocol,
 * and this is the only way to train it that a sixteen-year-old will actually
 * do twice.
 *
 * The silhouette is deliberately abstract: no face, no gender, no sport.
 */

const W = 200;
const H = 340;

/** Hit targets are generous circles laid over the figure, not path hit-tests. */
const AREAS: {
  id: BodyArea;
  label: string;
  note: string;
  cx: number;
  cy: number;
  r: number;
}[] = [
  { id: "head", label: "Head", note: "Racing thoughts, noise", cx: 100, cy: 34, r: 27 },
  { id: "throat", label: "Throat", note: "Tight, hard to swallow", cx: 100, cy: 74, r: 20 },
  { id: "shoulders", label: "Shoulders", note: "Up around your ears", cx: 100, cy: 100, r: 30 },
  { id: "chest", label: "Chest", note: "Pounding, can't get a full breath", cx: 100, cy: 136, r: 30 },
  { id: "stomach", label: "Stomach", note: "Knotted, queasy", cx: 100, cy: 182, r: 28 },
  { id: "hands", label: "Hands", note: "Shaky, clammy", cx: 44, cy: 196, r: 24 },
  { id: "legs", label: "Legs", note: "Heavy or jumpy", cx: 100, cy: 262, r: 34 },
];

export function BodyMap({ value, onChange, caption }: Props) {
  const { colors, space, radius } = useTheme();

  const toggle = (id: BodyArea) => {
    haptics.step();
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const selected = AREAS.filter((a) => value.includes(a.id));

  return (
    <View style={{ alignItems: "center", gap: space.base }}>
      {caption && (
        <Body size={15} align="center" style={{ maxWidth: 290 }}>
          {caption}
        </Body>
      )}

      <View style={{ width: W, height: H }}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Defs>
            <RadialGradient id="bm-glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.accent} stopOpacity={0.45} />
              <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Figure — one continuous silhouette, no features */}
          <G>
            <Circle
              cx={100}
              cy={32}
              r={22}
              fill={colors.surfaceAlt}
              stroke={colors.border}
              strokeWidth={1.5}
            />
            <Path
              d="M100 58c-9 0-15 3-15 3l-28 12c-6 2.5-9 8-9 14v46c0 5 4 9 9 9s9-4 9-9v-32l5-2v40l-4 62c-.5 7 5 13 12 13s12-5 12.5-12l6-52h5l6 52c.5 7 6 12 12.5 12s12.5-6 12-13l-4-62v-40l5 2v32c0 5 4 9 9 9s9-4 9-9V87c0-6-3-11.5-9-14l-28-12s-6-3-15-3z"
              fill={colors.surfaceAlt}
              stroke={colors.border}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </G>

          {/* Selection glows sit under the tap targets */}
          {selected.map((a) => (
            <G key={a.id}>
              <Circle cx={a.cx} cy={a.cy} r={a.r + 10} fill="url(#bm-glow)" />
              <Circle
                cx={a.cx}
                cy={a.cy}
                r={a.r - 2}
                fill={withAlpha(colors.accent, 0.3)}
                stroke={colors.accent}
                strokeWidth={2}
              />
            </G>
          ))}

          {/* Resting markers for everything unselected */}
          {AREAS.filter((a) => !value.includes(a.id)).map((a) => (
            <Ellipse
              key={a.id}
              cx={a.cx}
              cy={a.cy}
              rx={5}
              ry={5}
              fill={colors.textFaint}
              fillOpacity={0.4}
            />
          ))}
        </Svg>

        {/* Touch layer */}
        {AREAS.map((a) => (
          <Pressable
            key={a.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: value.includes(a.id) }}
            accessibilityLabel={`${a.label}. ${a.note}`}
            onPress={() => toggle(a.id)}
            hitSlop={6}
            style={{
              position: "absolute",
              left: a.cx - a.r,
              top: a.cy - a.r,
              width: a.r * 2,
              height: a.r * 2,
              borderRadius: a.r,
            }}
          />
        ))}
      </View>

      {/* What you picked, in words — confirms the tap without a toast */}
      <View
        style={{
          minHeight: 46,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: space.base,
        }}
      >
        {selected.length === 0 ? (
          <Body size={13} tone="faint" align="center">
            Tap anywhere you're feeling it. Skip if you're not.
          </Body>
        ) : (
          <View style={styles.tagRow}>
            {selected.map((a) => (
              <View
                key={a.id}
                style={{
                  backgroundColor: colors.accentSoft,
                  borderRadius: radius.pill,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}
              >
                <Label size={10} style={{ color: colors.accent }}>
                  {a.label}
                </Label>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * A single area pulsing on its own — used in the debrief recap and on the
 * insight cards, where the map is being *shown* rather than filled in.
 */
export function BodyPulse({ area, size = 88 }: { area: BodyArea; size?: number }) {
  const { colors } = useTheme();
  const p = useSharedValue(0);
  React.useEffect(() => {
    p.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [p]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + p.value * 0.18 }],
    opacity: 0.5 - p.value * 0.25,
  }));

  const a = AREAS.find((x) => x.id === area) ?? AREAS[0];
  const scale = size / W;

  return (
    <View style={{ width: size, height: size * (H / W) }}>
      <Svg width={size} height={size * (H / W)} viewBox={`0 0 ${W} ${H}`}>
        <Path
          d="M100 58c-9 0-15 3-15 3l-28 12c-6 2.5-9 8-9 14v46c0 5 4 9 9 9s9-4 9-9v-32l5-2v40l-4 62c-.5 7 5 13 12 13s12-5 12.5-12l6-52h5l6 52c.5 7 6 12 12.5 12s12.5-6 12-13l-4-62v-40l5 2v32c0 5 4 9 9 9s9-4 9-9V87c0-6-3-11.5-9-14l-28-12s-6-3-15-3z"
          fill={colors.surfaceAlt}
        />
        <Circle cx={100} cy={32} r={22} fill={colors.surfaceAlt} />
        <Circle cx={a.cx} cy={a.cy} r={a.r - 4} fill={colors.accent} fillOpacity={0.55} />
      </Svg>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: (a.cx - a.r) * scale,
            top: (a.cy - a.r) * scale,
            width: a.r * 2 * scale,
            height: a.r * 2 * scale,
            borderRadius: a.r * scale,
            backgroundColor: colors.accent,
          },
          style,
        ]}
      />
    </View>
  );
}

export const BODY_AREAS = AREAS;

const styles = StyleSheet.create({
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
});
