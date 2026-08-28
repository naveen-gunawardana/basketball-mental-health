import React, { useState } from "react";
import { View, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Body, Display, Label } from "@/components/ui/Text";
import { Well } from "@/components/ui/Card";
import { useOnboarding } from "@/store/onboarding";
import { useAuth } from "@/store/auth";

/**
 * The account, asked for last.
 *
 * By this point the athlete has answered eight questions and seen their own
 * warmup laid out. Asking for an email first is the single biggest drop-off in
 * apps like this, and none of what came before needed a server.
 *
 * The same `auth.users` table backs mentalitysports.org, so anyone who already
 * has a web account signs in here and keeps their profile, mentor match, and
 * message history.
 */
export function StepAccount({ onValidChange }: { onValidChange: (v: boolean) => void }) {
  const { colors, space, radius } = useTheme();
  const router = useRouter();
  const { draft, set } = useOnboarding();
  const { error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  React.useEffect(() => {
    const valid =
      draft.name.trim().length >= 2 &&
      /^\S+@\S+\.\S+$/.test(email.trim()) &&
      password.length >= 8;
    onValidChange(valid);
    // Credentials are held here and read by the controller on submit.
    accountDraft.email = email.trim();
    accountDraft.password = password;
  }, [draft.name, email, password, onValidChange]);

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
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: space.lg,
        paddingTop: space.lg,
        paddingBottom: space["3xl"],
        gap: space.xl,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400).springify().damping(20)} style={{ gap: 8 }}>
        <Label tone="accent">Last thing</Label>
        <Display size={36}>Save it to you</Display>
        <Body size={15.5} style={{ maxWidth: 340 }}>
          So your log survives a new phone. Everything you just set up is waiting on the
          other side.
        </Body>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(120).duration(400)} style={{ gap: space.md }}>
        <View style={{ gap: 6 }}>
          <Label size={10}>What should we call you</Label>
          {field({
            value: draft.name,
            onChangeText: (t) => set("name", t),
            placeholder: "First name",
            autoCapitalize: "words",
            autoComplete: "name",
            textContentType: "givenName",
            maxLength: 40,
          })}
        </View>

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
          <View>
            {field({
              value: password,
              onChangeText: setPassword,
              placeholder: "At least 8 characters",
              secureTextEntry: !show,
              autoCapitalize: "none",
              autoComplete: "new-password",
              textContentType: "newPassword",
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={show ? "Hide password" : "Show password"}
              onPress={() => setShow((s) => !s)}
              style={styles.reveal}
              hitSlop={8}
            >
              <Label size={10} tone="accent">
                {show ? "Hide" : "Show"}
              </Label>
            </Pressable>
          </View>
          {password.length > 0 && password.length < 8 && (
            <Body size={12} tone="danger">
              {8 - password.length} more character{8 - password.length === 1 ? "" : "s"}
            </Body>
          )}
        </View>

        {error && (
          <Animated.View entering={FadeIn.duration(200)}>
            <Body size={13.5} tone="danger">
              {error}
            </Body>
          </Animated.View>
        )}
      </Animated.View>

      <Well tone="calm">
        <Label size={10} tone="calm">
          Who sees this
        </Label>
        <Body size={13.5}>
          Nobody. Your check-ins, debriefs, and voice notes are yours alone. If you're in
          the Mentality mentorship program you can share a debrief with your mentor one at
          a time — and only by tapping share on that one.
        </Body>
      </Well>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/(auth)/sign-in")}
        style={{ alignSelf: "center", paddingVertical: space.sm }}
      >
        <Body size={14} tone="faint">
          Already have a Mentality account?{" "}
          <Body size={14} tone="accent" weight="semi">
            Sign in
          </Body>
        </Body>
      </Pressable>
    </ScrollView>
  );
}

/**
 * Credentials never go into the persisted onboarding draft — that draft is
 * written to disk, and a password has no business being there.
 */
export const accountDraft = { email: "", password: "" };

const styles = StyleSheet.create({
  reveal: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
});
