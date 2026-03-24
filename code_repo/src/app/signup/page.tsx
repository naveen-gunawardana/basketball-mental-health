"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Users, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

type Role = "player" | "mentor";

const sports = [
  "Basketball", "Football", "Soccer", "Volleyball", "Baseball", "Softball",
  "Track & Field", "Swimming", "Tennis", "Wrestling", "Lacrosse", "Hockey",
  "Cross Country", "Golf", "Gymnastics", "Other",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const playerGrades = ["6th", "7th", "8th", "9th", "10th", "11th", "12th", "College"];

const playerLevels = [
  "Middle school recreational",
  "Middle school team / club",
  "High school JV",
  "High school Varsity",
  "Club / AAU",
  "College",
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
  "Team dynamics / fitting in",
  "Injury recovery",
  "Balancing athletics and school",
  "Self-talk / inner critic",
  "Burnout",
  "Identity — my worth beyond sport",
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
  "Motivation & burnout",
  "Identity & self-worth",
];

const mentorPlayingLevels = [
  "High School",
  "College (D3)",
  "College (D2)",
  "College (D1)",
  "Semi-Professional",
  "Professional",
];

const menteeAgePrefs = [
  "Middle school (6th–8th)",
  "High school (9th–12th)",
  "Any age",
];

const MIDDLE_SCHOOL_GRADES = new Set(["6th", "7th", "8th"]);

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-10 text-center text-muted-foreground">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawRole = searchParams.get("role");
  const initialRole: Role = rawRole === "mentor" ? "mentor" : "player";

  const [role, setRole] = useState<Role>(initialRole);
  const [step, setStep] = useState(1);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Shared fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Player fields
  const [playerSport, setPlayerSport] = useState("");
  const [playerAge, setPlayerAge] = useState("");
  const [playerSchool, setPlayerSchool] = useState("");
  const [playerGrade, setPlayerGrade] = useState("");
  const [playerLevel, setPlayerLevel] = useState("");
  const [playerLocation, setPlayerLocation] = useState("");
  const [playerChallenges, setPlayerChallenges] = useState<string[]>([]);
  const [playerGoal, setPlayerGoal] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  // Shared availability (used for both roles)
  const [availability, setAvailability] = useState("");

  // Mentor fields
  const [mentorSport, setMentorSport] = useState("");
  const [mentorPlayingLevel, setMentorPlayingLevel] = useState("");
  const [mentorInstitution, setMentorInstitution] = useState("");
  const [mentorLocation, setMentorLocation] = useState("");
  const [mentorYearsPlayed, setMentorYearsPlayed] = useState("");
  const [mentorSkillsSelected, setMentorSkillsSelected] = useState<string[]>([]);
  const [mentorWhy, setMentorWhy] = useState("");
  const [mentorBio, setMentorBio] = useState("");
  const [menteeAgePref, setMenteeAgePref] = useState("");

  const requiresParent = MIDDLE_SCHOOL_GRADES.has(playerGrade);

  function toggleItem(list: string[], item: string, setList: (v: string[]) => void) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          sport: role === "player" ? playerSport : mentorSport,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await fetch("/api/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.user.id,
          name,
          role,
          sport: role === "player" ? playerSport || null : mentorSport || null,
          playerProfile: role === "player" ? {
            age: playerAge ? parseInt(playerAge) : null,
            school: playerSchool || null,
            grade: playerGrade || null,
            level: playerLevel || null,
            location: playerLocation || null,
            challenges: playerChallenges.length > 0 ? playerChallenges : null,
            goal: playerGoal || null,
            availability: availability || null,
            parent_name: parentName || null,
            parent_email: parentEmail || null,
            parent_phone: parentPhone || null,
          } : null,
          mentorProfile: role === "mentor" ? {
            playing_level: mentorPlayingLevel || null,
            institution: mentorInstitution || null,
            location: mentorLocation || null,
            years_played: mentorYearsPlayed ? parseInt(mentorYearsPlayed) : null,
            skills: mentorSkillsSelected.length > 0 ? mentorSkillsSelected : null,
            why: mentorWhy || null,
            bio: mentorBio || null,
            mentee_age_pref: menteeAgePref || null,
            availability: availability || null,
          } : null,
        }),
      });

      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "welcome", email, name, role }),
      }).catch(() => {});
    }

    setLoading(false);
    if (!data.session) {
      router.push("/verify-email");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-6">
          <Logo href="/" size="md" variant="dark" />
        </div>
        <h1 className="text-3xl font-bold text-navy mb-2">Get Involved</h1>
        <p className="text-muted-foreground">
          Tell us who you are and we&apos;ll match you with the right experience.
        </p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-8 max-w-md mx-auto">
        {([
          { r: "player" as Role, Icon: UserPlus, label: "I'm an Athlete", sub: "Looking for mentorship" },
          { r: "mentor" as Role, Icon: Users,   label: "I'm a Mentor",   sub: "Current or former athlete giving back" },
        ]).map(({ r, Icon, label, sub }) => (
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
        ))}
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
                ? ["About You", "Your Sport", "Mental Goals"][s - 1]
                : ["About You", "Your Background", "Mentoring Focus"][s - 1]}
            </span>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-navy" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mb-6">
        Already have an account?{" "}
        <a href="/signin" className="font-medium text-navy hover:text-orange-500 transition-colors underline underline-offset-2">
          Sign in
        </a>
      </p>

      <form onSubmit={handleSubmit}>
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About You</CardTitle>
              <CardDescription>Signing up as {role === "player" ? "an athlete" : "a mentor"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Full Name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

              {role === "player" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Age" type="number" placeholder="e.g. 14" value={playerAge} onChange={(e) => setPlayerAge(e.target.value)} />
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">State</label>
                      <select
                        value={playerLocation}
                        onChange={(e) => setPlayerLocation(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select state</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Grade</label>
                    <div className="flex flex-wrap gap-2">
                      {playerGrades.map((g) => (
                        <button key={g} type="button" onClick={() => setPlayerGrade(g)}
                          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${playerGrade === g ? "bg-navy text-white border-navy" : "bg-white text-muted-foreground hover:bg-muted"}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input label="School / Team" placeholder="Your school or team name" value={playerSchool} onChange={(e) => setPlayerSchool(e.target.value)} />

                  {/* Parent/Guardian — required for 6th–8th grade */}
                  {playerGrade && (
                    <div className={`rounded-lg border p-4 space-y-3 ${requiresParent ? "border-orange-200 bg-orange-50/40" : "border-offWhite-300 bg-offWhite/40"}`}>
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          Parent / Guardian Contact
                          {requiresParent && <span className="ml-1.5 text-xs text-orange-600 font-medium">(required for your grade)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {requiresParent
                            ? "We require a parent or guardian contact for athletes in middle school."
                            : "Optional — helpful for keeping parents in the loop."}
                        </p>
                      </div>
                      <Input
                        label="Parent / Guardian Name"
                        placeholder="Full name"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        required={requiresParent}
                      />
                      <Input
                        label="Parent / Guardian Email"
                        type="email"
                        placeholder="parent@email.com"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        required={requiresParent}
                      />
                      <Input
                        label="Parent / Guardian Phone"
                        type="tel"
                        placeholder="(555) 000-0000"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}

              {role === "mentor" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Highest / current playing level</label>
                    <div className="flex flex-wrap gap-2">
                      {mentorPlayingLevels.map((lvl) => (
                        <button key={lvl} type="button" onClick={() => setMentorPlayingLevel(lvl)}
                          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${mentorPlayingLevel === lvl ? "bg-navy text-white border-navy" : "bg-white text-muted-foreground hover:bg-muted"}`}>
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    label="School / Team / Program"
                    placeholder="e.g. State University, hometown club, etc."
                    value={mentorInstitution}
                    onChange={(e) => setMentorInstitution(e.target.value)}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">State</label>
                    <select
                      value={mentorLocation}
                      onChange={(e) => setMentorLocation(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select state</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {role === "player" ? "Your Sport" : "Your Background"}
              </CardTitle>
              <CardDescription>
                {role === "player" ? "Tell us about your athletic background" : "Tell us about your playing background"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Your sport</label>
                <div className="flex flex-wrap gap-2">
                  {sports.map((s) => {
                    const selected = role === "mentor" ? mentorSport === s : playerSport === s;
                    const setter = role === "mentor" ? setMentorSport : setPlayerSport;
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
                    {playerLevels.map((l) => (
                      <button key={l} type="button" onClick={() => setPlayerLevel(l)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${playerLevel === l ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {role === "mentor" && (
                <>
                  <Input
                    label="Years of organized sport"
                    type="number"
                    placeholder="e.g. 8"
                    value={mentorYearsPlayed}
                    onChange={(e) => setMentorYearsPlayed(e.target.value)}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Who are you most comfortable mentoring?</label>
                    <div className="flex flex-wrap gap-2">
                      {menteeAgePrefs.map((pref) => (
                        <button key={pref} type="button" onClick={() => setMenteeAgePref(pref)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${menteeAgePref === pref ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10"}`}>
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Short bio</label>
                    <textarea
                      value={mentorBio}
                      onChange={(e) => setMentorBio(e.target.value)}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="A few sentences about yourself as an athlete — what you've been through, what drives you to give back..."
                    />
                  </div>
                </>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Availability for weekly check-ins</label>
                <div className="flex flex-wrap gap-2">
                  {["Weekday afternoons", "Weekday evenings", "Weekend mornings", "Weekend afternoons", "Flexible"].map((time) => (
                    <button key={time} type="button" onClick={() => setAvailability(time)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${availability === time ? "bg-navy text-white" : "bg-muted text-muted-foreground hover:bg-navy/10"}`}>
                      {time}
                    </button>
                  ))}
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

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {role === "player" ? "Mental Challenges" : "Mentoring Focus"}
              </CardTitle>
              <CardDescription>
                {role === "player"
                  ? "What are you dealing with? Select all that apply."
                  : "What areas are you best equipped to help with?"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(role === "player" ? mentalChallenges : mentorSkills).map((item) => {
                  const list = role === "player" ? playerChallenges : mentorSkillsSelected;
                  const setter = role === "player"
                    ? (v: string[]) => setPlayerChallenges(v)
                    : (v: string[]) => setMentorSkillsSelected(v);
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
                    ? "What's your #1 goal for this mentorship?"
                    : "Why do you want to be a mentor?"}
                </label>
                <textarea
                  value={role === "player" ? playerGoal : mentorWhy}
                  onChange={(e) => role === "player" ? setPlayerGoal(e.target.value) : setMentorWhy(e.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder={
                    role === "player"
                      ? "Example: I want to play with the same confidence in games that I have in practice. I get really anxious before big games and I need help managing that..."
                      : "Tell us about your motivation to help athletes and what you hope to give them..."
                  }
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-navy"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <a href="/terms" target="_blank" className="font-medium text-navy underline underline-offset-2 hover:text-orange-500 transition-colors">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" target="_blank" className="font-medium text-navy underline underline-offset-2 hover:text-orange-500 transition-colors">Privacy Policy</a>
                </span>
              </label>

              {authError && (
                <p className="text-sm text-red-500">{authError}</p>
              )}
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <Button type="submit" variant="secondary" disabled={loading || !agreedToTerms}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
