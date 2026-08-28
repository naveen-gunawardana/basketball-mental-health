import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { cache } from "@/lib/outbox";
import { useAuth } from "@/store/auth";
import type { SportId, FocusId } from "@/data/catalog";

export type AthleteSettings = {
  id: string;
  primary_sport: SportId;
  level: string | null;
  position: string | null;
  focus_areas: FocusId[];
  anchor_word: string | null;
  baseline_pressure: number | null;
  baseline_body_areas: string[];
  notifications_opt_in: boolean;
  tz: string | null;
  season_start: string | null;
};

export const settingsKey = ["athlete_settings"] as const;

export type Profile = { id: string; name: string; role: string; sport: string[] | null };

/** The shared `profiles` row — the same one the website reads. */
export function useProfile() {
  const uid = useAuth((s) => s.user?.id);

  return useQuery({
    queryKey: ["profile"],
    enabled: !!uid,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, role, sport")
        .eq("id", uid!)
        .maybeSingle();

      if (error) {
        const cached = await cache.get<Profile>("profile");
        if (cached) return cached;
        throw error;
      }
      if (data) await cache.set("profile", data);
      return data as Profile | null;
    },
  });
}

/** Just the first name, for headers. Falls back to something usable. */
export function useFirstName(): string {
  const { data } = useProfile();
  const name = data?.name?.trim();
  if (!name) return "Gameday";
  return name.split(/\s+/)[0];
}

export function useSettings() {
  const uid = useAuth((s) => s.user?.id);

  return useQuery({
    queryKey: settingsKey,
    enabled: !!uid,
    queryFn: async (): Promise<AthleteSettings | null> => {
      const { data, error } = await supabase
        .from("athlete_settings")
        .select("*")
        .eq("id", uid!)
        .maybeSingle();

      if (error) {
        const cached = await cache.get<AthleteSettings>("settings");
        if (cached) return cached;
        throw error;
      }
      if (data) await cache.set("settings", data);
      return data as AthleteSettings | null;
    },
  });
}

export function useUpdateSettings() {
  const uid = useAuth((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (patch: Partial<AthleteSettings>) => {
      const { data, error } = await supabase
        .from("athlete_settings")
        .update(patch)
        .eq("id", uid!)
        .select()
        .single();
      if (error) throw error;
      return data as AthleteSettings;
    },
    onSuccess: (row) => {
      qc.setQueryData(settingsKey, row);
      void cache.set("settings", row);
    },
  });
}

/**
 * The mentorship link.
 *
 * Deliberately at the edge of the app: the mentorship program has capacity for
 * dozens of athletes and Gameday has to stand alone for thousands, so an
 * active match surfaces inside Me rather than in the tab bar. Most users have
 * no mentor and shouldn't feel like they're outside the real product.
 */
export function useMentorMatch() {
  const uid = useAuth((s) => s.user?.id);

  return useQuery({
    queryKey: ["mentor_match"],
    enabled: !!uid,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("id, mentor_id, status, profiles!matches_mentor_id_fkey(name)")
        .eq("player_id", uid!)
        .eq("status", "active")
        .maybeSingle();

      // No match is the normal case, not an error worth surfacing.
      if (error) return null;
      return data as {
        id: string;
        mentor_id: string;
        status: string;
        profiles: { name: string } | null;
      } | null;
    },
  });
}
