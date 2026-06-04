"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  ArrowLeft, Plus, Pencil, Trash2, X, Users, Calendar, CheckCircle,
  AlertTriangle, ChevronDown, ChevronUp, Copy, Video,
} from "lucide-react";

interface GroupSession {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  host_name: string | null;
  host_title: string | null;
  sport: string | null;
  topic: string | null;
  starts_at: string;
  duration_min: number;
  meeting_url: string | null;
  capacity: number | null;
  status: string;
}

interface Rsvp {
  name: string;
  email: string;
  created_at: string;
}

type StatusValue = "draft" | "published" | "cancelled" | "completed";

interface FormState {
  id: string | null;
  title: string;
  slug: string;
  description: string;
  host_name: string;
  host_title: string;
  sport: string;
  topic: string;
  starts_at: string; // datetime-local value
  duration_min: string;
  meeting_url: string;
  capacity: string; // blank = unlimited
  status: StatusValue;
}

const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  slug: "",
  description: "",
  host_name: "",
  host_title: "",
  sport: "",
  topic: "",
  starts_at: "",
  duration_min: "60",
  meeting_url: "",
  capacity: "",
  status: "published",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Convert an ISO timestamp to the value expected by <input type="datetime-local">
function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-sage-100 text-sage-700 border-sage-200",
  draft: "bg-navy/8 text-navy/60 border-navy/10",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-orange-50 text-orange-600 border-orange-200",
};

