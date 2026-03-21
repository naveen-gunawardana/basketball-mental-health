"use client";

import Link from "next/link";
import { useState } from "react";
import { mentors, allSports, allLevels } from "@/lib/mock-mentors";
import { ArrowRight } from "lucide-react";

const statusLabels: Record<string, string> = {
  current: "Current Athlete",
  former: "Former Athlete",
};

export default function MentorsPage() {
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const filtered = mentors.filter((m) => {
    if (sportFilter && m.sport !== sportFilter) return false;
    if (levelFilter && m.level !== levelFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-offWhite border-b border-offWhite-300 px-6 py-20 md:px-12 lg:px-20 xl:px-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-4">Our Network</p>
            <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight mb-5">
              Meet our mentors
            </h1>
            <p className="text-lg text-navy/60 leading-relaxed max-w-2xl">
              Our mentors are current and former athletes who&apos;ve navigated the mental
              side of sport — the pressure, the setbacks, the identity shifts. We personally
              match each athlete with a mentor based on their sport, challenges, and goals.
            </p>
          </div>
        </div>
      </section>

      {/* Matching note */}
      <section className="bg-navy text-white px-6 py-6 md:px-12 lg:px-20 xl:px-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-400" />
              <p className="text-sm text-white/70">
                <span className="text-white font-medium">Matching is personal, not self-selected.</span>
                {" "}We pair each athlete with the right mentor — you don&apos;t choose, we do the work.
              </p>
            </div>
            <Link
              href="/signup?role=player"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Apply to be matched <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-offWhite-300 px-6 py-5 md:px-12 lg:px-20 xl:px-32">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-navy/30 mr-1">Filter</span>

          <button
            type="button"
            onClick={() => setSportFilter(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              !sportFilter ? "bg-navy text-white" : "bg-offWhite text-navy/60 hover:bg-offWhite-300"
            }`}
          >
            All Sports
          </button>
          {allSports.map((sport) => (
            <button
              type="button"
              key={sport}
              onClick={() => setSportFilter(sportFilter === sport ? null : sport)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                sportFilter === sport ? "bg-navy text-white" : "bg-offWhite text-navy/60 hover:bg-offWhite-300"
              }`}
            >
              {sport}
            </button>
          ))}

          <div className="w-px h-4 bg-offWhite-300 mx-1" />

          {allLevels.map((level) => (
            <button
              type="button"
              key={level}
              onClick={() => setLevelFilter(levelFilter === level ? null : level)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                levelFilter === level ? "bg-orange-500 text-white" : "bg-offWhite text-navy/60 hover:bg-offWhite-300"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </section>

      {/* Mentor grid */}
      <section className="bg-offWhite px-6 py-16 md:px-12 lg:px-20 xl:px-32">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs text-navy/40 mb-8">
            {filtered.length} mentor{filtered.length !== 1 ? "s" : ""} in our network
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-2xl p-7 border border-offWhite-300 flex flex-col gap-5"
              >
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white font-bold text-sm ${mentor.avatarColor}`}>
                    {mentor.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-navy">{mentor.name}</h3>
                    <p className="text-sm text-navy/50 mt-0.5">
                      {mentor.sport} &middot; {mentor.level} &middot; {mentor.school}
                    </p>
                    <div className="mt-1.5 inline-flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${mentor.status === "current" ? "bg-sage-500" : "bg-offWhite-400"}`} />
                      <span className="text-xs text-navy/40">
                        {statusLabels[mentor.status]}
                        {mentor.year ? ` · ${mentor.year}` : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="border-l-2 border-orange-300 pl-4">
                  <p className="text-sm text-navy/70 leading-relaxed italic">
                    &ldquo;{mentor.quote}&rdquo;
                  </p>
                </blockquote>

                {/* Focus areas */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {mentor.focusAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full bg-offWhite px-2.5 py-1 text-xs font-medium text-navy/60 border border-offWhite-300"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-navy/40 mb-3">No mentors match that filter.</p>
              <button
                type="button"
                onClick={() => { setSportFilter(null); setLevelFilter(null); }}
                className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Become a mentor CTA */}
      <section className="bg-navy text-white px-6 py-20 md:px-12 lg:px-20 xl:px-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-4">Give Back</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Are you a current or former athlete?
              </h2>
              <p className="text-white/60 leading-relaxed max-w-lg">
                15 minutes a week. That&apos;s all it takes to be the person a younger athlete
                needed and didn&apos;t have. We handle the matching — you just show up.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup?role=mentor"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-4 font-semibold hover:bg-orange-600 transition-colors text-center"
              >
                Apply to Mentor <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/resources"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-4 font-semibold hover:bg-white/15 transition-colors border border-white/10 text-center"
              >
                Explore Resources
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
