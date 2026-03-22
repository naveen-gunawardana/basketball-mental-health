"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, ArrowRight, PenLine } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  read_time: string | null;
  published_at: string | null;
}

const CATEGORIES = ["All", "Confidence", "Resilience", "Motivation", "Goal Setting", "Pressure & Anxiety", "Coach Communication"];

export default function AdvicePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("resources")
      .select("id, title, slug, excerpt, category, read_time, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setArticles((data ?? []) as Article[]);
        setLoading(false);
      });
  }, []);

  const filtered = activeCategory === "All"
    ? articles
    : articles.filter(a => a.category === activeCategory);

  const availableCategories = CATEGORIES.filter(
    c => c === "All" || articles.some(a => a.category === c)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-3">The library</p>
          <h1 className="text-4xl font-bold text-navy mb-3">Advice</h1>
          <p className="text-navy/55 max-w-xl leading-relaxed">
            Articles on the mental side of sport — written by athletes, coaches, and mental performance experts. Free, always.
          </p>
        </div>
        <Link
          href="/advice/submit"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-sm border border-navy/20 px-4 py-2.5 text-sm font-medium text-navy hover:bg-navy/5 transition-colors"
        >
          <PenLine className="h-3.5 w-3.5" />Give Advice
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {availableCategories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-navy text-white"
                : "bg-offWhite border border-offWhite-300 text-navy/60 hover:text-navy hover:border-navy/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">Nothing here yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(article => (
            <Link
              key={article.id}
              href={`/advice/${article.slug}`}
              className="group flex flex-col rounded-sm border border-offWhite-300 bg-offWhite p-6 hover:border-offWhite-400 hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-2 mb-4">
                {article.category && (
                  <span className="rounded-sm px-2.5 py-0.5 text-xs font-medium bg-navy/8 text-navy">
                    {article.category}
                  </span>
                )}
                {article.read_time && (
                  <div className="flex items-center gap-1 text-xs text-navy/35">
                    <BookOpen className="h-3 w-3" />
                    {article.read_time}
                  </div>
                )}
              </div>
              <h2 className="font-bold text-navy text-sm leading-snug mb-2 flex-1 group-hover:text-orange-600 transition-colors">
                {article.title}
              </h2>
              {article.excerpt && (
                <p className="text-xs text-navy/55 leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
              )}
              <div className="flex items-center gap-1 text-xs font-semibold text-navy/40 group-hover:text-orange-500 transition-colors mt-auto">
                Read <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
