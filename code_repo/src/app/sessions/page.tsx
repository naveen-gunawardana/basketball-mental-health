"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Star, MessageCircle, Save, CheckCircle, AlertTriangle } from "lucide-react";

const allTopics = [
  "Confidence", "Team dynamics", "Pre-game anxiety", "Goal setting",
  "Leadership", "Handling pressure", "Academic balance", "Communication",
  "Resilience", "Self-talk", "Focus & concentration", "Dealing with losses",
  "Time management", "Motivation", "Injury recovery mindset",
];

export default function SessionsPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [matchId, setMatchId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [otherPersonName, setOtherPersonName] = useState<string>("");
  const [noMatch, setNoMatch] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("15");
  const [moodScore, setMoodScore] = useState(7);
  const [rating, setRating] = useState(4);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      const role = user.user_metadata?.role ?? null;
      setUserRole(role);

      const field = role === "player" ? "player_id" : "mentor_id";
      const otherField = role === "player" ? "mentor:mentor_id(name)" : "player:player_id(name)";

      const { data: match } = await supabase
        .from("matches")
        .select(`id, ${otherField}`)
        .eq(field, user.id)
        .eq("status", "active")
        .maybeSingle();

      if (!match) {
        setNoMatch(true);
        return;
      }

      setMatchId(match.id);
      const other = role === "player"
        ? (match as unknown as { mentor: { name: string } }).mentor
        : (match as unknown as { player: { name: string } }).player;
      setOtherPersonName(other?.name ?? "");
    }
    load();
  }, []);

  function toggleTopic(topic: string) {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!matchId || !userId) return;

    setSaving(true);
    setError("");

    const supabase = createClient();
    const { error: insertError } = await supabase.from("sessions").insert({
      match_id: matchId,
      logged_by: userId,
      date: new Date(date).toISOString(),
      duration: parseInt(duration),
      topics: selectedTopics.length > 0 ? selectedTopics : null,
      mood: moodScore,
      notes: notes || null,
      rating,
      flagged,
      flag_reason: flagged ? flagReason || null : null,
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      setStep("success");
    }
  }

  const dashboardHref = userRole === "mentor" ? "/dashboard/mentor" : "/dashboard/player";

  if (step === "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-navy mb-2">Session Logged!</h1>
        <p className="text-muted-foreground mb-6">Your session has been saved.</p>
        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={() => {
            setStep("form"); setNotes(""); setSelectedTopics([]); setFlagged(false); setFlagReason("");
          }}>
            Log Another
          </Button>
          <Button variant="outline" asChild>
            <Link href={dashboardHref}>Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (noMatch) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy mb-2">No active match yet</h1>
        <p className="text-muted-foreground mb-6">You&apos;ll be able to log sessions once you&apos;ve been matched.</p>
        <Button asChild variant="secondary"><Link href={dashboardHref}>Back to Dashboard</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Log a Session</h1>
        {otherPersonName && (
          <p className="text-muted-foreground">Recording your session with <span className="font-medium text-navy">{otherPersonName}</span>.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />Session Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Duration (minutes)</label>
                <div className="flex gap-2">
                  {["15", "30", "45", "60"].map((d) => (
                    <button key={d} type="button" onClick={() => setDuration(d)}
                      className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        duration === d ? "bg-navy text-white border-navy" : "bg-white text-muted-foreground hover:bg-muted"
                      }`}>
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-orange-500" />Player Mood
            </CardTitle>
            <CardDescription>How was the player feeling? (1 = very low, 10 = great)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                <button key={val} type="button" onClick={() => setMoodScore(val)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    moodScore === val
                      ? val >= 7 ? "bg-emerald-500 text-white" : val >= 4 ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}>
                  {val}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-500" />Session Quality
            </CardTitle>
            <CardDescription>How productive was this session?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((val) => (
                <button key={val} type="button" onClick={() => setRating(val)} aria-label={`Rate ${val} out of 5`} className="p-1">
                  <Star className={`h-8 w-8 transition-colors ${val <= rating ? "fill-orange-400 text-orange-400" : "text-muted fill-muted"}`} />
                </button>
              ))}
              <span className="ml-3 text-sm text-muted-foreground">{rating}/5</span>
            </div>
          </CardContent>
        </Card>

        {/* Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Topics Discussed</CardTitle>
            <CardDescription>Select all topics covered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allTopics.map((topic) => (
                <button key={topic} type="button" onClick={() => toggleTopic(topic)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedTopics.includes(topic) ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10"
                  }`}>
                  {topic}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Notes</CardTitle>
            <CardDescription>Key takeaways, action items, and observations</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="What did you talk about? Any breakthroughs, concerns, or follow-up items?" />
          </CardContent>
        </Card>

        {/* Flag */}
        <Card className={flagged ? "border-red-200" : ""}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${flagged ? "text-red-500" : "text-muted-foreground"}`} />
              Flag for Follow-up
            </CardTitle>
            <CardDescription>Flag if something concerning came up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <button type="button" onClick={() => setFlagged(!flagged)} aria-label={flagged ? "Remove flag" : "Add flag"}
                className={`relative h-6 w-11 rounded-full transition-colors ${flagged ? "bg-red-500" : "bg-muted"}`}>
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${flagged ? "translate-x-5" : ""}`} />
              </button>
              <span className="text-sm text-muted-foreground">{flagged ? "Flagged for review" : "No flag"}</span>
            </div>
            {flagged && (
              <Input label="Reason for flag" placeholder="Brief description of the concern..."
                value={flagReason} onChange={(e) => setFlagReason(e.target.value)} />
            )}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href={dashboardHref}>Cancel</Link>
          </Button>
          <Button type="submit" variant="secondary" disabled={saving || !matchId}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Session"}
          </Button>
        </div>
      </form>
    </div>
  );
}
