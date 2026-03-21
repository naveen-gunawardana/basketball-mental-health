"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  TrendingUp,
  Calendar,
  BookOpen,
  MessageCircle,
  Star,
  ChevronRight,
  Flame,
  Brain,
  Heart,
  Zap,
} from "lucide-react";

// Mock data for the logged-in player
const playerData = {
  name: "Marcus Johnson",
  mentor: { name: "Coach Ray Davis", avatar: "RD", role: "Former D1 Guard" },
  streak: 6,
  sessionsCompleted: 18,
  nextSession: "Thursday, Mar 18 at 4:00 PM",
  moodHistory: [6, 7, 6, 8, 7, 8, 9, 8, 7, 8, 8, 9],
  weeklyGoals: {
    effort: { description: "Sprint back on defense every single possession", score: 4, target: 5 },
    attitude: { description: "Clap hands after every mistake and move on", score: 3, target: 5 },
    focus: { description: "Stay locked on defensive assignment — no ball-watching", score: 4, target: 5 },
  },
  recentSessions: [
    {
      date: "Feb 8, 2026",
      topics: ["Confidence", "Leadership"],
      mood: 8,
      rating: 5,
      notes: "Great session. Stepping up as team captain.",
    },
    {
      date: "Feb 1, 2026",
      topics: ["Pre-game anxiety", "Self-talk"],
      mood: 7,
      rating: 4,
      notes: "Worked through visualization techniques before big game.",
    },
    {
      date: "Jan 25, 2026",
      topics: ["Leadership", "Team dynamics"],
      mood: 8,
      rating: 5,
      notes: "Led a team huddle on my own this week.",
    },
  ],
  recommendedResources: [
    { slug: "pre-game-confidence-routine", title: "Pre-Game Confidence Routine", readTime: "5 min" },
    { slug: "dealing-with-mistakes-during-games", title: "Dealing with Mistakes During Games", readTime: "6 min" },
    { slug: "setting-weekly-mental-goals", title: "Setting Weekly Mental Goals", readTime: "5 min" },
  ],
};

function MoodBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = value >= 7 ? "bg-emerald-500" : value >= 5 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-muted">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium w-6 text-right">{value}</span>
    </div>
  );
}

export default function PlayerDashboard() {
  const [activeGoalTab, setActiveGoalTab] = useState<"effort" | "attitude" | "focus">("effort");
  const d = playerData;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">
            Welcome back, {d.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Track your mental game progress and prep for your next session.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/sessions">
            <MessageCircle className="h-4 w-4 mr-2" />
            Log Session
          </Link>
        </Button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{d.streak}</p>
              <p className="text-xs text-muted-foreground">Week streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{d.sessionsCompleted}</p>
              <p className="text-xs text-muted-foreground">Sessions total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">
                {d.moodHistory[d.moodHistory.length - 1]}/10
              </p>
              <p className="text-xs text-muted-foreground">Latest mood</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <Star className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">4.7</p>
              <p className="text-xs text-muted-foreground">Avg rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next session */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-navy text-white">
                    {d.mentor.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Next session with</p>
                  <p className="font-semibold text-navy">{d.mentor.name}</p>
                  <p className="text-xs text-muted-foreground">{d.mentor.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-navy">{d.nextSession}</p>
                <Badge variant="secondary" className="mt-1">Upcoming</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Weekly goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Mental Goals</CardTitle>
              <CardDescription>
                Rate yourself 1-5 on each goal after every practice or game
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                {(["effort", "attitude", "focus"] as const).map((tab) => {
                  const icons = { effort: Zap, attitude: Heart, focus: Brain };
                  const Icon = icons[tab];
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveGoalTab(tab)}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                        activeGoalTab === tab
                          ? "bg-navy text-white"
                          : "bg-muted text-muted-foreground hover:bg-navy-50"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab}
                    </button>
                  );
                })}
              </div>
              <div className="rounded-lg bg-offWhite p-4">
                <p className="text-sm font-medium text-navy mb-2">
                  {d.weeklyGoals[activeGoalTab].description}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <MoodBar
                      value={d.weeklyGoals[activeGoalTab].score}
                      max={d.weeklyGoals[activeGoalTab].target}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {d.weeklyGoals[activeGoalTab].score}/{d.weeklyGoals[activeGoalTab].target}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mood over time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mood Trend</CardTitle>
              <CardDescription>Your self-reported mood over last 12 sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1.5 h-32">
                {d.moodHistory.map((mood, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{mood}</span>
                    <div
                      className={`w-full rounded-t ${
                        mood >= 8
                          ? "bg-emerald-500"
                          : mood >= 6
                          ? "bg-amber-400"
                          : "bg-red-400"
                      }`}
                      style={{ height: `${(mood / 10) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                <span>12 sessions ago</span>
                <span>Most recent</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {d.recentSessions.map((session, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 shrink-0">
                      <Calendar className="h-5 w-5 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-navy">
                          {session.date}
                        </p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: session.rating }).map((_, j) => (
                            <Star
                              key={j}
                              className="h-3 w-3 fill-orange-400 text-orange-400"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {session.topics.map((topic) => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.notes}
                      </p>
                      <div className="mt-2">
                        <MoodBar value={session.mood} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Mentor card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Mentor</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-3">
                <AvatarFallback className="bg-navy text-white text-xl">
                  {d.mentor.avatar}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold text-navy">{d.mentor.name}</p>
              <p className="text-sm text-muted-foreground">{d.mentor.role}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-offWhite p-2">
                  <p className="text-lg font-bold text-navy">{d.sessionsCompleted}</p>
                  <p className="text-[10px] text-muted-foreground">Sessions</p>
                </div>
                <div className="rounded-lg bg-offWhite p-2">
                  <p className="text-lg font-bold text-navy">{d.streak}w</p>
                  <p className="text-[10px] text-muted-foreground">Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended for You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {d.recommendedResources.map((res) => (
                  <Link
                    key={res.slug}
                    href={`/resources/${res.slug}`}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-offWhite transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-orange-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">
                        {res.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {res.readTime} read
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
              <Button asChild variant="ghost" className="w-full mt-3">
                <Link href="/resources">View all resources</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick reflection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Check-in</CardTitle>
              <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {[
                  { emoji: "1", label: "Rough" },
                  { emoji: "2", label: "Low" },
                  { emoji: "3", label: "Ok" },
                  { emoji: "4", label: "Good" },
                  { emoji: "5", label: "Great" },
                ].map((m) => (
                  <button
                    key={m.emoji}
                    className="flex flex-col items-center gap-1 rounded-lg border p-2 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                  >
                    <span className="text-lg font-bold text-navy">{m.emoji}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
