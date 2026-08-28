import React, { useState } from "react";
import { View, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Body, Display, Label } from "@/components/ui/Text";
import { GamedayMark } from "@/icons";
import { useAuth } from "@/store/auth";

/**
 * Sign-in for athletes who already have a Mentality Sports account — the web
 * platform and this app share `auth.users`, so the same credentials work and
 * an existing mentor match comes with them.
 */
export default function SignIn() {
  const { colors, space, radius } = useTheme();
  const router = useRouter();
  const { signIn, resetPassword, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);

  const valid = /^\S+@\S+\.\S+$/.test(email.trim()) && password.length >= 6;

  const submit = async () => {
    const ok = await signIn(email, password);
    if (ok) router.replace("/");
  };

  const forgot = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return;
    const ok = await resetPassword(email);
    if (ok) setSent(true);
  };

  const field = (props: React.ComponentProps<typeof TextInput>) => (
    <TextInput
      placeholderTextColor={colors.textFaint}
      {...props}
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
      }}
    />
  );

  return (
    <Screen
      nav="close"
      scroll
      footer={
        <>
          <Button label="Sign in" onPress={submit} disabled={!valid} loading={loading} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={{ alignSelf: "center", paddingVertical: 8 }}
          >
            <Body size={13.5} tone="faint">
              New here?{" "}
              <Body size={13.5} tone="accent" weight="semi">
                Set up instead
              </Body>
            </Body>
          </Pressable>
        </>
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ gap: space.xl }}
      >
        <Animated.View
          entering={FadeInDown.duration(400).springify().damping(20)}
          style={{ alignItems: "center", gap: space.base, paddingTop: space.lg }}
        >
          <GamedayMark size={72} color={colors.accent} ring={colors.text} progress={0.78} />
          <View style={{ gap: 6, alignItems: "center" }}>
            <Display size={34} align="center">
              Welcome back
            </Display>
            <Body size={14.5} align="center" style={{ maxWidth: 300 }}>
              Same account as mentalitysports.org. Your log is where you left it.
            </Body>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(140).duration(400)} style={{ gap: space.md }}>
          <View style={{ gap: 6 }}>
            <Label size={10}>Email</Label>
            {field({
              value: email,
              onChangeText: setEmail,
              placeholder: "you@school.edu",
              autoCapitalize: "none",
              keyboardType: "email-address",
              autoComplete: "email",
              textContentType: "emailAddress",
            })}
          </View>

          <View style={{ gap: 6 }}>
            <Label size={10}>Password</Label>
            {field({
              value: password,
              onChangeText: setPassword,
              placeholder: "Your password",
              secureTextEntry: true,
              autoCapitalize: "none",
              autoComplete: "current-password",
              textContentType: "password",
              onSubmitEditing: submit,
              returnKeyType: "go",
            })}
          </View>

          {error && (
            <Animated.View entering={FadeIn.duration(200)}>
              <Body size={13.5} tone="danger">
                {error}
              </Body>
            </Animated.View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={forgot}
            style={{ alignSelf: "flex-start", paddingVertical: 6 }}
          >
            <Body size={13.5} tone={sent ? "calm" : "accent"} weight="medium">
              {sent ? "Check your email for the reset link" : "Forgot your password?"}
            </Body>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
