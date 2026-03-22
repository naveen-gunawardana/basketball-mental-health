import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Mentality Sports <hello@mentalitysports.com>";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mentalitysports.com";

function getAdmin() {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function getUserEmail(userId: string): Promise<string | null> {
  const { data } = await getAdmin().auth.admin.getUserById(userId);
  return data?.user?.email ?? null;
}

export async function POST(request: Request) {
  const payload = await request.json();
  const { type } = payload;

  try {
    if (type === "welcome") {
      const { email, name, role } = payload;
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: "Welcome to Mentality Sports",
        html: `<p>Hi ${name},</p>
<p>Welcome to Mentality Sports!</p>
${role === "player"
  ? `<p>Our team is reviewing your application and will match you with a mentor soon. We'll reach out by email when you're matched.</p>`
  : `<p>Our team is reviewing your mentor application. You'll hear back within a few days once you're approved.</p>`}
<p>While you wait, check out our advice library: <a href="${BASE_URL}/advice">${BASE_URL}/advice</a></p>
<p>— The Mentality Sports Team</p>`,
      });

    } else if (type === "match_created") {
      const { playerEmail, playerName, mentorEmail, mentorName } = payload;
      await Promise.all([
        resend.emails.send({
          from: FROM,
          to: playerEmail,
          subject: "You've been matched with a mentor",
          html: `<p>Hi ${playerName},</p>
<p>Great news — you've been matched with <strong>${mentorName}</strong> on Mentality Sports.</p>
<p>Head to your <a href="${BASE_URL}/dashboard">Locker Room</a> to send your first message and get started.</p>
<p>— The Mentality Sports Team</p>`,
        }),
        resend.emails.send({
          from: FROM,
          to: mentorEmail,
          subject: "You've been matched with an athlete",
          html: `<p>Hi ${mentorName},</p>
<p>You've been matched with <strong>${playerName}</strong> on Mentality Sports.</p>
<p>Head to your <a href="${BASE_URL}/dashboard">Locker Room</a> to introduce yourself and review their profile.</p>
<p>— The Mentality Sports Team</p>`,
        }),
      ]);

    } else if (type === "mentor_approved") {
      const { email, name } = payload;
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: "Your Mentality Sports application has been approved",
        html: `<p>Hi ${name},</p>
<p>Your application to become a mentor on Mentality Sports has been approved!</p>
<p>We're now working on finding the right athlete for you. Once matched, you'll get another email and your mentee will appear in your <a href="${BASE_URL}/dashboard">Locker Room</a>.</p>
<p>Thanks for giving back to the next generation of athletes.</p>
<p>— The Mentality Sports Team</p>`,
      });

    } else if (type === "call_scheduled") {
      const { matchId, scheduledAt, proposedById, note } = payload;
      const admin = getAdmin();

      const { data: match } = await admin
        .from("matches")
        .select("mentor_id, player_id")
        .eq("id", matchId)
        .single();
      if (!match) return NextResponse.json({ ok: true });

      const recipientId = proposedById === match.mentor_id ? match.player_id : match.mentor_id;

      const [{ data: proposerProfile }, { data: recipientProfile }, recipientEmail] = await Promise.all([
        admin.from("profiles").select("name").eq("id", proposedById).single(),
        admin.from("profiles").select("name").eq("id", recipientId).single(),
        getUserEmail(recipientId),
      ]);

      if (!recipientEmail) return NextResponse.json({ ok: true });

      const d = new Date(scheduledAt);
      const formatted = d.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      }) + " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

      await resend.emails.send({
        from: FROM,
        to: recipientEmail,
        subject: `Call scheduled for ${formatted}`,
        html: `<p>Hi ${recipientProfile?.name ?? "there"},</p>
<p><strong>${proposerProfile?.name ?? "Your match"}</strong> has scheduled a call with you for <strong>${formatted}</strong>.</p>
${note ? `<p>Note: ${note}</p>` : ""}
<p>See it in your <a href="${BASE_URL}/dashboard">Locker Room</a>.</p>
<p>— The Mentality Sports Team</p>`,
      });

    } else if (type === "new_message") {
      const { matchId, senderId } = payload;
      const admin = getAdmin();

      const { data: match } = await admin
        .from("matches")
        .select("mentor_id, player_id")
        .eq("id", matchId)
        .single();
      if (!match) return NextResponse.json({ ok: true });

      const recipientId = senderId === match.mentor_id ? match.player_id : match.mentor_id;

      // Only notify if the conversation has been quiet for 30+ minutes
      // to avoid flooding when both parties are actively chatting
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: recentMessages } = await admin
        .from("messages")
        .select("id")
        .eq("match_id", matchId)
        .neq("sender_id", senderId)
        .gte("created_at", thirtyMinsAgo)
        .limit(1);

      // If the recipient sent a message in the last 30 min, they're likely active
      if (recentMessages && recentMessages.length > 0) {
        return NextResponse.json({ ok: true, skipped: true });
      }

      const [{ data: senderProfile }, { data: recipientProfile }, recipientEmail] = await Promise.all([
        admin.from("profiles").select("name").eq("id", senderId).single(),
        admin.from("profiles").select("name").eq("id", recipientId).single(),
        getUserEmail(recipientId),
      ]);

      if (!recipientEmail) return NextResponse.json({ ok: true });

      await resend.emails.send({
        from: FROM,
        to: recipientEmail,
        subject: `New message from ${senderProfile?.name ?? "your match"}`,
        html: `<p>Hi ${recipientProfile?.name ?? "there"},</p>
<p>You have a new message from <strong>${senderProfile?.name ?? "your match"}</strong> on Mentality Sports.</p>
<p><a href="${BASE_URL}/dashboard">Go to your Locker Room</a> to read and reply.</p>
<p>— The Mentality Sports Team</p>`,
      });

    } else if (type === "article_approved") {
      const { submittedBy, authorName, title, slug } = payload;
      if (!submittedBy) return NextResponse.json({ ok: true });

      const authorEmail = await getUserEmail(submittedBy);
      if (!authorEmail) return NextResponse.json({ ok: true });

      await resend.emails.send({
        from: FROM,
        to: authorEmail,
        subject: `Your article is now live on Mentality Sports`,
        html: `<p>Hi ${authorName ?? "there"},</p>
<p>Your article <strong>"${title}"</strong> has been approved and is now live in the advice library.</p>
<p><a href="${BASE_URL}/advice/${slug}">Read it here</a></p>
<p>Thank you for contributing to the community.</p>
<p>— The Mentality Sports Team</p>`,
      });

    } else {
      return NextResponse.json({ error: "Unknown notification type" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
