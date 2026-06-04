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

/**
 * One-click unsubscribe via a per-subscriber token. Linked from the footer of
 * direct sends. (Resend broadcasts add their own unsubscribe link too.)
 * Always redirects to a friendly confirmation page.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token && process.env.SUPABASE_SERVICE_ROLE_KEY) {
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

  return NextResponse.redirect(`${BASE_URL}/newsletter?unsubscribed=1`);
}
