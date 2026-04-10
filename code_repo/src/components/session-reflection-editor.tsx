"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

export interface ReflectionData {
  id: string;
  body: string;
  shared: boolean;
}

interface Props {
  sessionId: string;
  userId: string;
  otherPersonName: string;
  existing: ReflectionData | null;
  onSave: (saved: ReflectionData) => void;
  onCancel: () => void;
}

export function SessionReflectionEditor({ sessionId, userId, otherPersonName, existing, onSave, onCancel }: Props) {
  const [body, setBody] = useState(existing?.body ?? "");
  const [shared, setShared] = useState(existing?.shared ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!body.trim()) { setError("Write something first."); return; }
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { data, error: dbError } = await supabase
      .from("session_reflections")
      .upsert(
        { session_id: sessionId, author_id: userId, body: body.trim(), shared, updated_at: new Date().toISOString() },
        { onConflict: "session_id,author_id" }
      )
      .select("id, body, shared")
      .single();

    setSaving(false);
    if (dbError || !data) { setError(dbError?.message ?? "Something went wrong."); return; }
    onSave({ id: data.id, body: data.body, shared: data.shared });
  }

  return (
    <div className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        autoFocus
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        placeholder="How did this session feel? What are you taking away from it?"
      />

      {/* Share toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <button
          type="button"
          role="switch"
          aria-checked={shared}
          onClick={() => setShared(!shared)}
          className={`relative h-5 w-9 rounded-full transition-colors shrink-0 ${shared ? "bg-navy" : "bg-muted"}`}
        >
          <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${shared ? "translate-x-4" : ""}`} />
        </button>
        <span className="text-xs text-muted-foreground">
          {shared ? `Sharing with ${otherPersonName}` : `Private — only you can see this`}
        </span>
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving} className="bg-navy hover:bg-navy/90 text-white">
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? "Saving..." : "Save reflection"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
          <X className="h-3.5 w-3.5 mr-1" />Cancel
        </Button>
      </div>
    </div>
  );
}
