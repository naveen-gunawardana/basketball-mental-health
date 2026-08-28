import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Body, Display, Label } from "@/components/ui/Text";
import { GamedayMark } from "@/icons";

/**
 * Reached by a stale deep link — a notification for a game that's since been
 * deleted, most often.
 */
export default function NotFound() {
  const { colors, space } = useTheme();
  const router = useRouter();

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: space.lg }}>
        <GamedayMark size={64} color={colors.textFaint} ring={colors.textFaint} progress={0.3} />
        <View style={{ alignItems: "center", gap: 6 }}>
          <Label tone="faint">Nothing here</Label>
          <Display size={34} align="center">
            That's gone
          </Display>
          <Body size={15} align="center" style={{ maxWidth: 280 }}>
            The link pointed at something that isn't in your log any more.
          </Body>
        </View>
        <Button
          label="Back to Gameday"
          full={false}
          onPress={() => router.replace("/(tabs)")}
        />
      </View>
    </Screen>
  );
}
