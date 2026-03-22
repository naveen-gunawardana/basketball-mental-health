"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Globe } from "lucide-react";

interface Reflection {
  id: string;
  content: string;
  created_at: string;
  player_id: string;
}

interface Props {
  playerId: string;
  playerName: string;
}

export function MenteeReflections({ playerId, playerName }: Props) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("reflections")
        .select("id, content, created_at, player_id")
        .eq("player_id", playerId)
        .eq("shared_with_mentor", true)
        .order("created_at", { ascending: false });
      setReflections(data ?? []);
      setLoading(false);
    }
    load();
  }, [playerId]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-semibold text-navy">
          {playerName.split(" ")[0]}&apos;s Shared Reflections
        </h3>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : reflections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-offWhite-400 p-5 text-center">
          <p className="text-xs text-muted-foreground">
            {playerName.split(" ")[0]} hasn&apos;t shared any reflections yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reflections.map((r) => (
            <div key={r.id} className="rounded-lg border border-offWhite-300 bg-white p-4">
              <p className="text-sm text-navy leading-relaxed whitespace-pre-wrap">{r.content}</p>
              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-offWhite-200">
                {formatDate(r.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
