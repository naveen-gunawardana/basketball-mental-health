import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  // Ensure profile row exists — if not, send them back to complete signup
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/signup");
  }

  const role = profile.role ?? user.user_metadata?.role;

  if (role === "mentor") {
    redirect("/dashboard/mentor");
  } else {
    redirect("/dashboard/player");
  }
}
