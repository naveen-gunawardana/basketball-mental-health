import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { cache, outbox } from "@/lib/outbox";
import { useAuth } from "@/store/auth";
import type { RunStep, StepKind } from "@/components/primitives/Runner";
import type { BreathPattern } from "@/components/primitives/Breath";

export type RoutineKind = "warmup" | "reset" | "wind_down" | "mistake";

export type Routine = {
  id: string;
  athlete_id: string;
  kind: RoutineKind;
  name: string;
  is_default: boolean;
  anchor_word: string | null;
  updated_at: string;
  steps: RoutineStep[];
};

export type RoutineStep = {
  id: string;
  routine_id: string;
  position: number;
  kind: StepKind;
  label: string;
  seconds: number;
  config: { detail?: string; pattern?: BreathPattern };
};

export const routineKeys = {
  all: ["routines"] as const,
  byKind: (k: RoutineKind) => ["routines", k] as const,
};

export function useRoutines() {
  const uid = useAuth((s) => s.user?.id);

  return useQuery({
    queryKey: routineKeys.all,
    enabled: !!uid,
    queryFn: async (): Promise<Routine[]> => {
      const { data, error } = await supabase
        .from("routines")
        .select("*, steps:routine_steps(*)")
        .eq("athlete_id", uid!)
        .order("updated_at", { ascending: false });

      if (error) {
        const cached = await cache.get<Routine[]>("routines");
        if (cached) return cached;
        throw error;
      }

      const rows = (data as unknown as Routine[]).map((r) => ({
        ...r,
        steps: [...(r.steps ?? [])].sort((a, b) => a.position - b.position),
      }));

      // Routines are cached aggressively — the runner has to work in a gym
      // with no signal, and it can't fall back to anything else.
      await cache.set("routines", rows);
      return rows;
    },
  });
}

export function useDefaultRoutine(kind: RoutineKind) {
  const { data: routines = [], ...rest } = useRoutines();
  const matches = routines.filter((r) => r.kind === kind);
  return {
    routine: matches.find((r) => r.is_default) ?? matches[0] ?? null,
    all: matches,
    ...rest,
  };
}

/** Routine rows → the shape the Runner takes. */
export function toRunSteps(routine: Routine): RunStep[] {
  return routine.steps.map((s) => ({
    id: s.id,
    kind: s.kind,
    label: s.label,
    seconds: s.seconds,
    detail: s.config?.detail,
    pattern: s.config?.pattern,
  }));
}

export function useSaveRoutine() {
  const uid = useAuth((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id?: string;
      kind: RoutineKind;
      name: string;
      anchor_word?: string | null;
      steps: Omit<RoutineStep, "id" | "routine_id">[];
    }) => {
      const id = input.id ?? outbox.newId();

      const { error: rErr } = await supabase.from("routines").upsert(
        {
          id,
          athlete_id: uid!,
          kind: input.kind,
          name: input.name,
          anchor_word: input.anchor_word ?? null,
          is_default: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
      if (rErr) throw rErr;

      // Steps are replaced wholesale — reordering and deleting through diffs
      // costs more than it saves for a list this short.
      await supabase.from("routine_steps").delete().eq("routine_id", id);

      const { error: sErr } = await supabase.from("routine_steps").insert(
        input.steps.map((s, i) => ({
          routine_id: id,
          position: i,
          kind: s.kind,
          label: s.label,
          seconds: s.seconds,
          config: s.config ?? {},
        })),
      );
      if (sErr) throw sErr;

      return id;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: routineKeys.all });
    },
  });
}
