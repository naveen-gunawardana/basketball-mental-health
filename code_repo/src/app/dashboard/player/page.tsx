"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, MessageCircle, Calendar, BookOpen, ChevronDown, ChevronUp, CalendarClock, ChevronRight, AlertTriangle, Lightbulb, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogSessionForm } from "@/components/log-session-form";
import { ReflectionJournal } from "@/components/reflection-journal";
import { AvatarUpload } from "@/components/avatar-upload";
import { ChatWindow } from "@/components/chat-window";
import { useCallPresence } from "@/hooks/use-call-presence";
import { ScheduleCallModal } from "@/components/schedule-call-modal";
import { UpcomingCalls } from "@/components/upcoming-calls";
import { WeeklyGoals } from "@/components/weekly-goals";

type Tab = "home" | "chat" | "sessions" | "journal";

interface Profile { name: string; sport: string | null; avatar_url: string | null }
interface MentorInfo { id: string; name: string; sport: string | null; avatar_url: string | null }
interface MatchData { id: string; meeting_url: string | null; created_at: string; mentor: MentorInfo }
interface SessionRecord { id: string; date: string | null; topics: string[] | null; notes: string | null; flagged: boolean | null; flag_reason: string | null }
interface RecommendedArticle { slug: string; title: string; read_time: string | null }

const TABS: { key: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "home",     label: "Home",     Icon: Home },
  { key: "chat",     label: "Chat",     Icon: MessageCircle },
  { key: "sessions", label: "Sessions", Icon: Calendar },
  { key: "journal",  label: "Journal",  Icon: BookOpen },
];

