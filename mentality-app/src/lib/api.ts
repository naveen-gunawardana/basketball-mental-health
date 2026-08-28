import Constants from "expo-constants";
import { getAccessToken } from "./supabase";

/**
 * Typed client for the Next.js routes under /api/app/v1.
 *
 * Only work that needs the service-role key or a server secret goes through
 * here — push registration, transcription, the safety scan, insight
 * computation. Everything the athlete owns is read and written straight
 * through supabase-js against RLS, which is faster and survives being offline.
 */

const BASE: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ??
  "https://mentalitysports.org";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = init;

  const h: Record<string, string> = {
    "Content-Type": "application/json",
    ...((headers as Record<string, string>) ?? {}),
  };

  if (auth) {
    const token = await getAccessToken();
    if (!token) throw new ApiError("Not signed in", 401);
    h.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}/api/app/v1${path}`, { ...rest, headers: h });

  if (!res.ok) {
    // Surface the server's message when it wrote one — these strings are
    // written to be shown to the athlete.
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.error === "string") message = body.error;
    } catch {
      // Non-JSON error body. The status line is all we have.
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ── Push ───────────────────────────────────────────────────────────────── */

export const push = {
  register: (token: string, platform: "ios" | "android", tz: string) =>
    request<{ ok: true }>("/push/register", {
      method: "POST",
      body: JSON.stringify({ token, platform, tz }),
    }),

  unregister: (token: string) =>
    request<{ ok: true }>("/push/register", {
      method: "DELETE",
      body: JSON.stringify({ token }),
    }),
};

/* ── Content ────────────────────────────────────────────────────────────── */

export type RemoteDrill = {
  id: string;
  slug: string;
  title: string;
  category: string;
  sports: string[];
  seconds: number;
  script: { steps: unknown[] };
  audio_url: string | null;
  version: number;
};

export const content = {
  /** Drills published since a version. Bundled to SQLite for offline use. */
  sync: (since = 0) =>
    request<{ drills: RemoteDrill[]; version: number }>(
      `/content/sync?since=${since}`,
      { auth: false },
    ),
};

/* ── Voice ──────────────────────────────────────────────────────────────── */

export const voice = {
  /**
   * Uploads a local recording and returns a transcript. The transcript is
   * always editable before anything is saved — a bad transcription of
   * something private is worse than none.
   */
  transcribe: async (uri: string) => {
    const token = await getAccessToken();
    if (!token) throw new ApiError("Not signed in", 401);

    const form = new FormData();
    form.append("audio", {
      uri,
      name: "note.m4a",
      type: "audio/m4a",
    } as unknown as Blob);

    const res = await fetch(`${BASE}/api/app/v1/voice/transcribe`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!res.ok) throw new ApiError("Couldn't transcribe that", res.status);
    return (await res.json()) as { text: string; path: string };
  },
};

/* ── Safety ─────────────────────────────────────────────────────────────── */

export const safety = {
  /**
   * Server-side scan of free text. Returns whether to surface support
   * resources. It never blocks the write and never notifies anyone else.
   */
  scan: (text: string, source: "debrief" | "journal") =>
    request<{ surfaceSupport: boolean }>("/debrief/scan", {
      method: "POST",
      body: JSON.stringify({ text, source }),
    }),
};

/* ── Insight ────────────────────────────────────────────────────────────── */

export type Insight = {
  id: string;
  kind: string;
  title: string;
  body: string;
  sample_size: number;
  evidence: { game_ids: string[] };
  generated_at: string;
};

export const insights = {
  list: () => request<{ insights: Insight[]; gamesLogged: number; threshold: number }>("/insights"),
};

export type SeasonRecap = {
  gamesLogged: number;
  debriefsFiled: number;
  avgPerformance: number | null;
  avgPressure: number | null;
  routineRate: number | null;
  bestGame: { id: string; opponent: string | null; performance: number; date: string } | null;
  pressureSeries: { date: string; pressure: number; performance: number | null }[];
  biggestShift: { label: string; from: number; to: number } | null;
};

export const season = {
  recap: () => request<SeasonRecap>("/season/recap"),
};
