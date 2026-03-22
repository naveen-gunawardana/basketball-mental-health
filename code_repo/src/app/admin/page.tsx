"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, X, Link2, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlayerProfile {
  age: number | null; school: string | null; grade: string | null;
  level: string | null; challenges: string[] | null; goal: string | null; availability: string | null;
}
interface MentorProfile {
  college: string | null; years_played: number | null; skills: string[] | null;
  why: string | null; availability: string | null; approved: boolean;
}
interface Person {
  id: string; name: string; role: string; sport: string | null; created_at: string;
  player_profiles: PlayerProfile | null;
  mentor_profiles: MentorProfile | null;
}
interface Match { id: string; status: string; created_at: string; meeting_url: string | null; player: Person; mentor: Person }
interface FlaggedSession { id: string; date: string; flag_reason: string | null; match_id: string; player_name: string; mentor_name: string }
interface PendingArticle { id: string; title: string; category: string | null; excerpt: string | null; content: string; submitted_by_name: string | null; created_at: string }

export default function AdminPage() {
  const [players, setPlayers] = useState<Person[]>([]);
  const [mentors, setMentors] = useState<Person[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [flagged, setFlagged] = useState<FlaggedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [expandedMentorId, setExpandedMentorId] = useState<string | null>(null);
  const [matchingPlayer, setMatchingPlayer] = useState<Person | null>(null);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");
  const [copiedMatchId, setCopiedMatchId] = useState<string | null>(null);
  const [pendingArticles, setPendingArticles] = useState<PendingArticle[]>([]);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const [articleAction, setArticleAction] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const [profilesRes, matchesRes, sessionsRes, articlesRes] = await Promise.all([
      supabase.from("profiles").select(`
        id, name, role, sport, created_at,
        player_profiles(age, school, grade, level, challenges, goal, availability),
        mentor_profiles(college, years_played, skills, why, availability, approved)
      `).order("created_at", { ascending: false }),
      supabase.from("matches").select("id, status, created_at, meeting_url, player:player_id(id, name, role, sport, created_at), mentor:mentor_id(id, name, role, sport, created_at)").order("created_at", { ascending: false }),
      supabase.from("sessions").select("id, flagged, flag_reason, match_id, date"),
      supabase.from("resources").select("id, title, category, excerpt, content, submitted_by_name, created_at").eq("status", "pending").order("created_at", { ascending: true }),
    ]);

    const all = (profilesRes.data ?? []) as unknown as Person[];
    setPlayers(all.filter(p => p.role === "player"));
    setMentors(all.filter(p => p.role === "mentor"));

    const typedMatches = (matchesRes.data ?? []) as unknown as Match[];
    setMatches(typedMatches);

    const flaggedSessions = (sessionsRes.data ?? []).filter(s => s.flagged);
    setFlagged(flaggedSessions.map(s => {
      const match = typedMatches.find(m => m.id === s.match_id);
      return { id: s.id, date: s.date, flag_reason: s.flag_reason, match_id: s.match_id,
        player_name: match?.player?.name ?? "Unknown", mentor_name: match?.mentor?.name ?? "Unknown" };
    }));

    setPendingArticles((articlesRes.data ?? []) as PendingArticle[]);
    setLoading(false);
  }

  async function reviewArticle(id: string, action: "published" | "rejected") {
    setArticleAction(id);
    const supabase = createClient();
    await supabase.from("resources").update({
      status: action,
      ...(action === "published" ? { published_at: new Date().toISOString() } : {}),
    }).eq("id", id);
    setPendingArticles(prev => prev.filter(a => a.id !== id));
    setArticleAction(null);
    setExpandedArticleId(null);
  }

  useEffect(() => { load(); }, []);

  const activeMatches = matches.filter(m => m.status === "active");
  const matchedPlayerIds = new Set(activeMatches.map(m => m.player?.id));
  const matchedMentorIds = new Set(activeMatches.map(m => m.mentor?.id));
  const pendingMentors = mentors.filter(m => !m.mentor_profiles?.approved);
  const approvedUnmatchedMentors = mentors.filter(m => m.mentor_profiles?.approved && !matchedMentorIds.has(m.id));

  function getMatchFor(id: string) {
    return activeMatches.find(m => m.player?.id === id || m.mentor?.id === id);
  }

  async function createMatch(mentorId: string) {
    if (!matchingPlayer) return;
    setCreating(true);
    setCreateMsg("");
    const supabase = createClient();
    const { error } = await supabase.from("matches").insert({ player_id: matchingPlayer.id, mentor_id: mentorId, status: "active" });
    if (error) { setCreateMsg(`Error: ${error.message}`); }
    else { setMatchingPlayer(null); setCreateMsg(""); await load(); }
    setCreating(false);
  }

  async function endMatch(matchId: string) {
    const supabase = createClient();
    await supabase.from("matches").update({ status: "inactive" }).eq("id", matchId);
    await load();
  }

  async function approveMentor(mentorId: string) {
    const mentor = mentors.find(m => m.id === mentorId);
    await fetch("/api/admin/approve-mentor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId, mentorName: mentor?.name }),
    });
    await load();
  }

  function togglePlayer(id: string) { setExpandedPlayerId(prev => prev === id ? null : id); }
  function toggleMentor(id: string) { setExpandedMentorId(prev => prev === id ? null : id); }
  function fmt(iso: string) { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  function jitsiUrl(matchId: string) { return `https://meet.jit.si/mentality-${matchId.replace(/-/g, "").slice(0, 20)}`; }
  function copyLink(matchId: string) {
    navigator.clipboard.writeText(jitsiUrl(matchId));
    setCopiedMatchId(matchId);
    setTimeout(() => setCopiedMatchId(null), 2000);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-white text-xs font-bold">A</div>
          <div>
            <h1 className="text-2xl font-bold text-navy">Admin</h1>
            <p className="text-xs text-muted-foreground">Mentality Sports — internal only</p>
          </div>
        </div>
        <Link href="/admin/content"
          className="inline-flex items-center gap-1.5 rounded-md border border-offWhite-300 px-3 py-1.5 text-xs font-medium text-navy hover:bg-offWhite transition-colors">
          <BookOpen className="h-3.5 w-3.5" /> Manage Content
        </Link>
        <div className="flex gap-4 text-center">
          {[
            { label: "Players", value: players.length },
            { label: "Mentors", value: mentors.length },
            { label: "Matches", value: activeMatches.length },
            { label: "Approvals", value: pendingMentors.length },
            { label: "Flagged", value: flagged.length },
            { label: "For Review", value: pendingArticles.length },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xl font-bold text-navy">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Match picker overlay */}
      {matchingPlayer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Matching with</p>
                <h2 className="text-lg font-bold text-navy">{matchingPlayer.name}</h2>
              </div>
              <button type="button" onClick={() => setMatchingPlayer(null)} aria-label="Close" className="p-2 hover:bg-muted rounded-md">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm font-medium text-navy/60 mb-3">Select a mentor:</p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {approvedUnmatchedMentors.map(m => (
                <button key={m.id} type="button" onClick={() => createMatch(m.id)} disabled={creating}
                  className="w-full text-left rounded-lg border border-offWhite-300 p-3 hover:border-orange-400 hover:bg-orange-50 transition-colors">
                  <p className="text-sm font-medium text-navy">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.sport ?? "—"} {m.mentor_profiles?.college ? `· ${m.mentor_profiles.college}` : ""}</p>
                </button>
              ))}
              {approvedUnmatchedMentors.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No approved available mentors</p>
              )}
            </div>
            {createMsg && <p className="mt-3 text-sm text-red-500">{createMsg}</p>}
          </div>
        </div>
      )}

      {/* Flagged sessions */}
      {flagged.length > 0 && (
        <Card className="mb-8 border-red-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" /> {flagged.length} Flagged Session{flagged.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-offWhite-300">
              {flagged.map(s => (
                <div key={s.id} className="py-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-navy">{s.player_name} <span className="text-muted-foreground font-normal">with</span> {s.mentor_name}</p>
                    {s.flag_reason && <p className="text-xs text-red-700 mt-0.5">{s.flag_reason}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-4">{fmt(s.date)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending articles */}
      {pendingArticles.length > 0 && (
        <Card className="mb-8 border-orange-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-orange-700">
              <BookOpen className="h-4 w-4" /> {pendingArticles.length} Article{pendingArticles.length !== 1 ? "s" : ""} Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingArticles.map(article => {
                const isExpanded = expandedArticleId === article.id;
                return (
                  <div key={article.id} className="rounded-lg border border-orange-100 overflow-hidden">
                    <button type="button" onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-orange-50/50 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-navy">{article.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {article.submitted_by_name ?? "Unknown"}{article.category ? ` · ${article.category}` : ""} · {fmt(article.created_at)}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-orange-100 px-4 pb-4 pt-3 space-y-3">
                        {article.excerpt && (
                          <p className="text-sm text-navy/70 italic">{article.excerpt}</p>
                        )}
                        <div className="rounded-md bg-offWhite p-3 max-h-60 overflow-y-auto">
                          <pre className="text-xs text-navy/70 whitespace-pre-wrap font-sans leading-relaxed">{article.content}</pre>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={() => reviewArticle(article.id, "published")}
                            disabled={articleAction === article.id}
                            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
                            <CheckCircle className="h-3.5 w-3.5" /> Publish
                          </button>
                          <button type="button" onClick={() => reviewArticle(article.id, "rejected")}
                            disabled={articleAction === article.id}
                            className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Players */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-4">Players ({players.length})</p>
          <div className="space-y-3">
            {players.map(p => {
              const match = getMatchFor(p.id);
              const isExpanded = expandedPlayerId === p.id;
              const pp = p.player_profiles;
              return (
                <div key={p.id} className={`rounded-lg border transition-colors ${match ? "border-offWhite-300" : "border-orange-200"}`}>
                  {/* Header row */}
                  <button type="button" onClick={() => togglePlayer(p.id)} className="w-full flex items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-navy text-sm font-bold shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sport ?? "—"}{pp?.grade ? ` · ${pp.grade}` : ""}{pp?.school ? ` · ${pp.school}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {match
                        ? <Badge variant="default" className="text-xs">Matched</Badge>
                        : <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">Waiting</Badge>
                      }
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="border-t border-offWhite-300 px-4 pb-4 pt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {pp?.age && <div><p className="text-xs text-muted-foreground">Age</p><p className="font-medium text-navy">{pp.age}</p></div>}
                        {pp?.level && <div><p className="text-xs text-muted-foreground">Level</p><p className="font-medium text-navy">{pp.level}</p></div>}
                        {pp?.availability && <div className="col-span-2"><p className="text-xs text-muted-foreground">Availability</p><p className="font-medium text-navy">{pp.availability}</p></div>}
                      </div>
                      {pp?.challenges && pp.challenges.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Challenges</p>
                          <div className="flex flex-wrap gap-1.5">{pp.challenges.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}</div>
                        </div>
                      )}
                      {pp?.goal && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Goal</p>
                          <p className="text-sm text-navy">{pp.goal}</p>
                        </div>
                      )}
                      {match && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Video call link (auto-generated)</p>
                          <div className="flex gap-2 items-center">
                            <a href={jitsiUrl(match.id)} target="_blank" rel="noopener noreferrer"
                              className="flex-1 truncate text-xs text-navy/60 underline underline-offset-2 hover:text-navy transition-colors">
                              {jitsiUrl(match.id)}
                            </a>
                            <button type="button" onClick={() => copyLink(match.id)}
                              className="shrink-0 rounded-md border border-offWhite-300 px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-offWhite transition-colors">
                              {copiedMatchId === match.id ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="pt-2 flex items-center gap-2">
                        {match ? (
                          <>
                            <p className="text-xs text-muted-foreground flex-1">Matched with <span className="font-medium text-navy">{match.mentor?.name}</span> since {fmt(match.created_at)}</p>
                            <button type="button" onClick={() => endMatch(match.id)}
                              className="flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors">
                              <X className="h-3 w-3" /> End match
                            </button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setMatchingPlayer(p)}
                            className="flex items-center gap-1.5 rounded-md bg-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-navy/80 transition-colors">
                            <Link2 className="h-3.5 w-3.5" /> Match now
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Joined {fmt(p.created_at)}</p>
                    </div>
                  )}
                </div>
              );
            })}
            {players.length === 0 && <p className="text-sm text-muted-foreground">No players yet.</p>}
          </div>
        </div>

        {/* Mentors */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-navy/40 mb-4">Mentors ({mentors.length})</p>
          <div className="space-y-3">
            {mentors.map(m => {
              const match = getMatchFor(m.id);
              const isExpanded = expandedMentorId === m.id;
              const mp = m.mentor_profiles;
              return (
                <div key={m.id} className={`rounded-lg border transition-colors ${!mp?.approved ? "border-amber-200" : match ? "border-offWhite-300" : "border-emerald-200"}`}>
                  <button type="button" onClick={() => toggleMentor(m.id)} className="w-full flex items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-sm font-bold shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.sport ?? "—"}{mp?.college ? ` · ${mp.college}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {!mp?.approved
                        ? <Badge variant="outline" className="text-xs border-amber-300 text-amber-600">Pending</Badge>
                        : match
                          ? <Badge variant="default" className="text-xs">Active</Badge>
                          : <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-600">Available</Badge>
                      }
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-offWhite-300 px-4 pb-4 pt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {mp?.years_played && <div><p className="text-xs text-muted-foreground">Years played</p><p className="font-medium text-navy">{mp.years_played}</p></div>}
                        {mp?.availability && <div><p className="text-xs text-muted-foreground">Availability</p><p className="font-medium text-navy">{mp.availability}</p></div>}
                      </div>
                      {mp?.skills && mp.skills.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Can help with</p>
                          <div className="flex flex-wrap gap-1.5">{mp.skills.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>
                        </div>
                      )}
                      {mp?.why && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Why they want to mentor</p>
                          <p className="text-sm text-navy">{mp.why}</p>
                        </div>
                      )}
                      <div className="pt-2 flex items-center gap-2">
                        {!mp?.approved ? (
                          <button type="button" onClick={() => approveMentor(m.id)}
                            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors">
                            <CheckCircle className="h-3.5 w-3.5" /> Approve Mentor
                          </button>
                        ) : match ? (
                          <p className="text-xs text-muted-foreground">Matched with <span className="font-medium text-navy">{match.player?.name}</span> since {fmt(match.created_at)}</p>
                        ) : (
                          <p className="text-xs text-emerald-600 font-medium">Available to be matched</p>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Joined {fmt(m.created_at)}</p>
                    </div>
                  )}
                </div>
              );
            })}
            {mentors.length === 0 && <p className="text-sm text-muted-foreground">No mentors yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
