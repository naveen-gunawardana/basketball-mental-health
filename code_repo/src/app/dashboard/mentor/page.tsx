"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  Star,
  ChevronRight,
  MessageCircle,
  FileText,
  BookOpen,
} from "lucide-react";

const mentorData = {
  name: "Coach Ray Davis",
  mentees: [
    {
      id: "u1",
      name: "Marcus Johnson",
      avatar: "MJ",
      grade: "10th",
      sessions: 18,
      lastSession: "Feb 8, 2026",
      avgMood: 7.8,
      trend: "up",
      status: "active",
      currentGoal: "Step up as team captain, work on pre-game visualization",
      topics: ["Confidence", "Leadership"],
    },
    {
      id: "u13",
      name: "Andre Mitchell",
      avatar: "AM",
      grade: "11th",
      sessions: 8,
      lastSession: "Jan 18, 2026",
      avgMood: 3.5,
      trend: "down",
      status: "at-risk",
      currentGoal: "Managing family pressure, finding motivation",
      topics: ["Motivation", "Handling pressure"],
    },
  ],
  totalSessions: 26,
  thisWeekSessions: 2,
  avgRating: 4.2,
  upcomingSessions: [
    { player: "Marcus Johnson", date: "Thu, Mar 18", time: "4:00 PM" },
    { player: "Andre Mitchell", date: "Fri, Mar 19", time: "3:30 PM" },
  ],
  recentNotes: [
    {
      player: "Marcus Johnson",
      date: "Feb 8",
      note: "Great session. Marcus is stepping up as team captain. Discussed leadership qualities and how to inspire teammates during tough moments.",
      mood: 8,
    },
    {
      player: "Andre Mitchell",
      date: "Jan 18",
      note: "Andre mentioned thinking about quitting the team. Family pressure at home. Need to follow up and consider connecting with school counselor.",
      mood: 3,
      flagged: true,
    },
    {
      player: "Marcus Johnson",
      date: "Feb 1",
      note: "Worked through visualization techniques before big game. Marcus is buying in to the mental prep routine.",
      mood: 7,
    },
  ],
};

function MoodIndicator({ value }: { value: number }) {
  const color =
    value >= 7 ? "text-emerald-600 bg-emerald-50" : value >= 5 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {value.toFixed(1)}
    </span>
  );
}

export default function MentorDashboard() {
  const d = mentorData;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Mentor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {d.name}. Here&apos;s how your mentees are doing.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/sessions">
            <FileText className="h-4 w-4 mr-2" />
            Log Session
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{d.mentees.length}</p>
              <p className="text-xs text-muted-foreground">Active mentees</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{d.totalSessions}</p>
              <p className="text-xs text-muted-foreground">Total sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{d.thisWeekSessions}</p>
              <p className="text-xs text-muted-foreground">This week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <Star className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{d.avgRating}</p>
              <p className="text-xs text-muted-foreground">Avg session rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mentee cards */}
          <div>
            <h2 className="text-lg font-semibold text-navy mb-4">Your Mentees</h2>
            <div className="space-y-4">
              {d.mentees.map((mentee) => (
                <Card
                  key={mentee.id}
                  className={mentee.status === "at-risk" ? "border-red-200" : ""}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback
                          className={
                            mentee.status === "at-risk"
                              ? "bg-red-100 text-red-700"
                              : "bg-navy-100 text-navy-700"
                          }
                        >
                          {mentee.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-navy">
                            {mentee.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {mentee.grade} grade
                          </Badge>
                          {mentee.status === "at-risk" && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Needs attention
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {mentee.currentGoal}
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="rounded-lg bg-offWhite p-2">
                            <p className="text-lg font-bold text-navy">
                              {mentee.sessions}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Sessions
                            </p>
                          </div>
                          <div className="rounded-lg bg-offWhite p-2">
                            <MoodIndicator value={mentee.avgMood} />
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Avg mood
                            </p>
                          </div>
                          <div className="rounded-lg bg-offWhite p-2">
                            <p className="text-xs font-medium text-navy">
                              {mentee.lastSession}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Last session
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {mentee.topics.map((topic) => (
                            <Badge key={topic} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Session notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Session Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {d.recentNotes.map((note, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-4 ${
                      note.flagged ? "border-red-200 bg-red-50/50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-navy">
                          {note.player}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {note.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MoodIndicator value={note.mood} />
                        {note.flagged && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {d.upcomingSessions.map((session, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Calendar className="h-4 w-4 text-orange-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-navy">
                        {session.player}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.date} at {session.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Talking points */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Prep</CardTitle>
              <CardDescription>
                Suggested talking points for your next sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-navy mb-2">
                    Marcus Johnson
                  </p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <MessageCircle className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
                      Follow up on team captain experience
                    </li>
                    <li className="flex items-start gap-2">
                      <MessageCircle className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
                      Check in on pre-game visualization routine
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-navy mb-2">
                    Andre Mitchell
                  </p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      Follow up on desire to quit — check current status
                    </li>
                    <li className="flex items-start gap-2">
                      <MessageCircle className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
                      Discuss connecting with school counselor
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources to share */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share with Mentees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Pre-Game Confidence Routine", slug: "pre-game-confidence-routine" },
                  { title: "Dealing with Mistakes During Games", slug: "dealing-with-mistakes-during-games" },
                  { title: "How to Stay Motivated During a Plateau", slug: "how-to-stay-motivated-during-a-plateau" },
                ].map((res) => (
                  <Link
                    key={res.slug}
                    href={`/resources/${res.slug}`}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-offWhite transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-orange-500 shrink-0" />
                    <span className="text-sm font-medium text-navy flex-1">
                      {res.title}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
