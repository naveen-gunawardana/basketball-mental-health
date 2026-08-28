import React, { useState } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Body, Display, Label } from "@/components/ui/Text";
import { Chips } from "@/components/primitives/Chips";
import { Well } from "@/components/ui/Card";
import { useSettings, useUpdateSettings } from "@/features/profile/queries";
import { ANCHOR_WORDS } from "@/data/catalog";

/**
 * The anchor word.
 *
 * Changing it rewrites every cue step in every routine that referenced the old
 * one, which is why it lives behind its own screen instead of an inline field.
 */
export default function AnchorSettings() {
  const { colors } = useTheme();
  const router = useRouter();
  const { data: settings } = useSettings();
  const update = useUpdateSettings();

  const [word, setWord] = useState<string[]>(
    settings?.anchor_word ? [settings.anchor_word] : [],
  );

  const save = async () => {
    await update.mutateAsync({ anchor_word: word[0] ?? null });
    router.back();
  };

  return (
    <Screen
      nav="back"
      eyebrow="Settings"
      title="Your word"
      footer={
        <Button
          label="Save"
          onPress={save}
          disabled={word.length === 0}
          loading={update.isPending}
        />
      }
    >
      <Body size={15}>
        One word you come back to after a mistake. It has to tell you what to do, not what
        to stop — under load your head can't act on a negation.
      </Body>

      <Chips
        options={ANCHOR_WORDS}
        value={word}
        onChange={setWord}
        allowCustom
        single
        tone="calm"
      />

      {word[0] && (
        <Animated.View entering={FadeIn.duration(300)}>
          <Well tone="calm">
            <Label size={10} tone="calm">
              You'll hear this at halftime and after every mistake
            </Label>
            <Display size={44} align="center" style={{ color: colors.calm }}>
              {word[0]}
            </Display>
          </Well>
        </Animated.View>
      )}
    </Screen>
  );
}
