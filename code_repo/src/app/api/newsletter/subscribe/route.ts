import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { EMAIL_FROM, BASE_URL } from "@/lib/email";
import { getResend, addContactToAudience } from "@/lib/resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getAdmin() {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: Request) {
  let payload: { email?: string; name?: string; source?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase();
  const name = payload.name?.trim() || null;
  const source = payload.source?.trim() || "site";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
  }

  const admin = getAdmin();

  const { data: existing } = await admin
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (existing && existing.status === "subscribed") {
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  }

  const resendContactId = await addContactToAudience(email, name);

  let isNew = true;
  if (existing) {
    isNew = false;
    await admin
      .from("newsletter_subscribers")
      .update({
        status: "subscribed",
        unsubscribed_at: null,
        ...(name ? { name } : {}),
        ...(resendContactId ? { resend_contact_id: resendContactId } : {}),
      })
      .eq("id", existing.id);
  } else {
    const { error } = await admin.from("newsletter_subscribers").insert({
      email,
      name,
      source,
      status: "subscribed",
      resend_contact_id: resendContactId,
    });
    if (error) {
      console.error("newsletter subscribe insert error:", error);
      return NextResponse.json({ error: "Could not subscribe. Try again." }, { status: 500 });
    }
  }

  // Best-effort welcome email for brand-new subscribers.
  if (isNew) {
    const resend = getResend();
    if (resend) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: "Welcome to The Mental Rep",
          html: `<p>Hey${name ? ` ${name.split(" ")[0]}` : ""},</p>
<p>You're on the list for <strong>The Mental Rep</strong> — our newsletter for athletes who train the mental game like they train everything else.</p>
<p>A couple times a month we'll send one idea you can actually use. No fluff.</p>
<p>While you wait for the next issue, explore everything we do at <a href="${BASE_URL}/programs">mentalitysports.com/programs</a>.</p>
<p>— The Mentality Sports Team</p>`,
        });
      } catch (err) {
        console.error("welcome email failed:", err);
      }
    }
  }

  return NextResponse.json({ ok: true, alreadySubscribed: false });
}
