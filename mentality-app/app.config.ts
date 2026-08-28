import type { ExpoConfig } from "expo/config";

/**
 * Gameday by Mentality Sports.
 *
 * Supabase credentials come from the environment so the app can point at the
 * same project the website uses without the keys living in source control.
 * Both are safe to ship in a client bundle — the anon key is RLS-gated.
 */
const config: ExpoConfig = {
  name: "Gameday",
  slug: "gameday",
  scheme: "gameday",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#091327",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "org.mentalitysports.gameday",
    infoPlist: {
      // The routine runner keeps playing while the phone is in a pocket.
      UIBackgroundModes: ["audio"],
      NSMicrophoneUsageDescription:
        "Record a voice note instead of typing out your debrief.",
    },
  },
  android: {
    package: "org.mentalitysports.gameday",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#091327",
    },
    edgeToEdgeEnabled: true,
  },
  plugins: [
    "expo-router",
    "expo-asset",
    "expo-secure-store",
    [
      "expo-audio",
      {
        microphonePermission:
          "Record a voice note instead of typing out your debrief.",
      },
    ],
    "expo-font",
    "expo-sqlite",
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#C4633A",
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#091327",
        image: "./assets/splash.png",
        imageWidth: 180,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://mentalitysports.org",
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
};

export default config;