export default function PlayerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [logOpen, setLogOpen] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mentor, setMentor] = useState<MentorInfo | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [matchCreatedAt, setMatchCreatedAt] = useState<string | null>(null);
  const { startCall, showPostCallBanner, dismissPostCallBanner } = useCallPresence(matchId);
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
        .select("id, meeting_url, created_at, mentor:mentor_id(id, name, sport, avatar_url)")
        .eq("player_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (matchData) {
        const md = matchData as unknown as MatchData;
        setMatchId(md.id);
        setMatchCreatedAt(md.created_at);
        setMentor(md.mentor);

        const { data: sessionData } = await supabase
          .from("sessions")
          .select("id, date, topics, notes, flagged, flag_reason")
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

  async function refreshSessions() {
    if (!matchId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("sessions")
      .select("id, date, topics, notes, flagged, flag_reason")
      .eq("match_id", matchId)
      .order("date", { ascending: false })
      .limit(20);
    setSessions(data ?? []);
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">Entering the locker room...</div>;
  }

  // No match yet — waiting screen
  if (!matchId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-navy">Locker Room</h1>
          <p className="text-muted-foreground mt-1">Welcome, {profile?.name?.split(" ")[0]}.</p>
        </div>
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6 mb-8 flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 shrink-0">
            <CalendarClock className="h-5 w-5 text-orange-500" />
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

  // Log session view
  if (logOpen && matchId && userId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <LogSessionForm
          matchId={matchId}
          userId={userId}
          otherPersonName={mentor?.name ?? ""}
          onCancel={() => setLogOpen(false)}
          onSuccess={() => { setLogOpen(false); refreshSessions(); setActiveTab("sessions"); }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 md:pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {userId && (
          <AvatarUpload userId={userId} name={profile?.name ?? ""} avatarUrl={profile?.avatar_url ?? null} />
        )}
        <div>
          <h1 className="text-2xl font-bold text-navy">Locker Room</h1>
          <p className="text-sm text-muted-foreground">Hey {profile?.name?.split(" ")[0]} — here&apos;s where your mental game lives.</p>
        </div>
      </div>

      {/* Post-call banner */}
      {showPostCallBanner && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-sage-300 bg-sage-50 px-4 py-3">
          <p className="text-sm font-medium text-sage-800">Just finished your call? Log it while it&apos;s fresh.</p>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="bg-sage-600 hover:bg-sage-700 text-white h-7 text-xs" onClick={() => { dismissPostCallBanner(); setLogOpen(true); }}>
              Log session
            </Button>
            <button type="button" onClick={dismissPostCallBanner} className="text-sage-500 hover:text-sage-700 text-xs">Dismiss</button>
          </div>
        </div>
      )}

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

      {/* Desktop tab bar */}
      <div className="hidden md:flex items-center gap-1 border-b border-offWhite-300 mb-6">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === key
                ? "border-navy text-navy"
                : "border-transparent text-muted-foreground hover:text-navy"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── HOME TAB ── */}
      {activeTab === "home" && (() => {
        const matchAgeInDays = matchCreatedAt
          ? Math.floor((Date.now() - new Date(matchCreatedAt).getTime()) / (1000 * 60 * 60 * 24))
          : null;
        const milestone =
          sessions.length === 1
            ? { title: "First session complete!", text: "You showed up. That's the hardest part — keep going." }
            : sessions.length === 5
            ? { title: "5 sessions in", text: "Five conversations that are already shaping your mental game." }
            : matchAgeInDays !== null && matchAgeInDays >= 28 && matchAgeInDays <= 42
            ? { title: "One month in", text: "Your consistency is what makes this work. Keep at it." }
            : null;
        const flaggedSessions = sessions.filter(s => s.flagged);
        return (
        <div className="space-y-5">
          {/* Milestone banner */}
          {milestone && (
            <div className="flex items-center gap-3 rounded-lg border border-gold-200 bg-gold-50 px-4 py-3">
              <Trophy className="h-4 w-4 text-gold-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-navy">{milestone.title}</p>
                <p className="text-xs text-muted-foreground">{milestone.text}</p>
              </div>
            </div>
          )}

          {/* Session prep — mirrors what mentor sees for flagged sessions */}
          {flaggedSessions.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />Before your next call
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {flaggedSessions.map(s => (
                    <div key={s.id} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                      <span className="text-navy">{s.flag_reason ?? "Your mentor noted something to follow up on."}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Your mentor flagged this for your next conversation.</p>
              </CardContent>
            </Card>
          )}

          {/* Upcoming calls */}
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
                  onJoin={() => { startCall(); }}
                  refreshKey={scheduleRefreshKey}
                />
                <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => setShowScheduleModal(true)}>
                  <CalendarClock className="h-3.5 w-3.5 mr-1.5" />Schedule a Call
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">Most pairs meet 2x/month for 30 mins.</p>
              </CardContent>
            </Card>
          )}

          {/* First session guide — shown until first session is logged */}
          {sessions.length === 0 && (
            <Card className="border-orange-200 bg-orange-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-orange-500" />Your first call — what to expect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Your mentor is here to listen, not judge. It&apos;s a conversation, not a performance.</p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-2">Things you can talk about</p>
                  <ul className="space-y-1.5">
                    {[
                      "What's been hardest for you mentally this season",
                      "What your goals are — beyond just winning",
                      "What kind of support you're actually looking for",
                    ].map(q => (
                      <li key={q} className="flex items-start gap-2 text-sm text-navy">
                        <span className="text-orange-400 shrink-0 mt-0.5">•</span>{q}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">It&apos;s okay if it feels a little awkward — that&apos;s normal. Just show up and be honest.</p>
              </CardContent>
            </Card>
          )}

          {/* Weekly goals */}
          {matchId && userId && (
            <WeeklyGoals matchId={matchId} userId={userId} />
          )}

          {/* Mentor card */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-4">
                {mentor?.avatar_url ? (
                  <img src={mentor.avatar_url} alt={mentor.name} className="h-14 w-14 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-navy flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {mentor?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-0.5">Your Mentor</p>
                  <p className="font-semibold text-navy leading-tight">{mentor?.name}</p>
                  {mentor?.sport && <p className="text-sm text-muted-foreground">{mentor.sport}</p>}
                </div>
                <Button size="sm" variant="outline" onClick={() => setActiveTab("chat")}>
                  Message <MessageCircle className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick article recs */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Recommended for You</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
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
        );
      })()}

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && matchId && userId && mentor && (
        <div className="fixed inset-x-0 top-14 bottom-[60px] md:bottom-0 z-20 bg-white flex flex-col">
          <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <ChatWindow
              matchId={matchId}
              currentUserId={userId}
              otherPersonName={mentor.name}
              otherPersonAvatarUrl={mentor.avatar_url}
              fullHeight
            />
          </div>
        </div>
      )}

      {/* ── SESSIONS TAB ── */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy">Session History</h2>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setLogOpen(true)}>
              <Calendar className="h-3.5 w-3.5 mr-1.5" />Log Session
            </Button>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-offWhite-300 p-10 text-center">
              <Calendar className="h-8 w-8 text-navy/20 mx-auto mb-2" />
              <p className="text-sm font-medium text-navy mb-1">No sessions logged yet</p>
              <p className="text-xs text-muted-foreground mb-4">Log your first session after your check-in.</p>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setLogOpen(true)}>
                Log your first session
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
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
                            {session.date ? new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
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
        </div>
      )}

      {/* ── JOURNAL TAB ── */}
      {activeTab === "journal" && userId && (
        <ReflectionJournal playerId={userId} />
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-offWhite-300 z-40">
        <div className="grid grid-cols-4">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                activeTab === key ? "text-navy" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${activeTab === key ? "text-navy" : "text-muted-foreground"}`} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
