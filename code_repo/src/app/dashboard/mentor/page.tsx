"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, MessageCircle, Calendar, Users, AlertTriangle, BookOpen, ChevronDown, ChevronUp, ChevronRight, PenLine, CalendarClock, Clock, Award, Lightbulb, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogSessionForm } from "@/components/log-session-form";
import { MenteeReflections } from "@/components/mentee-reflections";
import { AvatarUpload } from "@/components/avatar-upload";
import { ChatWindow } from "@/components/chat-window";
import { useCallPresence } from "@/hooks/use-call-presence";
import { ScheduleCallModal } from "@/components/schedule-call-modal";
import { UpcomingCalls } from "@/components/upcoming-calls";
import { WeeklyGoals } from "@/components/weekly-goals";

type Tab = "home" | "chat" | "sessions" | "mentee";

interface PlayerProfile { grade: string | null; school: string | null; level: string | null; challenges: string[] | null; goal: string | null }
interface Mentee { id: string; name: string; sport: string | null; avatar_url: string | null; player_profiles: PlayerProfile | null }
interface Match { id: string; meeting_url: string | null; created_at: string; player: Mentee }
interface SessionRecord {
  id: string; date: string | null; topics: string[] | null;
  notes: string | null; flagged: boolean | null; flag_reason: string | null;
  match_id: string;
}
interface ShareArticle { slug: string; title: string; read_time: string | null }

const CONVERSATION_STARTERS: [string, string][] = [
  ["confidence",    "Tell me about a time you played your best — what was going through your mind?"],
  ["anxiety",       "Walk me through what your head is like in the hour before a game."],
  ["pre-game",      "Walk me through what your head is like in the hour before a game."],
  ["team dynamics", "How would you describe the team chemistry right now?"],
  ["pressure",      "What kind of pressure feels hardest to manage — internal expectations or external?"],
  ["goal setting",  "If we focus on one mental area this season, what would make the biggest difference?"],
  ["focus",         "When do you feel most locked in? What's different about those moments?"],
  ["losses",        "How do you handle a tough loss in the 24 hours after a game?"],
  ["resilience",    "Tell me about a setback you had to bounce back from — on or off the field."],
  ["motivation",    "What keeps you going on the days you don't want to show up?"],
  ["self-talk",     "What does your internal voice sound like in a high-pressure moment?"],
  ["leadership",    "How do you see your role in setting the tone for your team?"],
  ["academic",      "How are you managing the mental load of school and sport together?"],
  ["injury",        "How has the injury affected how you see yourself as an athlete?"],
  ["communication", "Is there something you've been wanting to say to a teammate or coach but haven't?"],
  ["time",          "What part of your schedule feels hardest to control right now?"],
];

const TABS: { key: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "home",     label: "Home",     Icon: Home },
  { key: "chat",     label: "Chat",     Icon: MessageCircle },
  { key: "sessions", label: "Sessions", Icon: Calendar },
  { key: "mentee",   label: "Mentee",   Icon: Users },
];

