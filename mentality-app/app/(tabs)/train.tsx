import React, { useMemo, useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import Animated, { FadeIn, FadeInDown, Layout } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Body, Heading, Label, Stat } from "@/components/ui/Text";
import {
  IconBreath,
  IconCue,
  IconMovement,
  IconMusic,
  IconPlay,
  IconSilence,
  IconVisualize,
} from "@/icons";
import { useRoutines, type Routine, type RoutineKind } from "@/features/routines/queries";
import { useSettings } from "@/features/profile/queries";
import { DRILLS, FOCUS_AREAS, type FocusId } from "@/data/catalog";
import * as haptics from "@/lib/haptics";

const KIND_COPY: Record<RoutineKind, { label: string; note: string }> = {
  warmup: { label: "Warmup", note: "The hour before" },
  reset: { label: "Reset", note: "Halftime, or any stoppage" },
  mistake: { label: "After a mistake", note: "Ten seconds, mid-game" },
  wind_down: { label: "Night before", note: "So you can actually sleep" },
};

const STEP_ICONS = {
  breath: IconBreath,
  visualize: IconVisualize,
  cue: IconCue,
  movement: IconMovement,
  music: IconMusic,
  silence: IconSilence,
  custom: IconCue,
} as const;

/**
 * Train — the routines the athlete runs on game day, and the drills that build
 * the skills those routines use.
 */
