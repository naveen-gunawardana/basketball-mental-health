"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  read_time: string | null;
  submitted_by_name: string | null;
  published_at: string | null;
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl font-bold text-navy mt-8 mb-3 first:mt-0">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      elements.push(
        <p key={i} className="font-semibold text-navy mt-4 mb-1">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.trim() === "") {
      // skip blank lines
    } else if (/^\[youtube:[a-zA-Z0-9_-]+\]$/.test(line.trim())) {
      const videoId = line.trim().slice(9, -1);
      elements.push(
        <div key={i} className="my-8 rounded-xl overflow-hidden aspect-video w-full shadow-sm border border-offWhite-300">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    } else {
      // Regular paragraph — handle inline **bold**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <p key={i} className="text-navy/75 leading-relaxed mb-3">
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={j} className="font-semibold text-navy">{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    }
    i++;
  }

  return elements;
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const supabase = createClient();
    supabase
      .from("resources")
      .select("id, title, slug, content, excerpt, category, read_time, submitted_by_name, published_at")
      .eq("slug", slug)
      .eq("status", "published")
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setNotFound(true); }
        else { setArticle(data as Article); }
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground text-sm">Loading...</div>;
  }

  if (notFound || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-navy font-semibold mb-2">Article not found</p>
        <Link href="/advice" className="text-sm text-navy/50 hover:text-navy underline">Back to Advice</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Back */}
      <Link href="/advice" className="inline-flex items-center gap-1.5 text-sm text-navy/50 hover:text-navy transition-colors mb-8">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Advice
      </Link>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {article.category && (
          <span className="rounded-sm px-2.5 py-0.5 text-xs font-medium bg-navy/8 text-navy">
            {article.category}
          </span>
        )}
        {article.read_time && (
          <div className="flex items-center gap-1 text-xs text-navy/40">
            <BookOpen className="h-3 w-3" />
            {article.read_time} read
          </div>
        )}
        {article.published_at && (
          <div className="flex items-center gap-1 text-xs text-navy/40">
            <Clock className="h-3 w-3" />
            {new Date(article.published_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-4">
        {article.title}
      </h1>

      {article.excerpt && (
        <p className="text-lg text-navy/55 leading-relaxed mb-10 border-l-4 border-orange-400 pl-4">
          {article.excerpt}
        </p>
      )}

      {/* Content */}
      <div className="prose-content">
        {renderMarkdown(article.content)}
      </div>

      {article.submitted_by_name && (
        <div className="mt-10 pt-6 border-t border-offWhite-300 text-xs text-muted-foreground">
          Contributed by <span className="font-medium text-navy">{article.submitted_by_name}</span>
        </div>
      )}

      <div className="mt-8">
        <Link href="/advice" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-orange-500 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          More Advice
        </Link>
      </div>
    </div>
  );
}
