"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { renderMarkdown } from "@/lib/markdown";
import {
  ArrowLeft,
  Mail,
  Users,
  Copy,
  Check,
  Send,
  Save,
  Loader2,
  Eye,
  Info,
  ExternalLink,
  FileText,
  Trash2,
} from "lucide-react";

interface Subscriber {
  email: string;
  name: string | null;
  status: string;
  source: string | null;
  created_at: string;
}

interface Issue {
  id: string;
  slug: string;
  title: string;
  subject: string;
  excerpt: string | null;
  preview_text: string | null;
  status: string;
  sent_at: string | null;
  recipient_count: number | null;
  created_at: string;
}

type SubFilter = "all" | "subscribed" | "unsubscribed";

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "issue"}-${suffix}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminNewsletterPage() {
  // Subscribers
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subFilter, setSubFilter] = useState<SubFilter>("subscribed");
  const [copiedEmails, setCopiedEmails] = useState(false);

  // Issues
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Compose form
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Send state
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [confirmSendId, setConfirmSendId] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<string>("");

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function loadSubscribers() {
    const supabase = createClient();
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("email, name, status, source, created_at")
      .order("created_at", { ascending: false });
    setSubscribers((data ?? []) as unknown as Subscriber[]);
  }

  async function loadIssues() {
    const supabase = createClient();
    const { data } = await supabase
      .from("newsletter_issues")
      .select(
        "id, slug, title, subject, excerpt, preview_text, status, sent_at, recipient_count, created_at",
      )
      .order("created_at", { ascending: false });
    setIssues((data ?? []) as unknown as Issue[]);
  }

  useEffect(() => {
    Promise.all([loadSubscribers(), loadIssues()]).finally(() => setLoading(false));
  }, []);

  const subscribedList = subscribers.filter((s) => s.status === "subscribed");
  const filteredSubs = subscribers.filter((s) => {
    if (subFilter === "all") return true;
    return s.status === subFilter;
  });

  function copySubscribedEmails() {
    const emails = subscribedList.map((s) => s.email).join(", ");
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2000);
  }

  async function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!title.trim() || !subject.trim() || !content.trim()) {
      setSaveMsg("Subject, title, and content are required.");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    const supabase = createClient();
    const { error } = await supabase.from("newsletter_issues").insert({
      slug: `${slugify(title) || "issue"}-${Math.random().toString(36).slice(2, 7)}`,
      subject: subject.trim(),
      title: title.trim(),
      preview_text: previewText.trim() || null,
      excerpt: excerpt.trim() || null,
      content: content,
      status: "draft",
    });
    if (error) {
      setSaveMsg(`Error: ${error.message}`);
      setSaving(false);
      return;
    }
    setSubject("");
    setTitle("");
    setPreviewText("");
    setExcerpt("");
    setContent("");
    setSaveMsg("Draft saved.");
    await loadIssues();
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 4000);
  }

  async function sendIssue(issueId: string) {
    const isResend = issues.find((i) => i.id === issueId)?.status === "sent";
    setSendingId(issueId);
    setConfirmSendId(null);
    setSendResult("");
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, resend: isResend }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendResult(data?.error ?? "Send failed. Try again.");
      } else {
        const failedNote = data.failedCount ? ` (${data.failedCount} failed to send)` : "";
        setSendResult(
          `Sent to ${data.recipientCount ?? 0} subscriber${
            data.recipientCount === 1 ? "" : "s"
          } via ${data.mode === "broadcast" ? "Resend Broadcast" : "direct send"}${failedNote}.`,
        );
        await loadIssues();
      }
    } catch {
      setSendResult("Network error. Try again.");
    }
    setSendingId(null);
    setTimeout(() => setSendResult(""), 6000);
  }

  async function deleteIssue(issueId: string) {
    setDeletingId(issueId);
    setConfirmDeleteId(null);
    const supabase = createClient();
    const { error } = await supabase.from("newsletter_issues").delete().eq("id", issueId);
    if (error) {
      setSendResult(`Could not delete: ${error.message}`);
      setTimeout(() => setSendResult(""), 6000);
    } else {
      await loadIssues();
    }
    setDeletingId(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Confirm send overlay */}
      {confirmSendId && (() => {
        const target = issues.find((i) => i.id === confirmSendId);
        const isResend = target?.status === "sent";
        return (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-sm w-full max-w-sm p-6">
              <h2 className="text-base font-bold text-navy mb-2">
                {isResend ? "Resend this issue?" : "Send this issue?"}
              </h2>
              <p className="text-sm text-navy/60 mb-5">
                {isResend && (
                  <>
                    This was already sent on {fmtDate(target?.sent_at ?? null)} to{" "}
                    {target?.recipient_count ?? 0} subscriber{target?.recipient_count === 1 ? "" : "s"}.{" "}
                  </>
                )}
                This will email{" "}
                <span className="font-semibold text-navy">{subscribedList.length}</span>{" "}
                subscribed reader{subscribedList.length === 1 ? "" : "s"}
                {isResend ? " again, with a “(Resend)” subject prefix" : ""}. This can&apos;t be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmSendId(null)}
                  className="rounded-sm border border-offWhite-300 px-4 py-2 text-sm font-medium text-navy hover:bg-offWhite transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => sendIssue(confirmSendId)}
                  className="inline-flex items-center gap-2 rounded-sm bg-orange-500 hover:bg-orange-400 px-4 py-2 text-sm font-bold text-white transition-colors"
                >
                  <Send className="h-3.5 w-3.5" /> {isResend ? "Resend now" : "Send now"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Confirm delete overlay */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-navy mb-2">Delete this issue?</h2>
            <p className="text-sm text-navy/60 mb-5">
              This permanently removes it from the archive. If it was already sent, this
              doesn&apos;t recall it from anyone&apos;s inbox. This can&apos;t be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-sm border border-offWhite-300 px-4 py-2 text-sm font-medium text-navy hover:bg-offWhite transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteIssue(confirmDeleteId)}
                className="inline-flex items-center gap-2 rounded-sm bg-red-600 hover:bg-red-500 px-4 py-2 text-sm font-bold text-white transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-navy/50 hover:text-navy transition-colors mb-5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to admin
        </Link>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-navy text-white shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy">Newsletter</h1>
              <p className="text-xs text-navy/50">The Mental Rep — subscribers &amp; issues</p>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-black text-navy font-condensed leading-none">
                {subscribedList.length}
              </p>
              <p className="text-xs text-navy/50 mt-1">Subscribed</p>
            </div>
            <div>
              <p className="text-2xl font-black text-navy font-condensed leading-none">
                {issues.length}
              </p>
              <p className="text-xs text-navy/50 mt-1">Issues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tip banner */}
      <div className="flex items-start gap-3 rounded-sm border border-orange-200 bg-orange-50 px-4 py-3 mb-8">
        <Info className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
        <p className="text-xs text-navy/70 leading-relaxed">
          <span className="font-semibold text-navy">Tip:</span> set{" "}
          <code className="rounded-sm bg-orange-100 px-1 py-0.5 text-orange-700">
            RESEND_AUDIENCE_ID
          </code>{" "}
          to send via Resend Broadcasts. Without it, issues are sent directly to your subscriber
          list (still works).
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-navy/40 text-sm">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          {/* LEFT: Compose + Issues */}
          <div className="space-y-10">
            {/* Compose */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-orange-500" />
                <h2 className="text-lg font-black text-navy font-condensed tracking-wide uppercase">
                  Compose
                </h2>
              </div>
              <form onSubmit={saveDraft} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-navy/40 mb-1.5">
                      Subject line
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Email subject"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-offWhite-400 bg-white text-navy placeholder-navy/35 outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-navy/40 mb-1.5">
                      Title (headline)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Shown in the email & archive"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-offWhite-400 bg-white text-navy placeholder-navy/35 outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-navy/40 mb-1.5">
                      Preview text
                    </label>
                    <input
                      type="text"
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      placeholder="Inbox preview snippet"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-offWhite-400 bg-white text-navy placeholder-navy/35 outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-navy/40 mb-1.5">
                      Excerpt
                    </label>
                    <input
                      type="text"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="One-liner for the archive list"
                      className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-offWhite-400 bg-white text-navy placeholder-navy/35 outline-none focus:border-orange-400 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-navy/40 mb-1.5">
                    Content (markdown)
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={16}
                    placeholder={"## A heading\n\nWrite the issue here. **Bold**, [links](https://…), and\n\n- bullet lists\n\nare all supported."}
                    className="w-full px-3.5 py-3 text-sm rounded-sm border border-offWhite-400 bg-white text-navy placeholder-navy/35 outline-none focus:border-orange-400 transition-colors font-mono leading-relaxed resize-y"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-navy hover:bg-navy/85 disabled:opacity-60 px-6 py-3 text-sm font-bold text-white rounded-sm transition-colors"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save draft
                  </button>
                  {saveMsg && (
                    <span
                      className={`text-xs font-medium ${
                        saveMsg.startsWith("Error") ? "text-red-600" : "text-orange-600"
                      }`}
                    >
                      {saveMsg}
                    </span>
                  )}
                </div>
              </form>

              {/* Live preview */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-3.5 w-3.5 text-navy/40" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-navy/40">
                    Live preview
                  </span>
                </div>
                <div className="rounded-sm border border-offWhite-300 bg-white p-6">
                  {title.trim() && (
                    <h2 className="text-2xl font-black text-navy font-condensed tracking-tight leading-tight mb-4">
                      {title}
                    </h2>
                  )}
                  {content.trim() ? (
                    <div className="prose-content">{renderMarkdown(content)}</div>
                  ) : (
                    <p className="text-sm text-navy/35 italic">
                      Start typing content above to see it rendered here.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Issues list */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-orange-500" />
                  <h2 className="text-lg font-black text-navy font-condensed tracking-wide uppercase">
                    Issues
                  </h2>
                </div>
                {sendResult && (
                  <span className="text-xs font-medium text-orange-600">{sendResult}</span>
                )}
              </div>

              {issues.length === 0 ? (
                <div className="rounded-sm border border-dashed border-offWhite-400 bg-offWhite p-10 text-center text-sm text-navy/50">
                  No issues yet. Compose one above and save it as a draft.
                </div>
              ) : (
                <div className="space-y-3">
                  {issues.map((issue) => {
                    const isSent = issue.status === "sent";
                    return (
                      <div
                        key={issue.id}
                        className="rounded-sm border border-offWhite-300 bg-offWhite p-5 hover:bg-white hover:border-orange-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              {isSent ? (
                                <span className="rounded-sm px-2.5 py-0.5 text-xs font-medium bg-navy/8 text-navy">
                                  Sent
                                </span>
                              ) : (
                                <span className="rounded-sm px-2.5 py-0.5 text-xs font-medium bg-orange-50 text-orange-600">
                                  Draft
                                </span>
                              )}
                              <span className="text-[11px] text-navy/40">
                                {isSent
                                  ? `Sent ${fmtDate(issue.sent_at)} · ${
                                      issue.recipient_count ?? 0
                                    } recipient${issue.recipient_count === 1 ? "" : "s"}`
                                  : `Created ${fmtDate(issue.created_at)}`}
                              </span>
                            </div>
                            <h3 className="font-bold text-navy text-sm leading-snug truncate">
                              {issue.title}
                            </h3>
                            {issue.excerpt && (
                              <p className="text-xs text-navy/50 mt-1 line-clamp-2">
                                {issue.excerpt}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {isSent ? (
                              <>
                                <Link
                                  href={`/newsletter/${issue.slug}`}
                                  className="inline-flex items-center gap-1.5 rounded-sm border border-offWhite-400 px-3 py-1.5 text-xs font-medium text-navy hover:bg-offWhite transition-colors"
                                >
                                  View <ExternalLink className="h-3 w-3" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => setConfirmSendId(issue.id)}
                                  disabled={sendingId === issue.id}
                                  className="inline-flex items-center gap-1.5 rounded-sm border border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-60 px-3 py-1.5 text-xs font-bold transition-colors"
                                >
                                  {sendingId === issue.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Send className="h-3.5 w-3.5" />
                                  )}
                                  Resend
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmSendId(issue.id)}
                                disabled={sendingId === issue.id}
                                className="inline-flex items-center gap-1.5 rounded-sm bg-orange-500 hover:bg-orange-400 disabled:opacity-60 px-3.5 py-1.5 text-xs font-bold text-white transition-colors"
                              >
                                {sendingId === issue.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Send className="h-3.5 w-3.5" />
                                )}
                                Send now
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(issue.id)}
                              disabled={deletingId === issue.id}
                              title="Delete issue"
                              className="inline-flex items-center justify-center rounded-sm border border-offWhite-400 p-1.5 text-navy/50 hover:text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-60 transition-colors"
                            >
                              {deletingId === issue.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: Subscribers */}
          <aside>
            <div className="lg:sticky lg:top-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <h2 className="text-lg font-black text-navy font-condensed tracking-wide uppercase">
                    Subscribers
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={copySubscribedEmails}
                  disabled={subscribedList.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-offWhite-400 px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-offWhite disabled:opacity-50 transition-colors"
                >
                  {copiedEmails ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-orange-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy emails
                    </>
                  )}
                </button>
              </div>

              {/* Filter */}
              <div className="flex gap-1.5 mb-4">
                {(["all", "subscribed", "unsubscribed"] as SubFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSubFilter(f)}
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                      subFilter === f
                        ? "bg-navy text-white"
                        : "bg-offWhite border border-offWhite-300 text-navy/60 hover:text-navy hover:border-navy/20"
                    }`}
                  >
                    {f}
                    {f === "subscribed" ? ` (${subscribedList.length})` : ""}
                  </button>
                ))}
              </div>

              <div className="rounded-sm border border-offWhite-300 bg-white divide-y divide-offWhite-300 max-h-[640px] overflow-y-auto">
                {filteredSubs.length === 0 ? (
                  <p className="text-sm text-navy/50 text-center py-10">No subscribers here.</p>
                ) : (
                  filteredSubs.map((s) => {
                    const subscribed = s.status === "subscribed";
                    return (
                      <div key={s.email} className="flex items-start justify-between gap-3 p-3.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-navy truncate">{s.email}</p>
                          <p className="text-xs text-navy/45 mt-0.5">
                            {s.name ? `${s.name} · ` : ""}
                            {s.source ? `${s.source} · ` : ""}
                            {fmtDate(s.created_at)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-sm px-2 py-0.5 text-[11px] font-medium ${
                            subscribed
                              ? "bg-orange-50 text-orange-600"
                              : "bg-navy/8 text-navy/50"
                          }`}
                        >
                          {subscribed ? "Subscribed" : "Unsubscribed"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              <p className="text-[11px] text-navy/40 mt-2">
                {filteredSubs.length} shown · {subscribers.length} total
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
