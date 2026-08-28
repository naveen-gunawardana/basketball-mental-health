import React, { useCallback, useMemo, useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
} from "react-native-reanimated";
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useTheme } from "@/theme/ThemeProvider";
import { Button, IconButton } from "@/components/ui/Button";
import { Body } from "@/components/ui/Text";
import { IconArrowLeft, IconArrowRight } from "@/icons";
import { Progress } from "@/features/onboarding/Progress";
import {
  StepHero,
  StepSport,
  StepLevel,
  StepFocus,
  StepBaseline,
  StepBody,
  StepAnchor,
  StepRoutine,
  StepNotifications,
  StepDone,
} from "@/features/onboarding/steps";
import { StepAccount, accountDraft } from "@/features/onboarding/StepAccount";
import { useOnboarding } from "@/store/onboarding";
import { useAuth } from "@/store/auth";
import { registerForPush } from "@/lib/notifications";
import * as haptics from "@/lib/haptics";

type StepDef = {
  key: string;
  render: (helpers: { setValid: (v: boolean) => void }) => React.ReactNode;
  cta: string;
  /** Steps that can't be skipped past. */
  requires?: (d: ReturnType<typeof useOnboarding.getState>["draft"]) => boolean;
  /** Steps that opt out of the progress bar and back arrow. */
  chrome?: boolean;
};

export default function Onboarding() {
  const { colors, space } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { draft } = useOnboarding();
  const { signUp, saveOnboarding, loading, session, hasProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const [index, setIndex] = useState(0);
  const [back, setBack] = useState(false);
  const [accountValid, setAccountValid] = useState(false);

  // Someone who already signed in on another device lands here with a session
  // but no Gameday profile — they still walk the flow, they just skip the
  // account step at the end.
  const signedIn = !!session;

  const steps = useMemo<StepDef[]>(() => {
    const list: StepDef[] = [
      { key: "hero", render: () => <StepHero />, cta: "Let's go", chrome: false },
      {
        key: "sport",
        render: () => <StepSport />,
        cta: "Next",
        requires: (d) => !!d.sport,
      },
      { key: "level", render: () => <StepLevel />, cta: "Next", requires: (d) => !!d.level },
      {
        key: "focus",
        render: () => <StepFocus />,
        cta: "Next",
        requires: (d) => d.focus.length > 0,
      },
      { key: "baseline", render: () => <StepBaseline />, cta: "Next" },
      { key: "body", render: () => <StepBody />, cta: "Next" },
      {
        key: "anchor",
        render: () => <StepAnchor />,
        cta: "Next",
        requires: (d) => !!d.anchorWord,
      },
      {
        key: "routine",
        render: () => <StepRoutine />,
        cta: "That's mine",
        requires: (d) => !!d.routineTemplateId,
      },
      { key: "notifications", render: () => <StepNotifications />, cta: "Next" },
    ];

    if (!signedIn) {
      list.push({
        key: "account",
        render: ({ setValid }) => <StepAccount onValidChange={setValid} />,
        cta: "Create my account",
      });
    }

    list.push({ key: "done", render: () => <StepDone />, cta: "Load my first game", chrome: false });
    return list;
  }, [signedIn]);

  const step = steps[index];
  const total = steps.length;
  const isLast = index === total - 1;
  const isAccount = step.key === "account";

  const canAdvance = isAccount
    ? accountValid
    : step.requires
      ? step.requires(draft)
      : true;

  const goNext = useCallback(async () => {
    if (isLast) {
      haptics.commit();

      // Someone who arrived already signed in never hit the account step, so
      // this is the only place their answers get written.
      if (signedIn && !hasProfile) {
        setSaving(true);
        const ok = await saveOnboarding();
        setSaving(false);
        if (!ok) return;
      }

      if (draft.notificationsOptIn) {
        // Fire and forget — a denied prompt shouldn't hold up the app.
        registerForPush().catch(() => {});
      }
      router.replace("/(tabs)");
      return;
    }

    if (isAccount) {
      const ok = await signUp(accountDraft.email, accountDraft.password, draft.name);
      if (!ok) return; // The error renders inside the step.
    }

    haptics.step();
    setBack(false);
    setIndex((i) => Math.min(total - 1, i + 1));
  }, [
    draft.name,
    draft.notificationsOptIn,
    hasProfile,
    isAccount,
    isLast,
    router,
    saveOnboarding,
    signUp,
    signedIn,
    total,
  ]);

  const goBack = useCallback(() => {
    if (index === 0) return;
    haptics.step();
    setBack(true);
    setIndex((i) => Math.max(0, i - 1));
  }, [index]);

  // Already fully set up — nothing to do here. A <Redirect> rather than a
  // router call, because navigating during render is a side effect and this
  // branch is hit the moment saveOnboarding flips hasProfile.
  if (signedIn && hasProfile) return <Redirect href="/(tabs)" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <StatusBar style={colors.ground === "#F6F3EC" ? "dark" : "light"} />

      {/* Chrome: back arrow and segmented progress. Hidden on the bookends. */}
      <View style={{ paddingTop: insets.top + space.sm, gap: space.md }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: space.lg,
            height: 44,
          }}
        >
          {index > 0 && !isLast ? (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)}>
              <IconButton label="Go back" variant="ghost" size={40} onPress={goBack}>
                <IconArrowLeft size={19} color={colors.textMuted} />
              </IconButton>
            </Animated.View>
          ) : (
            <View style={{ width: 40 }} />
          )}

          <View style={{ flex: 1 }} />

          {step.key === "body" && (
            <Animated.View entering={FadeIn.duration(200)}>
              <Body
                size={14}
                tone="faint"
                weight="medium"
                onPress={goNext}
                suppressHighlighting
                style={{ paddingHorizontal: 10, paddingVertical: 8 }}
              >
                Skip
              </Body>
            </Animated.View>
          )}
        </View>

        {index > 0 && !isLast && (
          <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(150)}>
            <Progress step={index - 1} total={total - 2} />
          </Animated.View>
        )}
      </View>

      {/* Stage */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top + 90}
      >
        <Animated.View
          key={step.key}
          entering={(back ? SlideInLeft : SlideInRight).duration(360).springify().damping(22)}
          exiting={(back ? SlideOutRight : SlideOutLeft).duration(200)}
          style={{ flex: 1 }}
        >
          {step.render({ setValid: setAccountValid })}
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View
        style={{
          paddingHorizontal: space.lg,
          paddingTop: space.md,
          paddingBottom: insets.bottom + space.md,
          gap: space.sm,
        }}
      >
        <Button
          label={step.cta}
          onPress={goNext}
          disabled={!canAdvance}
          loading={(isAccount && loading) || saving}
          iconRight={
            !isLast && !isAccount ? (
              <IconArrowRight size={19} color={colors.accentText} strokeWidth={2.2} />
            ) : undefined
          }
        />

        {isAccount && (
          <Body size={11.5} tone="faint" align="center" style={{ maxWidth: 320, alignSelf: "center" }}>
            By making an account you agree to the Mentality Sports terms. Gameday is a
            performance tool, not medical care.
          </Body>
        )}
      </View>
    </View>
  );
}
