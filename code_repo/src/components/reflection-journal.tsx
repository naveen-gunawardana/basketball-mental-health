"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lock, Globe, Trash2, Plus, X, Check } from "lucide-react";

interface Reflection {
  id: string;
  content: string;
  shared_with_mentor: boolean;
  created_at: string;
}

interface Props {
  playerId: string;
}

export function ReflectionJournal({ playerId }: Props) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [shareWithMentor, setShareWithMentor] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("reflections")
      .select("id, content, shared_with_mentor, created_at")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false });
    setReflections(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [playerId]);

  async function handleSave() {
    if (!draft.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("reflections")
      .insert({ player_id: playerId, content: draft.trim(), shared_with_mentor: shareWithMentor })
      .select("id, content, shared_with_mentor, created_at")
      .single();
    if (data) setReflections(prev => [data, ...prev]);
    setDraft("");
    setShareWithMentor(true);
    setComposing(false);
    setSaving(false);
  }

  async function toggleShare(id: string, current: boolean) {
    setTogglingId(id);
    const supabase = createClient();
    await supabase.from("reflections").update({ shared_with_mentor: !current }).eq("id", id);
    setReflections(prev => prev.map(r => r.id === id ? { ...r, shared_with_mentor: !current } : r));
    setTogglingId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("reflections").delete().eq("id", id);
    setReflections(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-navy">Reflections</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Write anytime. Choose what your mentor sees.</p>
        </div>
        {!composing && (
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="flex items-center gap-1.5 rounded-md bg-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-navy/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Write
          </button>
        )}
      </div>

      {/* Compose area */}
      {composing && (
        <div className="rounded-lg border-2 border-navy/20 bg-white p-4 mb-5">
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            placeholder="What's on your mind? How did practice feel? Anything weighing on you..."
            className="w-full text-sm text-navy placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-offWhite-300">
            {/* Privacy toggle */}
            <button
              type="button"
              onClick={() => setShareWithMentor(!shareWithMentor)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                shareWithMentor
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {shareWithMentor
                ? <><Globe className="h-3.5 w-3.5" /> Shared with mentor</>
                : <><Lock className="h-3.5 w-3.5" /> Only me</>
              }
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setComposing(false); setDraft(""); setShareWithMentor(true); }}
                className="p-1.5 text-muted-foreground hover:text-navy transition-colors">
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !draft.trim()}
                className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-400 transition-colors disabled:opacity-40"
              >
                <Check className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entries */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : reflections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-offWhite-400 p-8 text-center">
          <p className="text-sm text-muted-foreground">Nothing yet. Hit Write whenever something's on your mind.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reflections.map((r) => (
            <div key={r.id} className="rounded-lg border border-offWhite-300 bg-white p-4">
              <p className="text-sm text-navy leading-relaxed whitespace-pre-wrap">{r.content}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-offWhite-200">
                <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                <div className="flex items-center gap-2">
                  {/* Toggle share */}
                  <button
                    type="button"
                    disabled={togglingId === r.id}
                    onClick={() => toggleShare(r.id, r.shared_with_mentor)}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      r.shared_with_mentor
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-muted text-muted-foreground hover:bg-navy/10"
                    }`}
                  >
                    {r.shared_with_mentor
                      ? <><Globe className="h-3 w-3" /> Shared</>
                      : <><Lock className="h-3 w-3" /> Private</>
                    }
                  </button>
                  {/* Delete */}
                  <button
                    type="button"
                    disabled={deletingId === r.id}
                    onClick={() => handleDelete(r.id)}
                    className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
