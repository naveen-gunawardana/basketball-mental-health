import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { BASE_URL } from "@/lib/email";
import { unsubscribeContact } from "@/lib/resend";

function getAdmin() {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function unsubscribeByToken(token: string | null) {
  if (!token || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const admin = getAdmin();
  const { data: sub } = await admin
    .from("newsletter_subscribers")
    .select("id, email")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (sub) {
    await admin
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("id", sub.id);
    await unsubscribeContact(sub.email);
  }
}

/**
 * One-click unsubscribe via a per-subscriber token. Linked from the footer of
 * direct sends. (Resend broadcasts add their own unsubscribe link too.)
 * Always redirects to a friendly confirmation page.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  await unsubscribeByToken(searchParams.get("token"));
  return NextResponse.redirect(`${BASE_URL}/newsletter?unsubscribed=1`);
}

/**
 * RFC 8058 one-click unsubscribe. Mail clients (Gmail, Outlook, etc.) call
 * this directly — via the `List-Unsubscribe-Post` header — without loading
 * any page, so it must respond 200 with no redirect. Having this wired up
 * (plus the List-Unsubscribe header on outgoing mail) is one of the signals
 * inbox providers use to avoid routing bulk-looking mail to spam.
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  await unsubscribeByToken(searchParams.get("token"));
  return new NextResponse(null, { status: 200 });
}
