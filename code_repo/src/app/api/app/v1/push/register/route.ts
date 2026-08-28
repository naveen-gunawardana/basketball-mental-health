import { NextResponse } from "next/server";
import { badRequest, getAdmin, withAppUser } from "@/lib/app-api";

/**
 * Expo push token registration.
 *
 * The token carries the athlete's timezone so the hourly prep cron can resolve
 * their local 9pm without a second lookup. Re-registering the same token just
 * refreshes `last_seen`, which is how a token that moved between accounts gets
 * reattached rather than duplicated.
 */

export const POST = withAppUser(async (user, request) => {
  let body: { token?: string; platform?: string; tz?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request.");
  }

  const token = body.token?.trim();
  const platform = body.platform;

  if (!token) return badRequest("Missing push token.");
  if (platform !== "ios" && platform !== "android") {
    return badRequest("Unknown platform.");
  }

  const admin = getAdmin();

  const { error } = await admin.from("device_tokens").upsert(
    {
      athlete_id: user.id,
      token,
      platform,
      tz: body.tz ?? null,
      last_seen: new Date().toISOString(),
    },
    { onConflict: "token" },
  );

  if (error) {
    console.error("[push/register]", error);
    return NextResponse.json({ error: "Couldn't save that." }, { status: 500 });
  }

  // Keep the settings row's timezone in step — the crons read it from there
  // for athletes who have no live token.
  if (body.tz) {
    await admin.from("athlete_settings").update({ tz: body.tz }).eq("id", user.id);
  }

  return NextResponse.json({ ok: true });
});

export const DELETE = withAppUser(async (user, request) => {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request.");
  }

  const token = body.token?.trim();
  if (!token) return badRequest("Missing push token.");

  const admin = getAdmin();

  // Scoped to the athlete so a stale token can't be used to unregister
  // somebody else's device.
  const { error } = await admin
    .from("device_tokens")
    .delete()
    .eq("token", token)
    .eq("athlete_id", user.id);

  if (error) {
    console.error("[push/register:delete]", error);
    return NextResponse.json({ error: "Couldn't remove that." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
});
