import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { Database } from "@/lib/supabase/types";
import { EMAIL_FROM, BASE_URL } from "@/lib/email";

export async function POST(request: Request) {
  // Verify caller is an admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
    return NextResponse.json({ error: "Server misconfiguration: missing service key" }, { status: 500 });
  }

  const { mentorId, mentorName } = await request.json();
  if (!mentorId) {
    return NextResponse.json({ error: "mentorId required" }, { status: 400 });
  }

  // Use service role to bypass RLS
  const admin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
  );

  const { error } = await admin
    .from("mentor_profiles")
    .update({ approved: true })
    .eq("id", mentorId);

  if (error) {
    console.error("mentor_profiles update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send approval email if Resend is configured
  if (process.env.RESEND_API_KEY && mentorName) {
    try {
      const { data: authUser } = await admin.auth.admin.getUserById(mentorId);
      const email = authUser?.user?.email;
      if (email) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: "Your Mentality Sports application has been approved",
          html: `<p>Hi ${mentorName},</p>
<p>Your application to become a mentor on Mentality Sports has been approved!</p>
<p>We're now working on finding the right athlete for you. Once matched, you'll get another email and your mentee will appear in your <a href="${BASE_URL}/dashboard">Locker Room</a>.</p>
<p>Thanks for giving back to the next generation of athletes.</p>
<p>— The Mentality Sports Team</p>`,
        });
      }
    } catch (emailErr) {
      // Email failure shouldn't block the approval
      console.error("Approval email failed:", emailErr);
    }
  }

  return NextResponse.json({ ok: true });
}
