"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Heart,
  Target,
  MessageCircle,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle,
  Users,
  BookOpen,
} from "lucide-react";

const problems = [
  {
    icon: Brain,
    title: "Practice-to-Game Gap",
    description:
      "You dominate in practice but freeze up in games. Your brain treats games as a threat instead of an opportunity.",
  },
  {
    icon: Shield,
    title: "Fear of Mistakes",
    description:
      "You hold back because you're afraid to mess up. So you play safe — and never show what you can really do.",
  },
  {
    icon: MessageCircle,
    title: "Can't Talk to Your Coach",
    description:
      "You want more playing time but don't know how to ask without sounding entitled or making things worse.",
  },
  {
    icon: TrendingUp,
    title: "Stuck on a Plateau",
    description:
      "You're putting in work but not seeing results. You compare yourself to others who seem to improve faster.",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Sign Up",
    description:
      "Tell us about yourself — your goals, your challenges, what position you play, and what you want to work on mentally.",
  },
  {
    step: "2",
    title: "Get Matched",
    description:
      "We pair you with a college or former player who's been through what you're going through. Someone who gets it.",
  },
  {
    step: "3",
    title: "Weekly Check-ins",
    description:
      "15-minute weekly conversations focused on the mental side of your game. Not coaching, not therapy — mentorship.",
  },
  {
    step: "4",
    title: "Track Progress",
    description:
      "Set mental goals, track your confidence and mood, and see real growth over time with your personal dashboard.",
  },
];

const stats = [
  { value: "9/10", label: "Players report practice-to-game confidence gap" },
  { value: "15 min", label: "Weekly check-in with your mentor" },
  { value: "10+", label: "Mental performance resources" },
  { value: "Free", label: "During pilot program" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-navy text-white section-padding py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium mb-6">
              <Heart className="h-4 w-4 text-orange-400" />
              Now piloting in San Francisco
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your game is{" "}
              <span className="text-orange-400">mental</span>.
              <br />
              Your support should be too.
            </h1>
            <p className="text-lg md:text-xl text-navy-200 mb-8 max-w-2xl">
              Hoops &amp; Hope connects high school basketball players with
              college mentors who&apos;ve been there. Weekly 15-minute check-ins
              focused on confidence, pressure, and the mental side of the game.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="text-base"
              >
                <Link href="/signup">
                  Join as a Player
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/resources">Explore Resources</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-bold text-orange-500">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="section-padding bg-offWhite">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Sound familiar?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These are the most common mental challenges high school basketball
              players face. You&apos;re not alone — and there&apos;s a way through.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problems.map((problem) => {
              const Icon = problem.icon;
              return (
                <Card
                  key={problem.title}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6 flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                      <Icon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy mb-1">
                        {problem.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {problem.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              How Hoops &amp; Hope works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Think of it as Big Brothers Big Sisters for basketball. A mentor
              who gets the game and gets what you&apos;re going through.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="section-padding bg-navy text-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What you get
            </h2>
            <p className="text-lg text-navy-200 max-w-2xl mx-auto">
              Everything you need to build the mental side of your game.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl bg-white/10 p-6">
              <Users className="h-8 w-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                1-on-1 Mentor Match
              </h3>
              <ul className="space-y-2 text-sm text-navy-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  Matched with a college/former player
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  Weekly 15-minute check-ins
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  Someone who&apos;s been through it
                </li>
              </ul>
            </div>
            <div className="rounded-xl bg-white/10 p-6">
              <Target className="h-8 w-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
              <ul className="space-y-2 text-sm text-navy-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  Weekly mental goals (effort, attitude, focus)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  Mood and confidence tracking
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  30-day lookback reviews
                </li>
              </ul>
            </div>
            <div className="rounded-xl bg-white/10 p-6">
              <BookOpen className="h-8 w-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Resource Library</h3>
              <ul className="space-y-2 text-sm text-navy-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  Articles on confidence, pressure, goals
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  Scripts for talking to your coach
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                  Worksheets and actionable exercises
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-offWhite">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Ready to level up your mental game?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join the pilot program — it&apos;s free. Get matched with a mentor who
            understands the game and what you&apos;re going through.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="secondary" size="lg" className="text-base">
              <Link href="/signup">
                Sign Up as a Player
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="default" size="lg" className="text-base">
              <Link href="/signup?role=mentor">Become a Mentor</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
