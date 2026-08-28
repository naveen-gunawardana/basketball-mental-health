import { NextResponse } from "next/server";
import { getAdmin, isAuthorizedCron } from "@/lib/app-api";
import { computeInsights, MIN_SAMPLE, type LogRow } from "@/lib/gameday-insights";

/**
 * Nightly insight refresh.
 *
 * Recomputes what each athlete's log can support and stores the result, so the
 * Me tab renders instantly instead of running four comparisons on open.
 *
 * It sends no notification. An insight arriving as a push would make the
 * feature feel like surveillance, and the whole reason athletes fill the log in
 * is that nothing in it is watching them.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Row = LogRow & { athlete_id: string };

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getAdmin();

  // Only the last year matters — a finding from two seasons ago describes a
  // different athlete.
  const since = new Date(Date.now() - 365 * 24 * 3600_000).toISOString();

  const { data, error } = await admin
    .from("v_game_log")
    .select(
      "athlete_id, game_id, venue, walk_in_pressure, sleep_hours, performance, routine_followed",
    )
    .not("performance", "is", null)
    .gte("starts_at", since);

  if (error) {
    console.error("[cron/insights-refresh]", error);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }

  const byAthlete = new Map<string, Row[]>();
  ((data ?? []) as unknown as Row[]).forEach((r) => {
    const list = byAthlete.get(r.athlete_id) ?? [];
    list.push(r);
    byAthlete.set(r.athlete_id, list);
  });

  const generatedAt = new Date().toISOString();
  const insights: Record<string, unknown>[] = [];
  const cleared: string[] = [];

  for (const [athleteId, rows] of Array.from(byAthlete.entries())) {
    if (rows.length < MIN_SAMPLE) continue;

    // Every athlete past the threshold gets cleared, including those whose
    // findings came out empty this time — see the note on replacement below.
    cleared.push(athleteId);

    computeInsights(rows).forEach((i) =>
      insights.push({ ...i, athlete_id: athleteId, generated_at: generatedAt }),
    );
  }

  if (cleared.length === 0) {
    return NextResponse.json({ athletes: 0, insights: 0 });
  }

  // Replace rather than merge. A finding that no longer holds — because the
  // season moved on — has to disappear, not linger as a stale claim.
  //
  // Chunked because `in` with thousands of ids overruns the URL length limit
  // PostgREST will accept.
  for (const chunk of chunks(cleared, 200)) {
    const { error: deleteError } = await admin
      .from("insights")
      .delete()
      .in("athlete_id", chunk);

    if (deleteError) {
      console.error("[cron/insights-refresh] clear", deleteError);
      return NextResponse.json({ error: "clear failed" }, { status: 500 });
    }
  }

  for (const chunk of chunks(insights, 500)) {
    const { error: insertError } = await admin.from("insights").insert(chunk as never);
    if (insertError) {
      console.error("[cron/insights-refresh] insert", insertError);
      return NextResponse.json({ error: "insert failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ athletes: cleared.length, insights: insights.length });
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
