import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { EMAIL_FROM, BASE_URL } from "@/lib/email";
import { getResend } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";

function getAdmin() {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function formatWhen(startsAt: string): string {
  const d = new Date(startsAt);
  return (
    d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) +
    " at " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })
  );
}

export async function POST(request: Request) {
  // RSVP requires a signed-in account — we RSVP them with their account email.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Please sign in to RSVP." }, { status: 401 });
  }

  let payload: { sessionId?: string; name?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const sessionId = payload.sessionId?.trim();
  const email = user.email.toLowerCase();
  const name =
    payload.name?.trim() ||
    (user.user_metadata?.name as string | undefined)?.trim() ||
    user.email.split("@")[0];

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session." }, { status: 400 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const admin = getAdmin();

  const { data: session } = await admin
    .from("group_sessions")
    .select("id, title, slug, starts_at, duration_min, meeting_url, capacity, status, host_name")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session || session.status !== "published") {
    return NextResponse.json({ error: "This session is no longer available." }, { status: 404 });
  }

  // Idempotent: if they already RSVP'd, just resend the confirmation.
  const { data: existing } = await admin
    .from("session_rsvps")
    .select("id")
    .eq("session_id", sessionId)
    .eq("email", email)
    .maybeSingle();

  const { count } = await admin
    .from("session_rsvps")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId);

  const taken = count ?? 0;

  if (!existing) {
    if (session.capacity != null && taken >= session.capacity) {
      return NextResponse.json({ error: "This session is full." }, { status: 409 });
    }
    const { error } = await admin.from("session_rsvps").insert({
      session_id: sessionId,
      name,
      email,
    });
    if (error && error.code !== "23505") {
      console.error("rsvp insert error:", error);
      return NextResponse.json({ error: "Could not save your RSVP. Try again." }, { status: 500 });
    }
  }

  const spotsLeft =
    session.capacity != null ? Math.max(0, session.capacity - (taken + (existing ? 0 : 1))) : null;

  // Confirmation email (best-effort).
  const resend = getResend();
  if (resend) {
    try {
      const when = formatWhen(session.starts_at);
      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: `You're in: ${session.title}`,
        html: `<p>Hi ${name.split(" ")[0]},</p>
<p>You're confirmed for <strong>${session.title}</strong>.</p>
<p><strong>When:</strong> ${when}<br/>
<strong>Where:</strong> Online${session.meeting_url ? ` — <a href="${session.meeting_url}">join here</a>` : ""}</p>
${session.meeting_url ? `<p>Save this link — it's how you'll join:<br/><a href="${session.meeting_url}">${session.meeting_url}</a></p>` : ""}
<p>We'll send a reminder before it starts. See the full session details <a href="${BASE_URL}/group-sessions/${session.slug}">here</a>.</p>
<p>— The Mentality Sports Team</p>`,
      });
    } catch (err) {
      console.error("rsvp confirmation email failed:", err);
    }
  }

  return NextResponse.json({ ok: true, alreadyRsvped: !!existing, spotsLeft });
}
