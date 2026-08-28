import {
  differenceInMinutes,
  differenceInCalendarDays,
  isSameDay,
  format,
  addMinutes,
} from "date-fns";
import type { SportId } from "@/data/catalog";

export type GameStatus = "upcoming" | "live" | "complete" | "skipped";
export type Venue = "home" | "away" | "neutral";
export type GameKind = "game" | "practice" | "tryout" | "meet" | "scrimmage";

export type Game = {
  id: string;
  athlete_id: string;
  sport: SportId;
  kind: GameKind;
  opponent: string | null;
  starts_at: string;
  tz: string;
  venue: Venue | null;
  status: GameStatus;
  result: "win" | "loss" | "draw" | null;
  created_at: string;
};

export type GameEntry = {
  id: string;
  game_id: string;
  athlete_id: string;
  phase: "night_before" | "walk_in" | "warmup" | "in_game";
  pressure: number | null;
  energy: number | null;
  valence: number | null;
  arousal: number | null;
  sleep_hours: number | null;
  body_areas: string[] | null;
  controllable: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type Debrief = {
  id: string;
  game_id: string;
  athlete_id: string;
  performance: number;
  effort: number | null;
  mindset: number | null;
  routine_followed: boolean | null;
  worked: string[] | null;
  didnt: string[] | null;
  letting_go: string | null;
  voice_path: string | null;
  transcript: string | null;
  reflection_id: string | null;
  created_at: string;
};

/**
 * Where the athlete is in the arc of one game.
 *
 * This is the app's whole state machine. The NOW screen renders exactly one
 * thing, chosen by this, which is what keeps it from turning into a dashboard.
 */
export type Phase =
  | "none" // no game loaded
  | "far" // 3+ days out
  | "near" // 1-2 days out
  | "night_before" // evening before game day
  | "morning" // game day, more than 4h out
  | "gameday" // inside 4h — the takeover
  | "live" // between start and estimated end
  | "debrief" // ended, no debrief filed
  | "settled"; // debrief filed, waiting on the next game

/** How long a competition runs, by sport, for estimating the end. */
const DURATION_MIN: Partial<Record<SportId, number>> = {
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

export function estimatedEnd(game: Game): Date {
  const mins = DURATION_MIN[game.sport] ?? 120;
  return addMinutes(new Date(game.starts_at), mins);
}

export function phaseOf(
  game: Game | null,
  hasDebrief: boolean,
  now = new Date(),
): Phase {
  if (!game) return "none";
  if (game.status === "complete" && hasDebrief) return "settled";

  const start = new Date(game.starts_at);
  const end = estimatedEnd(game);
  const minsToStart = differenceInMinutes(start, now);

  if (now >= end) return hasDebrief ? "settled" : "debrief";
  if (now >= start) return "live";
  if (minsToStart <= 240) return "gameday";

  if (isSameDay(start, now)) return "morning";

  const days = differenceInCalendarDays(start, now);
  // "Night before" starts at 6pm the day before and runs until bed.
  if (days === 1 && now.getHours() >= 18) return "night_before";
  if (days <= 2) return "near";
  return "far";
}

/** True while the app should wear the Gameday surface. */
export function isGamedaySurface(phase: Phase): boolean {
  return phase === "gameday" || phase === "live";
}

/* ── Formatting ─────────────────────────────────────────────────────────── */

export function countdown(game: Game, now = new Date()): {
  value: string;
  unit: string;
  urgent: boolean;
} {
  const start = new Date(game.starts_at);
  const mins = differenceInMinutes(start, now);

  if (mins < 0) return { value: "Now", unit: "", urgent: true };
  if (mins < 60) return { value: String(mins), unit: mins === 1 ? "minute" : "minutes", urgent: true };

  const hours = Math.floor(mins / 60);
  if (hours < 24) return { value: String(hours), unit: hours === 1 ? "hour" : "hours", urgent: hours <= 4 };

  const days = differenceInCalendarDays(start, now);
  return { value: String(days), unit: days === 1 ? "day" : "days", urgent: false };
}

export function gameTitle(game: Game): string {
  if (game.opponent) return game.opponent;
  if (game.kind === "practice") return "Practice";
  if (game.kind === "tryout") return "Tryouts";
  if (game.kind === "meet") return "Meet";
  if (game.kind === "scrimmage") return "Scrimmage";
  return "Game";
}

export function gameWhen(game: Game, now = new Date()): string {
  const d = new Date(game.starts_at);
  if (isSameDay(d, now)) return `Today · ${format(d, "h:mm a")}`;
  const days = differenceInCalendarDays(d, now);
  if (days === 1) return `Tomorrow · ${format(d, "h:mm a")}`;
  if (days === -1) return `Yesterday · ${format(d, "h:mm a")}`;
  if (days > 1 && days < 7) return format(d, "EEEE · h:mm a");
  return format(d, "MMM d · h:mm a");
}

export function venueLabel(venue: Venue | null): string {
  if (venue === "home") return "Home";
  if (venue === "away") return "Away";
  if (venue === "neutral") return "Neutral";
  return "";
}

/**
 * Copy for each phase of the arc. Kept here rather than in the components so
 * the whole voice of the app can be read in one place — and so it stays in the
 * register of a teammate two years older, not a therapist.
 */
export const PHASE_COPY: Record<
  Phase,
  { eyebrow: string; title: string; body: string; cta: string | null }
> = {
  none: {
    eyebrow: "Nothing loaded",
    title: "Add your next game",
    body: "Everything in here hangs off one game. Put one in and the app starts working.",
    cta: "Add a game",
  },
  far: {
    eyebrow: "Building",
    title: "Take today's rep",
    body: "Two minutes on the thing you said is hardest. This is how it's there when you need it.",
    cta: "Start",
  },
  near: {
    eyebrow: "Close now",
    title: "Get your reps in",
    body: "A couple of days out is when prep actually helps. Later it's just nerves.",
    cta: "Start",
  },
  night_before: {
    eyebrow: "Night before",
    title: "Put it down",
    body: "Say what you're carrying, see tomorrow once, then leave your phone face-down.",
    cta: "Wind down",
  },
  morning: {
    eyebrow: "Game day",
    title: "How are you walking in?",
    body: "Thirty seconds, then pick the one thing you control today.",
    cta: "Check in",
  },
  gameday: {
    eyebrow: "It's close",
    title: "Run your warmup",
    body: "Headphones in. It runs itself.",
    cta: "Start warmup",
  },
  live: {
    eyebrow: "Live",
    title: "Reset",
    body: "Thirty seconds. Nothing gets logged.",
    cta: "Reset",
  },
  debrief: {
    eyebrow: "It's done",
    title: "What actually happened?",
    body: "Ninety seconds, before you sleep on it. Rate the performance, not the result.",
    cta: "Debrief",
  },
  settled: {
    eyebrow: "Logged",
    title: "That one's closed",
    body: "Add your next game when you know it.",
    cta: "Add a game",
  },
};
