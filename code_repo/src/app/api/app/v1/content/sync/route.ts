import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/app-api";

/**
 * Drill sync.
 *
 * The app ships a starter library bundled so day one works with no network at
 * all. This hands down anything published since the version the device already
 * has, and the app caches the result to SQLite — game day happens in buildings
 * with no signal, which is exactly when the drills matter.
 *
 * Unauthenticated on purpose: published drills are public content, and gating
 * them behind a token would mean a cold start with an expired session shows an
 * empty library.
 */

export const revalidate = 300;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const since = Number(url.searchParams.get("since") ?? 0);

  if (!Number.isFinite(since) || since < 0) {
    return NextResponse.json({ error: "Invalid version." }, { status: 400 });
  }

  try {
    const admin = getAdmin();

    const { data, error } = await admin
      .from("drills")
      .select("id, slug, title, category, sports, seconds, blurb, script, audio_path, version")
      .eq("published", true)
      .gt("version", since)
      .order("version", { ascending: true });

    if (error) {
      console.error("[content/sync]", error);
      return NextResponse.json({ error: "Couldn't load drills." }, { status: 500 });
    }

    const drills = (data ?? []).map((d) => ({
      ...d,
      // Audio lives in a public storage bucket; the app only ever needs the URL.
      audio_url: d.audio_path
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gameday-audio/${d.audio_path}`
        : null,
    }));

    const version = drills.reduce((max, d) => Math.max(max, d.version), since);

    return NextResponse.json({ drills, version });
  } catch (err) {
    console.error("[content/sync]", err);
    return NextResponse.json({ error: "Couldn't load drills." }, { status: 500 });
  }
}