export default function Train() {
  const { colors, space } = useTheme();
  const router = useRouter();
  const { data: routines = [] } = useRoutines();
  const { data: settings } = useSettings();

  const [filter, setFilter] = useState<FocusId | null>(null);

  const byKind = useMemo(() => {
    const m = new Map<RoutineKind, Routine>();
    routines.forEach((r) => {
      const existing = m.get(r.kind);
      if (!existing || (r.is_default && !existing.is_default)) m.set(r.kind, r);
    });
    return m;
  }, [routines]);

  const focus = useMemo<FocusId[]>(
    () => settings?.focus_areas ?? [],
    [settings?.focus_areas],
  );

  const drills = useMemo(() => {
    if (filter) return DRILLS.filter((d) => d.category === filter);
    if (!focus.length) return DRILLS;
    // What they said is hard comes first; everything else stays reachable.
    return [...DRILLS].sort((a, b) => {
      const ai = focus.indexOf(a.category);
      const bi = focus.indexOf(b.category);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [filter, focus]);

  const chips = useMemo(() => {
    const ids = new Set(DRILLS.map((d) => d.category));
    return FOCUS_AREAS.filter((f) => ids.has(f.id));
  }, []);

  return (
    <Screen eyebrow="Build it before you need it" title="Train" padded={false}>
      <View style={{ paddingHorizontal: space.lg, gap: space.xl }}>
        {/* Routines */}
        <View style={{ gap: space.md }}>
          <Label>Your routines</Label>
          {(Object.keys(KIND_COPY) as RoutineKind[]).map((kind, i) => {
            const routine = byKind.get(kind);
            return (
              <Animated.View key={kind} entering={FadeInDown.delay(i * 50).duration(350)}>
                <RoutineRow
                  kind={kind}
                  routine={routine}
                  onRun={() => routine && router.push(`/run/${routine.id}`)}
                  onEdit={() =>
                    router.push(
                      `/run/${routine?.id ?? "new"}?edit=1&kind=${kind}`,
                    )
                  }
                />
              </Animated.View>
            );
          })}
        </View>

        {/* Drills */}
        <View style={{ gap: space.md }}>
          <Label>Reps</Label>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: space.lg }}
            style={{ marginHorizontal: -space.lg, paddingHorizontal: space.lg }}
          >
            <FilterChip label="All" active={filter === null} onPress={() => setFilter(null)} />
            {chips.map((f) => (
              <FilterChip
                key={f.id}
                label={f.label}
                active={filter === f.id}
                highlight={focus.includes(f.id)}
                onPress={() => setFilter(filter === f.id ? null : f.id)}
              />
            ))}
          </ScrollView>

          <View style={{ gap: space.sm }}>
            {drills.map((d, i) => (
              <Animated.View
                key={d.slug}
                layout={Layout.springify().damping(20)}
                entering={FadeIn.delay(Math.min(i * 40, 240)).duration(320)}
              >
                <Card onPress={() => router.push(`/drill/${d.slug}`)} flat>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: space.base }}>
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 23,
                        backgroundColor: focus.includes(d.category)
                          ? colors.accentSoft
                          : colors.surfaceAlt,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconPlay
                        size={17}
                        color={focus.includes(d.category) ? colors.accent : colors.textMuted}
                      />
                    </View>

                    <View style={{ flex: 1, gap: 2 }}>
                      <Heading size={16.5}>{d.title}</Heading>
                      <Body size={13} tone="faint">
                        {d.blurb}
                      </Body>
                    </View>

                    <Stat size={17} tone="faint">
                      {Math.round(d.seconds / 60)}′
                    </Stat>
                  </View>
                </Card>
              </Animated.View>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

function RoutineRow({
  kind,
  routine,
  onRun,
  onEdit,
}: {
  kind: RoutineKind;
  routine?: Routine;
  onRun: () => void;
  onEdit: () => void;
}) {
  const { colors, space, radius } = useTheme();
  const copy = KIND_COPY[kind];
  const total = routine?.steps.reduce((s, x) => s + x.seconds, 0) ?? 0;

  if (!routine) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Build your ${copy.label} routine`}
        onPress={onEdit}
        style={{
          borderRadius: radius.lg,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: colors.border,
          padding: space.base,
          gap: 3,
        }}
      >
        <Label size={9.5} tone="faint">
          {copy.note}
        </Label>
        <Body size={15} weight="medium" style={{ color: colors.textMuted }}>
          Build your {copy.label.toLowerCase()}
        </Body>
      </Pressable>
    );
  }

  return (
    <Card onPress={onRun}>
      <View style={{ gap: space.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
          <View style={{ flex: 1, gap: 3 }}>
            <Label size={9.5} tone="accent">
              {copy.note}
            </Label>
            <Heading size={18}>{routine.name}</Heading>
          </View>

          <View style={{ alignItems: "flex-end", gap: 2 }}>
            <Stat size={20}>{Math.max(1, Math.round(total / 60))}′</Stat>
            <Label size={8.5} tone="faint">
              {routine.steps.length} steps
            </Label>
          </View>

          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconPlay size={17} color={colors.accentText} />
          </View>
        </View>

        {/* Step strip — the shape of the routine at a glance */}
        <View style={{ flexDirection: "row", gap: 3 }}>
          {routine.steps.map((s) => {
            const Icon = STEP_ICONS[s.kind] ?? IconCue;
            return (
              <View
                key={s.id}
                style={{
                  flex: s.seconds,
                  height: 30,
                  borderRadius: 7,
                  backgroundColor: colors.surfaceAlt,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Icon size={14} color={colors.textFaint} />
              </View>
            );
          })}
        </View>

        <Pressable onPress={onEdit} hitSlop={8} style={{ alignSelf: "flex-start" }}>
          <Label size={9.5} tone="faint">
            Edit steps
          </Label>
        </Pressable>
      </View>
    </Card>
  );
}

function FilterChip({
  label,
  active,
  highlight,
  onPress,
}: {
  label: string;
  active: boolean;
  highlight?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={() => {
        haptics.step();
        onPress();
      }}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.border,
        backgroundColor: active ? colors.accentSoft : "transparent",
      }}
    >
      <Body
        size={13.5}
        weight={active ? "semi" : "medium"}
        style={{ color: active ? colors.accent : highlight ? colors.text : colors.textFaint }}
      >
        {label}
      </Body>
    </Pressable>
  );
}

