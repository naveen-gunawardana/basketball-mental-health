import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { EMAIL_FROM as FROM, BASE_URL } from "@/lib/email";

// Daily cron. Emails a reminder to everyone who RSVP'd to a published group
// session that starts within the next 24 hours. Protected by CRON_SECRET —
// accepts either `?secret=` (manual) or Vercel's `Authorization: Bearer` header.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (secret && searchParams.get("secret") !== secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const admin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  const now = Date.now();
  const windowStart = new Date(now).toISOString();
  const windowEnd = new Date(now + 24 * 60 * 60 * 1000).toISOString();

  const { data: sessions, error } = await admin
    .from("group_sessions")
    .select("id, title, slug, starts_at, meeting_url")
    .eq("status", "published")
    .gte("starts_at", windowStart)
    .lte("starts_at", windowEnd);

  if (error) {
    console.error("session-reminders query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ ok: true, sessions: 0, sent: 0 });
  }

  let sent = 0;
  for (const session of sessions) {
    const { data: rsvps } = await admin
      .from("session_rsvps")
      .select("name, email")
      .eq("session_id", session.id);

    if (!rsvps || rsvps.length === 0) continue;

    const d = new Date(session.starts_at);
    const when =
      d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) +
      " at " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });

    const BATCH = 40;
    for (let i = 0; i < rsvps.length; i += BATCH) {
      const chunk = rsvps.slice(i, i + BATCH);
      await Promise.all(
        chunk.map((r) =>
          resend.emails
            .send({
              from: FROM,
              to: r.email,
              subject: `Tomorrow: ${session.title}`,
              html: `<p>Hi ${r.name.split(" ")[0]},</p>
<p>A quick reminder — <strong>${session.title}</strong> is coming up <strong>${when}</strong>.</p>
${session.meeting_url ? `<p>Join here when it's time:<br/><a href="${session.meeting_url}">${session.meeting_url}</a></p>` : ""}
<p>Full details: <a href="${BASE_URL}/group-sessions/${session.slug}">${BASE_URL}/group-sessions/${session.slug}</a></p>
<p>See you there.<br/>— The Mentality Sports Team</p>`,
            })
            .then(() => { sent++; })
            .catch((e) => console.error(`reminder to ${r.email} failed:`, e)),
        ),
      );
    }
  }

  return NextResponse.json({ ok: true, sessions: sessions.length, sent });
}
