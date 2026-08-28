import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { outbox, cache } from "@/lib/outbox";
import { useAuth } from "@/store/auth";
import { scheduleDebriefNudge, cancelDebriefNudge } from "@/lib/notifications";
import type { Game, GameEntry, Debrief } from "./model";
import { estimatedEnd, gameTitle } from "./model";

export const keys = {
  games: ["games"] as const,
  game: (id: string) => ["games", id] as const,
  entries: (id: string) => ["games", id, "entries"] as const,
  debriefs: ["debriefs"] as const,
  debrief: (id: string) => ["debriefs", id] as const,
  routines: ["routines"] as const,
  settings: ["settings"] as const,
};

/* ── Reads ──────────────────────────────────────────────────────────────── */

/**
 * Every game, newest first. Cached to SQLite on each success so a cold start
 * in a gym with no signal still shows the schedule and the log.
 */
export function useGames() {
  const uid = useAuth((s) => s.user?.id);

  return useQuery({
    queryKey: keys.games,
    enabled: !!uid,
    queryFn: async (): Promise<Game[]> => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("athlete_id", uid!)
        .order("starts_at", { ascending: false });

      if (error) {
        const cached = await cache.get<Game[]>("games");
        if (cached) return cached;
        throw error;
      }

      await cache.set("games", data);
      return data as Game[];
    },
    initialData: undefined,
    placeholderData: (prev) => prev,
  });
}

/** The game the app should be organized around right now. */
export function useCurrentGame() {
  const { data: games = [], ...rest } = useGames();
  const now = Date.now();

  // The next game that hasn't ended yet; failing that, the most recent one
  // that ended, so the debrief prompt survives until it's filed.
  const upcoming = [...games]
    .filter((g) => g.status !== "skipped" && estimatedEnd(g).getTime() > now)
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))[0];

  const justPlayed = [...games]
    .filter((g) => g.status !== "skipped" && estimatedEnd(g).getTime() <= now)
    .sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at))[0];

  return { game: upcoming ?? justPlayed ?? null, games, ...rest };
}

export function useDebriefs() {
  const uid = useAuth((s) => s.user?.id);

  return useQuery({
    queryKey: keys.debriefs,
    enabled: !!uid,
    queryFn: async (): Promise<Debrief[]> => {
      const { data, error } = await supabase
        .from("debriefs")
        .select("*")
        .eq("athlete_id", uid!)
        .order("created_at", { ascending: false });

      if (error) {
        const cached = await cache.get<Debrief[]>("debriefs");
        if (cached) return cached;
        throw error;
      }
      await cache.set("debriefs", data);
      return data as Debrief[];
    },
  });
}

export function useGameEntries(gameId: string | undefined) {
  const uid = useAuth((s) => s.user?.id);

  return useQuery({
    queryKey: keys.entries(gameId ?? "none"),
    enabled: !!uid && !!gameId,
    queryFn: async (): Promise<GameEntry[]> => {
      const { data, error } = await supabase
        .from("game_entries")
        .select("*")
        .eq("game_id", gameId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as GameEntry[];
    },
  });
}

/* ── Writes ─────────────────────────────────────────────────────────────── */

/**
 * All writes go through the outbox rather than straight to Supabase. The
 * mutation resolves once the write is durably queued on the device — the
 * athlete is never left waiting on a gym's wifi to see their own check-in.
 */

export function useAddGame() {
  const uid = useAuth((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<Game, "id" | "athlete_id" | "created_at" | "status" | "result">) => {
      const id = outbox.newId();
      const row: Game = {
        ...input,
        id,
        athlete_id: uid!,
        status: "upcoming",
        result: null,
        created_at: new Date().toISOString(),
      };
      await outbox.enqueue("games", row as unknown as Record<string, unknown>);

      // The debrief nudge is scheduled locally — it has to fire ninety minutes
      // after a game that may have ended somewhere with no signal.
      await scheduleDebriefNudge(id, estimatedEnd(row), gameTitle(row));

      return row;
    },
    onSuccess: (row) => {
      qc.setQueryData<Game[]>(keys.games, (prev = []) =>
        [row, ...prev].sort((a, b) => +new Date(b.starts_at) - +new Date(a.starts_at)),
      );
      void cache.set("games", qc.getQueryData<Game[]>(keys.games) ?? []);
    },
  });
}

