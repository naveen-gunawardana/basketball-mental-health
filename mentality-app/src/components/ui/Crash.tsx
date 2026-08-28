import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { Body, Display, Label } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { GamedayMark } from "@/icons";

/**
 * What an athlete sees if the app throws.
 *
 * The bar here is that it never white-screens on game day, and that it doesn't
 * make a sixteen-year-old feel like they broke something. The stack trace is
 * available but collapsed — useful in TestFlight, invisible in normal use.
 */
export function Crash({ error, retry }: { error: Error; retry: () => void }) {
  const { colors, space, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [showDetail, setShowDetail] = React.useState(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.ground,
        paddingTop: insets.top + space.xl,
        paddingBottom: insets.bottom + space.lg,
        paddingHorizontal: space.lg,
        gap: space.lg,
      }}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: space.lg }}>
        <GamedayMark size={64} color={colors.accent} ring={colors.textFaint} progress={0.2} />

        <View style={{ alignItems: "center", gap: 8 }}>
          <Label tone="accent">Our fault, not yours</Label>
          <Display size={36} align="center">
            Something broke
          </Display>
          <Body size={15} align="center" style={{ maxWidth: 300 }}>
            Nothing you logged is lost — anything you'd saved is on your phone and goes up
            the next time you're online.
          </Body>
        </View>

        {showDetail && (
          <ScrollView
            style={{
              maxHeight: 180,
              alignSelf: "stretch",
              backgroundColor: colors.surfaceAlt,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            contentContainerStyle={{ padding: space.base }}
          >
            <Body size={11} tone="faint" style={{ fontFamily: "Inter_400Regular" }}>
              {error.message}
              {"\n\n"}
              {error.stack}
            </Body>
          </ScrollView>
        )}
      </View>

      <View style={{ gap: space.sm }}>
        <Button label="Try again" onPress={retry} />
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowDetail((s) => !s)}
          style={{ alignSelf: "center", padding: space.sm }}
        >
          <Label size={9.5} tone="faint">
            {showDetail ? "Hide details" : "Show details"}
          </Label>
        </Pressable>
      </View>
    </View>
  );
}
