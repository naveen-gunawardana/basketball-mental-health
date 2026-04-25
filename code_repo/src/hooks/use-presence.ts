"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function usePresence(matchId: string | null, currentUserId: string | null, otherUserId: string | null) {
  const [otherOnline, setOtherOnline] = useState(false);

  useEffect(() => {
    if (!matchId || !currentUserId || !otherUserId) return;
    const supabase = createClient();
    const channel = supabase.channel(`presence:${matchId}`, {
      config: { presence: { key: currentUserId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOtherOnline(!!state[otherUserId]);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key === otherUserId) setOtherOnline(true);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key === otherUserId) setOtherOnline(false);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [matchId, currentUserId, otherUserId]);

  return { otherOnline };
}
