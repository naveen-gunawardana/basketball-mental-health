"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  sport: string | null;
  media_type: string | null;
  excerpt: string | null;
  content: string;
  status: string | null;
  submitted_by: string | null;
  submitted_by_name: string | null;
  published_at: string | null;
  created_at: string | null;
}

type Filter = "published" | "pending" | "rejected";

const SPORTS = [
  "General", "Basketball", "Soccer", "Football", "Baseball", "Softball",
  "Volleyball", "Track & Field", "Cross-Country", "Swimming", "Wrestling",
  "Tennis", "Golf", "Lacrosse",
];

const ISSUES = [
  "Confidence", "Resilience", "Motivation", "Goal Setting",
  "Pressure & Anxiety", "Coach Communication", "Identity", "Injury Recovery", "Other",
];

const MEDIA_TYPES = ["Article", "Video", "Podcast", "Guide", "Infographic"];

export default function AdminContentPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("published");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [tagEdits, setTagEdits] = useState<Record<string, { sport: string; category: string; media_type: string }>>({});

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("resources")
      .select("id, title, slug, category, sport, media_type, excerpt, content, status, submitted_by, submitted_by_name, published_at, created_at")
      .order("created_at", { ascending: false });
    setArticles((data ?? []) as unknown as Article[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function initTagEdit(article: Article) {
    setTagEdits(prev => ({
      ...prev,
      [article.id]: {
        sport: article.sport ?? "All Sports",
        category: article.category ?? "Confidence",
        media_type: article.media_type ?? "Article",
      },
    }));
  }

  function handleExpand(article: Article) {
    const isExpanded = expandedId === article.id;
    setExpandedId(isExpanded ? null : article.id);
    if (!isExpanded && !tagEdits[article.id]) initTagEdit(article);
  }

  async function saveTags(id: string) {
    const tags = tagEdits[id];
    if (!tags) return;
    setActingId(id);
    const supabase = createClient();
    await supabase.from("resources").update({
      sport: tags.sport,
      category: tags.category,
      media_type: tags.media_type,
    } as never).eq("id", id);
    await load();
    setActingId(null);
  }

  async function setStatus(id: string, status: "published" | "pending" | "rejected") {
    // Save any pending tag edits alongside status change
    const tags = tagEdits[id];
    setActingId(id);
    const supabase = createClient();
    await supabase.from("resources").update({
      status,
      ...(status === "published" ? { published_at: new Date().toISOString() } : {}),
      ...(tags ? { sport: tags.sport, category: tags.category, media_type: tags.media_type } : {}),
    } as never).eq("id", id);

    if (status === "published") {
      const article = articles.find(a => a.id === id);
      if (article?.submitted_by) {
        fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "article_approved",
            submittedBy: article.submitted_by,
            authorName: article.submitted_by_name,
            title: article.title,
            slug: article.slug,
          }),
        }).catch(() => {});
      }
    }

    await load();
    setActingId(null);
    setExpandedId(null);
  }

  async function deleteArticle(id: string) {
    if (!confirm("Delete this article permanently?")) return;
    setActingId(id);
    const supabase = createClient();
    await supabase.from("resources").delete().eq("id", id);
    setArticles(prev => prev.filter(a => a.id !== id));
    setActingId(null);
  }

  function fmt(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const filtered = articles.filter(a => a.status === filter);

  const counts = {
    published: articles.filter(a => a.status === "published").length,
    pending: articles.filter(a => a.status === "pending").length,
    rejected: articles.filter(a => a.status === "rejected").length,
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy transition-colors mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Admin
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">Content</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage advice library articles</p>
          </div>
          <Link href="/advice/submit"
            className="inline-flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/80 transition-colors">
            + New Article
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-offWhite-300 mb-6">
        {(["published", "pending", "rejected"] as Filter[]).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              filter === f
                ? "border-navy text-navy"
                : "border-transparent text-muted-foreground hover:text-navy"
            }`}
          >
            {f}
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              filter === f ? "bg-navy text-white" : "bg-offWhite text-navy/50"
            }`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Article list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No {filter} articles.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(article => {
            const isExpanded = expandedId === article.id;
            const tags = tagEdits[article.id];
            return (
              <div key={article.id} className="rounded-lg border border-offWhite-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleExpand(article)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-offWhite/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">{article.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {article.submitted_by_name ?? "Unknown"}
                        {article.category ? ` · ${article.category}` : ""}
                        {article.sport && article.sport !== "General" ? ` · ${article.sport}` : ""}
                        {" · "}
                        {filter === "published" ? fmt(article.published_at) : fmt(article.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {article.media_type && (
                      <Badge variant="outline" className="text-xs hidden sm:flex">{article.media_type}</Badge>
                    )}
                    {article.category && (
                      <Badge variant="outline" className="text-xs hidden sm:flex">{article.category}</Badge>
                    )}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-offWhite-300 px-4 pb-4 pt-3 space-y-4">
                    {article.excerpt && (
                      <p className="text-sm text-navy/60 italic">{article.excerpt}</p>
                    )}
                    <div className="rounded-md bg-offWhite p-3 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-navy/70 whitespace-pre-wrap font-sans leading-relaxed">{article.content}</pre>
                    </div>

                    {/* Tag editor */}
                    {tags && (
                      <div className="rounded-md border border-offWhite-300 p-4 space-y-4 bg-white">
                        <p className="text-xs font-semibold uppercase tracking-widest text-navy/40">Tags</p>

                        <div>
                          <p className="text-xs font-medium text-navy mb-2">Sport</p>
                          <div className="flex flex-wrap gap-1.5">
                            {SPORTS.map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setTagEdits(prev => ({ ...prev, [article.id]: { ...prev[article.id], sport: s } }))}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                  tags.sport === s
                                    ? "bg-navy text-white"
                                    : "bg-offWhite border border-offWhite-300 text-navy/60 hover:text-navy"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-navy mb-2">Issue</p>
                          <div className="flex flex-wrap gap-1.5">
                            {ISSUES.map(i => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setTagEdits(prev => ({ ...prev, [article.id]: { ...prev[article.id], category: i } }))}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                  tags.category === i
                                    ? "bg-navy text-white"
                                    : "bg-offWhite border border-offWhite-300 text-navy/60 hover:text-navy"
                                }`}
                              >
                                {i}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-navy mb-2">Media Type</p>
                          <div className="flex flex-wrap gap-1.5">
                            {MEDIA_TYPES.map(m => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setTagEdits(prev => ({ ...prev, [article.id]: { ...prev[article.id], media_type: m } }))}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                  tags.media_type === m
                                    ? "bg-orange-500 text-white"
                                    : "bg-offWhite border border-offWhite-300 text-navy/60 hover:text-navy"
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => saveTags(article.id)}
                          disabled={actingId === article.id}
                          className="inline-flex items-center gap-1.5 rounded-md border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy hover:bg-offWhite transition-colors disabled:opacity-50"
                        >
                          Save Tags
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* View live */}
                      {filter === "published" && (
                        <Link href={`/advice/${article.slug}`} target="_blank"
                          className="inline-flex items-center gap-1.5 rounded-md border border-offWhite-300 px-3 py-1.5 text-xs font-medium text-navy hover:bg-offWhite transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" /> View live
                        </Link>
                      )}

                      {/* Publish */}
                      {filter !== "published" && (
                        <button type="button" onClick={() => setStatus(article.id, "published")}
                          disabled={actingId === article.id}
                          className="inline-flex items-center gap-1.5 rounded-md bg-sage px-3 py-1.5 text-xs font-medium text-white hover:bg-sage-600 transition-colors disabled:opacity-50">
                          <Eye className="h-3.5 w-3.5" /> Publish
                        </button>
                      )}

                      {/* Unpublish */}
                      {filter === "published" && (
                        <button type="button" onClick={() => setStatus(article.id, "pending")}
                          disabled={actingId === article.id}
                          className="inline-flex items-center gap-1.5 rounded-md border border-gold-400 px-3 py-1.5 text-xs font-medium text-gold-700 hover:bg-gold-50 transition-colors disabled:opacity-50">
                          <EyeOff className="h-3.5 w-3.5" /> Unpublish
                        </button>
                      )}

                      {/* Reject */}
                      {filter === "pending" && (
                        <button type="button" onClick={() => setStatus(article.id, "rejected")}
                          disabled={actingId === article.id}
                          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                          Reject
                        </button>
                      )}

                      {/* Delete */}
                      <button type="button" onClick={() => deleteArticle(article.id)}
                        disabled={actingId === article.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
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
