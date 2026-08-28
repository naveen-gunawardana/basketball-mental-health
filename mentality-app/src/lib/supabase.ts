import "react-native-url-polyfill/auto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import type { Database } from "@/types/database";

/**
 * Gameday points at the same Supabase project the website uses.
 *
 * That's the whole reason an athlete who signed up on mentalitysports.org can
 * sign into this app with the account they already have, and why a debrief can
 * optionally land in `reflections` where their mentor's existing view picks it
 * up. Note this is @supabase/supabase-js directly — @supabase/ssr is web-only
 * and its cookie handling has nothing to attach to here.
 */

const extra = Constants.expoConfig?.extra ?? {};

const configuredUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? (extra.supabaseUrl as string | undefined);
const configuredKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  (extra.supabaseAnonKey as string | undefined);

/** False when the app is running without credentials — see the note below. */
export const isSupabaseConfigured = Boolean(configuredUrl && configuredKey);

/**
 * `createClient` throws on an empty URL, which would white-screen the app
 * before a single pixel renders — the worst way to learn you forgot a `.env`.
 *
 * So an unconfigured build boots against a placeholder host instead. Every
 * network call fails, which is correct and visible, but onboarding (all of
 * which is local until the account step) still runs. That makes the app usable
 * as a design preview and turns a blank screen into a readable warning.
 */
const SUPABASE_URL = configuredUrl || "https://unconfigured.supabase.co";
const SUPABASE_ANON_KEY = configuredKey || "unconfigured-anon-key";

if (!isSupabaseConfigured) {
  console.warn(
    "[gameday] No Supabase credentials. Copy .env.example to .env and fill in " +
      "EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY. " +
      "Onboarding will run; anything that needs an account will not.",
  );
}

/**
 * Sessions live in the device keychain, not AsyncStorage.
 *
 * SecureStore rejects values over 2048 bytes, and a Supabase session with a
 * fat JWT can exceed that, so oversized values are chunked. Web has no
 * SecureStore at all and falls back to AsyncStorage.
 */
const CHUNK_LIMIT = 1800;

const secureAdapter = {
  getItem: async (key: string) => {
    const head = await SecureStore.getItemAsync(key);
    if (head === null) return null;
    if (!head.startsWith("__chunked__:")) return head;

    const count = parseInt(head.split(":")[1] ?? "0", 10);
    const parts: string[] = [];
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`);
      if (part === null) return null; // Torn write — treat as signed out.
      parts.push(part);
    }
    return parts.join("");
  },

  setItem: async (key: string, value: string) => {
    // Clear any previous chunks so a shrinking value can't leave orphans.
    const prev = await SecureStore.getItemAsync(key);
    if (prev?.startsWith("__chunked__:")) {
      const count = parseInt(prev.split(":")[1] ?? "0", 10);
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}.${i}`);
      }
    }

    if (value.length <= CHUNK_LIMIT) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_LIMIT) {
      chunks.push(value.slice(i, i + CHUNK_LIMIT));
    }
    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}.${i}`, chunks[i]);
    }
    await SecureStore.setItemAsync(key, `__chunked__:${chunks.length}`);
  },

  removeItem: async (key: string) => {
    const head = await SecureStore.getItemAsync(key);
    if (head?.startsWith("__chunked__:")) {
      const count = parseInt(head.split(":")[1] ?? "0", 10);
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}.${i}`);
      }
    }
    await SecureStore.deleteItemAsync(key);
  },
};

const storage = Platform.OS === "web" ? AsyncStorage : secureAdapter;

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: storage as any,
      autoRefreshToken: true,
      persistSession: true,
      // No URL to parse in a native app; deep-link callbacks are handled
      // explicitly in the auth flow instead.
      detectSessionInUrl: false,
    },
    global: {
      headers: { "x-gameday-client": Platform.OS },
    },
  },
);

/** The current access token, for calls to the Next.js API. */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
