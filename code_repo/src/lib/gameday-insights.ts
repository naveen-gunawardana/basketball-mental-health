/**
 * The insight engine.
 *
 * The point of the Game Log is that around six debriefed games the app can
 * tell an athlete something about themselves they can't see from the inside.
 * The point of this module is that it only does so when the number of games
 * actually supports it.
 *
 * Every claim carries the game ids behind it, and nothing publishes under six
 * games or a difference too small to mean anything. A confident-sounding
 * finding from four data points would poison trust in the whole feature, and
 * that trust is the only reason the log gets filled in.
 *
 * Shared by the nightly cron (which stores results) and the /insights endpoint
 * (which falls back to computing live for an athlete who crossed the threshold
 * since the last run). One copy, so the two can't drift.
 */

export const MIN_SAMPLE = 6;

/** Below this, a difference in self-rating is noise, not a finding. */
export const MIN_EFFECT = 0.8;

/** Each side of a comparison needs at least this many games. Two is a fluke. */
const MIN_PER_SIDE = 3;

export type LogRow = {
  game_id: string;
  venue: string | null;
  walk_in_pressure: number | null;
  sleep_hours: number | null;
  performance: number | null;
  routine_followed: boolean | null;
};

export type ComputedInsight = {
  kind: string;
  title: string;
  body: string;
  evidence: { game_ids: string[] };
  sample_size: number;
};

export function computeInsights(rows: LogRow[]): ComputedInsight[] {
  const rated = rows.filter((r) => r.performance !== null);
  if (rated.length < MIN_SAMPLE) return [];

  return [routineLift(rated), pressureEffect(rated), sleepFloor(rated), venueEffect(rated)]
    .filter((x): x is ComputedInsight => x !== null);
}

function routineLift(rows: LogRow[]): ComputedInsight | null {
  const withIt = rows.filter((r) => r.routine_followed === true);
  const without = rows.filter((r) => r.routine_followed === false);
  if (withIt.length < MIN_PER_SIDE || without.length < MIN_PER_SIDE) return null;

  const diff = mean(withIt) - mean(without);
  if (Math.abs(diff) < MIN_EFFECT) return null;

  return {
    kind: "routine_lift",
    title: "Your warmup is doing something",
    body:
      diff > 0
        ? `You rate yourself ${diff.toFixed(1)} points higher in games where you finished your warmup. That's the biggest single thing in your log.`
        : `Your ratings are ${Math.abs(diff).toFixed(1)} points lower in games where you ran your warmup — which usually means the routine you built isn't the one you need. Worth rebuilding it.`,
    evidence: { game_ids: ids(withIt, without) },
    sample_size: withIt.length + without.length,
  };
}

function pressureEffect(rows: LogRow[]): ComputedInsight | null {
  const usable = rows.filter((r) => r.walk_in_pressure !== null);
  if (usable.length < MIN_SAMPLE) return null;

  const high = usable.filter((r) => r.walk_in_pressure! >= 7);
  const low = usable.filter((r) => r.walk_in_pressure! <= 4);
  if (high.length < MIN_PER_SIDE || low.length < MIN_PER_SIDE) return null;

  const diff = mean(high) - mean(low);

  // The genuinely useful version of this finding is usually the null result:
  // the nerves are high and it doesn't matter. Worth saying out loud, because
  // most athletes have spent years assuming the opposite.
  if (Math.abs(diff) < MIN_EFFECT) {
    return {
      kind: "pressure_neutral",
      title: "The nerves aren't the problem",
      body: `Across ${usable.length} games, how wound up you were walking in barely moved how you rated the performance. You've been treating the nerves as the thing to fix. They aren't.`,
      evidence: { game_ids: usable.map((r) => r.game_id) },
      sample_size: usable.length,
    };
  }

  return {
    kind: "pressure_effect",
    title: diff > 0 ? "You play better lit up" : "You play better settled",
    body:
      diff > 0
        ? "Your best-rated games come when you walk in at a 7 or higher. Getting calm before a big one might be the wrong goal for you."
        : `You rate yourself ${Math.abs(diff).toFixed(1)} points higher when you walk in under a 5. Bringing it down before tip is worth real time for you.`,
    evidence: { game_ids: ids(high, low) },
    sample_size: high.length + low.length,
  };
}

function sleepFloor(rows: LogRow[]): ComputedInsight | null {
  const usable = rows.filter((r) => r.sleep_hours !== null);
  const short = usable.filter((r) => r.sleep_hours! < 6.5);
  const rested = usable.filter((r) => r.sleep_hours! >= 7.5);
  if (short.length < MIN_PER_SIDE || rested.length < MIN_PER_SIDE) return null;

  const diff = mean(rested) - mean(short);
  if (diff < MIN_EFFECT) return null;

  return {
    kind: "sleep_floor",
    title: "Sleep is showing up in your ratings",
    body: `Games after under six and a half hours come in ${diff.toFixed(1)} points lower than games after seven and a half. That's a bigger gap than most of what you're working on.`,
    evidence: { game_ids: ids(short, rested) },
    sample_size: short.length + rested.length,
  };
}

function venueEffect(rows: LogRow[]): ComputedInsight | null {
  const home = rows.filter((r) => r.venue === "home");
  const away = rows.filter((r) => r.venue === "away");
  if (home.length < MIN_PER_SIDE || away.length < MIN_PER_SIDE) return null;

  const diff = mean(home) - mean(away);
  if (Math.abs(diff) < MIN_EFFECT) return null;

  return {
    kind: "venue",
    title: diff > 0 ? "Away games are costing you" : "You're better on the road",
    body:
      diff > 0
        ? `You rate yourself ${diff.toFixed(1)} points lower away from home. That's a routine problem more often than a talent one — the warmup is the part that changes on the road.`
        : `You rate yourself ${Math.abs(diff).toFixed(1)} points higher away from home. Whatever you do differently on the road, do it at home too.`,
    evidence: { game_ids: ids(home, away) },
    sample_size: home.length + away.length,
  };
}

function mean(rows: LogRow[]): number {
  return rows.reduce((s, r) => s + (r.performance ?? 0), 0) / rows.length;
}

function ids(...groups: LogRow[][]): string[] {
  return groups.flat().map((r) => r.game_id);
}
