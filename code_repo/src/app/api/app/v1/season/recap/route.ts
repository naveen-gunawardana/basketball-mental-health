import { NextResponse } from "next/server";
import { getAdmin, withAppUser } from "@/lib/app-api";

// Reads a bearer token, so there is nothing to prerender. Declaring it keeps
// the build from attempting a static render and logging the failure.
export const dynamic = "force-dynamic";

/**
 * Season recap.
 *
 * The app computes its own recap from what's already cached on the device so
 * it works offline. This endpoint exists for the fuller version — the whole
 * season rather than what's local, and the first-third-to-last-third
 * comparison that needs every game to be meaningful.
 */

type Row = {
  game_id: string;
  opponent: string | null;
  starts_at: string;
  walk_in_pressure: number | null;
  performance: number | null;
  routine_followed: boolean | null;
};

export const GET = withAppUser(async (user) => {
  const admin = getAdmin();

  const { data: settings } = await admin
    .from("athlete_settings")
    .select("season_start")
    .eq("id", user.id)
    .maybeSingle();

  // Default to the last twelve months rather than a calendar year — seasons
  // straddle New Year in most of these sports.
  const from =
    settings?.season_start ??
    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("v_game_log")
    .select("game_id, opponent, starts_at, walk_in_pressure, performance, routine_followed")
    .eq("athlete_id", user.id)
    .gte("starts_at", from)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("[season/recap]", error);
    return NextResponse.json({ error: "Couldn't build your recap." }, { status: 500 });
  }

  const rows = (data ?? []) as Row[];
  const debriefed = rows.filter((r) => r.performance !== null);

  if (debriefed.length === 0) {
    return NextResponse.json({
      gamesLogged: rows.length,
      debriefsFiled: 0,
      avgPerformance: null,
      avgPressure: null,
      routineRate: null,
      bestGame: null,
      pressureSeries: [],
      biggestShift: null,
    });
  }

  const perf = debriefed.map((r) => r.performance!);
  const pressures = rows
    .map((r) => r.walk_in_pressure)
    .filter((p): p is number => p !== null);

  const withRoutine = debriefed.filter((r) => r.routine_followed !== null);
  const ranIt = withRoutine.filter((r) => r.routine_followed === true);

  const best = debriefed.reduce((m, r) => (r.performance! > m.performance! ? r : m), debriefed[0]);

  // First third against last third — the honest version of "you improved".
  const third = Math.max(1, Math.floor(debriefed.length / 3));
  const biggestShift =
    debriefed.length >= 6
      ? {
          label: "Start of season to now",
          from: round(mean(debriefed.slice(0, third).map((r) => r.performance!))),
          to: round(mean(debriefed.slice(-third).map((r) => r.performance!))),
        }
      : null;

  return NextResponse.json({
    gamesLogged: rows.length,
    debriefsFiled: debriefed.length,
    avgPerformance: round(mean(perf)),
    avgPressure: pressures.length ? round(mean(pressures)) : null,
    routineRate: withRoutine.length >= 3 ? round(ranIt.length / withRoutine.length) : null,
    bestGame: {
      id: best.game_id,
      opponent: best.opponent,
      performance: best.performance!,
      date: best.starts_at,
    },
    pressureSeries: rows.map((r) => ({
      date: r.starts_at,
      pressure: r.walk_in_pressure ?? 0,
      performance: r.performance,
    })),
    biggestShift,
  });
});

function mean(xs: number[]): number {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
