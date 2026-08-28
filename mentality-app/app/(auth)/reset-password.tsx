import React, { useEffect, useState } from "react";
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useTheme } from "@/theme/ThemeProvider";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Body, Display, Label } from "@/components/ui/Text";
import { GamedayMark, IconCheck } from "@/icons";
import { supabase } from "@/lib/supabase";
import * as haptics from "@/lib/haptics";

/**
 * The landing point for a password reset email.
 *
 * Supabase sends the athlete to `gameday://reset-password#access_token=…`.
 * The native client is configured with `detectSessionInUrl: false`, so the
 * fragment has to be parsed and exchanged here rather than picked up
 * automatically the way it is on the web.
 */
export default function ResetPassword() {
  const { colors, space, radius } = useTheme();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const consume = async (url: string | null) => {
      if (!url || cancelled) return;

      // Supabase puts the tokens in the fragment, which expo-linking leaves in
      // `url` untouched.
      const fragment = url.split("#")[1];
      if (!fragment) {
        if (!cancelled) setError("That link has expired. Ask for a new one.");
        return;
      }

      const params = new URLSearchParams(fragment);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (!access_token || !refresh_token) {
        if (!cancelled) setError("That link has expired. Ask for a new one.");
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (cancelled) return;
      if (sessionError) setError("That link has expired. Ask for a new one.");
      else setReady(true);
    };

    Linking.getInitialURL().then(consume);
    const sub = Linking.addEventListener("url", (e) => consume(e.url));

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    haptics.commit();
    setDone(true);
  };

  if (done) {
    return (
      <Screen scroll={false}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: space.lg }}>
          <Animated.View
            entering={FadeIn.duration(400)}
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.calmSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconCheck size={42} color={colors.calm} strokeWidth={2.5} />
          </Animated.View>
          <Display size={34} align="center">
            Changed
          </Display>
          <Button label="Go to Gameday" full={false} onPress={() => router.replace("/")} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      nav="close"
      onNav={() => router.replace("/")}
      footer={
        <Button
          label="Set new password"
          onPress={save}
          disabled={!ready || password.length < 8}
          loading={saving}
        />
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ gap: space.xl }}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={{ alignItems: "center", gap: space.base, paddingTop: space.lg }}
        >
          <GamedayMark size={64} color={colors.accent} ring={colors.text} />
          <Display size={32} align="center">
            New password
          </Display>
          <Body size={14.5} align="center" style={{ maxWidth: 300 }}>
            This is the same password you use on mentalitysports.org.
          </Body>
        </Animated.View>

        <View style={{ gap: 6 }}>
          <Label size={10}>Password</Label>
          <TextInput
            value={password}
            onChangeText={setPassword}
            editable={ready}
            placeholder="At least 8 characters"
            placeholderTextColor={colors.textFaint}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: space.base,
              paddingVertical: 15,
              color: colors.text,
              fontFamily: "Inter_500Medium",
              fontSize: 16,
              opacity: ready ? 1 : 0.5,
            }}
          />
        </View>

        {!ready && !error && (
          <Body size={13} tone="faint" align="center">
            Checking your link…
          </Body>
        )}

        {error && (
          <View style={{ gap: space.sm, alignItems: "center" }}>
            <Body size={13.5} tone="danger" align="center">
              {error}
            </Body>
            <Pressable onPress={() => router.replace("/(auth)/sign-in")} style={{ padding: 8 }}>
              <Label size={10} tone="accent">
                Back to sign in
              </Label>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
