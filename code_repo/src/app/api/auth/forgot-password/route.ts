import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { EMAIL_FROM, BASE_URL } from "@/lib/email";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${BASE_URL}/reset-password`,
    },
  });

  if (error || !data.properties?.action_link) {
    // Don't reveal whether the email exists
    return NextResponse.json({ ok: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Reset your Mentality Sports password",
    html: `<p>Hi,</p>
<p>Click the link below to reset your password. This link expires in 1 hour.</p>
<p><a href="${data.properties.action_link}">Reset password</a></p>
<p>If you didn't request this, you can ignore this email.</p>
<p>— The Mentality Sports Team</p>`,
  });

  return NextResponse.json({ ok: true });
}
