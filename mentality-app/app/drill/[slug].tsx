import React, { useMemo } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Body, Label } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Runner, type RunStep } from "@/components/primitives/Runner";
import { DRILLS } from "@/data/catalog";
import { useAuth } from "@/store/auth";
import { outbox } from "@/lib/outbox";

/**
 * A single rep.
 *
 * Drills ship bundled with the app so day one works with no network at all;
 * anything published later arrives through /api/app/v1/content/sync and is
 * cached to SQLite alongside these.
 */
export default function DrillPlayer() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ slug: string }>();
  const uid = useAuth((s) => s.user?.id);

  const drill = useMemo(() => DRILLS.find((d) => d.slug === params.slug), [params.slug]);

  const steps = useMemo<RunStep[]>(
    () =>
      (drill?.steps ?? []).map((s, i) => ({
        id: `${drill?.slug}-${i}`,
        kind: s.kind,
        label: s.label,
        seconds: s.seconds,
        detail: s.detail,
        pattern: s.pattern,
      })),
    [drill],
  );

  const complete = async () => {
    if (!drill || !uid) return;
    // Completions go through the outbox like everything else — a rep taken on
    // a bus with no signal still counts.
    await outbox.enqueue("drill_completions", {
      id: outbox.newId(),
      athlete_id: uid,
      drill_slug: drill.slug,
      completed_at: new Date().toISOString(),
    });
  };

  if (!drill) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.ground,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
        }}
      >
        <Label tone="faint">Not found</Label>
        <Body size={15} align="center">
          That rep isn't in the library any more.
        </Body>
        <Button label="Back" full={false} size="md" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <Runner
      steps={steps}
      title={drill.title}
      doneLabel="Rep taken"
      onDone={async () => {
        await complete();
        router.back();
      }}
      onExit={() => router.back()}
    />
  );
}
