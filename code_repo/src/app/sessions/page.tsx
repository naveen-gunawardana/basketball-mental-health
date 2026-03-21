"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Star,
  MessageCircle,
  Save,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const allTopics = [
  "Confidence",
  "Team dynamics",
  "Pre-game anxiety",
  "Goal setting",
  "Leadership",
  "Handling pressure",
  "Academic balance",
  "Communication",
  "Resilience",
  "Self-talk",
  "Focus & concentration",
  "Dealing with losses",
  "Time management",
  "Motivation",
  "Injury recovery mindset",
];

export default function SessionsPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("15");
  const [moodScore, setMoodScore] = useState(7);
  const [rating, setRating] = useState(4);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In a real app, this would POST to an API
    setStep("success");
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-navy mb-2">Session Logged!</h1>
        <p className="text-muted-foreground mb-6">
          Your session has been saved. Keep up the great work!
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="secondary"
            onClick={() => {
              setStep("form");
              setNotes("");
              setSelectedTopics([]);
              setFlagged(false);
              setFlagReason("");
            }}
          >
            Log Another Session
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard/player">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Log a Session</h1>
        <p className="text-muted-foreground">
          Record your mentorship session details, mood, and notes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Duration (minutes)
                </label>
                <div className="flex gap-2">
                  {["15", "30", "45", "60"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        duration === d
                          ? "bg-navy text-white border-navy"
                          : "bg-white text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-orange-500" />
              Player Mood
            </CardTitle>
            <CardDescription>
              How was the player feeling during this session? (1 = very low, 10 = great)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMoodScore(val)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    moodScore === val
                      ? val >= 7
                        ? "bg-emerald-500 text-white"
                        : val >= 4
                        ? "bg-amber-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {moodScore}/10
            </p>
          </CardContent>
        </Card>

        {/* Session Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-orange-500" />
              Session Quality
            </CardTitle>
            <CardDescription>
              How productive was this session overall?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRating(val)}
                  className="p-1"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      val <= rating
                        ? "fill-orange-400 text-orange-400"
                        : "text-muted fill-muted"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-muted-foreground">
                {rating}/5
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Topics Discussed</CardTitle>
            <CardDescription>
              Select all topics covered in this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedTopics.includes(topic)
                      ? "bg-navy text-white"
                      : "bg-muted text-muted-foreground hover:bg-navy-50"
                  }`}
                >
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
            <CardDescription>
              Key takeaways, action items, and observations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="What did you talk about? Any breakthroughs, concerns, or follow-up items?"
            />
          </CardContent>
        </Card>

        {/* Flag */}
        <Card className={flagged ? "border-red-200" : ""}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${flagged ? "text-red-500" : "text-muted-foreground"}`} />
              Flag for Follow-up
            </CardTitle>
            <CardDescription>
              If something concerning came up, flag it for the program coordinator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => setFlagged(!flagged)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  flagged ? "bg-red-500" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    flagged ? "translate-x-5" : ""
                  }`}
                />
              </button>
              <span className="text-sm text-muted-foreground">
                {flagged ? "Flagged for review" : "No flag"}
              </span>
            </div>
            {flagged && (
              <Input
                label="Reason for flag"
                placeholder="Brief description of the concern..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
              />
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <a href="/dashboard/mentor">Cancel</a>
          </Button>
          <Button type="submit" variant="secondary">
            <Save className="h-4 w-4 mr-2" />
            Save Session
          </Button>
        </div>
      </form>
    </div>
  );
}
