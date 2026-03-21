"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, MessageCircle, Video, CheckCircle } from "lucide-react";

const heroImages = [
  "/header_images/markus-spiske-oPDQGXW7i40-unsplash.jpg",
  "/header_images/nik-shuliahin-BWRyS1-KKrs-unsplash.jpg",
  "/header_images/logan-weaver-lgnwvr-pZRX3qGeets-unsplash.jpg",
];

const whoWeServe = [
  {
    label: "Athletes",
    accent: "bg-navy",
    description:
      "Struggling with the mental side of competing — anxiety, confidence, identity, or just needing honest guidance from someone who gets it? We pair you with a mentor who's navigated exactly what you're facing.",
    cta: "Find a Mentor",
    href: "/signup?role=player",
  },
  {
    label: "Mentors",
    accent: "bg-orange-500",
    description:
      "You've been through the mental grind of sport — the pressure, the setbacks, the growth. That lived experience is exactly what a younger athlete needs. 15 minutes a week. We handle everything else.",
    cta: "Apply to Mentor",
    href: "/signup?role=mentor",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Apply",
    description: "Tell us about your sport, level, and what you're working through mentally or emotionally.",
  },
  {
    step: "02",
    title: "Get Matched",
    description: "We personally review every application and pair you with a mentor whose experience fits yours.",
  },
  {
    step: "03",
    title: "Build the Relationship",
    description: "Weekly check-ins with your mentor — honest conversation about the mental game, sport guidance, and whatever you need.",
  },
  {
    step: "04",
    title: "Use the Resources",
    description: "Tap into a library of articles and videos on mental skills, resilience, and performing under pressure — anytime.",
  },
];

