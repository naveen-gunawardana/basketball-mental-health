"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

type Role = "player" | "mentor";

const mentalChallenges = [
  "Practice-to-game confidence gap",
  "Fear of making mistakes",
  "Pre-game anxiety",
  "Talking to my coach",
  "Unclear role on team",
  "Dealing with bench time",
  "Staying motivated",
  "Handling pressure",
  "Team dynamics",
  "Injury recovery",
  "Academic balance",
  "Self-talk / inner critic",
];

const mentorSkills = [
  "Building confidence",
  "Managing anxiety",
  "Goal setting",
  "Coach communication",
  "Leadership development",
  "Dealing with adversity",
  "Time management",
  "Team dynamics",
  "Injury recovery support",
  "Academic-athletic balance",
];

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-10 text-center text-muted-foreground">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "mentor" ? "mentor" : "player";

  const [role, setRole] = useState<Role>(initialRole);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Player fields
  const [playerName, setPlayerName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [playerAge, setPlayerAge] = useState("");
  const [playerSchool, setPlayerSchool] = useState("");
  const [playerGrade, setPlayerGrade] = useState("");
  const [playerPosition, setPlayerPosition] = useState("");
  const [playerChallenges, setPlayerChallenges] = useState<string[]>([]);
  const [playerMotivation, setPlayerMotivation] = useState("");
  const [playerGoal, setPlayerGoal] = useState("");

  // Mentor fields
  const [mentorName, setMentorName] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [mentorCollege, setMentorCollege] = useState("");
  const [mentorYearsPlayed, setMentorYearsPlayed] = useState("");
  const [mentorPosition, setMentorPosition] = useState("");
  const [mentorSkillsSelected, setMentorSkillsSelected] = useState<string[]>([]);
  const [mentorWhy, setMentorWhy] = useState("");
  const [mentorAvailability, setMentorAvailability] = useState("");

  function toggleChallenge(challenge: string) {
    setPlayerChallenges((prev) =>
      prev.includes(challenge)
        ? prev.filter((c) => c !== challenge)
        : [...prev, challenge]
    );
  }

  function toggleMentorSkill(skill: string) {
    setMentorSkillsSelected((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-navy mb-2">
          {role === "player" ? "Welcome to Hoops & Hope!" : "Thanks for signing up as a mentor!"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {role === "player"
            ? "We've received your information and will match you with a mentor soon. You'll receive an email with next steps."
            : "We'll review your application and reach out with next steps. Thank you for giving back to the game!"}
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="secondary" asChild>
            <a href="/resources">Explore Resources</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-navy mb-2">
          Join Hoops &amp; Hope
        </h1>
        <p className="text-muted-foreground">
          {role === "player"
            ? "Sign up to get matched with a mentor who's been through what you're going through."
            : "Sign up to mentor a high school player and help them with the mental side of the game."}
        </p>
      </div>

      {/* Role selector */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => { setRole("player"); setStep(1); }}
          className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${
            role === "player"
              ? "border-orange-500 bg-orange-50"
              : "border-muted hover:border-orange-200"
          }`}
        >
          <UserPlus className={`h-6 w-6 mx-auto mb-2 ${role === "player" ? "text-orange-500" : "text-muted-foreground"}`} />
          <p className={`font-semibold ${role === "player" ? "text-navy" : "text-muted-foreground"}`}>
            I&apos;m a Player
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            High school basketball player seeking mentorship
          </p>
        </button>
        <button
          onClick={() => { setRole("mentor"); setStep(1); }}
          className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${
            role === "mentor"
              ? "border-orange-500 bg-orange-50"
              : "border-muted hover:border-orange-200"
          }`}
        >
          <Users className={`h-6 w-6 mx-auto mb-2 ${role === "mentor" ? "text-orange-500" : "text-muted-foreground"}`} />
          <p className={`font-semibold ${role === "mentor" ? "text-navy" : "text-muted-foreground"}`}>
            I&apos;m a Mentor
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            College/former player ready to give back
          </p>
        </button>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= s
                  ? "bg-navy text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? <CheckCircle className="h-4 w-4" /> : s}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">
              {role === "player"
                ? ["Basic Info", "Your Game", "Mental Goals"][s - 1]
                : ["Basic Info", "Experience", "Mentoring Style"][s - 1]}
            </span>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-navy" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* PLAYER SIGNUP */}
        {role === "player" && step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About You</CardTitle>
              <CardDescription>Tell us the basics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Your full name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Age"
                  type="number"
                  placeholder="16"
                  value={playerAge}
                  onChange={(e) => setPlayerAge(e.target.value)}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Grade
                  </label>
                  <div className="flex gap-2">
                    {["9th", "10th", "11th", "12th"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPlayerGrade(g)}
                        className={`flex-1 rounded-md border px-2 py-2 text-sm font-medium transition-colors ${
                          playerGrade === g
                            ? "bg-navy text-white border-navy"
                            : "bg-white text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Input
                label="School"
                placeholder="Your school name"
                value={playerSchool}
                onChange={(e) => setPlayerSchool(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(2)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {role === "player" && step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Game</CardTitle>
              <CardDescription>
                Tell us about your basketball journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Position
                </label>
                <div className="flex flex-wrap gap-2">
                  {["PG", "SG", "SF", "PF", "C"].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setPlayerPosition(pos)}
                      className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                        playerPosition === pos
                          ? "bg-navy text-white border-navy"
                          : "bg-white text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  How motivated are you to improve your mental game? (1-10)
                </label>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPlayerMotivation(String(val))}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        playerMotivation === String(val)
                          ? "bg-orange-500 text-white"
                          : "bg-muted text-muted-foreground hover:bg-orange-50"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(3)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {role === "player" && step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mental Challenges</CardTitle>
              <CardDescription>
                What are you dealing with? Select all that apply.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {mentalChallenges.map((challenge) => (
                  <button
                    key={challenge}
                    type="button"
                    onClick={() => toggleChallenge(challenge)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      playerChallenges.includes(challenge)
                        ? "bg-navy text-white"
                        : "bg-muted text-muted-foreground hover:bg-navy-50"
                    }`}
                  >
                    {challenge}
                  </button>
                ))}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  What&apos;s your #1 goal for the mentorship program?
                </label>
                <textarea
                  value={playerGoal}
                  onChange={(e) => setPlayerGoal(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Example: I want to play with the same confidence in games that I have in practice..."
                />
              </div>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" variant="secondary">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Application
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* MENTOR SIGNUP */}
        {role === "mentor" && step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About You</CardTitle>
              <CardDescription>Tell us the basics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Your full name"
                value={mentorName}
                onChange={(e) => setMentorName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={mentorEmail}
                onChange={(e) => setMentorEmail(e.target.value)}
                required
              />
              <Input
                label="College/University"
                placeholder="Where you played"
                value={mentorCollege}
                onChange={(e) => setMentorCollege(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(2)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {role === "mentor" && step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basketball Experience</CardTitle>
              <CardDescription>
                Tell us about your playing background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Position(s) Played
                </label>
                <div className="flex flex-wrap gap-2">
                  {["PG", "SG", "SF", "PF", "C"].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setMentorPosition(pos)}
                      className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                        mentorPosition === pos
                          ? "bg-navy text-white border-navy"
                          : "bg-white text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="Years of Organized Basketball"
                type="number"
                placeholder="e.g., 8"
                value={mentorYearsPlayed}
                onChange={(e) => setMentorYearsPlayed(e.target.value)}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Availability for weekly sessions
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Weekday afternoons", "Weekday evenings", "Weekend mornings", "Weekend afternoons", "Flexible"].map(
                    (time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setMentorAvailability(time)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                          mentorAvailability === time
                            ? "bg-navy text-white"
                            : "bg-muted text-muted-foreground hover:bg-navy-50"
                        }`}
                      >
                        {time}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(3)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {role === "mentor" && step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mentoring Focus</CardTitle>
              <CardDescription>
                What areas are you best equipped to help with?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {mentorSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleMentorSkill(skill)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      mentorSkillsSelected.includes(skill)
                        ? "bg-navy text-white"
                        : "bg-muted text-muted-foreground hover:bg-navy-50"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Why do you want to be a mentor?
                </label>
                <textarea
                  value={mentorWhy}
                  onChange={(e) => setMentorWhy(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Tell us about your motivation to help high school players..."
                />
              </div>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" variant="secondary">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Application
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
