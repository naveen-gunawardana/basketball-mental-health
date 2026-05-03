import { createClient } from "@supabase/supabase-js";
import { AdviceClient } from "./AdviceClient";

export const revalidate = 3600;

async function getArticles() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("resources")
    .select("id, title, slug, excerpt, category, sport, media_type, read_time, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return data ?? [];
}

export default async function AdvicePage() {
  const articles = await getArticles();
  return <AdviceClient articles={articles} />;
}