export default function Home() {
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setHeroIdx((i) => (i + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      {/* ─── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy pt-20 pb-24 md:pt-28 md:pb-32 px-6 md:px-12 lg:px-20 xl:px-32">
        {/* Background image carousel — full opacity, masking handled by overlays */}
        {heroImages.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === heroIdx ? "opacity-100" : "opacity-0"}`}
          >
            <Image src={src} alt="" fill className="object-cover object-center" priority={i === 0} />
          </div>
        ))}

        {/* Layer 1: uniform dark tint so images don't overpower */}
        <div className="absolute inset-0 bg-navy/60" />
        {/* Layer 2: diagonal gradient — left (text zone) much darker, fades to transparent bottom-right */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/50 to-transparent" />
        {/* Layer 3: subtle bottom fade into the stats bar */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-navy/70 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">
            {/* Left — headline */}
            <div className="lg:col-span-7">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white">
                The mental side
                <br />
                of sport.
                <br />
                <em className="not-italic text-orange-400">Finally supported.</em>
              </h1>
            </div>

            {/* Right — description + CTAs */}
            <div className="lg:col-span-5 lg:pb-2">
              <p className="text-base md:text-lg text-white/65 leading-relaxed mb-8 max-w-sm">
                Real relationships between <span className="text-orange-400 font-semibold">athletes</span> and <span className="text-orange-400 font-semibold">mentors</span> who&apos;ve lived it — built on mental resilience, honest sport guidance, and the kind of support no coach or trainer is trained to give.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
                >
                  Get Involved
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/25 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Browse Resources
                </Link>
              </div>
            </div>
          </div>

          {/* Slide indicators */}
          <div className="flex gap-1.5 mt-12">
            {heroImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setHeroIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-0.5 rounded-full transition-all duration-300 ${i === heroIdx ? "w-6 bg-orange-400" : "w-2 bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANCHOR STATS ─────────────────────────────────────────────────────── */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-12 lg:px-20 xl:px-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-white/10">
            {[
              { value: "All Sports", label: "Not just one sport" },
              { value: "15 min", label: "Weekly mentor check-in" },
              { value: "Free", label: "During the pilot" },
              { value: "1-on-1", label: "Personally matched" },
            ].map((s) => (
              <div key={s.label} className="md:pl-8 first:pl-0">
                <div className="text-2xl md:text-3xl font-bold text-orange-400">{s.value}</div>
                <div className="text-xs text-white/40 mt-1 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MISSION ──────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-3">
              <div className="w-8 h-px bg-orange-400 mb-4" />
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">
                Our Mission
              </p>
            </div>
            <div className="lg:col-span-9">
              <p className="text-2xl md:text-3xl font-semibold text-navy leading-snug">
                Coaches teach the game. Trainers build the body. But nobody builds a real relationship with athletes around the fear of failure, the weight of expectation, or the identity crisis when sport doesn&apos;t go the way they planned. Mental strength isn&apos;t a bonus — it&apos;s the foundation.
              </p>
              <p className="mt-6 text-navy/50 font-medium text-sm uppercase tracking-wider">
                That&apos;s the relationship we exist to create.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHO WE SERVE ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-offWhite">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="label-tag mb-3">Who we serve</p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy">
              Built on real relationships.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {whoWeServe.map((group) => (
              <div
                key={group.label}
                className="bg-white rounded-sm p-10 border border-offWhite-300 hover:border-offWhite-400 transition-colors flex flex-col gap-6"
              >
                <div className={`inline-block rounded-sm px-3 py-1 text-xs font-semibold text-white self-start ${group.accent}`}>
                  {group.label}
                </div>
                <p className="text-navy/70 leading-relaxed flex-1">
                  {group.description}
                </p>
                <Link
                  href={group.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-orange-500 transition-colors"
                >
                  {group.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT WE OFFER ────────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left — pain points */}
            <div>
              <p className="label-tag mb-3">Sound familiar?</p>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
                The challenges are real.
              </h2>
              <p className="text-navy/60 mb-10 leading-relaxed text-sm">
                These are the mental and emotional challenges athletes across every sport face. Common, real — and much easier to navigate with someone who&apos;s already been through them.
              </p>
              <div className="space-y-0">
                {[
                  "Practice-to-game confidence gap",
                  "Fear of failure and making mistakes",
                  "Pressure, anxiety, and mental blocks",
                  "Identity and self-worth tied to performance",
                  "Injury recovery — the mental side",
                  "Navigating your role and finding your place",
                  "Motivation dips and burnout",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 py-3.5 border-b border-offWhite-300 last:border-0"
                  >
                    <div className="h-1 w-4 bg-orange-400 shrink-0" />
                    <span className="text-navy/80 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — what we provide */}
            <div className="bg-navy rounded-sm p-8 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-8">
                What we provide
              </p>
              <ul className="space-y-7">
                {[
                  {
                    title: "A Real Mentor Relationship",
                    desc: "Personally matched with a current or former athlete — ongoing, honest, built on shared experience in sport",
                  },
                  {
                    title: "Mental & Sport Guidance",
                    desc: "Your mentor helps you work through the mental side and offers real guidance on navigating the demands of competing",
                  },
                  {
                    title: "Resource Library",
                    desc: "Articles, videos, and guides on confidence, anxiety, identity, and the mental skills that translate to performance",
                  },
                  {
                    title: "Free During Pilot",
                    desc: "No cost to join while we grow the program and prove the model",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs text-white/45 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-offWhite">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="label-tag mb-3">The process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy">How it works</h2>
            <p className="text-navy/50 mt-2 text-sm max-w-md">
              Simple by design. The goal is connection, not complexity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <div key={item.step} className="relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-4 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-px bg-offWhite-400 z-0" />
                )}
                <div className="text-4xl font-bold text-offWhite-400 mb-4 leading-none font-serif">
                  {item.step}
                </div>
                <h3 className="font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-navy/55 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RESOURCES PREVIEW ────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="label-tag mb-3">From the library</p>
              <h2 className="text-3xl md:text-4xl font-bold text-navy">
                Mental skills, built through resources.
              </h2>
            </div>
            <Link
              href="/resources"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-orange-500 transition-colors"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                category: "Confidence",
                format: "Article",
                Icon: BookOpen,
                catColor: "bg-sage-100 text-sage-600",
                title: "The Practice-to-Game Gap: Why It Happens and How to Close It",
                desc: "Why your brain treats games differently than practice — and what to do about it.",
              },
              {
                category: "Coach Communication",
                format: "Script",
                Icon: MessageCircle,
                catColor: "bg-orange-50 text-orange-600",
                title: "How to Talk to Your Coach About Playing Time",
                desc: "A step-by-step script for a productive conversation without sounding entitled.",
              },
              {
                category: "Pressure & Anxiety",
                format: "Video",
                Icon: Video,
                catColor: "bg-navy/8 text-navy",
                title: "Pre-Competition Anxiety: What's Normal and What Helps",
                desc: "How to reframe pressure as a signal, not a threat.",
              },
            ].map((r) => (
              <div
                key={r.title}
                className="bg-offWhite rounded-sm p-6 border border-offWhite-300 hover:border-offWhite-400 transition-colors"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={`rounded-sm px-2.5 py-0.5 text-xs font-medium ${r.catColor}`}>
                    {r.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-navy/35">
                    <r.Icon className="h-3 w-3" />
                    {r.format}
                  </div>
                </div>
                <h3 className="font-bold text-navy text-sm leading-snug mb-2">{r.title}</h3>
                <p className="text-xs text-navy/55 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-orange-500 transition-colors"
            >
              View all resources <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="section-padding bg-navy text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-4">
                Get Started
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get involved?</h2>
              <p className="text-white/55 leading-relaxed text-sm max-w-sm">
                Whether you&apos;re an athlete looking for a real relationship with someone who gets the mental side, or a current or former player ready to give back — this is where it starts.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/signup?role=player"
                className="flex items-center justify-between rounded-sm bg-orange-500 px-6 py-4 font-semibold hover:bg-orange-600 transition-colors text-sm"
              >
                I&apos;m an Athlete <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup?role=mentor"
                className="flex items-center justify-between rounded-sm bg-white/10 px-6 py-4 font-semibold hover:bg-white/15 transition-colors border border-white/10 text-sm"
              >
                I want to Mentor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
