import React, { useState } from "react";
import { View, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Card, Well } from "@/components/ui/Card";
import { Body, Label } from "@/components/ui/Text";
import { IconBreath, IconCheck, IconNow, IconRecord } from "@/icons";
import { useSettings, useUpdateSettings } from "@/features/profile/queries";
import {
  registerForPush,
  unregisterPush,
  cancelAllNudges,
} from "@/lib/notifications";
import { openAppSettings } from "@/lib/confirm";
import * as haptics from "@/lib/haptics";

const MOMENTS = [
  { when: "9pm the night before", what: "Put the game down so you can sleep", Icon: IconBreath },
  { when: "75 minutes out", what: "Time to run your warmup", Icon: IconNow },
  { when: "90 minutes after", what: "Debrief it before you sleep on it", Icon: IconRecord },
];

export default function NotificationSettings() {
  const { colors, space, radius } = useTheme();
  const router = useRouter();
  const { data: settings } = useSettings();
  const update = useUpdateSettings();

  const [on, setOn] = useState(settings?.notifications_opt_in ?? false);
  const [denied, setDenied] = useState(false);

  const save = async () => {
    if (on) {
      const token = await registerForPush();
      if (!token) {
        // The OS said no. Telling them where to fix it beats silently storing
        // a preference that will never fire.
        setDenied(true);
        await update.mutateAsync({ notifications_opt_in: false });
        return;
      }
    } else {
      await unregisterPush();
      await cancelAllNudges();
    }

    await update.mutateAsync({ notifications_opt_in: on });
    router.back();
  };

  return (
    <Screen
      nav="back"
      eyebrow="Settings"
      title="Reminders"
      footer={<Button label="Save" onPress={save} loading={update.isPending} />}
    >
      <Body size={15}>
        Three per game, one per non-game day. That cap is enforced on the server, so it
        can't creep. There is no "we miss you" send in here and there never will be.
      </Body>

      <View style={{ gap: space.sm }}>
        {MOMENTS.map((m) => (
          <Card key={m.when} flat>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.base }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.calmSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <m.Icon size={19} color={colors.calm} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Label size={9} tone="calm">
                  {m.when}
                </Label>
                <Body size={14} weight="medium" style={{ color: colors.text }}>
                  {m.what}
                </Body>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: on }}
        onPress={() => {
          haptics.step();
          setOn((v) => !v);
          setDenied(false);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: space.md,
          padding: space.base,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: on ? colors.accent : colors.border,
          backgroundColor: on ? colors.accentSoft : "transparent",
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            borderWidth: on ? 0 : 1.5,
            borderColor: colors.border,
            backgroundColor: on ? colors.accent : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {on && <IconCheck size={15} color={colors.accentText} strokeWidth={3} />}
        </View>
        <Body size={15} weight="medium" style={{ flex: 1, color: colors.text }}>
          Remind me at those three moments
        </Body>
      </Pressable>

      {denied && (
        <Well tone="accent">
          <Label size={10} tone="accent">
            Your phone is blocking them
          </Label>
          <Body size={14}>
            Notifications are turned off for Gameday at the system level, so we can't turn
            them on from in here.
          </Body>
          {Platform.OS !== "web" && (
            <Button
              label="Open phone settings"
              variant="secondary"
              size="md"
              onPress={() => void openAppSettings()}
            />
          )}
        </Well>
      )}

      <Body size={12.5} tone="faint">
        Turning these off doesn't lock anything. Nothing in the app is gated behind showing
        up.
      </Body>
    </Screen>
  );
}
