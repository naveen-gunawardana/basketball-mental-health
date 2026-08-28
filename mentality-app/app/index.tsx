import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/store/auth";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * The gate.
 *
 * Onboarding runs before there's an account, so an unauthenticated athlete
 * goes to the flow rather than to a sign-in wall. Sign-in is reachable from
 * inside it for people who already have a Mentality Sports account.
 */
export default function Index() {
  const { session, hasProfile, loading } = useAuth();
  const { colors } = useTheme();

  if (loading || (session && hasProfile === null)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ground, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(onboarding)" />;
  if (!hasProfile) return <Redirect href="/(onboarding)" />;
  return <Redirect href="/(tabs)" />;
}
