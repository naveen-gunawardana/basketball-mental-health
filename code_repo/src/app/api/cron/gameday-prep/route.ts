import { NextResponse } from "next/server";
import {
  getAdmin,
  isAuthorizedCron,
  localHour,
  pruneTokens,
  sendPush,
  type PushMessage,
} from "@/lib/app-api";

/**
 * Gameday prep notifications. Runs hourly.
 *
 * Two sends live here:
 *   · night before, at 9pm in the athlete's own timezone
 *   · warmup, 75 minutes before the first whistle
 *
 * The cap — three per game, one per non-game day — is enforced here rather
 * than in the app, because a cap the client owns is a cap that eventually
 * creeps. `notification_sends` has a unique constraint on
 * (athlete, game, kind), so a double fire is impossible rather than unlikely.
 *
 * There is no "we miss you" send in this file and there never will be. A
 * teenager turns notifications off permanently the first time an app wastes
 * one, and there is no getting that permission back.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Row = {
  id: string;
  athlete_id: string;
  opponent: string | null;
  starts_at: string;
  kind: string;
};

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getAdmin();
  const now = new Date();

  // Everything starting in the next 40 hours — wide enough to cover both the
  // night-before window and the warmup window in one query.
  const { data: games, error } = await admin
    .from("games")
    .select("id, athlete_id, opponent, starts_at, kind")
    .eq("status", "upcoming")
    .gte("starts_at", now.toISOString())
    .lte("starts_at", new Date(now.getTime() + 40 * 3600_000).toISOString());

  if (error) {
    console.error("[cron/gameday-prep]", error);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }

  const rows = (games ?? []) as Row[];
  if (rows.length === 0) return NextResponse.json({ sent: 0, considered: 0 });

  const athleteIds = Array.from(new Set(rows.map((r) => r.athlete_id)));

  const [{ data: tokens }, { data: settings }, { data: alreadySent }] = await Promise.all([
    admin.from("device_tokens").select("athlete_id, token, tz").in("athlete_id", athleteIds),
    admin
      .from("athlete_settings")
      .select("id, tz, notifications_opt_in")
      .in("id", athleteIds),
    admin
      .from("notification_sends")
      .select("athlete_id, game_id, kind")
      .in("athlete_id", athleteIds),
  ]);

  const optedIn = new Set(
    (settings ?? []).filter((s) => s.notifications_opt_in).map((s) => s.id),
  );
  const tzById = new Map((settings ?? []).map((s) => [s.id, s.tz]));

  const tokensByAthlete = new Map<string, string[]>();
  (tokens ?? []).forEach((t) => {
    const list = tokensByAthlete.get(t.athlete_id) ?? [];
    list.push(t.token);
    tokensByAthlete.set(t.athlete_id, list);
  });

  const sentKeys = new Set(
    (alreadySent ?? []).map((s) => `${s.athlete_id}:${s.game_id}:${s.kind}`),
  );

  const messages: PushMessage[] = [];
  const ledger: { athlete_id: string; game_id: string; kind: string }[] = [];

  for (const game of rows) {
    if (!optedIn.has(game.athlete_id)) continue;

    const deviceTokens = tokensByAthlete.get(game.athlete_id) ?? [];
    if (deviceTokens.length === 0) continue;

    const tz = tzById.get(game.athlete_id) ?? null;
    const start = new Date(game.starts_at);
    const minutesOut = (start.getTime() - now.getTime()) / 60_000;
    const hourLocal = localHour(tz, now);

    const push = (kind: string, title: string, body: string, route: string) => {
      if (sentKeys.has(`${game.athlete_id}:${game.id}:${kind}`)) return;
      deviceTokens.forEach((to) =>
        messages.push({ to, title, body, data: { route }, channelId: "gameday" }),
      );
      ledger.push({ athlete_id: game.athlete_id, game_id: game.id, kind });
      sentKeys.add(`${game.athlete_id}:${game.id}:${kind}`);
    };

    const name = game.opponent ?? "Tomorrow";

    // Night before — 9pm local, and only when the game is genuinely tomorrow
    // rather than later in the week.
    if (hourLocal === 21 && minutesOut > 8 * 60 && minutesOut < 26 * 60) {
      push(
        "night_before",
        `${name} tomorrow`,
        "Put it down before you try to sleep. Two minutes.",
        "/(tabs)",
      );
    }

    // Warmup — 75 minutes out, caught inside the hour the cron runs.
    if (minutesOut <= 75 && minutesOut > 15) {
      push(
        "warmup",
        game.opponent ? `${game.opponent} — it's close` : "It's close",
        "Headphones in. Your warmup runs itself.",
        `/gameday/${game.id}`,
      );
    }
  }

  if (messages.length === 0) {
    return NextResponse.json({ sent: 0, considered: rows.length });
  }

  // The ledger is written before the send, not after. A notification that was
  // delivered but not recorded would fire again next hour; one recorded but
  // not delivered is simply missed. Missing one is the better failure.
  const { error: ledgerError } = await admin
    .from("notification_sends")
    .upsert(ledger, { onConflict: "athlete_id,game_id,kind", ignoreDuplicates: true });

  if (ledgerError) {
    console.error("[cron/gameday-prep] ledger", ledgerError);
    return NextResponse.json({ error: "ledger failed" }, { status: 500 });
  }

  const { sent, invalidTokens } = await sendPush(messages);
  await pruneTokens(invalidTokens);

  return NextResponse.json({ sent, considered: rows.length, pruned: invalidTokens.length });
}
