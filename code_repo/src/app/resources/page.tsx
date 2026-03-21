"use client";

import { useState } from "react";
import Link from "next/link";
import { resources, allCategories } from "@/data/resources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Clock,
  BookOpen,
  Video,
  Pen,
  MessageSquare,
  Filter,
} from "lucide-react";
import type { ResourceFormat } from "@/types/resources";

const formatIcons: Record<ResourceFormat, typeof BookOpen> = {
  article: BookOpen,
  worksheet: Pen,
  script: MessageSquare,
  video: Video,
};

const categoryColors: Record<string, string> = {
  Confidence: "bg-blue-100 text-blue-700",
  "Coach Communication": "bg-purple-100 text-purple-700",
  "Playing Time": "bg-amber-100 text-amber-700",
  "Pressure & Anxiety": "bg-red-100 text-red-700",
  "Goal Setting": "bg-emerald-100 text-emerald-700",
  "Returning from Injury": "bg-cyan-100 text-cyan-700",
};

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const filtered = resources.filter((r) => {
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory || r.category === selectedCategory;
    const matchesFormat = !selectedFormat || r.format === selectedFormat;
    return matchesSearch && matchesCategory && matchesFormat;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Resource Library</h1>
        <p className="text-muted-foreground">
          Articles, worksheets, and scripts to help you build the mental side of
          your game.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mr-2">
            <Filter className="h-4 w-4" />
            Category:
          </div>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !selectedCategory
                ? "bg-navy text-white"
                : "bg-muted text-muted-foreground hover:bg-navy-50"
            }`}
          >
            All
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-navy text-white"
                  : "bg-muted text-muted-foreground hover:bg-navy-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mr-2">
            <Filter className="h-4 w-4" />
            Format:
          </div>
          {(["article", "video", "worksheet", "script"] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() =>
                setSelectedFormat(selectedFormat === fmt ? null : fmt)
              }
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                selectedFormat === fmt
                  ? "bg-orange-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-orange-50"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        {filtered.length} resource{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Resource grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((resource) => {
          const FormatIcon = formatIcons[resource.format];
          return (
            <Link key={resource.slug} href={`/resources/${resource.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        categoryColors[resource.category] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {resource.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {resource.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-snug">
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {resource.summary}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-navy font-medium">
                    <FormatIcon className="h-3.5 w-3.5" />
                    <span className="capitalize">{resource.format}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy mb-1">
            No resources found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setSelectedCategory(null);
              setSelectedFormat(null);
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
