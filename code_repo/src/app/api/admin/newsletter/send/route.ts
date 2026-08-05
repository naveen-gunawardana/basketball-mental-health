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
  // Verify caller has admin dashboard access (API routes aren't covered by middleware).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.app_metadata?.role;
  if (!role || !["admin", "outreach", "operations"].includes(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Missing service key" }, { status: 500 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email is not configured (RESEND_API_KEY missing)." }, { status: 500 });
  }

  const { issueId, resend: isResend } = await request.json();
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
  // Resending an already-sent issue is allowed only when explicitly requested
  // (the "Resend" button) — a plain "Send now" click should never double-send.
  if (issue.status === "sent" && !isResend) {
    return NextResponse.json({ error: "This issue has already been sent." }, { status: 400 });
  }

  let mode: "broadcast" | "direct";
  let broadcastId: string | null = null;
  let recipientCount = 0;
  const failedEmails: string[] = [];
  // Flag resends in the subject line so anyone who already got this issue
  // doesn't see an unexplained identical duplicate in their inbox.
  const outboundSubject = isResend ? `(Resend) ${issue.subject}` : issue.subject;

  if (getAudienceId()) {
    // Preferred path: a single Resend Broadcast to the audience. Resend owns
    // delivery to the whole list here, so we report our subscriber count as
    // the recipient count (we don't get per-address results back).
    const { count: subCount } = await admin
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "subscribed");
    recipientCount = subCount ?? 0;

    try {
      broadcastId = await sendBroadcast({
        subject: outboundSubject,
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
      const results = await Promise.all(
        chunk.map(async (s) => {
          const unsubscribeUrl = `${BASE_URL}/api/newsletter/unsubscribe?token=${s.unsubscribe_token}`;
          try {
            const { error } = await resend.emails.send({
              from: EMAIL_FROM,
              to: s.email,
              subject: outboundSubject,
              // One-click List-Unsubscribe (RFC 8058). Inbox providers weigh
              // this heavily when deciding whether bulk-looking mail lands
              // in the primary inbox vs. spam.
              headers: {
                "List-Unsubscribe": `<${unsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
              html: buildIssueHtml({
                title: issue.title,
                contentMd: issue.content,
                unsubscribeUrl,
              }),
            });
            // Resend resolves (doesn't throw) on API-level errors, so this
            // check is required — a bare .catch() here would silently miss
            // real failures and report success anyway.
            if (error) throw error;
            return { email: s.email, ok: true as const };
          } catch (e) {
            console.error(`send to ${s.email} failed:`, e);
            return { email: s.email, ok: false as const };
          }
        }),
      );
      for (const r of results) {
        if (r.ok) recipientCount++;
        else failedEmails.push(r.email);
      }
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

  return NextResponse.json({ ok: true, mode, recipientCount, failedCount: failedEmails.length, broadcastId });
}
