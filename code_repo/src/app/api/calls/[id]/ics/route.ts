import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function fmtICSDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escape(s: string): string {
  return s.replace(/[\\;,]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: call } = await supabase
    .from("scheduled_calls")
    .select("id, scheduled_at, note, match_id, matches!inner(mentor_id, player_id, meeting_url)")
    .eq("id", params.id)
    .single();

  if (!call) return NextResponse.json({ error: "not found" }, { status: 404 });

  const match = call.matches as unknown as { mentor_id: string; player_id: string; meeting_url: string | null };
  if (match.mentor_id !== user.id && match.player_id !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const start = call.scheduled_at;
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // default 30 min

  const summary = "Mentality Sports — mentor call";
  const description = call.note ? escape(call.note) : "Your scheduled mentor call.";
  const url = match.meeting_url ?? "";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mentality Sports//Calls//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${call.id}@mentalitysports`,
    `DTSTAMP:${fmtICSDate(new Date().toISOString())}`,
    `DTSTART:${fmtICSDate(startDate.toISOString())}`,
    `DTEND:${fmtICSDate(endDate.toISOString())}`,
    `SUMMARY:${escape(summary)}`,
    `DESCRIPTION:${description}`,
    url ? `URL:${url}` : "",
    url ? `LOCATION:${escape(url)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  const body = lines.join("\r\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="mentality-call-${call.id}.ics"`,
    },
  });
}
