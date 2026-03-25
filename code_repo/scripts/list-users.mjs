import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceKey);
const { data: { users }, error } = await supabase.auth.admin.listUsers();
if (error) { console.error(error.message); process.exit(1); }
users.forEach(u => console.log(u.email, "|", u.id));
