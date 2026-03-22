"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, ChevronRight, Clock, ChevronDown, ChevronUp, CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogSessionForm } from "@/components/log-session-form";
import { ReflectionJournal } from "@/components/reflection-journal";
import { AvatarUpload } from "@/components/avatar-upload";
import { ChatWindow } from "@/components/chat-window";
import { useCallPresence } from "@/hooks/use-call-presence";
import { ScheduleCallModal } from "@/components/schedule-call-modal";
import { UpcomingCalls } from "@/components/upcoming-calls";
import { WeeklyGoals } from "@/components/weekly-goals";

interface Profile { name: string; sport: string | null; avatar_url: string | null }
interface MentorInfo { id: string; name: string; sport: string | null; avatar_url: string | null }
interface MatchData { id: string; meeting_url: string | null; mentor: MentorInfo }
interface SessionRecord { id: string; date: string; topics: string[] | null; notes: string | null }

interface RecommendedArticle { slug: string; title: string; read_time: string | null }

export default function PlayerDashboard() {
  const [view, setView] = useState<"home" | "log">("home");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mentor, setMentor] = useState<MentorInfo | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const { startCall } = useCallPresence(matchId);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [recommendedArticles, setRecommendedArticles] = useState<RecommendedArticle[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profileData } = await supabase
        .from("profiles").select("name, sport, avatar_url").eq("id", user.id).single();
      setProfile(profileData);

      const { data: matchData } = await supabase
        .from("matches")
        .select("id, meeting_url, mentor:mentor_id(id, name, sport, avatar_url)")
        .eq("player_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (matchData) {
        const md = matchData as unknown as MatchData;
        setMatchId(md.id);
        setMentor(md.mentor);

        const { data: sessionData } = await supabase
          .from("sessions")
          .select("id, date, topics, notes")
          .eq("match_id", matchData.id)
          .order("date", { ascending: false })
          .limit(20);
        setSessions(sessionData ?? []);

      }

      const { data: articleData } = await supabase
        .from("resources")
        .select("slug, title, read_time")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);
      setRecommendedArticles((articleData ?? []) as RecommendedArticle[]);

      setLoading(false);
    }
    load();
  }, []);


  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">Entering the locker room...</div>;
  }

  if (!matchId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-navy">Locker Room</h1>
          <p className="text-muted-foreground mt-1">Welcome, {profile?.name?.split(" ")[0]}.</p>
        </div>
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6 mb-8 flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 shrink-0">
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-navy">You&apos;re on the list</p>
            <p className="text-sm text-muted-foreground mt-1">
              We&apos;re personally reviewing your application and finding the right mentor for you. This usually takes a few days. We&apos;ll reach out by email when you&apos;re matched.
            </p>
          </div>
        </div>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-4">What happens next</p>
          <div className="space-y-4">
            {[
              { step: "1", title: "We review your application", desc: "We look at your sport, level, and what you're working through to find the right fit." },
              { step: "2", title: "We match you with a mentor", desc: "A current or former athlete whose experience lines up with yours." },
              { step: "3", title: "You get an intro email", desc: "We'll connect you and your mentor over email to set up your first check-in." },
              { step: "4", title: "First session — 15 minutes", desc: "Get to know each other. No pressure, just a conversation." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-white text-xs font-bold shrink-0">{item.step}</div>
                <div>
                  <p className="font-medium text-navy text-sm">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-4">Browse resources while you wait</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {recommendedArticles.map((res) => (
              <Link key={res.slug} href={`/advice/${res.slug}`}
                className="flex items-start gap-3 rounded-lg border p-4 hover:bg-offWhite transition-colors">
                <BookOpen className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy leading-snug">{res.title}</p>
                  {res.read_time && <p className="text-xs text-muted-foreground mt-1">{res.read_time} read</p>}
                </div>
              </Link>
            ))}
          </div>
          <Button asChild variant="secondary"><Link href="/advice">View all advice</Link></Button>
        </div>
      </div>
    );
  }

  if (view === "log" && matchId && userId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <LogSessionForm
          matchId={matchId}
          userId={userId}
          otherPersonName={mentor?.name ?? ""}
          onCancel={() => setView("home")}
          onSuccess={() => setView("home")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {userId && (
            <AvatarUpload userId={userId} name={profile?.name ?? ""} avatarUrl={profile?.avatar_url ?? null} />
          )}
          <div>
            <h1 className="text-3xl font-bold text-navy">Locker Room</h1>
            <p className="text-muted-foreground">Hey {profile?.name?.split(" ")[0]} — here&apos;s where your mental game lives.</p>
          </div>
        </div>
      </div>

      {/* Schedule call modal */}
      {showScheduleModal && matchId && userId && mentor && (
        <ScheduleCallModal
          matchId={matchId}
          currentUserId={userId}
          otherPersonId={mentor.id}
          otherPersonName={mentor.name}
          onClose={() => setShowScheduleModal(false)}
          onScheduled={() => setScheduleRefreshKey(k => k + 1)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly goals */}
          {matchId && userId && (
            <WeeklyGoals matchId={matchId} userId={userId} />
          )}

          {/* Recent sessions — expandable */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Sessions</CardTitle>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setView("log")}>
                <Calendar className="h-3.5 w-3.5 mr-1.5" />Log Session
              </Button>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions logged yet — log your first one after your check-in.</p>
              ) : (
                <div className="space-y-2">
                  {sessions.slice(0, 8).map((session) => {
                    const isOpen = expandedSessionId === session.id;
                    return (
                      <div key={session.id} className="rounded-lg border overflow-hidden">
                        <button type="button" onClick={() => setExpandedSessionId(isOpen ? null : session.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-offWhite/60 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-offWhite shrink-0">
                              <Calendar className="h-4 w-4 text-navy" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-navy">
                                {new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                              {session.topics && session.topics.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {session.topics.slice(0, 2).join(", ")}{session.topics.length > 2 ? ` +${session.topics.length - 2}` : ""}
                                </p>
                              )}
                            </div>
                          </div>
                          {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="border-t px-4 pb-4 pt-3 bg-offWhite/30 space-y-3">
                            {session.topics && session.topics.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1.5">Topics</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {session.topics.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                                </div>
                              </div>
                            )}
                            {session.notes && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                                <p className="text-sm text-navy leading-relaxed">{session.notes}</p>
                              </div>
                            )}
                            {!session.notes && !session.topics?.length && (
                              <p className="text-sm text-muted-foreground">No details recorded.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reflections */}
          <Card>
            <CardContent className="pt-6">
              {userId && <ReflectionJournal playerId={userId} />}
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Recommended for You</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedArticles.map((res) => (
                  <Link key={res.slug} href={`/advice/${res.slug}`}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-offWhite transition-colors">
                    <BookOpen className="h-4 w-4 text-orange-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{res.title}</p>
                      {res.read_time && <p className="text-xs text-muted-foreground">{res.read_time} read</p>}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
              <Button asChild variant="ghost" className="w-full mt-3">
                <Link href="/advice">View all advice</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right column — mentor profile + chat */}
        <div className="space-y-6">
          {/* Upcoming scheduled calls */}
          {matchId && userId && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-navy/50" />Upcoming Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpcomingCalls
                  matchId={matchId}
                  currentUserId={userId}
                  onJoin={startCall}
                  refreshKey={scheduleRefreshKey}
                />
                <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => setShowScheduleModal(true)}>
                  <CalendarClock className="h-3.5 w-3.5 mr-1.5" />Schedule a Call
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mentor card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                {mentor?.avatar_url ? (
                  <img src={mentor.avatar_url} alt={mentor.name} className="h-16 w-16 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-navy flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {mentor?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-0.5">Your Mentor</p>
                  <p className="font-semibold text-navy text-lg leading-tight">{mentor?.name}</p>
                  {mentor?.sport && <p className="text-sm text-muted-foreground">{mentor.sport}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat — always visible */}
          {matchId && userId && mentor && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Messages with {mentor.name.split(" ")[0]}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChatWindow
                  matchId={matchId}
                  currentUserId={userId}
                  otherPersonName={mentor.name}
                  otherPersonAvatarUrl={mentor.avatar_url}
                />
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
