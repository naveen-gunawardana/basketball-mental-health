"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Users, BookOpen, MessageSquare, Calendar, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SignupRow { created_at: string | null; role: string }
interface SessionRow { created_at: string | null }
interface MessageRow { created_at: string | null }
interface ResourceRow { status: string | null; created_at: string | null }
interface MatchRow { created_at: string | null; status: string | null }

function groupByWeek(dates: (string | null)[]) {
  const counts: Record<string, number> = {};
  for (const d of dates) {
    if (!d) continue;
    const date = new Date(d);
    // ISO week start (Monday)
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    const key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function last8Weeks() {
  const weeks: string[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    weeks.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  }
  return weeks;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [signups, setSignups] = useState<SignupRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [s, se, m, r, ma] = await Promise.all([
        supabase.from("profiles").select("created_at, role").order("created_at", { ascending: true }),
        supabase.from("sessions").select("created_at").order("created_at", { ascending: true }),
        supabase.from("messages").select("created_at").order("created_at", { ascending: true }),
        supabase.from("resources").select("status, created_at"),
        supabase.from("matches").select("created_at, status"),
      ]);
      setSignups((s.data ?? []) as SignupRow[]);
      setSessions((se.data ?? []) as SessionRow[]);
      setMessages((m.data ?? []) as MessageRow[]);
      setResources((r.data ?? []) as ResourceRow[]);
      setMatches((ma.data ?? []) as MatchRow[]);
      setLoading(false);
    }
    load();
  }, []);

  const players = signups.filter(s => s.role === "player");
  const mentors = signups.filter(s => s.role === "mentor");
  const activeMatches = matches.filter(m => m.status === "active");
  const publishedArticles = resources.filter(r => r.status === "published");

  const weeks = last8Weeks();
  const signupByWeek = groupByWeek(signups.map(s => s.created_at));
  const sessionByWeek = groupByWeek(sessions.map(s => s.created_at));
  const messageByWeek = groupByWeek(messages.map(m => m.created_at));

  const maxSignups = Math.max(...weeks.map(w => signupByWeek[w] ?? 0), 1);
  const maxSessions = Math.max(...weeks.map(w => sessionByWeek[w] ?? 0), 1);
  const maxMessages = Math.max(...weeks.map(w => messageByWeek[w] ?? 0), 1);

  // 30-day activity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const newSignups30d = signups.filter(s => s.created_at && s.created_at > thirtyDaysAgo).length;
  const newSessions30d = sessions.filter(s => s.created_at && s.created_at > thirtyDaysAgo).length;
  const newMessages30d = messages.filter(m => m.created_at && m.created_at > thirtyDaysAgo).length;
  const newMatches30d = matches.filter(m => m.created_at && m.created_at > thirtyDaysAgo).length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading analytics...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-navy/50 hover:text-navy transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Admin
        </Link>
        <div className="h-4 w-px bg-offWhite-300" />
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-navy" />
          <h1 className="text-2xl font-bold text-navy">Analytics</h1>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Total Users", value: signups.length, icon: Users, color: "text-navy" },
          { label: "Players", value: players.length, icon: Users, color: "text-orange-500" },
          { label: "Mentors", value: mentors.length, icon: Users, color: "text-navy" },
          { label: "Active Matches", value: activeMatches.length, icon: TrendingUp, color: "text-green-600" },
          { label: "Sessions Logged", value: sessions.length, icon: Calendar, color: "text-navy" },
          { label: "Articles Published", value: publishedArticles.length, icon: BookOpen, color: "text-orange-500" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-5 pb-4 px-4">
              <stat.icon className={`h-4 w-4 mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-navy">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last 30 days */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-navy/50 uppercase tracking-widest">Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: "New Signups", value: newSignups30d, icon: Users },
              { label: "New Matches", value: newMatches30d, icon: TrendingUp },
              { label: "Sessions Logged", value: newSessions30d, icon: Calendar },
              { label: "Messages Sent", value: newMessages30d, icon: MessageSquare },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-navy/8 shrink-0">
                  <s.icon className="h-4 w-4 text-navy" />
                </div>
                <div>
                  <p className="text-xl font-bold text-navy">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { title: "Signups / Week", data: signupByWeek, max: maxSignups, color: "bg-navy" },
          { title: "Sessions / Week", data: sessionByWeek, max: maxSessions, color: "bg-orange-500" },
          { title: "Messages / Week", data: messageByWeek, max: maxMessages, color: "bg-navy/40" },
        ].map(chart => (
          <Card key={chart.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{chart.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-24">
                {weeks.map(w => {
                  const val = chart.data[w] ?? 0;
                  const pct = Math.round((val / chart.max) * 100);
                  return (
                    <div key={w} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {val}
                      </div>
                      <div
                        className={`w-full rounded-t-sm ${chart.color} transition-all`}
                        style={{ height: `${Math.max(pct, val > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">{weeks[0]}</span>
                <span className="text-[10px] text-muted-foreground">{weeks[weeks.length - 1]}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Signup breakdown */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Player vs Mentor Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-offWhite-300 overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: signups.length > 0 ? `${Math.round((players.length / signups.length) * 100)}%` : "0%" }}
              />
            </div>
            <div className="flex gap-4 shrink-0 text-xs text-muted-foreground">
              <span><span className="inline-block h-2 w-2 rounded-full bg-orange-500 mr-1" />Players {players.length}</span>
              <span><span className="inline-block h-2 w-2 rounded-full bg-navy mr-1" />Mentors {mentors.length}</span>
            </div>
          </div>
          {signups.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((players.length / signups.length) * 100)}% players · {Math.round((mentors.length / signups.length) * 100)}% mentors
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
