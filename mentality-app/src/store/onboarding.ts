import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SportId, FocusId } from "@/data/catalog";
import type { BodyArea } from "@/components/primitives/BodyMap";

const KEY = "gameday.onboarding.draft";

export type OnboardingDraft = {
  name: string;
  sport: SportId | null;
  level: string | null;
  position: string | null;
  focus: FocusId[];
  /** Where they usually sit before a big game. Seeds the first insight. */
  baselinePressure: number;
  baselineBody: BodyArea[];
  anchorWord: string | null;
  routineTemplateId: string | null;
  notificationsOptIn: boolean;
};

const EMPTY: OnboardingDraft = {
  name: "",
  sport: null,
  level: null,
  position: null,
  focus: [],
  baselinePressure: 6,
  baselineBody: [],
  anchorWord: null,
  routineTemplateId: null,
  notificationsOptIn: false,
};

type Store = {
  draft: OnboardingDraft;
  hydrated: boolean;
  set: <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => void;
  hydrate: () => Promise<void>;
  clear: () => Promise<void>;
};

/**
 * The onboarding draft lives on the device until the account is created.
 *
 * That ordering is deliberate: an athlete answers eight questions and runs a
 * real breathing drill before they're ever asked for an email. Asking for the
 * account first is the single biggest drop-off in apps like this, and none of
 * these answers need a server to be useful.
 */
export const useOnboarding = create<Store>((set, get) => ({
  draft: EMPTY,
  hydrated: false,

  set: (key, value) => {
    const draft = { ...get().draft, [key]: value };
    set({ draft });
    AsyncStorage.setItem(KEY, JSON.stringify(draft)).catch(() => {
      // A failed cache write costs the athlete their answers only if the app
      // dies mid-onboarding. Not worth interrupting them over.
    });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set({ draft: { ...EMPTY, ...JSON.parse(raw) } });
    } catch {
      // Corrupt draft — start clean rather than crash on launch.
    } finally {
      set({ hydrated: true });
    }
  },

  clear: async () => {
    set({ draft: EMPTY });
    await AsyncStorage.removeItem(KEY).catch(() => {});
  },
}));
