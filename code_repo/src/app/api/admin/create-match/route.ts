import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const { playerId, mentorId } = await request.json();
  if (!playerId || !mentorId) {
    return NextResponse.json({ error: "playerId and mentorId required" }, { status: 400 });
  }

  const admin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );

  const { data: created, error } = await admin
    .from("matches")
    .insert({ player_id: playerId, mentor_id: mentorId, status: "active" })
    .select("id")
    .single();

  if (error || !created) {
    return NextResponse.json({ error: error?.message ?? "match insert failed" }, { status: 500 });
  }

  // Auto-schedule an intro call ~7 days out at 5pm UTC, on the hour.
  // Mentors/mentees will typically reschedule — this just plants a marker.
  const intro = new Date();
  intro.setUTCDate(intro.getUTCDate() + 7);
  intro.setUTCHours(17, 0, 0, 0);

  const { error: callError } = await admin
    .from("scheduled_calls")
    .insert({
      match_id: created.id,
      proposed_by: mentorId,
      scheduled_at: intro.toISOString(),
      note: "Intro call — auto-scheduled. Reschedule if this time doesn't work.",
    });

  // Don't fail the match creation if the auto-call insert fails — just log.
  if (callError) {
    console.error("auto-schedule intro call failed:", callError.message);
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const { matchId } = await request.json();
  if (!matchId) {
    return NextResponse.json({ error: "matchId required" }, { status: 400 });
  }

  const admin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );

  const { error } = await admin
    .from("matches")
    .update({ status: "inactive" })
    .eq("id", matchId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
