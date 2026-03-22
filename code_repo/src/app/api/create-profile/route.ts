import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

const admin = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, name, role, sport, playerProfile, mentorProfile } = body;

  if (!userId || !name || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = admin();

  // Verify the user actually exists in auth
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
  if (authError || !authUser?.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    name,
    role,
    sport: sport || null,
  });

  if (profileError && profileError.code !== "23505") {
    // 23505 = unique violation (profile already exists — ignore)
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (role === "player" && playerProfile) {
    await supabase.from("player_profiles").insert({ id: userId, ...playerProfile });
  } else if (role === "mentor" && mentorProfile) {
    await supabase.from("mentor_profiles").insert({ id: userId, ...mentorProfile });
  }

  return NextResponse.json({ ok: true });
}