export function useUpdateGame() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Game> }) => {
      const current = (qc.getQueryData<Game[]>(keys.games) ?? []).find((g) => g.id === id);
      if (!current) throw new Error("That game isn't loaded any more.");
      const row = { ...current, ...patch };
      await outbox.enqueue("games", row as unknown as Record<string, unknown>);
      if (patch.status === "skipped") await cancelDebriefNudge(id);
      return row;
    },
    onSuccess: (row) => {
      qc.setQueryData<Game[]>(keys.games, (prev = []) =>
        prev.map((g) => (g.id === row.id ? row : g)),
      );
      void cache.set("games", qc.getQueryData<Game[]>(keys.games) ?? []);
    },
  });
}

export function useDeleteGame() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await cancelDebriefNudge(id);
      const { error } = await supabase.from("games").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData<Game[]>(keys.games, (prev = []) => prev.filter((g) => g.id !== id));
      void cache.set("games", qc.getQueryData<Game[]>(keys.games) ?? []);
    },
  });
}

export function useSaveEntry() {
  const uid = useAuth((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<GameEntry, "id" | "athlete_id" | "created_at">) => {
      const row: GameEntry = {
        ...input,
        id: outbox.newId(),
        athlete_id: uid!,
        created_at: new Date().toISOString(),
      };
      await outbox.enqueue("game_entries", row as unknown as Record<string, unknown>);
      return row;
    },
    onSuccess: (row) => {
      qc.setQueryData<GameEntry[]>(keys.entries(row.game_id), (prev = []) => [...prev, row]);
    },
  });
}

export function useSaveDebrief() {
  const uid = useAuth((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: Omit<Debrief, "id" | "athlete_id" | "created_at" | "reflection_id"> & {
        /** Opt-in per debrief, defaults off. Writes a row the mentor can see. */
        shareWithMentor?: boolean;
      },
    ) => {
      const { shareWithMentor, ...rest } = input;

      const row: Debrief = {
        ...rest,
        id: outbox.newId(),
        athlete_id: uid!,
        reflection_id: null,
        created_at: new Date().toISOString(),
      };

      // Sharing writes into the website's existing `reflections` table, which
      // already gates mentor visibility on `shared_with_mentor`. This only
      // ever happens on an explicit tap.
      if (shareWithMentor && (rest.transcript || rest.letting_go)) {
        const reflectionId = outbox.newId();
        await outbox.enqueue("reflections", {
          id: reflectionId,
          player_id: uid!,
          content: rest.transcript ?? rest.letting_go ?? "",
          shared_with_mentor: true,
        });
        row.reflection_id = reflectionId;
      }

      await outbox.enqueue("debriefs", row as unknown as Record<string, unknown>);
      // A patch, not an upsert — see the note in outbox.ts. Upserting two
      // columns against `games` would trip the NOT NULL on athlete_id.
      await outbox.enqueue("games", { id: rest.game_id, status: "complete" }, "patch");
      await cancelDebriefNudge(rest.game_id);

      return row;
    },
    onSuccess: (row) => {
      qc.setQueryData<Debrief[]>(keys.debriefs, (prev = []) => [row, ...prev]);
      qc.setQueryData<Game[]>(keys.games, (prev = []) =>
        prev.map((g) => (g.id === row.game_id ? { ...g, status: "complete" as const } : g)),
      );
      void cache.set("debriefs", qc.getQueryData<Debrief[]>(keys.debriefs) ?? []);
    },
  });
}
