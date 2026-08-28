import { NextResponse } from "next/server";
import { getAdmin, getAppUser, unauthorized } from "@/lib/app-api";

/**
 * Voice note transcription.
 *
 * The mic is the default affordance in the debrief because thirty seconds of
 * talking in the back of a car beats three sentences of thumb-typing. This
 * turns that recording into text the athlete can edit before anything is
 * saved — a bad transcription of something private is worse than none.
 *
 * The audio goes into a private bucket the athlete alone can read. Nobody at
 * Mentality listens to these, and there's no admin view that surfaces them.
 */

const MAX_BYTES = 12 * 1024 * 1024; // ~4 minutes of m4a

// Multipart bodies need the Node runtime, not edge.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getAppUser(request);
  if (!user) return unauthorized();

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("audio");
    if (value instanceof File) file = value;
  } catch {
    return NextResponse.json({ error: "Couldn't read that recording." }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: "No recording attached." }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That recording is too long." }, { status: 413 });
  }

  const admin = getAdmin();
  const path = `${user.id}/${crypto.randomUUID()}.m4a`;

  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from("gameday-voice")
    .upload(path, bytes, { contentType: "audio/m4a", upsert: false });

  if (uploadError) {
    console.error("[voice/transcribe] upload", uploadError.message);
    return NextResponse.json({ error: "Couldn't save that recording." }, { status: 500 });
  }

  // Transcription is optional infrastructure. If the key isn't configured the
  // recording is still saved and the athlete just types instead — which is a
  // worse experience, not a broken one.
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ text: "", path });
  }

  try {
    const upstream = new FormData();
    upstream.append("file", new Blob([bytes], { type: "audio/m4a" }), "note.m4a");
    upstream.append("model", "whisper-1");
    upstream.append("language", "en");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: upstream,
    });

    if (!res.ok) {
      console.error("[voice/transcribe] upstream", res.status);
      return NextResponse.json({ text: "", path });
    }

    const json = (await res.json()) as { text?: string };
    return NextResponse.json({ text: json.text ?? "", path });
  } catch (err) {
    console.error("[voice/transcribe]", err);
    // The audio is safe; only the transcript failed.
    return NextResponse.json({ text: "", path });
  }
}
