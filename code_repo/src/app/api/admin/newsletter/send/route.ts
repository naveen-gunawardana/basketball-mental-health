import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { EMAIL_FROM, BASE_URL } from "@/lib/email";
import { getResend, getAudienceId, sendBroadcast } from "@/lib/resend";
import { buildIssueHtml } from "@/lib/email-html";

function getAdmin() {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: Request) {
  // Verify caller is an admin (API routes aren't covered by middleware).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Missing service key" }, { status: 500 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email is not configured (RESEND_API_KEY missing)." }, { status: 500 });
  }

  const { issueId } = await request.json();
  if (!issueId) {
    return NextResponse.json({ error: "issueId required" }, { status: 400 });
  }

  const admin = getAdmin();
  const { data: issue } = await admin
    .from("newsletter_issues")
    .select("id, slug, subject, title, preview_text, content, status")
    .eq("id", issueId)
    .maybeSingle();

  if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  if (issue.status === "sent") {
    return NextResponse.json({ error: "This issue has already been sent." }, { status: 400 });
  }

  // How many subscribers will receive it (our source of truth).
  const { count: subCount } = await admin
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true })
    .eq("status", "subscribed");
  const recipientCount = subCount ?? 0;

  let mode: "broadcast" | "direct";
  let broadcastId: string | null = null;

  if (getAudienceId()) {
    // Preferred path: a single Resend Broadcast to the audience.
    try {
      broadcastId = await sendBroadcast({
        subject: issue.subject,
        previewText: issue.preview_text ?? undefined,
        name: issue.title,
        html: buildIssueHtml({
          title: issue.title,
          contentMd: issue.content,
          unsubscribeUrl: "{{{RESEND_UNSUBSCRIBE_URL}}}",
        }),
      });
      mode = "broadcast";
    } catch (err) {
      console.error("broadcast send failed:", err);
      return NextResponse.json({ error: `Broadcast failed: ${String(err)}` }, { status: 500 });
    }
  } else {
    // Fallback: send directly to our subscriber list in batches.
    mode = "direct";
    const resend = getResend()!;
    const { data: subs } = await admin
      .from("newsletter_subscribers")
      .select("email, unsubscribe_token")
      .eq("status", "subscribed");

    const list = subs ?? [];
    const BATCH = 40;
    for (let i = 0; i < list.length; i += BATCH) {
      const chunk = list.slice(i, i + BATCH);
      await Promise.all(
        chunk.map((s) =>
          resend.emails
            .send({
              from: EMAIL_FROM,
              to: s.email,
              subject: issue.subject,
              html: buildIssueHtml({
                title: issue.title,
                contentMd: issue.content,
                unsubscribeUrl: `${BASE_URL}/api/newsletter/unsubscribe?token=${s.unsubscribe_token}`,
              }),
            })
            .catch((e) => console.error(`send to ${s.email} failed:`, e)),
        ),
      );
    }
  }

  await admin
    .from("newsletter_issues")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      recipient_count: recipientCount,
      resend_broadcast_id: broadcastId,
    })
    .eq("id", issue.id);

  return NextResponse.json({ ok: true, mode, recipientCount, broadcastId });
}
