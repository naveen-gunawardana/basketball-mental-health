import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

/**
 * Shared plumbing for the Gameday mobile API (`/api/app/v1/*`).
 *
 * The website authenticates with cookies through @supabase/ssr. The app can't:
 * it holds a session in the device keychain and sends a bearer token. So these
 * routes verify the token directly and then do their privileged work with the
 * service role.
 *
 * Only work that genuinely needs a secret lives here — push, transcription,
 * the safety scan, insight computation. Everything an athlete owns is read and
 * written straight through supabase-js against RLS, which is faster and
 * survives being offline.
 */

export function getAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  return createAdminClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type AppUser = { id: string; email: string | null };

/**
 * Verifies the bearer token and returns the athlete, or null.
 *
 * The token is checked against Supabase rather than decoded locally, so a
 * revoked session stops working immediately instead of at expiry.
 */
export async function getAppUser(request: Request): Promise<AppUser | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice(7).trim();
  if (!token) return null;

  const admin = getAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;

  return { id: data.user.id, email: data.user.email ?? null };
}

export function unauthorized() {
  return NextResponse.json({ error: "Sign in again to keep going." }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(message = "Something went wrong on our end.") {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Wraps a handler with token verification so every route doesn't repeat it.
 * A thrown error becomes a 500 with a generic message — the details go to the
 * server log, never to a teenager's phone screen.
 */
export function withAppUser(
  handler: (user: AppUser, request: Request) => Promise<Response>,
) {
  return async (request: Request): Promise<Response> => {
    try {
      const user = await getAppUser(request);
      if (!user) return unauthorized();
      return await handler(user, request);
    } catch (err) {
      console.error("[app-api]", err);
      return serverError();
    }
  };
}

/** Guards the cron routes. Vercel sends this header on scheduled invocations. */
export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/* ── Expo push ─────────────────────────────────────────────────────────────
 * Sent straight to Expo's HTTP endpoint rather than through the SDK — it's one
 * POST and pulling in the SDK for it would be the larger dependency.
 */

export type PushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channelId?: string;
};

export async function sendPush(messages: PushMessage[]): Promise<{
  sent: number;
  invalidTokens: string[];
}> {
  if (messages.length === 0) return { sent: 0, invalidTokens: [] };

  const invalidTokens: string[] = [];
  let sent = 0;

  // Expo caps a request at 100 messages.
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(
        batch.map((m) => ({ ...m, sound: null, priority: "normal" })),
      ),
    });

    if (!res.ok) {
      console.error("[push] Expo returned", res.status, await res.text());
      continue;
    }

    const json = (await res.json()) as {
      data?: { status: string; details?: { error?: string } }[];
    };

    json.data?.forEach((ticket, idx) => {
      if (ticket.status === "ok") {
        sent += 1;
        return;
      }
      // A dead token stays dead — collect it so the caller can prune it rather
      // than retrying it every hour forever.
      if (ticket.details?.error === "DeviceNotRegistered") {
        invalidTokens.push(batch[idx].to);
      }
    });
  }

  return { sent, invalidTokens };
}

/** Drops tokens Expo told us are dead. */
export async function pruneTokens(tokens: string[]) {
  if (tokens.length === 0) return;
  const admin = getAdmin();
  await admin.from("device_tokens").delete().in("token", tokens);
}

/** The local hour for an athlete right now, given their IANA timezone. */
export function localHour(tz: string | null | undefined, at = new Date()): number {
  try {
    return Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz || "America/New_York",
        hour: "numeric",
        hour12: false,
      }).format(at),
    );
  } catch {
    // An unknown timezone shouldn't stop everyone else's notifications.
    return at.getUTCHours();
  }
}