export default function AdminGroupSessionsPage() {
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<FormState | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // RSVP viewing
  const [expandedRsvpId, setExpandedRsvpId] = useState<string | null>(null);
  const [rsvpList, setRsvpList] = useState<Rsvp[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data: sessionData, error } = await supabase
      .from("group_sessions")
      .select("id,slug,title,description,host_name,host_title,sport,topic,starts_at,duration_min,meeting_url,capacity,status")
      .order("starts_at", { ascending: false });

    if (error) {
      setMessage({ type: "error", text: `Failed to load sessions: ${error.message}` });
      setLoading(false);
      return;
    }

    const list = (sessionData ?? []) as unknown as GroupSession[];
    setSessions(list);

    // Tally RSVP counts across all sessions
    const { data: rsvpData } = await supabase.from("session_rsvps").select("session_id");
    const counts = new Map<string, number>();
    for (const row of (rsvpData ?? []) as { session_id: string }[]) {
      counts.set(row.session_id, (counts.get(row.session_id) ?? 0) + 1);
    }
    setRsvpCounts(counts);

    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm({ ...EMPTY_FORM });
    setSlugEdited(false);
    setMessage(null);
  }

  function openEdit(s: GroupSession) {
    setForm({
      id: s.id,
      title: s.title,
      slug: s.slug,
      description: s.description ?? "",
      host_name: s.host_name ?? "",
      host_title: s.host_title ?? "",
      sport: s.sport ?? "",
      topic: s.topic ?? "",
      starts_at: isoToLocalInput(s.starts_at),
      duration_min: String(s.duration_min ?? 60),
      meeting_url: s.meeting_url ?? "",
      capacity: s.capacity != null ? String(s.capacity) : "",
      status: (["draft", "published", "cancelled", "completed"].includes(s.status) ? s.status : "published") as StatusValue,
    });
    setSlugEdited(true); // don't auto-overwrite an existing slug
    setMessage(null);
  }

  function closeForm() {
    setForm(null);
    setSlugEdited(false);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function onTitleChange(value: string) {
    setForm((prev) => {
      if (!prev) return prev;
      return { ...prev, title: value, slug: slugEdited ? prev.slug : slugify(value) };
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form || saving) return;

    if (!form.title.trim()) { setMessage({ type: "error", text: "Title is required." }); return; }
    if (!form.slug.trim()) { setMessage({ type: "error", text: "Slug is required." }); return; }
    if (!form.starts_at) { setMessage({ type: "error", text: "Start date/time is required." }); return; }

    setSaving(true);
    setMessage(null);
    const supabase = createClient();

    const durationParsed = parseInt(form.duration_min, 10);
    const capacityTrimmed = form.capacity.trim();
    const capacityParsed = capacityTrimmed === "" ? null : parseInt(capacityTrimmed, 10);

    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug),
      description: form.description.trim() || null,
      host_name: form.host_name.trim() || null,
      host_title: form.host_title.trim() || null,
      sport: form.sport.trim() || null,
      topic: form.topic.trim() || null,
      starts_at: new Date(form.starts_at).toISOString(),
      duration_min: Number.isNaN(durationParsed) ? 60 : durationParsed,
      meeting_url: form.meeting_url.trim() || null,
      capacity: capacityParsed != null && Number.isNaN(capacityParsed) ? null : capacityParsed,
      status: form.status,
    };

    let errMsg: string | null = null;
    if (form.id) {
      const { error } = await supabase.from("group_sessions").update(payload).eq("id", form.id);
      errMsg = error?.message ?? null;
    } else {
      const { error } = await supabase.from("group_sessions").insert(payload);
      errMsg = error?.message ?? null;
    }

    setSaving(false);

    if (errMsg) {
      setMessage({ type: "error", text: `Could not save: ${errMsg}` });
      return;
    }

    setMessage({ type: "success", text: form.id ? "Session updated." : "Session created." });
    closeForm();
    await load();
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("group_sessions").delete().eq("id", id);
    setDeletingId(null);
    setConfirmDeleteId(null);

    if (error) {
      setMessage({ type: "error", text: `Could not delete: ${error.message}` });
      return;
    }
    setMessage({ type: "success", text: "Session deleted." });
    if (expandedRsvpId === id) setExpandedRsvpId(null);
    if (form?.id === id) closeForm();
    await load();
  }

  async function toggleRsvps(id: string) {
    if (expandedRsvpId === id) {
      setExpandedRsvpId(null);
      return;
    }
    setExpandedRsvpId(id);
    setRsvpList([]);
    setRsvpLoading(true);
    setCopied(false);
    const supabase = createClient();
    const { data } = await supabase
      .from("session_rsvps")
      .select("name,email,created_at")
      .eq("session_id", id)
      .order("created_at", { ascending: true });
    setRsvpList((data ?? []) as unknown as Rsvp[]);
    setRsvpLoading(false);
  }

  function copyEmails() {
    const emails = rsvpList.map((r) => r.email).filter(Boolean).join(", ");
    if (!emails) return;
    navigator.clipboard.writeText(emails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputClass =
    "w-full rounded-sm border border-offWhite-400 bg-white px-3 py-2 text-sm text-navy placeholder-navy/35 outline-none focus:border-orange-400 transition-colors";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-navy/45 mb-1.5";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-2">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-navy/50 hover:text-navy transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to admin
        </Link>
      </div>
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-navy">Group Sessions</h1>
          <p className="text-xs text-muted-foreground">{sessions.length} total · manage live workshops &amp; RSVPs</p>
        </div>
        <button
          type="button"
          onClick={form && form.id === null ? closeForm : openNew}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 px-5 py-2.5 text-sm font-bold text-white transition-colors rounded-sm"
        >
          {form && form.id === null ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New session</>}
        </button>
      </div>

      {/* Inline message */}
      {message && (
        <div
          className={`mb-6 flex items-start gap-2 rounded-sm border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-sage-200 bg-sage-50 text-sage-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />}
          <span className="flex-1">{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} aria-label="Dismiss" className="text-current/60 hover:text-current">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Form panel */}
      {form && (
        <form onSubmit={handleSave} className="mb-8 rounded-sm border border-offWhite-300 bg-offWhite p-6">
          <h2 className="text-base font-bold text-navy mb-4">{form.id ? "Edit session" : "New session"}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title</label>
              <input type="text" value={form.title} onChange={(e) => onTitleChange(e.target.value)} className={inputClass} placeholder="Handling pressure on game day" required />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => { setSlugEdited(true); updateField("slug", e.target.value); }}
                className={inputClass}
                placeholder="handling-pressure-on-game-day"
                required
              />
              <p className="mt-1 text-[11px] text-navy/40">Auto-generated from title. Editable.</p>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Description (markdown)</label>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={5} className={`${inputClass} resize-y font-mono text-xs leading-relaxed`} placeholder="What this session covers, who it's for…" />
            </div>

            <div>
              <label className={labelClass}>Host name</label>
              <input type="text" value={form.host_name} onChange={(e) => updateField("host_name", e.target.value)} className={inputClass} placeholder="Jordan Reyes" />
            </div>
            <div>
              <label className={labelClass}>Host title</label>
              <input type="text" value={form.host_title} onChange={(e) => updateField("host_title", e.target.value)} className={inputClass} placeholder="Former D1 guard" />
            </div>

            <div>
              <label className={labelClass}>Sport</label>
              <input type="text" value={form.sport} onChange={(e) => updateField("sport", e.target.value)} className={inputClass} placeholder="Basketball / General" />
            </div>
            <div>
              <label className={labelClass}>Topic</label>
              <input type="text" value={form.topic} onChange={(e) => updateField("topic", e.target.value)} className={inputClass} placeholder="Confidence" />
            </div>

            <div>
              <label className={labelClass}>Starts at</label>
              <input type="datetime-local" value={form.starts_at} onChange={(e) => updateField("starts_at", e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Duration (min)</label>
              <input type="number" min={1} value={form.duration_min} onChange={(e) => updateField("duration_min", e.target.value)} className={inputClass} placeholder="60" />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Meeting URL</label>
              <input type="url" value={form.meeting_url} onChange={(e) => updateField("meeting_url", e.target.value)} className={inputClass} placeholder="https://meet.jit.si/…" />
            </div>

            <div>
              <label className={labelClass}>Capacity</label>
              <input type="number" min={1} value={form.capacity} onChange={(e) => updateField("capacity", e.target.value)} className={inputClass} placeholder="Blank = unlimited" />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => updateField("status", e.target.value as StatusValue)} className={inputClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 px-6 py-2.5 text-sm font-bold text-white transition-colors rounded-sm">
              {saving ? "Saving…" : form.id ? "Save changes" : "Create session"}
            </button>
            <button type="button" onClick={closeForm} className="rounded-sm border border-offWhite-300 px-4 py-2.5 text-sm font-medium text-navy hover:bg-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Delete confirmation overlay */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-navy mb-2">Delete session?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              This will permanently delete{" "}
              <span className="font-medium text-navy">{sessions.find((s) => s.id === confirmDeleteId)?.title ?? "this session"}</span>. RSVP records linked to it may also be removed. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmDeleteId(null)} className="rounded-sm border border-offWhite-300 px-4 py-2 text-sm font-medium text-navy hover:bg-offWhite transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => handleDelete(confirmDeleteId)} disabled={deletingId === confirmDeleteId} className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50">
                {deletingId === confirmDeleteId ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-20 text-center text-navy/40 text-sm">Loading sessions…</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-sm border border-dashed border-offWhite-400 bg-offWhite p-10 text-center">
          <Calendar className="h-8 w-8 text-navy/20 mx-auto mb-3" />
          <p className="text-navy/55 text-sm mb-1 font-medium">No group sessions yet.</p>
          <p className="text-navy/40 text-xs">Create your first session to start collecting RSVPs.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const count = rsvpCounts.get(s.id) ?? 0;
            const showingRsvps = expandedRsvpId === s.id;
            return (
              <div key={s.id} className="rounded-sm border border-offWhite-300 bg-white">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLES[s.status] ?? "bg-navy/8 text-navy/60 border-navy/10"}`}>
                          {s.status}
                        </span>
                        {s.topic && <span className="rounded-sm px-2 py-0.5 text-[11px] font-medium bg-orange-50 text-orange-600">{s.topic}</span>}
                        {s.sport && <span className="rounded-sm px-2 py-0.5 text-[11px] font-medium bg-navy/8 text-navy">{s.sport}</span>}
                      </div>
                      <h3 className="text-sm font-bold text-navy leading-snug">{s.title}</h3>
                      <p className="text-xs text-navy/50 mt-1 flex items-center gap-1.5 flex-wrap">
                        <Calendar className="h-3 w-3" /> {fmtDateTime(s.starts_at)} · {s.duration_min} min
                        {s.host_name ? <span className="text-navy/40">· hosted by {s.host_name}{s.host_title ? `, ${s.host_title}` : ""}</span> : null}
                      </p>
                      <p className="text-xs text-navy/45 mt-1 flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        <span className="font-semibold text-navy/70">{count}</span> RSVP{count !== 1 ? "s" : ""}
                        {s.capacity != null ? ` · capacity ${s.capacity}` : " · unlimited capacity"}
                        <span className="text-navy/30">·</span>
                        <span className="text-navy/40">/{s.slug}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button type="button" onClick={() => toggleRsvps(s.id)} className="inline-flex items-center gap-1 rounded-sm border border-offWhite-300 px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-offWhite transition-colors">
                        <Users className="h-3.5 w-3.5" /> RSVPs {showingRsvps ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                      <button type="button" onClick={() => openEdit(s)} className="inline-flex items-center gap-1 rounded-sm border border-offWhite-300 px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-offWhite transition-colors">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button type="button" onClick={() => setConfirmDeleteId(s.id)} className="inline-flex items-center gap-1 rounded-sm border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {s.meeting_url && (
                    <a href={s.meeting_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs text-navy/45 hover:text-orange-600 underline underline-offset-2 transition-colors">
                      <Video className="h-3 w-3" /> {s.meeting_url}
                    </a>
                  )}
                </div>

                {/* RSVP list */}
                {showingRsvps && (
                  <div className="border-t border-offWhite-300 bg-offWhite px-5 py-4">
                    {rsvpLoading ? (
                      <p className="text-xs text-navy/40">Loading RSVPs…</p>
                    ) : rsvpList.length === 0 ? (
                      <p className="text-xs text-navy/40">No RSVPs yet for this session.</p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-navy/45">{rsvpList.length} attendee{rsvpList.length !== 1 ? "s" : ""}</p>
                          <button type="button" onClick={copyEmails} className="inline-flex items-center gap-1.5 rounded-sm border border-offWhite-300 bg-white px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-orange-50 hover:border-orange-300 transition-colors">
                            <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy emails"}
                          </button>
                        </div>
                        <div className="divide-y divide-offWhite-300 rounded-sm border border-offWhite-300 bg-white">
                          {rsvpList.map((r, i) => (
                            <div key={`${r.email}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2">
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-navy truncate">{r.name}</p>
                                <a href={`mailto:${r.email}`} className="text-xs text-navy/55 hover:text-navy underline underline-offset-2 transition-colors truncate block">{r.email}</a>
                              </div>
                              <span className="text-[10px] text-navy/35 shrink-0">{fmtDateTime(r.created_at)}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
