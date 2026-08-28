import React, { useMemo, useState } from "react";
import { View, Pressable, TextInput, StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { Body, Label } from "@/components/ui/Text";
import { IconCheck, IconPlus } from "@/icons";
import * as haptics from "@/lib/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  /** Cap the selection. Forcing a choice is the point on some screens. */
  max?: number;
  /** Let the athlete add wording that sounds like them. */
  allowCustom?: boolean;
  caption?: string;
  tone?: "accent" | "calm" | "record";
  /** Single-select behaves like a segmented control. */
  single?: boolean;
};

/**
 * Chips — primitive 04.
 *
 * Blank text fields are where check-ins go to die. Offering the twelve answers
 * athletes actually give turns a writing task into a tapping task, and the
 * free-text field stays available as the escape hatch rather than the default.
 */
export function Chips({
  options,
  value,
  onChange,
  max,
  allowCustom,
  caption,
  tone = "accent",
  single,
}: Props) {
  const { colors, space } = useTheme();
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);

  const tint =
    tone === "calm" ? colors.calm : tone === "record" ? colors.record : colors.accent;
  const soft =
    tone === "calm"
      ? colors.calmSoft
      : tone === "record"
        ? colors.recordSoft
        : colors.accentSoft;

  // Custom entries render after the presets, in the order they were added.
  const all = useMemo(() => {
    const extra = value.filter((v) => !options.includes(v));
    return [...options, ...extra];
  }, [options, value]);

  const atLimit = !!max && value.length >= max;

  const toggle = (opt: string) => {
    const on = value.includes(opt);
    if (single) {
      haptics.step();
      onChange(on ? [] : [opt]);
      return;
    }
    if (!on && atLimit) {
      haptics.warn();
      return;
    }
    haptics.step();
    onChange(on ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  const addCustom = () => {
    const t = draft.trim();
    if (!t) {
      setAdding(false);
      return;
    }
    if (!value.includes(t) && !atLimit) {
      haptics.commit();
      onChange(single ? [t] : [...value, t]);
    }
    setDraft("");
    setAdding(false);
  };

  return (
    <View style={{ gap: space.md }}>
      {caption && <Body size={15}>{caption}</Body>}

      <View style={styles.wrap}>
        {all.map((opt) => (
          <Chip
            key={opt}
            label={opt}
            selected={value.includes(opt)}
            onPress={() => toggle(opt)}
            tint={tint}
            soft={soft}
            dimmed={atLimit && !value.includes(opt)}
          />
        ))}

        {allowCustom && !adding && !atLimit && (
          <AnimatedPressable
            layout={Layout.springify()}
            accessibilityRole="button"
            accessibilityLabel="Add your own"
            onPress={() => {
              haptics.step();
              setAdding(true);
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: colors.border,
            }}
          >
            <IconPlus size={14} color={colors.textFaint} strokeWidth={2} />
            <Body size={14} tone="faint" weight="medium">
              Your words
            </Body>
          </AnimatedPressable>
        )}

        {adding && (
          <Animated.View
            entering={FadeIn.duration(160)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 999,
              borderWidth: 1,
              borderColor: tint,
              backgroundColor: soft,
              paddingLeft: 14,
              paddingRight: 6,
              minWidth: 190,
            }}
          >
            <TextInput
              autoFocus
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={addCustom}
              onBlur={addCustom}
              placeholder="Type it"
              placeholderTextColor={colors.textFaint}
              returnKeyType="done"
              maxLength={44}
              style={{
                flex: 1,
                paddingVertical: 9,
                color: colors.text,
                fontFamily: "Inter_500Medium",
                fontSize: 14,
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save"
              onPress={addCustom}
              style={{ padding: 8 }}
            >
              <IconCheck size={16} color={tint} strokeWidth={2.5} />
            </Pressable>
          </Animated.View>
        )}
      </View>

      {max && (
        <Label size={10} tone={atLimit ? "accent" : "faint"}>
          {single
            ? "Pick one"
            : atLimit
              ? `That's your ${max}`
              : `Pick up to ${max} · ${value.length} chosen`}
        </Label>
      )}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
  tint,
  soft,
  dimmed,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  tint: string;
  soft: string;
  dimmed?: boolean;
}) {
  const { colors } = useTheme();
  const press = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 - press.value * 0.05, { damping: 15 }) }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      layout={Layout.springify().damping(18)}
      onPressIn={() => (press.value = 1)}
      onPressOut={() => (press.value = 0)}
      onPress={onPress}
      style={[
        style,
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 7,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: selected ? tint : colors.border,
          backgroundColor: selected ? soft : colors.surface,
          opacity: dimmed ? 0.4 : 1,
        },
      ]}
    >
      {selected && (
        <Animated.View entering={FadeIn.duration(140)}>
          <IconCheck size={13} color={tint} strokeWidth={3} />
        </Animated.View>
      )}
      <Body
        size={14}
        weight={selected ? "semi" : "medium"}
        style={{ color: selected ? tint : colors.textMuted }}
      >
        {label}
      </Body>
    </AnimatedPressable>
  );
}

/** Read-only chip row, for recaps and log detail. */
export function ChipList({ items, tone = "accent" }: { items: string[]; tone?: "accent" | "calm" }) {
  const { colors } = useTheme();
  const tint = tone === "calm" ? colors.calm : colors.accent;
  const soft = tone === "calm" ? colors.calmSoft : colors.accentSoft;
  if (!items.length) return null;
  return (
    <View style={styles.wrap}>
      {items.map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: soft,
            borderRadius: 999,
            paddingHorizontal: 11,
            paddingVertical: 5,
          }}
        >
          <Body size={12} weight="medium" style={{ color: tint }}>
            {i}
          </Body>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