export default function MentorDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [logOpen, setLogOpen] = useState(false);
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
        .select("id, meeting_url, created_at, player:player_id(id, name, sport, avatar_url, player_profiles(grade, school, level, challenges, goal))")
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
        .select("slug, title, read_time")
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

  const { startCall, showPostCallBanner, dismissPostCallBanner } = useCallPresence(activeMatch?.id ?? null);
  const activeSessions = activeMatch ? sessions.filter(s => s.match_id === activeMatch.id) : [];

  const matchAgeInDays = activeMatch?.created_at
    ? Math.floor((Date.now() - new Date(activeMatch.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const milestone =
    activeSessions.length === 1
      ? { title: "First session complete!", text: "You've officially started. Keep the momentum going." }
      : activeSessions.length === 5
      ? { title: "5 sessions in", text: `${activeMatch?.player.name.split(" ")[0]} is lucky to have a mentor who keeps showing up.` }
      : matchAgeInDays !== null && matchAgeInDays >= 28 && matchAgeInDays <= 42
      ? { title: "One month together", text: "Consistency is the foundation of trust. You're building something real." }
      : null;

  const conversationStarters = (() => {
    const challenges = activeMatch?.player.player_profiles?.challenges ?? [];
    const seen = new Set<string>();
    const results: string[] = [];
    for (const c of challenges) {
      const lower = c.toLowerCase();
      for (const [key, starter] of CONVERSATION_STARTERS) {
        if (lower.includes(key) && !seen.has(starter)) {
          seen.add(starter);
          results.push(starter);
          break;
        }
      }
      if (results.length >= 3) break;
    }
    return results;
  })();

  function switchMentee(playerId: string) {
    setActiveMenteeId(playerId);
    setExpandedSessionId(null);
    setActiveTab("home");
  }

  async function refreshSessions() {
    if (!activeMatch) return;
    const supabase = createClient();
    const matchIds = matches.map(m => m.id);
    const { data } = await supabase
      .from("sessions")
      .select("id, date, topics, notes, flagged, flag_reason, match_id")
      .in("match_id", matchIds)
      .order("date", { ascending: false })
      .limit(50);
    setSessions(data ?? []);
  }

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">Entering the locker room...</div>;
  }

  if (logOpen && selectedMatchId && userId) {
    const mentee = matches.find(m => m.id === selectedMatchId)?.player;
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <LogSessionForm
          matchId={selectedMatchId}
          userId={userId}
          otherPersonName={mentee?.name ?? ""}
          onCancel={() => { setLogOpen(false); setSelectedMatchId(null); }}
          onSuccess={() => { setLogOpen(false); setSelectedMatchId(null); refreshSessions(); setActiveTab("sessions"); }}
        />
      </div>
    );
  }

  // ── Pending / waiting states ──
  if (!approved) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Locker Room</h1>
          <p className="text-muted-foreground mt-1">Hey {mentorName.split(" ")[0]}.</p>
        </div>
        <div className="rounded-lg border-2 border-gold-200 bg-gold-50 p-6 flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 shrink-0">
            <Clock className="h-5 w-5 text-gold-500" />
          </div>
          <div>
            <p className="font-semibold text-navy">Application under review</p>
            <p className="text-sm text-muted-foreground mt-1">Our team reviews every mentor before they&apos;re matched with an athlete. You&apos;ll get an email once you&apos;re approved — usually within a few days.</p>
          </div>
        </div>
        <div className="space-y-3">
          {shareArticles.map((res) => (
            <Link key={res.slug} href={`/advice/${res.slug}`}
              className="flex items-start gap-3 rounded-lg border p-4 hover:bg-offWhite transition-colors">
              <BookOpen className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-navy leading-snug">{res.title}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Locker Room</h1>
          <p className="text-muted-foreground mt-1">Hey {mentorName.split(" ")[0]}.</p>
        </div>
        <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6 flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 shrink-0">
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-navy">You&apos;re approved — waiting on a match</p>
            <p className="text-sm text-muted-foreground mt-1">We&apos;re looking for the right athlete for you. Once matched, you&apos;ll see your mentee here.</p>
          </div>
        </div>
        <div className="rounded-lg border border-offWhite-300 bg-white p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-navy text-sm">Share your experience with the community</p>
            <p className="text-xs text-muted-foreground mt-0.5">Submit an article to the advice library.</p>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href="/advice/submit"><PenLine className="h-3.5 w-3.5 mr-1.5" />Give Advice</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Matched — full dashboard ──
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 md:pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {userId && (
            <AvatarUpload userId={userId} name={mentorName} avatarUrl={mentorAvatarUrl} />
          )}
          <div>
            <h1 className="text-2xl font-bold text-navy">Locker Room</h1>
            <p className="text-sm text-muted-foreground">Hey {mentorName.split(" ")[0]} — here&apos;s how your athletes are doing.</p>
          </div>
        </div>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white hidden sm:flex" asChild>
          <Link href="/advice/submit"><PenLine className="h-3.5 w-3.5 mr-1.5" />Give Advice</Link>
        </Button>
      </div>

      {/* Mentee switcher */}
      {matches.filter(m => m.player).length > 0 && (
        <div className="flex items-center gap-4 mb-5 overflow-x-auto pb-1">
          {matches.filter(m => m.player).map((match) => {
            const isActive = activeMenteeId === match.player.id;
            const hasFlag = sessions.some(s => s.match_id === match.id && s.flagged);
            return (
              <button key={match.player.id} type="button" onClick={() => switchMentee(match.player.id)}
                className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative">
                  <div className={`rounded-full p-0.5 transition-all ${isActive ? "bg-navy" : "bg-transparent opacity-60 hover:opacity-100"}`}>
                    {match.player.avatar_url ? (
                      <img src={match.player.avatar_url} alt={match.player.name} className="h-12 w-12 rounded-full object-cover block" />
                    ) : (
                      <div className="h-12 w-12 rounded-full overflow-hidden">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className={hasFlag ? "bg-red-100 text-red-700" : "bg-navy/10 text-navy"}>
                            {match.player.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                  {hasFlag && <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />}
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-navy" : "text-muted-foreground"}`}>
                  {match.player.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Post-call banner */}
      {showPostCallBanner && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-sage-300 bg-sage-50 px-4 py-3">
          <p className="text-sm font-medium text-sage-800">Just finished your call? Log it while it&apos;s fresh.</p>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="bg-sage-600 hover:bg-sage-700 text-white h-7 text-xs"
              onClick={() => { dismissPostCallBanner(); setSelectedMatchId(activeMatch?.id ?? null); setLogOpen(true); }}>
              Log session
            </Button>
            <button type="button" onClick={dismissPostCallBanner} className="text-sage-500 hover:text-sage-700 text-xs">Dismiss</button>
          </div>
        </div>
      )}

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

      {/* Desktop tab bar */}
      <div className="hidden md:flex items-center gap-1 border-b border-offWhite-300 mb-6">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} type="button" onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === key ? "border-navy text-navy" : "border-transparent text-muted-foreground hover:text-navy"
            }`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      {activeMatch?.player && (
        <>
          {/* ── HOME TAB ── */}
          {activeTab === "home" && (
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

              {/* Upcoming calls */}
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
              {activeSessions.length === 0 && (
                <Card className="border-orange-200 bg-orange-50/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-orange-500" />Your first call — a quick guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-2">15-min agenda</p>
                      <div className="space-y-2">
                        {([
                          ["0–3 min",   "Quick intro — who you are, how you got into this"],
                          ["3–8 min",   "Let them talk — what's been hard mentally this season"],
                          ["8–12 min",  "Share one experience from your career that connects"],
                          ["12–15 min", "Agree on one thing to focus on next time"],
                        ] as [string, string][]).map(([time, text]) => (
                          <div key={time} className="flex gap-3 text-sm">
                            <span className="text-xs font-mono text-muted-foreground shrink-0 w-16 mt-0.5">{time}</span>
                            <span className="text-navy">{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-2">Good opening questions</p>
                      <ul className="space-y-1.5">
                        {[
                          "What made you sign up for Mentality Sports?",
                          "What does a tough game look like for you mentally?",
                          "What would a win look like this season — beyond the scoreboard?",
                        ].map(q => (
                          <li key={q} className="flex items-start gap-2 text-sm text-navy">
                            <span className="text-orange-400 shrink-0 mt-0.5">•</span>{q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Weekly goals */}
              {userId && (
                <WeeklyGoals matchId={activeMatch.id} userId={userId} />
              )}

              {/* Mentee quick profile */}
              <Card>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-4">
                    {activeMatch.player.avatar_url ? (
                      <img src={activeMatch.player.avatar_url} alt={activeMatch.player.name} className="h-14 w-14 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-navy/10 flex items-center justify-center text-navy text-lg font-bold shrink-0">
                        {activeMatch.player.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-0.5">Your Athlete</p>
                      <p className="font-semibold text-navy">{activeMatch.player.name}</p>
                      {activeMatch.player.sport && <p className="text-sm text-muted-foreground">{activeMatch.player.sport}</p>}
                      {activeMatch.player.player_profiles?.level && (
                        <p className="text-xs text-muted-foreground">{activeMatch.player.player_profiles.level}</p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab("chat")}>
                      Message <MessageCircle className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                  {activeMatch.player.player_profiles?.challenges && activeMatch.player.player_profiles.challenges.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-offWhite-200">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Working through</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeMatch.player.player_profiles.challenges.slice(0, 4).map(c => (
                          <span key={c} className="rounded-sm bg-offWhite px-2.5 py-1 text-xs font-medium text-navy/70 border border-offWhite-300">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Conversation starters based on athlete's challenges */}
              {conversationStarters.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-navy/40" />
                      Talking points for {activeMatch.player.name.split(" ")[0]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {conversationStarters.map((starter, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <span className="text-orange-400 font-semibold shrink-0 mt-0.5">{i + 1}.</span>
                          <span className="text-navy leading-snug">{starter}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Share with mentee */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Share with Mentee</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {shareArticles.map((res) => (
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
          )}

          {/* ── CHAT TAB ── */}
          {activeTab === "chat" && userId && (
            <div className="flex flex-col overflow-hidden
                            fixed inset-x-0 top-14 bottom-[60px] z-20 bg-white px-4 sm:px-6
                            md:relative md:inset-auto md:bottom-auto md:z-auto md:bg-transparent md:px-0
                            md:h-[calc(100dvh-314px)]">
              <ChatWindow
                matchId={activeMatch.id}
                currentUserId={userId}
                otherPersonName={activeMatch.player.name}
                otherPersonAvatarUrl={activeMatch.player.avatar_url}
                fullHeight
              />
            </div>
          )}

          {/* ── SESSIONS TAB ── */}
          {activeTab === "sessions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-navy">Session Notes</h2>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => { setSelectedMatchId(activeMatch.id); setLogOpen(true); }}>
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />Log Session
                </Button>
              </div>

              {/* Service hours summary */}
              {activeSessions.length > 0 && (() => {
                const totalMins = activeSessions.reduce((sum, s) => sum + 45, 0);
                const totalHrs = (totalMins / 60).toFixed(1);
                return (
                  <div className="flex items-center justify-between rounded-lg border border-offWhite-300 bg-offWhite px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-navy/40 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-navy">{activeSessions.length} sessions — {totalHrs} hrs of mentorship</p>
                        <p className="text-xs text-muted-foreground">Need to verify hours for your athletic program?</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild className="shrink-0">
                      <Link href="/dashboard/mentor/hours-report">View Report</Link>
                    </Button>
                  </div>
                );
              })()}

              {activeSessions.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-offWhite-300 p-10 text-center">
                  <Calendar className="h-8 w-8 text-navy/20 mx-auto mb-2" />
                  <p className="text-sm font-medium text-navy mb-1">No sessions logged yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Log your first session after your check-in.</p>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => { setSelectedMatchId(activeMatch.id); setLogOpen(true); }}>
                    Log first session
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeSessions.map((session) => {
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
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── MENTEE TAB ── */}
          {activeTab === "mentee" && (
            <div className="space-y-6">
              {/* Full mentee profile */}
              {activeMatch.player.player_profiles && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Athlete Profile</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {activeMatch.player.player_profiles.goal && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Their #1 goal</p>
                        <p className="text-sm text-navy leading-relaxed">{activeMatch.player.player_profiles.goal}</p>
                      </div>
                    )}
                    {activeMatch.player.player_profiles.challenges && activeMatch.player.player_profiles.challenges.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Working through</p>
                        <div className="flex flex-wrap gap-1.5">
                          {activeMatch.player.player_profiles.challenges.map(c => (
                            <span key={c} className="rounded-sm bg-offWhite px-2.5 py-1 text-xs font-medium text-navy/70 border border-offWhite-300">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {activeMatch.player.player_profiles.grade && (
                        <div><p className="text-xs text-muted-foreground">Grade</p><p className="text-sm font-medium text-navy">{activeMatch.player.player_profiles.grade}</p></div>
                      )}
                      {activeMatch.player.player_profiles.level && (
                        <div><p className="text-xs text-muted-foreground">Level</p><p className="text-sm font-medium text-navy">{activeMatch.player.player_profiles.level}</p></div>
                      )}
                      {activeMatch.player.player_profiles.school && (
                        <div><p className="text-xs text-muted-foreground">School</p><p className="text-sm font-medium text-navy">{activeMatch.player.player_profiles.school}</p></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Shared reflections */}
              <MenteeReflections playerId={activeMatch.player.id} playerName={activeMatch.player.name} />

              {/* Flagged session prep */}
              {activeSessions.some(s => s.flagged) && (
                <Card className="border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />Session Prep
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
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
          )}
        </>
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-offWhite-300 z-40">
        <div className="grid grid-cols-4">
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                activeTab === key ? "text-navy" : "text-muted-foreground"
              }`}>
              <Icon className={`h-5 w-5 ${activeTab === key ? "text-navy" : "text-muted-foreground"}`} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
