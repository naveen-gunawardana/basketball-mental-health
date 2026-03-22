"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CalendarClock, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScheduledCall {
  id: string;
  scheduled_at: string;
  note: string | null;
  proposed_by: string;
}

interface Props {
  matchId: string;
  currentUserId: string;
  onJoin: () => void;
  refreshKey?: number;
}

function formatScheduledAt(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
    " at " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })
  );
}

function isCallSoon(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return diff <= 15 * 60 * 1000 && diff >= -60 * 60 * 1000;
}

export function UpcomingCalls({ matchId, currentUserId, onJoin, refreshKey }: Props) {
  const [calls, setCalls] = useState<ScheduledCall[]>([]);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("scheduled_calls")
      .select("id, scheduled_at, note, proposed_by")
      .eq("match_id", matchId)
      .eq("status", "upcoming")
      .gte("scheduled_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(5);
    setCalls(data ?? []);
  }

  useEffect(() => { load(); }, [matchId, refreshKey]);

  async function cancelCall(id: string) {
    const supabase = createClient();
    await supabase.from("scheduled_calls").update({ status: "cancelled" }).eq("id", id);
    setCalls(prev => prev.filter(c => c.id !== id));
  }

  if (calls.length === 0) return null;

  // Join now always shows on the soonest call; teal highlight kicks in when it's actually time
  const soonestCallId = calls.length > 0 ? calls[0].id : null;

  return (
    <div className="space-y-2">
      {calls.map(call => {
        const isJoinable = call.id === soonestCallId;
        return (
          <div key={call.id} className={`rounded-lg border p-3 ${isJoinable ? "border-sage-300 bg-sage-50" : "border-offWhite-300 bg-white"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <CalendarClock className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${isJoinable ? "text-sage-600" : "text-navy/40"}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-navy">{formatScheduledAt(call.scheduled_at)}</p>
                  {call.note && <p className="text-xs text-muted-foreground mt-0.5 truncate">{call.note}</p>}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {call.proposed_by === currentUserId ? "You scheduled this" : "They scheduled this"}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => cancelCall(call.id)} aria-label="Cancel call"
                className="p-1 rounded hover:bg-muted transition-colors shrink-0">
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            {isJoinable && (
              <Button size="sm" onClick={onJoin} className="w-full mt-2 bg-sage-600 hover:bg-sage-700 text-white h-7 text-xs">
                <Video className="h-3 w-3 mr-1.5" />Join now
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
