import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

/**
 * Public read endpoint for group sessions. Returns published sessions enriched
 * with live RSVP counts (computed via the service role, since RSVP rows are
 * private). Supports `?slug=` to fetch a single session for the detail page.
 */
function getAdmin() {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ sessions: [] });
  }
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  const admin = getAdmin();

  let query = admin
    .from("group_sessions")
    .select("id, slug, title, description, host_name, host_title, sport, topic, starts_at, duration_min, meeting_url, capacity, cover_url, status")
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (slug) query = query.eq("slug", slug);

  const { data: sessions, error } = await query;
  if (error) {
    console.error("group-sessions list error:", error);
    return NextResponse.json({ sessions: [] }, { status: 500 });
  }

  const ids = (sessions ?? []).map((s) => s.id);
  const counts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: rsvps } = await admin
      .from("session_rsvps")
      .select("session_id")
      .in("session_id", ids);
    for (const r of rsvps ?? []) {
      counts.set(r.session_id, (counts.get(r.session_id) ?? 0) + 1);
    }
  }

  const now = Date.now();
  const enriched = (sessions ?? []).map((s) => {
    const rsvpCount = counts.get(s.id) ?? 0;
    const isPast = new Date(s.starts_at).getTime() < now;
    // Don't leak the join URL until someone has the page; it's fine to include
    // for published sessions (it's the same link emailed on RSVP).
    return {
      ...s,
      rsvpCount,
      spotsLeft: s.capacity != null ? Math.max(0, s.capacity - rsvpCount) : null,
      isFull: s.capacity != null && rsvpCount >= s.capacity,
      isPast,
    };
  });

  if (slug) {
    return NextResponse.json({ session: enriched[0] ?? null });
  }
  return NextResponse.json({ sessions: enriched });
}
