import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

/**
 * Re-enroll a player into another month of 1-on-1 mentorship with the SAME
 * mentor as their most recently completed program. Self-serve: creates a fresh
 * active engagement (the mentor sees the new active match in their Locker Room).
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const admin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );

  // Already in an active program? No-op (don't double-enroll).
  const { data: active } = await admin
    .from("matches")
    .select("id")
    .eq("player_id", user.id)
    .eq("status", "active")
    .limit(1);
  if (active && active.length > 0) {
    return NextResponse.json({ ok: true, alreadyActive: true });
  }

  // Most recent completed program → re-enroll with the same mentor.
  const { data: prev } = await admin
    .from("matches")
    .select("mentor_id")
    .eq("player_id", user.id)
    .eq("status", "completed")
    .order("program_end", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!prev) {
    return NextResponse.json({ error: "No completed program to re-enroll from." }, { status: 400 });
  }

  const programStart = new Date();
  const programEnd = new Date(programStart);
  programEnd.setUTCDate(programEnd.getUTCDate() + 28);

  const { data: created, error } = await admin
    .from("matches")
    .insert({
      player_id: user.id,
      mentor_id: prev.mentor_id,
      status: "active",
      program_start: programStart.toISOString().slice(0, 10),
      program_end: programEnd.toISOString().slice(0, 10),
    })
    .select("id")
    .single();

  if (error || !created) {
    return NextResponse.json({ error: error?.message ?? "Could not re-enroll." }, { status: 500 });
  }

  // Scaffold the 4 weekly sessions (weeks 1–4) at 5pm UTC, on the hour.
  const calls = Array.from({ length: 4 }, (_, i) => {
    const when = new Date();
    when.setUTCDate(when.getUTCDate() + 7 * (i + 1));
    when.setUTCHours(17, 0, 0, 0);
    return {
      match_id: created.id,
      proposed_by: prev.mentor_id,
      scheduled_at: when.toISOString(),
      note: `Session ${i + 1} of 4 — auto-scheduled. Reschedule if this time doesn't work.`,
    };
  });
  await admin.from("scheduled_calls").insert(calls);

  return NextResponse.json({ ok: true, matchId: created.id });
}
