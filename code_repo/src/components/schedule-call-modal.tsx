"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  matchId: string;
  currentUserId: string;
  otherPersonName: string;
  otherPersonId: string;
  onClose: () => void;
  onScheduled: () => void;
}

export function ScheduleCallModal({ matchId, currentUserId, otherPersonName, otherPersonId, onClose, onScheduled }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("15:00");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!date || !time) return;
    setSubmitting(true);
    setError("");
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    const supabase = createClient();
    const { error: err } = await supabase.from("scheduled_calls").insert({
      match_id: matchId,
      proposed_by: currentUserId,
      scheduled_at: scheduledAt,
      note: note.trim() || null,
    });
    if (err) { setError("Couldn't schedule. Try again."); setSubmitting(false); return; }

    // Email the other person
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "call_scheduled",
        matchId,
        scheduledAt,
        proposedById: currentUserId,
        note: note.trim() || null,
      }),
    }).catch(() => {});

    // Auto-send a chat message so the other person gets notified
    const d = new Date(`${date}T${time}`);
    const formatted = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
      " at " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const msgContent = note.trim()
      ? `📅 Call scheduled for ${formatted} — ${note.trim()}`
      : `📅 Call scheduled for ${formatted}`;
    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: currentUserId,
      content: msgContent,
    });

    onScheduled();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-navy" />
            <h2 className="text-base font-semibold text-navy">Schedule a call</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Set a time to connect with {otherPersonName.split(" ")[0]}. They&apos;ll see it in their dashboard.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Date</label>
            <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)}
              aria-label="Date" title="Date"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">
              Time <span className="text-muted-foreground font-normal text-xs">({Intl.DateTimeFormat().resolvedOptions().timeZone})</span>
            </label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              aria-label="Time" title="Time"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">
              Note <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="e.g. Pre-game routine discussion"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button onClick={submit} disabled={submitting || !date || !time} className="flex-1">
              {submitting ? "Scheduling..." : "Schedule call"}
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
