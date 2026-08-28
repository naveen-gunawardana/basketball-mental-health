import React, { useMemo, useState } from "react";
import { View, Pressable, TextInput, ScrollView, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { withAlpha } from "@/theme/tokens";
import { Button, IconButton } from "@/components/ui/Button";
import { Body, Label, Stat } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import {
  IconArrowLeft,
  IconBreath,
  IconClose,
  IconCue,
  IconMovement,
  IconMusic,
  IconSilence,
  IconVisualize,
} from "@/icons";
import { PATTERNS, type BreathPattern } from "@/components/primitives/Breath";
import type { StepKind } from "@/components/primitives/Runner";
import { useSaveRoutine, type Routine, type RoutineKind } from "./queries";
import { useSettings } from "@/features/profile/queries";
import * as haptics from "@/lib/haptics";

type DraftStep = {
  key: string;
  kind: StepKind;
  label: string;
  seconds: number;
  detail?: string;
  pattern?: BreathPattern;
};

const PALETTE: {
  kind: StepKind;
  label: string;
  seconds: number;
  detail: string;
  pattern?: BreathPattern;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [
  {
    kind: "breath",
    label: "Breathe",
    seconds: 60,
    detail: "Long exhales. This is the one that slows you down.",
    pattern: PATTERNS.settle,
    Icon: IconBreath,
  },
  {
    kind: "visualize",
    label: "See it",
    seconds: 90,
    detail: "Ordinary plays, not highlights.",
    Icon: IconVisualize,
  },
  { kind: "cue", label: "Say something", seconds: 30, detail: "Out loud if you can.", Icon: IconCue },
  { kind: "movement", label: "Move", seconds: 45, detail: "Get the blood going.", Icon: IconMovement },
  { kind: "music", label: "A track", seconds: 120, detail: "The one that works.", Icon: IconMusic },
  { kind: "silence", label: "Quiet", seconds: 60, detail: "Nothing to do.", Icon: IconSilence },
];

/** Default names, so a brand-new routine isn't called "My warmup" when it's a reset. */
const DEFAULT_NAME: Record<RoutineKind, string> = {
  warmup: "My warmup",
  reset: "My reset",
  wind_down: "Night before",
  mistake: "After a mistake",
};

const ICONS: Record<StepKind, React.ComponentType<{ size?: number; color?: string }>> = {
  breath: IconBreath,
  visualize: IconVisualize,
  cue: IconCue,
  movement: IconMovement,
  music: IconMusic,
  silence: IconSilence,
  custom: IconCue,
};

/**
 * The routine builder.
 *
 * Steps are added from a palette rather than configured from scratch, and the
 * only two things an athlete adjusts per step are its wording and its length.
 * Anything more turns building a warmup into an afternoon.
 */
export function RoutineEditor({
  routine,
  kind = "warmup",
  onClose,
}: {
  routine: Routine | null;
  kind?: RoutineKind;
  onClose: () => void;
}) {
  const { colors, space, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const save = useSaveRoutine();
  const { data: settings } = useSettings();

  const [name, setName] = useState(routine?.name ?? DEFAULT_NAME[kind]);
  const [steps, setSteps] = useState<DraftStep[]>(
    () =>
      routine?.steps.map((s) => ({
        key: s.id,
        kind: s.kind,
        label: s.label,
        seconds: s.seconds,
        detail: s.config?.detail,
        pattern: s.config?.pattern,
      })) ?? [],
  );
  const [editing, setEditing] = useState<string | null>(null);

  const total = useMemo(() => steps.reduce((s, x) => s + x.seconds, 0), [steps]);

  const add = (p: (typeof PALETTE)[number]) => {
    haptics.step();
    setSteps((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}-${prev.length}`,
        kind: p.kind,
        label:
          p.kind === "cue" && settings?.anchor_word
            ? `Say "${settings.anchor_word}"`
            : p.label,
        seconds: p.seconds,
        detail: p.detail,
        pattern: p.pattern,
      },
    ]);
  };

  const remove = (key: string) => {
    haptics.warn();
    setSteps((prev) => prev.filter((s) => s.key !== key));
  };

  const move = (key: string, dir: -1 | 1) => {
    setSteps((prev) => {
      const i = prev.findIndex((s) => s.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      haptics.step();
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const adjust = (key: string, delta: number) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.key === key
          ? { ...s, seconds: Math.max(5, Math.min(600, s.seconds + delta)) }
          : s,
      ),
    );
    haptics.tick();
  };

  const commit = async () => {
    haptics.commit();
    await save.mutateAsync({
      id: routine?.id,
      kind: routine?.kind ?? kind,
      name: name.trim() || DEFAULT_NAME[routine?.kind ?? kind],
      anchor_word: settings?.anchor_word ?? null,
      steps: steps.map((s, i) => ({
        position: i,
        kind: s.kind,
        label: s.label,
        seconds: s.seconds,
        config: { detail: s.detail, pattern: s.pattern },
      })),
    });
    onClose();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <View
        style={{
          paddingTop: insets.top + space.sm,
          paddingHorizontal: space.lg,
          flexDirection: "row",
          alignItems: "center",
          gap: space.md,
        }}
      >
        <IconButton label="Back" variant="ghost" size={42} onPress={onClose}>
          <IconArrowLeft size={19} color={colors.textMuted} />
        </IconButton>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Label size={9.5} tone="faint">
            {steps.length} steps · {Math.max(1, Math.round(total / 60))} min
          </Label>
        </View>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          paddingTop: space.lg,
          paddingBottom: space["3xl"],
          gap: space.xl,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name it"
          placeholderTextColor={colors.textFaint}
          maxLength={32}
          style={{
            color: colors.text,
            fontFamily: "BarlowCondensed_700Bold",
            fontSize: 36,
            textTransform: "uppercase",
            paddingVertical: 4,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderSoft,
          }}
        />

        {/* Steps */}
        <View style={{ gap: space.sm }}>
          {steps.length === 0 && (
            <Body size={14} tone="faint">
              Empty. Add steps from below — most good warmups are four or five.
            </Body>
          )}

          {steps.map((s, i) => {
            const Icon = ICONS[s.kind] ?? IconCue;
            const open = editing === s.key;

            return (
              <Animated.View
                key={s.key}
                layout={Layout.springify().damping(20)}
                entering={FadeInDown.duration(300)}
              >
                <Card flat>
                  <View style={{ gap: open ? space.md : 0 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: colors.surfaceAlt,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={18} color={colors.textMuted} />
                      </View>

                      <Pressable
                        style={{ flex: 1, gap: 2 }}
                        onPress={() => setEditing(open ? null : s.key)}
                        accessibilityRole="button"
                        accessibilityLabel={`${s.label}, ${s.seconds} seconds. Tap to edit.`}
                      >
                        <Body size={15.5} weight="semi" style={{ color: colors.text }}>
                          {s.label}
                        </Body>
                        {s.detail && (
                          <Body size={12.5} tone="faint" numberOfLines={open ? undefined : 1}>
                            {s.detail}
                          </Body>
                        )}
                      </Pressable>

                      <Stat size={18} tone="faint">
                        {fmt(s.seconds)}
                      </Stat>
                    </View>

                    {open && (
                      <Animated.View entering={FadeIn.duration(220)} style={{ gap: space.md }}>
                        <TextInput
                          value={s.label}
                          onChangeText={(t) =>
                            setSteps((prev) =>
                              prev.map((x) => (x.key === s.key ? { ...x, label: t } : x)),
                            )
                          }
                          placeholder="Call it something"
                          placeholderTextColor={colors.textFaint}
                          maxLength={40}
                          style={{
                            backgroundColor: colors.surfaceAlt,
                            borderRadius: radius.sm,
                            paddingHorizontal: 12,
                            paddingVertical: 11,
                            color: colors.text,
                            fontFamily: "Inter_500Medium",
                            fontSize: 15,
                          }}
                        />

                        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
                          <Stepper label="−15s" onPress={() => adjust(s.key, -15)} />
                          <Stepper label="+15s" onPress={() => adjust(s.key, 15)} />
                          <View style={{ flex: 1 }} />
                          <Stepper label="↑" onPress={() => move(s.key, -1)} disabled={i === 0} />
                          <Stepper
                            label="↓"
                            onPress={() => move(s.key, 1)}
                            disabled={i === steps.length - 1}
                          />
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Remove ${s.label}`}
                            onPress={() => remove(s.key)}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 19,
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: withAlpha(colors.danger, 0.12),
                            }}
                          >
                            <IconClose size={16} color={colors.danger} />
                          </Pressable>
                        </View>
                      </Animated.View>
                    )}
                  </View>
                </Card>
              </Animated.View>
            );
          })}
        </View>

        {/* Palette */}
        <View style={{ gap: space.md }}>
          <Label>Add a step</Label>
          <View style={styles.grid}>
            {PALETTE.map((p) => (
              <Pressable
                key={p.kind + p.label}
                accessibilityRole="button"
                accessibilityLabel={`Add ${p.label}`}
                onPress={() => add(p)}
                style={{
                  width: "31.5%",
                  aspectRatio: 1.05,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                <p.Icon size={22} color={colors.accent} />
                <Body size={12} weight="medium" style={{ color: colors.textMuted }}>
                  {p.label}
                </Body>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: space.lg,
          paddingTop: space.md,
          paddingBottom: insets.bottom + space.md,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.borderSoft,
        }}
      >
        <Button
          label="Save routine"
          onPress={commit}
          disabled={steps.length === 0}
          loading={save.isPending}
        />
      </View>
    </View>
  );
}

function Stepper({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        minWidth: 38,
        height: 38,
        paddingHorizontal: 10,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surfaceAlt,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Body size={13} weight="semi" style={{ color: colors.textMuted }}>
        {label}
      </Body>
    </Pressable>
  );
}

function fmt(s: number) {
  return s >= 60 ? `${Math.round(s / 60)}m` : `${s}s`;
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: "2.75%", rowGap: 10 },
});
