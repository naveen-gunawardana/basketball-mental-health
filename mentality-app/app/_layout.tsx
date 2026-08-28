import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ReducedMotionConfig, ReduceMotion } from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  BarlowCondensed_500Medium,
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from "@expo-google-fonts/barlow-condensed";
import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold } from "@expo-google-fonts/outfit";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";

import { ThemeProvider } from "@/theme/ThemeProvider";
import { useAuth } from "@/store/auth";
import { useOnboarding } from "@/store/onboarding";
import { outbox } from "@/lib/outbox";
import { useNotificationRouting } from "@/lib/notification-routing";
import { Crash } from "@/components/ui/Crash";

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * expo-router picks this up automatically. Without it a thrown render error is
 * a white screen, which on game day is the worst possible failure.
 */
export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => Promise<void>;
}) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Crash error={error} retry={() => void retry()} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Game day happens in buildings with no signal. Serving stale data beats
      // a spinner every time, and the outbox reconciles when we're back.
      staleTime: 60_000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed_500Medium,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const initAuth = useAuth((s) => s.init);
  const hydrateDraft = useOnboarding((s) => s.hydrate);
  const [ready, setReady] = useState(false);

  // A tapped notification lands on the screen it's about, including on a
  // cold start from the notification itself.
  useNotificationRouting();

  useEffect(() => {
    const unsub = initAuth();
    Promise.all([hydrateDraft(), outbox.init()])
      .catch(() => {
        // Neither is fatal — a fresh draft and an empty queue are valid states.
      })
      .finally(() => setReady(true));
    return unsub;
  }, [initAuth, hydrateDraft]);

  useEffect(() => {
    // Fonts failing shouldn't strand the user on the splash screen; the system
    // fallbacks in the text components are ugly but readable.
    if ((fontsLoaded || fontError) && ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, ready]);

  if (!fontsLoaded && !fontError) return null;
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Respects the OS "reduce motion" switch across every animation. */}
      <ReducedMotionConfig mode={ReduceMotion.System} />
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                contentStyle: { backgroundColor: "transparent" },
              }}
            >
              <Stack.Screen name="index" options={{ animation: "fade" }} />
              <Stack.Screen name="(onboarding)" options={{ animation: "fade" }} />
              <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
              <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
              <Stack.Screen
                name="gameday/[id]"
                options={{ animation: "fade", gestureEnabled: false }}
              />
              <Stack.Screen name="run/[id]" options={{ presentation: "fullScreenModal" }} />
              <Stack.Screen name="reset" options={{ presentation: "fullScreenModal", animation: "fade" }} />
              <Stack.Screen name="debrief/[id]" options={{ presentation: "fullScreenModal" }} />
              <Stack.Screen name="game/new" options={{ presentation: "modal" }} />
              <Stack.Screen name="drill/[slug]" options={{ presentation: "fullScreenModal" }} />
            </Stack>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
