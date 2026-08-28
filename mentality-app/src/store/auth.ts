import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useOnboarding, type OnboardingDraft } from "./onboarding";
import { ROUTINE_TEMPLATES, getSport } from "@/data/catalog";

type AuthState = {
  session: Session | null;
  user: User | null;
  /** Null until we've checked whether the athlete finished onboarding. */
  hasProfile: boolean | null;
  loading: boolean;
  error: string | null;

  init: () => () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  /** Writes the onboarding draft for the current session. */
  saveOnboarding: () => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  checkProfile: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  hasProfile: null,
  loading: true,
  error: null,

  init: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, user: data.session?.user ?? null, loading: false });
      if (data.session) get().checkProfile();
      else set({ hasProfile: false });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false });
      if (session) get().checkProfile();
      else set({ hasProfile: false });
    });

    return () => sub.subscription.unsubscribe();
  },

  checkProfile: async () => {
    const uid = get().session?.user.id;
    if (!uid) {
      set({ hasProfile: false });
      return;
    }
    const { data, error } = await supabase
      .from("athlete_settings")
      .select("id")
      .eq("id", uid)
      .maybeSingle();

    // A read failure here would bounce a signed-in athlete back to onboarding,
    // which is worse than letting them through — so only a definitive miss
    // counts as "no profile".
    if (error) {
      set({ hasProfile: true });
      return;
    }
    set({ hasProfile: !!data });
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      set({
        loading: false,
        error:
          error.message === "Invalid login credentials"
            ? "That email and password don't match. Try again."
            : error.message,
      });
      return false;
    }
    set({ loading: false });
    return true;
  },

  signUp: async (email, password, name) => {
    set({ loading: true, error: null });

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim() } },
    });

    if (error) {
      set({
        loading: false,
        error: error.message.includes("already registered")
          ? "There's already an account on that email. Sign in instead."
          : error.message,
      });
      return false;
    }

    // The session, not the user, is what decides whether we can write yet.
    // With email confirmation on, Supabase returns a user but no session, and
    // every table here is RLS-gated on auth.uid() — so the write would fail.
    // The draft stays on the device and `saveOnboarding` picks it up once they
    // confirm and sign in.
    if (!data.session) {
      set({ loading: false });
      return true;
    }

    const ok = await get().saveOnboarding();
    if (!ok) {
      set({
        loading: false,
        error: "Account made, but saving your setup failed. Open Me to finish it.",
      });
      return true;
    }

    set({ loading: false });
    return true;
  },

  /**
   * Writes the onboarding draft for whoever is signed in.
   *
   * Called after sign-up, and again at the end of the flow for someone who
   * arrived already signed in — an athlete with a Mentality web account, or
   * one who confirmed their email on a second device. Without this second
   * path they'd answer every question and have none of it saved.
   */
  saveOnboarding: async () => {
    const session = get().session;
    if (!session) return false;

    const draft = useOnboarding.getState().draft;
    const name =
      draft.name.trim() ||
      (session.user.user_metadata?.name as string | undefined)?.trim() ||
      session.user.email?.split("@")[0] ||
      "Athlete";

    const ok = await writeProfile(session.user.id, name, draft);
    if (!ok) return false;

    await useOnboarding.getState().clear();
    set({ hasProfile: true });
    return true;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, hasProfile: false });
  },

  resetPassword: async (email) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: "gameday://reset-password" },
    );
    set({ loading: false, error: error?.message ?? null });
    return !error;
  },
}));

/**
 * Writes everything onboarding collected.
 *
 * `profiles` is shared with the website, so this upserts rather than inserts —
 * an athlete who already has a web account keeps their existing row and just
 * gains the Gameday-specific pieces.
 */
async function writeProfile(
  userId: string,
  name: string,
  draft: OnboardingDraft,
): Promise<boolean> {
  const sport = getSport(draft.sport ?? undefined);

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      name: name.trim(),
      role: "player",
      sport: [sport.id],
    },
    { onConflict: "id" },
  );
  if (profileError) return false;

  const { error: settingsError } = await supabase.from("athlete_settings").upsert(
    {
      id: userId,
      primary_sport: sport.id,
      level: draft.level,
      position: draft.position,
      focus_areas: draft.focus,
      anchor_word: draft.anchorWord,
      baseline_pressure: draft.baselinePressure,
      baseline_body_areas: draft.baselineBody,
      notifications_opt_in: draft.notificationsOptIn,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    { onConflict: "id" },
  );
  if (settingsError) return false;

  // Seed the routine they picked so the first game already has one attached.
  const template = ROUTINE_TEMPLATES.find((t) => t.id === draft.routineTemplateId);
  if (template) {
    await seedRoutine(userId, template.id, draft.anchorWord);
    // The reset and mistake protocols come along for free — they're what the
    // in-game surfaces run, and an empty one there is a dead end.
    await seedRoutine(userId, "halftime", draft.anchorWord);
    await seedRoutine(userId, "mistake", draft.anchorWord);
  }

  return true;
}

async function seedRoutine(userId: string, templateId: string, anchor: string | null) {
  const template = ROUTINE_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return;

  const { data, error } = await supabase
    .from("routines")
    .insert({
      athlete_id: userId,
      kind: template.kind,
      name: template.name,
      is_default: true,
      anchor_word: anchor,
    })
    .select("id")
    .single();

  if (error || !data) return;

  await supabase.from("routine_steps").insert(
    template.steps.map((s, i) => ({
      routine_id: data.id,
      position: i,
      kind: s.kind,
      // Cue steps get the athlete's own word dropped in where the template
      // says "your word", so the very first run already sounds like them.
      label: anchor && s.label === "Your word" ? `Say "${anchor}"` : s.label,
      seconds: s.seconds,
      config: s.pattern ? { pattern: s.pattern, detail: s.detail } : { detail: s.detail },
    })),
  );
}
