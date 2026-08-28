import { NextResponse } from "next/server";
import { getAdmin, withAppUser } from "@/lib/app-api";
import { computeInsights, MIN_SAMPLE, type LogRow } from "@/lib/gameday-insights";

// Reads a bearer token, so there is nothing to prerender. Declaring it keeps
// the build from attempting a static render and logging the failure.
export const dynamic = "force-dynamic";

/**
 * Insights for one athlete.
 *
 * Reads what the nightly job already worked out, and computes live only when
 * there's nothing stored — which happens for an athlete who crossed the
 * six-game threshold since the last run, and is the one moment the feature
 * most needs to land.
 *
 * The findings themselves live in @/lib/gameday-insights so this and the cron
 * can't drift into disagreeing about what the log says.
 */

export const GET = withAppUser(async (user) => {
  const admin = getAdmin();

  const [{ data: stored }, { data: log, error }] = await Promise.all([
    admin
      .from("insights")
      .select("id, kind, title, body, evidence, sample_size, generated_at")
      .eq("athlete_id", user.id)
      .is("dismissed_at", null)
      .order("generated_at", { ascending: false }),
    admin
      .from("v_game_log")
      .select("game_id, venue, walk_in_pressure, sleep_hours, performance, routine_followed")
      .eq("athlete_id", user.id)
      .not("performance", "is", null)
      .order("starts_at", { ascending: false })
      .limit(60),
  ]);

  if (error) {
    console.error("[insights]", error);
    return NextResponse.json({ error: "Couldn't load your season." }, { status: 500 });
  }

  const rows = (log ?? []) as unknown as LogRow[];
  const gamesLogged = rows.length;

  if (stored && stored.length > 0) {
    return NextResponse.json({ insights: stored, gamesLogged, threshold: MIN_SAMPLE });
  }

  // Nothing stored yet. Compute it now rather than making them wait for the
  // overnight run — the ids are synthetic because nothing was persisted.
  const fresh = computeInsights(rows).map((i) => ({
    ...i,
    id: `live:${user.id}:${i.kind}`,
    generated_at: new Date().toISOString(),
  }));

  return NextResponse.json({ insights: fresh, gamesLogged, threshold: MIN_SAMPLE });
});
