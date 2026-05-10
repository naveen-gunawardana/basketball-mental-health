"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlayerProfile {
  age: number | null; school: string | null; grade: string | null;
  level: string[] | null; location: string | null; challenges: string[] | null;
  goal: string | null; availability: string | null;
  parent_name: string | null; parent_email: string | null; parent_phone: string | null;
}
interface MentorProfile {
  institution: string | null; playing_level: string[] | null; location: string | null;
  years_played: number | null; skills: string[] | null; why: string | null;
  bio: string | null; mentee_age_pref: string | null; availability: string | null; approved: boolean;
}
interface Person {
  id: string; name: string; role: string; sport: string[] | null; created_at: string | null;
  player_profiles: PlayerProfile | null;
  mentor_profiles: MentorProfile | null;
}
interface Match { id: string; status: string; created_at: string | null; player: Person; mentor: Person }

interface Props {
  players: Person[];
  mentors: Person[];
  matches: Match[];
  emails: Record<string, string>;
  role: string;
}

export default function AdminOutreachView({ players, mentors, matches, emails, role }: Props) {
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [expandedMentorId, setExpandedMentorId] = useState<string | null>(null);
  const [playerSportFilter, setPlayerSportFilter] = useState("all");
  const [mentorSportFilter, setMentorSportFilter] = useState("all");

  const activeMatches = matches.filter(m => m.status === "active");

  const playerSports = Array.from(new Set(players.flatMap(p => p.sport ?? []).filter(Boolean))) as string[];
  const mentorSports = Array.from(new Set(mentors.flatMap(m => m.sport ?? []).filter(Boolean))) as string[];

  const filteredPlayers = players.filter(p =>
    playerSportFilter === "all" || p.sport?.includes(playerSportFilter)
  );
  const filteredMentors = mentors.filter(m =>
    mentorSportFilter === "all" || m.sport?.includes(mentorSportFilter)
  );

  function fmt(iso: string | null) {
    return iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  }
  function getPlayerMatch(playerId: string) {
    return activeMatches.find(m => m.player?.id === playerId);
  }
  function getMentorMatches(mentorId: string) {
    return activeMatches.filter(m => m.mentor?.id === mentorId);
  }

  const roleLabel = role === "outreach" ? "Director of Outreach" : "Operations";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-white text-xs font-bold">A</div>
          <div>
            <h1 className="text-2xl font-bold text-navy">Admin</h1>
            <p className="text-xs text-muted-foreground">Mentality Sports — {roleLabel}</p>
          </div>
        </div>
        <div className="flex gap-4 text-center">
          {[
            { label: "Players", value: players.length },
            { label: "Mentors", value: mentors.length },
            { label: "Matches", value: activeMatches.length },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xl font-bold text-navy">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Active matches summary */}
      {activeMatches.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base text-navy">Active Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-offWhite-300">
              {activeMatches.map(m => (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <p className="text-sm text-navy">
                    <span className="font-medium">{m.player?.name}</span>
                    <span className="text-muted-foreground"> with </span>
                    <span className="font-medium">{m.mentor?.name}</span>
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0 ml-4">Matched {fmt(m.created_at)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Players */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-navy/40">
              Players ({filteredPlayers.length}/{players.length})
            </p>
          </div>
          <div className="mb-4">
            <select value={playerSportFilter} onChange={e => setPlayerSportFilter(e.target.value)}
              className="w-full rounded-md border border-offWhite-300 bg-white px-2.5 py-1.5 text-xs text-navy focus:outline-none focus:ring-1 focus:ring-navy">
              <option value="all">All sports</option>
              {playerSports.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            {filteredPlayers.map(p => {
              const match = getPlayerMatch(p.id);
              const isExpanded = expandedPlayerId === p.id;
              const pp = p.player_profiles;
              const email = emails[p.id];
              return (
                <div key={p.id} className={`rounded-lg border transition-colors ${match ? "border-offWhite-300" : "border-orange-200"}`}>
                  <button type="button" onClick={() => setExpandedPlayerId(prev => prev === p.id ? null : p.id)}
                    className="w-full flex items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-navy text-sm font-bold shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.sport?.join(", ") ?? "—"}
                          {pp?.grade ? ` · ${pp.grade}` : ""}
                          {pp?.school ? ` · ${pp.school}` : ""}
                          {pp?.location ? ` · ${pp.location}` : ""}
                        </p>
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

                  {isExpanded && (
                    <div className="border-t border-offWhite-300 px-4 pb-4 pt-3 space-y-3">
                      {email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <a href={`mailto:${email}`} className="text-xs text-navy/70 hover:text-navy underline underline-offset-2 transition-colors truncate">{email}</a>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {pp?.age && <div><p className="text-xs text-muted-foreground">Age</p><p className="font-medium text-navy">{pp.age}</p></div>}
                        {pp?.grade && <div><p className="text-xs text-muted-foreground">Grade</p><p className="font-medium text-navy">{pp.grade}</p></div>}
                        {pp?.level?.length ? <div className="col-span-2"><p className="text-xs text-muted-foreground">Level(s)</p><p className="font-medium text-navy">{pp.level.join(", ")}</p></div> : null}
                        {pp?.location && <div><p className="text-xs text-muted-foreground">State</p><p className="font-medium text-navy">{pp.location}</p></div>}
                        {pp?.school && <div className="col-span-2"><p className="text-xs text-muted-foreground">School / Team</p><p className="font-medium text-navy">{pp.school}</p></div>}
                        {pp?.availability && <div className="col-span-2"><p className="text-xs text-muted-foreground">Availability</p><p className="font-medium text-navy">{pp.availability}</p></div>}
                      </div>
                      {(pp?.parent_name || pp?.parent_email || pp?.parent_phone) && (
                        <div className="rounded-md border border-orange-100 bg-orange-50/40 px-3 py-2.5 space-y-1">
                          <p className="text-xs font-semibold text-orange-700">Parent / Guardian</p>
                          {pp.parent_name && <p className="text-xs text-navy">{pp.parent_name}</p>}
                          {pp.parent_email && (
                            <a href={`mailto:${pp.parent_email}`} className="block text-xs text-navy/70 underline underline-offset-2 hover:text-navy transition-colors">{pp.parent_email}</a>
                          )}
                          {pp.parent_phone && <p className="text-xs text-navy/70">{pp.parent_phone}</p>}
                        </div>
                      )}
                      {pp?.challenges && pp.challenges.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Challenges</p>
                          <div className="flex flex-wrap gap-1.5">
                            {pp.challenges.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                          </div>
                        </div>
                      )}
                      {pp?.goal && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Goal</p>
                          <p className="text-sm text-navy">{pp.goal}</p>
                        </div>
                      )}
                      {match && (
                        <p className="text-xs text-muted-foreground">
                          Matched with <span className="font-medium text-navy">{match.mentor?.name}</span> since {fmt(match.created_at)}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground pt-1">Joined {fmt(p.created_at)}</p>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredPlayers.length === 0 && <p className="text-sm text-muted-foreground">No players.</p>}
          </div>
        </div>

        {/* Mentors */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-navy/40">
              Mentors ({filteredMentors.length}/{mentors.length})
            </p>
          </div>
          <div className="mb-4">
            <select value={mentorSportFilter} onChange={e => setMentorSportFilter(e.target.value)}
              className="w-full rounded-md border border-offWhite-300 bg-white px-2.5 py-1.5 text-xs text-navy focus:outline-none focus:ring-1 focus:ring-navy">
              <option value="all">All sports</option>
              {mentorSports.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            {filteredMentors.map(m => {
              const mentorMatches = getMentorMatches(m.id);
              const isExpanded = expandedMentorId === m.id;
              const mp = m.mentor_profiles;
              const email = emails[m.id];
              return (
                <div key={m.id} className={`rounded-lg border transition-colors ${!mp?.approved ? "border-gold-300" : mentorMatches.length > 0 ? "border-offWhite-300" : "border-sage-200"}`}>
                  <button type="button" onClick={() => setExpandedMentorId(prev => prev === m.id ? null : m.id)}
                    className="w-full flex items-center justify-between p-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-sm font-bold shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.sport?.join(", ") ?? "—"}
                          {mp?.institution ? ` · ${mp.institution}` : ""}
                          {mp?.playing_level?.length ? ` · ${mp.playing_level.join(", ")}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {!mp?.approved
                        ? <Badge variant="outline" className="text-xs border-gold-400 text-gold-600">Pending</Badge>
                        : mentorMatches.length > 0
                          ? <Badge variant="default" className="text-xs">{mentorMatches.length} player{mentorMatches.length !== 1 ? "s" : ""}</Badge>
                          : <Badge variant="outline" className="text-xs border-sage-300 text-sage-600">Available</Badge>
                      }
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-offWhite-300 px-4 pb-4 pt-3 space-y-3">
                      {email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <a href={`mailto:${email}`} className="text-xs text-navy/70 hover:text-navy underline underline-offset-2 transition-colors truncate">{email}</a>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {mp?.playing_level?.length ? <div className="col-span-2"><p className="text-xs text-muted-foreground">Playing level(s)</p><p className="font-medium text-navy">{mp.playing_level.join(", ")}</p></div> : null}
                        {mp?.years_played && <div><p className="text-xs text-muted-foreground">Years played</p><p className="font-medium text-navy">{mp.years_played}</p></div>}
                        {mp?.location && <div><p className="text-xs text-muted-foreground">State</p><p className="font-medium text-navy">{mp.location}</p></div>}
                        {mp?.mentee_age_pref && <div><p className="text-xs text-muted-foreground">Prefers mentoring</p><p className="font-medium text-navy">{mp.mentee_age_pref}</p></div>}
                        {mp?.institution && <div className="col-span-2"><p className="text-xs text-muted-foreground">School / Team</p><p className="font-medium text-navy">{mp.institution}</p></div>}
                        {mp?.availability && <div className="col-span-2"><p className="text-xs text-muted-foreground">Availability</p><p className="font-medium text-navy">{mp.availability}</p></div>}
                      </div>
                      {mp?.bio && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Bio</p>
                          <p className="text-sm text-navy">{mp.bio}</p>
                        </div>
                      )}
                      {mp?.skills && mp.skills.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Can help with</p>
                          <div className="flex flex-wrap gap-1.5">
                            {mp.skills.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                          </div>
                        </div>
                      )}
                      {mp?.why && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Why they want to mentor</p>
                          <p className="text-sm text-navy">{mp.why}</p>
                        </div>
                      )}
                      {mentorMatches.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground font-medium">Current players</p>
                          {mentorMatches.map(match => (
                            <div key={match.id} className="rounded-md bg-offWhite px-3 py-2">
                              <p className="text-xs font-medium text-navy">{match.player?.name}</p>
                              <p className="text-[10px] text-muted-foreground">since {fmt(match.created_at)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground pt-1">Joined {fmt(m.created_at)}</p>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredMentors.length === 0 && <p className="text-sm text-muted-foreground">No mentors.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
