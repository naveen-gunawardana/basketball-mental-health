"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Users,
  Flag,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

type Role = "player" | "mentor" | "coach";

const sports = [
  "Basketball", "Football", "Soccer", "Volleyball", "Baseball", "Softball",
  "Track & Field", "Swimming", "Tennis", "Wrestling", "Lacrosse", "Hockey",
  "Cross Country", "Golf", "Gymnastics", "Other",
];

const mentalChallenges = [
  "Practice-to-game confidence gap",
  "Fear of making mistakes",
  "Pre-competition anxiety",
  "Communicating with my coach",
  "Unclear role on team",
  "Dealing with bench / less playing time",
  "Staying motivated",
  "Handling pressure moments",
  "Team dynamics",
  "Injury recovery",
  "Balancing athletics and academics",
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

const coachChallenges = [
  "Recognizing mental health struggles in athletes",
  "Having difficult conversations with athletes",
  "Supporting athletes through injury",
  "Managing team culture and conflict",
  "Balancing performance pressure with wellbeing",
  "Helping athletes build confidence",
  "Supporting athletes through slumps",
  "Communicating with parents",
  "Burnout — mine or my athletes'",
  "Mental health resources for my team",
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
  const rawRole = searchParams.get("role");
  const initialRole: Role = rawRole === "mentor" ? "mentor" : rawRole === "coach" ? "coach" : "player";

  const [role, setRole] = useState<Role>(initialRole);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Shared fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Player fields
  const [playerSport, setPlayerSport] = useState("");
  const [playerAge, setPlayerAge] = useState("");
  const [playerSchool, setPlayerSchool] = useState("");
  const [playerGrade, setPlayerGrade] = useState("");
  const [playerLevel, setPlayerLevel] = useState("");
  const [playerChallenges, setPlayerChallenges] = useState<string[]>([]);
  const [playerGoal, setPlayerGoal] = useState("");

  // Mentor fields
  const [mentorSport, setMentorSport] = useState("");
  const [mentorCollege, setMentorCollege] = useState("");
  const [mentorYearsPlayed, setMentorYearsPlayed] = useState("");
  const [mentorSkillsSelected, setMentorSkillsSelected] = useState<string[]>([]);
  const [mentorWhy, setMentorWhy] = useState("");
  const [mentorAvailability, setMentorAvailability] = useState("");

  // Coach fields
  const [coachSport, setCoachSport] = useState("");
  const [coachAgeGroup, setCoachAgeGroup] = useState("");
  const [coachOrg, setCoachOrg] = useState("");
  const [coachChallengesSelected, setCoachChallengesSelected] = useState<string[]>([]);
  const [coachLookingFor, setCoachLookingFor] = useState("");

  function toggleItem(list: string[], item: string, setList: (v: string[]) => void) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const roleLabels: Record<Role, string> = {
    player: "athlete",
    mentor: "mentor",
    coach: "coach",
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-navy mb-2">
          You&apos;re in — thanks for signing up!
        </h1>
        <p className="text-muted-foreground mb-6">
          {role === "player"
            ? "We've received your application and will match you with a mentor soon. Check your email for next steps."
            : role === "coach"
            ? "We've received your information and will be in touch with resources and next steps."
            : "We'll review your application and reach out with next steps. Thank you for giving back!"}
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
        <h1 className="text-3xl font-bold text-navy mb-2">Get Involved</h1>
        <p className="text-muted-foreground">
          Tell us who you are and we&apos;ll match you with the right experience.
        </p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {(["player", "mentor", "coach"] as Role[]).map((r) => {
          const Icon = r === "player" ? UserPlus : r === "mentor" ? Users : Flag;
          const label = r === "player" ? "I'm an Athlete" : r === "mentor" ? "I'm a Mentor" : "I'm a Coach";
          const sub = r === "player" ? "Looking for mentorship" : r === "mentor" ? "Former athlete giving back" : "Supporting my athletes";
          return (
            <button
              key={r}
              type="button"
              onClick={() => { setRole(r); setStep(1); }}
              className={`rounded-xl border-2 p-4 text-center transition-all ${
                role === r ? "border-orange-500 bg-orange-50" : "border-muted hover:border-orange-200"
              }`}
            >
              <Icon className={`h-6 w-6 mx-auto mb-2 ${role === r ? "text-orange-500" : "text-muted-foreground"}`} />
              <p className={`font-semibold text-sm ${role === r ? "text-navy" : "text-muted-foreground"}`}>{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </button>
          );
        })}
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= s ? "bg-navy text-white" : "bg-muted text-muted-foreground"}`}>
              {step > s ? <CheckCircle className="h-4 w-4" /> : s}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">
              {role === "player"
                ? ["Basic Info", "Your Sport", "Mental Goals"][s - 1]
                : role === "coach"
                ? ["Basic Info", "Your Coaching", "What You Need"][s - 1]
                : ["Basic Info", "Your Sport", "Mentoring Focus"][s - 1]}
            </span>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-navy" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* STEP 1 — shared basic info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About You</CardTitle>
              <CardDescription>Signing up as {roleLabels[role === "player" ? "player" : role === "coach" ? "coach" : "mentor"]}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Full Name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {role === "player" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Age" type="number" placeholder="16" value={playerAge} onChange={(e) => setPlayerAge(e.target.value)} />
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Grade</label>
                      <div className="flex gap-2">
                        {["9th", "10th", "11th", "12th"].map((g) => (
                          <button key={g} type="button" onClick={() => setPlayerGrade(g)}
                            className={`flex-1 rounded-md border px-2 py-2 text-sm font-medium transition-colors ${playerGrade === g ? "bg-navy text-white border-navy" : "bg-white text-muted-foreground hover:bg-muted"}`}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Input label="School" placeholder="Your school name" value={playerSchool} onChange={(e) => setPlayerSchool(e.target.value)} />
                </>
              )}
              {role === "coach" && (
                <Input label="Organization / School" placeholder="Team or school you coach for" value={coachOrg} onChange={(e) => setCoachOrg(e.target.value)} />
              )}
              {role === "mentor" && (
                <Input label="College / University" placeholder="Where you played" value={mentorCollege} onChange={(e) => setMentorCollege(e.target.value)} />
              )}
              <div className="flex justify-end">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2 — sport / background */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {role === "player" ? "Your Sport" : role === "coach" ? "Your Coaching" : "Your Sport"}
              </CardTitle>
              <CardDescription>
                {role === "player" ? "Tell us about your athletic background" : role === "coach" ? "Tell us about who you coach" : "Tell us about your playing background"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sport selector */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {role === "coach" ? "Sport(s) you coach" : "Your sport"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {sports.map((s) => {
                    const selected = role === "coach" ? coachSport === s : role === "mentor" ? mentorSport === s : playerSport === s;
                    const setter = role === "coach" ? setCoachSport : role === "mentor" ? setMentorSport : setPlayerSport;
                    return (
                      <button key={s} type="button" onClick={() => setter(s)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${selected ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10"}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {role === "player" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Level of competition</label>
                  <div className="flex flex-wrap gap-2">
                    {["Recreational", "School / Club", "Competitive / AAU", "Varsity"].map((l) => (
                      <button key={l} type="button" onClick={() => setPlayerLevel(l)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${playerLevel === l ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {role === "coach" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Age group you coach</label>
                  <div className="flex flex-wrap gap-2">
                    {["Youth (under 12)", "Middle School", "High School", "College", "Adult / Rec"].map((ag) => (
                      <button key={ag} type="button" onClick={() => setCoachAgeGroup(ag)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${coachAgeGroup === ag ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10"}`}>
                        {ag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {role === "mentor" && (
                <Input label="Years of organized sport" type="number" placeholder="e.g., 8" value={mentorYearsPlayed} onChange={(e) => setMentorYearsPlayed(e.target.value)} />
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Availability for weekly check-ins</label>
                <div className="flex flex-wrap gap-2">
                  {["Weekday afternoons", "Weekday evenings", "Weekend mornings", "Weekend afternoons", "Flexible"].map((time) => {
                    const selected = mentorAvailability === time;
                    return (
                      <button key={time} type="button" onClick={() => setMentorAvailability(time)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${selected ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10"}`}>
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button type="button" variant="secondary" onClick={() => setStep(3)}>
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3 — goals / challenges */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {role === "player" ? "Mental Challenges" : role === "coach" ? "What You Need" : "Mentoring Focus"}
              </CardTitle>
              <CardDescription>
                {role === "player"
                  ? "What are you dealing with? Select all that apply."
                  : role === "coach"
                  ? "What challenges do you face supporting your athletes mentally?"
                  : "What areas are you best equipped to help with?"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(role === "player" ? mentalChallenges : role === "coach" ? coachChallenges : mentorSkills).map((item) => {
                  const list = role === "player" ? playerChallenges : role === "coach" ? coachChallengesSelected : mentorSkillsSelected;
                  const setter = role === "player" ? (v: string[]) => setPlayerChallenges(v) : role === "coach" ? (v: string[]) => setCoachChallengesSelected(v) : (v: string[]) => setMentorSkillsSelected(v);
                  return (
                    <button key={item} type="button" onClick={() => toggleItem(list, item, setter)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${list.includes(item) ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10"}`}>
                      {item}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {role === "player"
                    ? "What's your #1 goal for the mentorship program?"
                    : role === "coach"
                    ? "What are you most hoping to get out of this?"
                    : "Why do you want to be a mentor?"}
                </label>
                <textarea
                  value={role === "player" ? playerGoal : role === "coach" ? coachLookingFor : mentorWhy}
                  onChange={(e) => role === "player" ? setPlayerGoal(e.target.value) : role === "coach" ? setCoachLookingFor(e.target.value) : setMentorWhy(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder={
                    role === "player"
                      ? "Example: I want to play with the same confidence in games that I have in practice..."
                      : role === "coach"
                      ? "Example: I want better tools to help my athletes through mental slumps..."
                      : "Tell us about your motivation to help athletes..."
                  }
                />
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button type="submit" variant="secondary">
                  <CheckCircle className="h-4 w-4 mr-2" /> Submit Application
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
