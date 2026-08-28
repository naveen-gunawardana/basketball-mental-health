import React, { useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Body, Label } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Runner } from "@/components/primitives/Runner";
import { useRoutines, toRunSteps, type RoutineKind } from "@/features/routines/queries";
import { RoutineEditor } from "@/features/routines/RoutineEditor";

/**
 * The routine runner.
 *
 * Full screen, offline, and safe to pocket — the steps advance on their own so
 * an athlete can put the phone away with headphones in and never look at it
 * again until it's done.
 */
export default function Run() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; edit?: string; kind?: string }>();
  const { data: routines = [], isLoading } = useRoutines();

  const routine = useMemo(
    () => routines.find((r) => r.id === params.id) ?? null,
    [routines, params.id],
  );

  if (params.edit) {
    // `kind` only matters when there's no routine yet — building a reset from
    // the Train tab has to produce a reset, not a warmup.
    return (
      <RoutineEditor
        routine={routine}
        kind={(params.kind as RoutineKind) ?? "warmup"}
        onClose={() => router.back()}
      />
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ground, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!routine || routine.steps.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.ground,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          gap: 16,
        }}
      >
        <Label tone="faint">Nothing to run</Label>
        <Body size={15} align="center" style={{ maxWidth: 280 }}>
          This routine has no steps yet. Build it once and it's there every game after
          that.
        </Body>
        <Button
          label="Build it"
          full={false}
          size="md"
          onPress={() => router.replace(`/run/${params.id}?edit=1`)}
        />
        <Button label="Not now" variant="ghost" size="sm" full={false} onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <Runner
      steps={toRunSteps(routine)}
      title={routine.name}
      doneLabel="That's your routine"
      onDone={() => router.back()}
      onExit={() => router.back()}
    />
  );
}
