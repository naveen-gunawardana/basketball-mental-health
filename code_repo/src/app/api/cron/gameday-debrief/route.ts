import { NextResponse } from "next/server";
import {
  getAdmin,
  isAuthorizedCron,
  pruneTokens,
  sendPush,
  type PushMessage,
} from "@/lib/app-api";

/**
 * The debrief nudge. Runs every fifteen minutes.
 *
 * Ninety minutes after the estimated final whistle, once, and never again for
 * that game. That timing is the whole point: late enough that they're out of
 * the building, early enough that sleep hasn't consolidated three days of
 * replaying a bad play.
 *
 * The app also schedules this locally, because a game can end somewhere with
 * no signal and this is too valuable to depend on a round trip. The ledger
 * makes the overlap harmless — whichever fires first records it, and the other
 * one skips.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Rough competition lengths, mirroring the app's model. */
const DURATION_MIN: Record<string, number> = {
  basketball: 105,
  soccer: 115,
  football: 150,
  volleyball: 105,
  baseball: 150,
  hockey: 140,
  lacrosse: 110,
  tennis: 120,
  wrestling: 180,
  track: 240,
  swimming: 210,
  golf: 270,
};

type Row = {
  id: string;
  athlete_id: string;
  opponent: string | null;
  starts_at: string;
  sport: string;
};

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getAdmin();
  const now = Date.now();

  // Anything that started in the last twelve hours is a candidate; the
  // per-sport duration narrows it below.
  const { data: games, error } = await admin
    .from("games")
    .select("id, athlete_id, opponent, starts_at, sport")
    .in("status", ["upcoming", "live"])
    .gte("starts_at", new Date(now - 12 * 3600_000).toISOString())
    .lte("starts_at", new Date(now).toISOString());

  if (error) {
    console.error("[cron/gameday-debrief]", error);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }

  const rows = (games ?? []) as Row[];

  // Due when we're between 90 and 150 minutes past the estimated end. The
  // window is wider than the cron interval so a skipped run still catches it.
  const due = rows.filter((g) => {
    const end = new Date(g.starts_at).getTime() + (DURATION_MIN[g.sport] ?? 120) * 60_000;
    const since = (now - end) / 60_000;
    return since >= 90 && since <= 150;
  });

  if (due.length === 0) return NextResponse.json({ sent: 0, considered: rows.length });

  const gameIds = due.map((g) => g.id);
  const athleteIds = Array.from(new Set(due.map((g) => g.athlete_id)));

  const [{ data: filed }, { data: tokens }, { data: settings }, { data: alreadySent }] =
    await Promise.all([
      admin.from("debriefs").select("game_id").in("game_id", gameIds),
      admin.from("device_tokens").select("athlete_id, token").in("athlete_id", athleteIds),
      admin
        .from("athlete_settings")
        .select("id, notifications_opt_in")
        .in("id", athleteIds),
      admin
        .from("notification_sends")
        .select("athlete_id, game_id, kind")
        .in("game_id", gameIds)
        .eq("kind", "debrief"),
    ]);

  const debriefed = new Set((filed ?? []).map((d) => d.game_id));
  const optedIn = new Set(
    (settings ?? []).filter((s) => s.notifications_opt_in).map((s) => s.id),
  );
  const sentKeys = new Set(
    (alreadySent ?? []).map((s) => `${s.athlete_id}:${s.game_id}`),
  );

  const tokensByAthlete = new Map<string, string[]>();
  (tokens ?? []).forEach((t) => {
    const list = tokensByAthlete.get(t.athlete_id) ?? [];
    list.push(t.token);
    tokensByAthlete.set(t.athlete_id, list);
  });

  const messages: PushMessage[] = [];
  const ledger: { athlete_id: string; game_id: string; kind: string }[] = [];

  for (const game of due) {
    if (debriefed.has(game.id)) continue;
    if (!optedIn.has(game.athlete_id)) continue;
    if (sentKeys.has(`${game.athlete_id}:${game.id}`)) continue;

    const deviceTokens = tokensByAthlete.get(game.athlete_id) ?? [];
    if (deviceTokens.length === 0) continue;

    deviceTokens.forEach((to) =>
      messages.push({
        to,
        title: game.opponent
          ? `${game.opponent} — before you sleep on it`
          : "Before you sleep on it",
        body: "Ninety seconds. Rate the performance, not the result.",
        data: { route: `/debrief/${game.id}` },
        channelId: "gameday",
      }),
    );

    ledger.push({ athlete_id: game.athlete_id, game_id: game.id, kind: "debrief" });
  }

  if (messages.length === 0) {
    return NextResponse.json({ sent: 0, considered: rows.length });
  }

  const { error: ledgerError } = await admin
    .from("notification_sends")
    .upsert(ledger, { onConflict: "athlete_id,game_id,kind", ignoreDuplicates: true });

  if (ledgerError) {
    console.error("[cron/gameday-debrief] ledger", ledgerError);
    return NextResponse.json({ error: "ledger failed" }, { status: 500 });
  }

  const { sent, invalidTokens } = await sendPush(messages);
  await pruneTokens(invalidTokens);

  return NextResponse.json({ sent, considered: rows.length, pruned: invalidTokens.length });
}
