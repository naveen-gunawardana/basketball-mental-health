import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2];

if (!url || !serviceKey) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
if (!email) { console.error("Usage: node scripts/make-admin.mjs <email>"); process.exit(1); }

const supabase = createClient(url, serviceKey);

const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
if (listErr) { console.error("Error listing users:", listErr.message); process.exit(1); }

const user = users.find(u => u.email === email);
if (!user) { console.error(`No user found with email: ${email}`); process.exit(1); }

const { error } = await supabase.auth.admin.updateUserById(user.id, {
  app_metadata: { ...user.app_metadata, role: "admin" },
});

if (error) { console.error("Error updating user:", error.message); process.exit(1); }
console.log(`Done — ${email} (${user.id}) is now an admin.`);
