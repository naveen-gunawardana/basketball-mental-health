"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, AlertTriangle, FileText, BookOpen, ChevronRight, Clock, ChevronDown, ChevronUp, PenLine, CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogSessionForm } from "@/components/log-session-form";
import { MenteeReflections } from "@/components/mentee-reflections";
import { AvatarUpload } from "@/components/avatar-upload";
import { ChatWindow } from "@/components/chat-window";
import { useCallPresence } from "@/hooks/use-call-presence";
import { ScheduleCallModal } from "@/components/schedule-call-modal";
import { UpcomingCalls } from "@/components/upcoming-calls";
import { WeeklyGoals } from "@/components/weekly-goals";

interface PlayerProfile { grade: string | null; school: string | null; level: string | null; challenges: string[] | null; goal: string | null }
interface Mentee { id: string; name: string; sport: string | null; avatar_url: string | null; player_profiles: PlayerProfile | null }
interface Match { id: string; meeting_url: string | null; player: Mentee }
interface SessionRecord {
  id: string; date: string | null; topics: string[] | null;
  notes: string | null; flagged: boolean | null; flag_reason: string | null;
  match_id: string;
}

interface ShareArticle { slug: string; title: string }


export default function MentorDashboard() {
  const [view, setView] = useState<"home" | "log">("home");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0);

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [activeMenteeId, setActiveMenteeId] = useState<string | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mentorName, setMentorName] = useState("");
  const [mentorAvatarUrl, setMentorAvatarUrl] = useState<string | null>(null);
  const [approved, setApproved] = useState<boolean | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [shareArticles, setShareArticles] = useState<ShareArticle[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles").select("name, sport, avatar_url").eq("id", user.id).single();
      setMentorName(profile?.name ?? "");
      setMentorAvatarUrl(profile?.avatar_url ?? null);

      const { data: mentorProfile } = await supabase
        .from("mentor_profiles").select("approved").eq("id", user.id).single();
      setApproved(mentorProfile?.approved ?? false);

      const { data: matchData } = await supabase
        .from("matches")
        .select("id, meeting_url, player:player_id(id, name, sport, avatar_url, player_profiles(grade, school, level, challenges, goal))")
        .eq("mentor_id", user.id)
        .eq("status", "active");

      const typedMatches = (matchData ?? []) as unknown as Match[];
setMatches(typedMatches);
      const firstWithPlayer = typedMatches.find(m => m.player != null);
      if (firstWithPlayer) setActiveMenteeId(firstWithPlayer.player.id);

      if (typedMatches.length > 0) {
        const matchIds = typedMatches.map(m => m.id);
        const { data: sessionData } = await supabase
          .from("sessions")
          .select("id, date, topics, notes, flagged, flag_reason, match_id")
          .in("match_id", matchIds)
          .order("date", { ascending: false })
          .limit(50);
        setSessions(sessionData ?? []);
      }

      const { data: articleData } = await supabase
        .from("resources")
        .select("slug, title")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);
      setShareArticles((articleData ?? []) as ShareArticle[]);

      setLoading(false);
    }
    load();
  }, []);


  const activeMatch =
    matches.find(m => m.player?.id === activeMenteeId) ??
    matches.find(m => m.player != null) ??
    null;

  const { startCall } = useCallPresence(activeMatch?.id ?? null);
  const activeSessions = activeMatch ? sessions.filter(s => s.match_id === activeMatch.id) : [];

  // Reset chat + expanded session when switching mentees
  function switchMentee(playerId: string) {
    setActiveMenteeId(playerId);
    setExpandedSessionId(null);
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">Entering the locker room...</div>;
  }



  if (view === "log" && selectedMatchId && userId) {
    const mentee = matches.find(m => m.id === selectedMatchId)?.player;
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <LogSessionForm
          matchId={selectedMatchId}
          userId={userId}
          otherPersonName={mentee?.name ?? ""}
          onCancel={() => { setView("home"); setSelectedMatchId(null); }}
          onSuccess={() => { setView("home"); setSelectedMatchId(null); }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {userId && (
            <AvatarUpload userId={userId} name={mentorName} avatarUrl={mentorAvatarUrl} />
          )}
          <div>
            <h1 className="text-3xl font-bold text-navy">Locker Room</h1>
            <p className="text-muted-foreground">Hey {mentorName.split(" ")[0]} — here&apos;s how your mentees are doing.</p>
          </div>
        </div>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
          <Link href="/advice/submit">
            <PenLine className="h-3.5 w-3.5 mr-1.5" />Give Advice
          </Link>
        </Button>
      </div>

      {!approved ? (
        <div className="max-w-2xl space-y-8">
          <div className="rounded-lg border-2 border-gold-200 bg-gold-50 p-6 flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 shrink-0">
              <Clock className="h-5 w-5 text-gold-500" />
            </div>
            <div>
              <p className="font-semibold text-navy">Application under review</p>
              <p className="text-sm text-muted-foreground mt-1">
                Our team reviews every mentor before they&apos;re matched with an athlete. You&apos;ll get an email once you&apos;re approved — usually within a few days.
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-4">What to expect</p>
            <div className="space-y-4">
              {[
                { step: "1", title: "We review your application", desc: "We look at your sport background, skills, and what you're hoping to give back." },
                { step: "2", title: "You get an approval email", desc: "Once approved, we start looking for an athlete whose needs match your experience." },
                { step: "3", title: "We make the match", desc: "We personally pair you with an athlete and intro you both over email." },
                { step: "4", title: "First check-in — 15 minutes", desc: "Get to know each other. No agenda required. Just show up and listen." },
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
            <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-4">Get a head start — read while you wait</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {shareArticles.map((res) => (
                <Link key={res.slug} href={`/advice/${res.slug}`}
                  className="flex items-start gap-3 rounded-lg border p-4 hover:bg-offWhite transition-colors">
                  <BookOpen className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-navy leading-snug">{res.title}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-offWhite-300 bg-white p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-navy text-sm">Have something to share?</p>
              <p className="text-xs text-muted-foreground mt-0.5">You can submit articles to the advice library even before you&apos;re matched.</p>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link href="/advice/submit">
                <PenLine className="h-3.5 w-3.5 mr-1.5" />Give Advice
              </Link>
            </Button>
          </div>
        </div>
      ) : matches.length === 0 ? (
        <div className="max-w-2xl space-y-8">
          <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6 flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 shrink-0">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-navy">You&apos;re approved — waiting on a match</p>
              <p className="text-sm text-muted-foreground mt-1">
                We&apos;re looking for the right athlete for you. Once we find a fit, we&apos;ll connect you both over email and you&apos;ll see your mentee here.
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-4">Good mentors do these things</p>
            <div className="space-y-3">
              {[
                { title: "Ask, don't tell", desc: "Start with questions. What are they dealing with? What have they already tried? Listen before you advise." },
                { title: "Lead with your own story", desc: "Your athlete will open up faster when you're honest about what you struggled with too." },
                { title: "Keep it consistent", desc: "15 minutes every week beats a 2-hour call once a month. Consistency is the relationship." },
                { title: "You don't need all the answers", desc: "You're not a therapist. Your job is to be present, honest, and a step ahead on the path they're on." },
              ].map((tip) => (
                <div key={tip.title} className="flex items-start gap-3 rounded-lg border border-offWhite-300 bg-white p-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-navy">{tip.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-4">Read what your mentee might be going through</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {shareArticles.map((res) => (
                <Link key={res.slug} href={`/advice/${res.slug}`}
                  className="flex items-start gap-3 rounded-lg border p-4 hover:bg-offWhite transition-colors">
                  <BookOpen className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-navy leading-snug">{res.title}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-offWhite-300 bg-white p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-navy text-sm">Share your experience with the community</p>
              <p className="text-xs text-muted-foreground mt-0.5">Submit an article to the advice library. Admin reviews before it goes live.</p>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link href="/advice/submit">
                <PenLine className="h-3.5 w-3.5 mr-1.5" />Give Advice
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Mentee switcher */}
          <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-3">Your Athletes</p>
          <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
            {matches.filter(m => m.player).map((match) => {
              const isActive = activeMenteeId === match.player.id;
              const hasFlag = sessions.some(s => s.match_id === match.id && s.flagged);
              return (
                <button
                  key={match.player.id}
                  type="button"
                  onClick={() => switchMentee(match.player.id)}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div className="relative">
                    <div className={`rounded-full p-0.5 transition-all ${isActive ? "bg-navy" : "bg-transparent opacity-60 hover:opacity-100"}`}>
                      {match.player.avatar_url ? (
                        <img src={match.player.avatar_url} alt={match.player.name}
                          className="h-14 w-14 rounded-full object-cover block" />
                      ) : (
                        <div className="h-14 w-14 rounded-full overflow-hidden">
                          <Avatar className="h-14 w-14">
                            <AvatarFallback className={hasFlag ? "bg-red-100 text-red-700" : "bg-navy/10 text-navy"}>
                              {match.player.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                    {hasFlag && (
                      <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white" />
                    )}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${isActive ? "text-navy" : "text-muted-foreground"}`}>
                    {match.player.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Schedule call modal */}
          {showScheduleModal && userId && activeMatch?.player && (
            <ScheduleCallModal
              matchId={activeMatch.id}
              currentUserId={userId}
              otherPersonId={activeMatch.player.id}
              otherPersonName={activeMatch.player.name}
              onClose={() => setShowScheduleModal(false)}
              onScheduled={() => setScheduleRefreshKey(k => k + 1)}
            />
          )}

          {/* Active mentee view */}
          {activeMatch?.player && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: profile + sessions + reflections */}
              <div className="lg:col-span-2 space-y-6">
                {/* Weekly goals */}
                {userId && (
                  <WeeklyGoals matchId={activeMatch.id} userId={userId} />
                )}

              {/* Session notes — expandable */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Session Notes</CardTitle>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => { setSelectedMatchId(activeMatch.id); setView("log"); }}>
                      <FileText className="h-3.5 w-3.5 mr-1.5" />Log Session
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {activeSessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeSessions.slice(0, 10).map((session) => {
                          const isOpen = expandedSessionId === session.id;
                          return (
                            <div key={session.id} className="rounded-lg border overflow-hidden">
                              <button type="button" onClick={() => setExpandedSessionId(isOpen ? null : session.id)}
                                className={`w-full flex items-center justify-between p-4 text-left hover:bg-offWhite/60 transition-colors ${session.flagged ? "bg-red-50/40" : ""}`}>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-offWhite shrink-0">
                                    <Calendar className="h-4 w-4 text-navy" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-navy">
                                      {session.date ? new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                    </p>
                                    {session.topics && session.topics.length > 0 && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {session.topics.slice(0, 2).join(", ")}{session.topics.length > 2 ? ` +${session.topics.length - 2}` : ""}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {session.flagged && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                </div>
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
                                  {session.flagged && session.flag_reason && (
                                    <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
                                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                                      <p className="text-xs text-red-700">{session.flag_reason}</p>
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
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Reflections</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <MenteeReflections playerId={activeMatch.player.id} playerName={activeMatch.player.name} />
                  </CardContent>
                </Card>

                {/* Share with Mentee */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">Share with Mentee</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {shareArticles.map((res) => (
                        <Link key={res.slug} href={`/advice/${res.slug}`}
                          className="flex items-center gap-3 rounded-lg border p-3 hover:bg-offWhite transition-colors">
                          <BookOpen className="h-4 w-4 text-orange-500 shrink-0" />
                          <span className="text-sm font-medium text-navy flex-1">{res.title}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Right sidebar — chat + flagged prep */}
              <div className="space-y-6">
                {/* Upcoming scheduled calls */}
                {userId && activeMatch && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-navy/50" />Upcoming Calls
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UpcomingCalls
                        matchId={activeMatch.id}
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

                {/* Chat — always visible */}
                {userId && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Messages with {activeMatch.player.name.split(" ")[0]}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChatWindow
                        matchId={activeMatch.id}
                        currentUserId={userId}
                        otherPersonName={activeMatch.player.name}
                        otherPersonAvatarUrl={activeMatch.player.avatar_url}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Flagged prep */}
                {activeSessions.some(s => s.flagged) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Session Prep</CardTitle>
                      <CardDescription>Things to follow up on</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {activeSessions.filter(s => s.flagged).map(s => (
                          <div key={s.id} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{s.flag_reason ?? "Flagged for follow-up"}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
